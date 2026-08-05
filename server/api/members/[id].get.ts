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
        orderBy: { scannedAt: 'desc' }
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!member) {
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })
  }

  return member
})