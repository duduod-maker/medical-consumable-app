import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"
import { Role } from "@prisma/client"
import nodemailer from "nodemailer"

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const where = {
      ...(isAdmin(session) ? {} : { userId: session.user.id }),
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { items, notes } = body as { items: OrderItemInput[], notes: string }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "La commande ne peut être vide" }, { status: 400 })
    }

    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Check for sufficient stock before starting the transaction
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour le produit: ${product?.name || item.productId}` },
          { status: 400 }
        );
      }
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          notes,
          userId: session.user.id,
          items: {
            create: items.map((item: OrderItemInput) => ({
              quantity: item.quantity,
              productId: item.productId,
            })),
          },
        },
        include: {
          user: true,
          items: { include: { product: { include: { category: true } } } },
        },
      });

      // Decrement stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });


    // --- Email sending logic ---
    try {
      const emailSetting = await prisma.setting.findUnique({
        where: { key: 'email_notifications' },
      });

      if (emailSetting && emailSetting.value === 'true') {
        const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
        const adminEmails = admins.map(admin => admin.email);
        const userEmail = newOrder.user.email;
        const allRecipients = [...new Set([...adminEmails, userEmail])];

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const itemsHtml = newOrder.items.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product?.name} (${item.product?.reference})</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          </tr>`
        ).join('');

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: allRecipients.join(','),
          subject: `Nouvelle commande de consommables #${newOrder.id}`,
          html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #0056b3;">Nouvelle commande</h1>
            <p>Une nouvelle commande a été passée par <strong>${newOrder.user.name}</strong> (${newOrder.user.email}).</p>
            <h2 style="color: #0056b3;">Détails de la commande</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 10px; border-bottom: 2px solid #0056b3; text-align: left;">Produit</th>
                  <th style="padding: 10px; border-bottom: 2px solid #0056b3; text-align: center;">Quantité</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <h2 style="color: #0056b3;">Notes</h2>
            <p>${newOrder.notes || 'Aucune'}</p>
            <p style="margin-top: 20px; font-size: 0.9em; color: #555;">
              Vous pouvez consulter la commande sur le portail.
            </p>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }
    // --- End of email sending logic ---

    return NextResponse.json(newOrder)
  } catch (error: unknown) {
    console.error("Erreur lors de la soumission de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la commande" },
      { status: 500 }
    )
  }
}