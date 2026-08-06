import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminName = process.env.ADMIN_NAME
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error('GAGAL: Variabel environment ADMIN belum lengkap di file .env!')
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    })
    console.log('SUKSES: Akun Super Admin berhasil dimasukkan ke database.')
  } else {
    console.log('INFO: Akun Super Admin sudah ada di database.')
  }
}

main()
  .catch((e) => {
    console.error('ERROR DETAIL:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })