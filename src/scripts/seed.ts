import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // --- Create Users ---
  const hashedPassword = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
      name: "Administrateur",
    },
  })

  const userPassword = await bcrypt.hash("user123", 12)
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      role: Role.USER,
      name: "Infirmière Test",
    },
  })

  // --- Create Categories ---
  const categories = [
    "Pansements",
    "Hygiène et Soins",
    "Désinfection et Antiseptiques",
    "Matériel de Prélèvement",
    "Protection",
  ]

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    })
  }
  
  console.log("Categories seeded.")

  // --- Create Products ---
  const pansementsCategory = await prisma.category.findUnique({ where: { name: "Pansements" } })
  if (pansementsCategory) {
    await prisma.product.createMany({
      data: [
        { name: "Compresses stériles 10x10cm", reference: "COMP-ST-1010", description: "Boîte de 50 compresses.", stock: 100, price: 5.99, categoryId: pansementsCategory.id },
        { name: "Sparadrap microporeux 5m x 2.5cm", reference: "SPAR-MICRO-525", description: "Rouleau unitaire.", stock: 200, price: 2.49, categoryId: pansementsCategory.id },
        { name: "Pansement adhésif stérile 8x10cm", reference: "PANS-ADH-810", description: "Boîte de 100.", stock: 150, price: 12.50, categoryId: pansementsCategory.id },
      ]
    })
  }

  const hygieneCategory = await prisma.category.findUnique({ where: { name: "Hygiène et Soins" } })
  if (hygieneCategory) {
    await prisma.product.createMany({
      data: [
        { name: "Solution hydroalcoolique 500ml", reference: "SHA-500", description: "Flacon avec pompe.", stock: 80, price: 8.75, categoryId: hygieneCategory.id },
        { name: "Savon doux liquide 1L", reference: "SAV-DOUX-1L", description: "Recharge pour distributeur.", stock: 120, price: 6.20, categoryId: hygieneCategory.id },
      ]
    })
  }
  
  const protectionCategory = await prisma.category.findUnique({ where: { name: "Protection" } })
  if (protectionCategory) {
    await prisma.product.createMany({
      data: [
        { name: "Gants nitrile non poudrés T.M", reference: "GANT-NIT-M", description: "Boîte de 100.", stock: 300, price: 15.00, categoryId: protectionCategory.id },
        { name: "Masques chirurgicaux Type II", reference: "MASK-CHIR-II", description: "Boîte de 50.", stock: 500, price: 9.99, categoryId: protectionCategory.id },
      ]
    })
  }

  console.log("Products seeded.")

  // --- Create Settings ---
  await prisma.setting.upsert({
    where: { key: 'email_notifications' },
    update: {},
    create: {
      key: 'email_notifications',
      value: 'true',
    },
  });

  console.log("Database seeded successfully!")
  console.log("Admin: admin@example.com / admin123")
  console.log("User: user@example.com / user123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
