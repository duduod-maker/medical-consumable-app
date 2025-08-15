import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Créer l'admin principal
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tonapp.com' },
    update: {},
    create: {
      email: 'admin@tonapp.com',
      name: 'Admin Principal',
      password: await hash('motdepasse123', 10),
      role: 'ADMIN',
    },
  })
  
  console.log('Admin principal créé:', admin)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
