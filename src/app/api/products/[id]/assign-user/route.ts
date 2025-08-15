import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/permissions"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      )
    }

    // Vérifier si le produit a déjà un utilisateur affecté
    const existingAssignment = await prisma.userProduct.findUnique({
      where: {
        productId: id
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Ce produit est déjà affecté à un autre utilisateur" },
        { status: 400 }
      )
    }

    // Créer l'affectation
    await prisma.userProduct.create({
      data: {
        userId,
        productId: id
      }
    })

    return NextResponse.json({ message: "Utilisateur affecté avec succès" })
  } catch (error) {
    console.error("Erreur lors de l'affectation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'affectation" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      )
    }

    // Supprimer l'affectation (il ne peut y en avoir qu'une par produit)
    await prisma.userProduct.delete({
      where: {
        productId: id
      }
    })

    return NextResponse.json({ message: "Affectation supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'affectation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'affectation" },
      { status: 500 }
    )
  }
}