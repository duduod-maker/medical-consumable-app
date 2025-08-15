import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { name, reference, supplierRef, description, categoryId, price } = body

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        reference: reference || null,
        supplierRef: supplierRef || null,
        description: description || null,
        price: price ? parseFloat(price) : undefined,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    revalidatePath("/") // Or a specific admin products page
    revalidatePath("/products")

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    await prisma.product.delete({
      where: { id },
    })

    revalidatePath("/")
    revalidatePath("/products")

    return NextResponse.json({ message: "Produit supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    )
  }
}
