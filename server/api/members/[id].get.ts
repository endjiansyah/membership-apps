import { prisma } from '~~/server/utils/prisma' // Diseragamkan menggunakan absolute path

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member tidak valid.' })
  }

  const member = await prisma.member.findUnique({
    where: { id: Number(id) },
    include: {
      // 1. Tarik riwayat kehadiran
      logs: {
        orderBy: { scannedAt: 'desc' },
        include: {
          scannedBy: {
            select: { name: true }
          }
        }
      },
      // 2. TAMBAHAN: Tarik riwayat audit log aktivitas
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true } // Ambil nama petugas yang mengeksekusi
          }
        }
      }
    }
  })

  if (!member) {
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })
  }

  return member
})