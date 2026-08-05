import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member tidak valid.' })
  }

  const member = await prisma.member.findUnique({
    where: { id: Number(id) },
    include: {
      logs: {
        orderBy: { scannedAt: 'desc' },
        // TAMBAHAN: Tarik nama petugas yang melakukan scan
        include: {
          scannedBy: {
            select: { name: true }
          }
        }
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        // TAMBAHAN: Tarik nama petugas/admin yang melakukan aktivitas
        include: {
          user: {
            select: { name: true }
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