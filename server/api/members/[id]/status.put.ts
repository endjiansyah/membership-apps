import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { isActive, source } = body

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member tidak valid.' })
  }

  const memberId = Number(id)
  let petugas = await prisma.user.findFirst()
  const petugasId = petugas?.id || 1

  // 1. Update status member
  const updatedMember = await prisma.member.update({
    where: { id: memberId },
    data: { isActive: Boolean(isActive) }
  })

  // 2. Catat rekam jejak ke AuditLog
  const actionName = isActive ? 'AKTIVASI_STATUS' : 'NONAKTIF_STATUS'
  
  await prisma.memberAuditLog.create({
    data: {
      memberId: memberId,
      action: actionName,
      source: source || 'MANUAL_ADMIN',
      performedBy: petugasId
    }
  })

  return { success: true, member: updatedMember }
})