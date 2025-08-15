import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { categoryId: { equals: category } }),
    }

    // Si l'utilisateur n'est pas admin, filtrer pour ne montrer que les produits qui lui sont affectés
    if (!isAdmin(session)) {
      where.assignedUsers = {
        some: {
          userId: session.user.id
        }
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        assignedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(products)
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { name, reference, supplierRef, description, categoryId, price } = body

    const product = await prisma.product.create({
      data: {
        name,
        reference: reference || null,
        supplierRef: supplierRef || null,
        description: description || null,
        price: price ? parseFloat(price) : 0.0,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    revalidatePath("/")
    revalidatePath("/products")

    return NextResponse.json(product)
  } catch (error: unknown) {
    console.error("Erreur lors de la création du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    )
  }
}