import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Inisialisasi adapter dengan URL dari .env
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// Masukkan adapter ke dalam Prisma Client
export const prisma = new PrismaClient({ adapter })