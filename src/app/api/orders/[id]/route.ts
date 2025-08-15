import { NextResponse } from "next/server"
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
    const { status, notes } = body

    const dataToUpdate: { status?: any; notes?: string } = {};
    if (status) {
      dataToUpdate.status = status;
    }
    if (notes !== undefined) {
      dataToUpdate.notes = notes;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    })

    return NextResponse.json(updatedOrder)
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
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

    // The relation is cascading, so OrderItems will be deleted automatically.
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Commande supprimée avec succès" })
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la commande" },
      { status: 500 }
    )
  }
}
