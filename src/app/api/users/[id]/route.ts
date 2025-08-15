import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { Role, Prisma } from "@prisma/client";

export async function PUT(req: Request, context: any) {
  const { id } = context.params; // Access id directly
  const session = await getServerSession(authOptions);

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { email, name, password, role } = body;

  try {
    const dataToUpdate: Prisma.UserUpdateInput = {};
    if (email) dataToUpdate.email = email;
    if (name) dataToUpdate.name = name;
    if (role) dataToUpdate.role = role as Role;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  const { id } = context.params; // Access id directly
  const session = await getServerSession(authOptions);

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
