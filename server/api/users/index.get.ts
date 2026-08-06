import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  // Ambil semua data user dari database
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc' // Urutkan dari yang terbaru dibuat
    }
  })

  return users
})