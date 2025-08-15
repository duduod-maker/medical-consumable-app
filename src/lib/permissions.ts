import { Role } from "@prisma/client"
import { Session } from "next-auth"

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === Role.ADMIN
}

export function isUser(session: Session | null): boolean {
  return session?.user?.role === Role.USER
}
