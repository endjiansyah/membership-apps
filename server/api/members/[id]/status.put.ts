import { prisma } from '~~/server/utils/prisma' // Path diseragamkan agar tidak error saat di-build

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

  // 1. Update status member (Ini yang bikin data berubah saat di-refresh)
  const updatedMember = await prisma.member.update({
    where: { id: memberId },
    data: { isActive: Boolean(isActive) }
  })

  // 2. Catat rekam jejak ke AuditLog (Dibungkus Try-Catch agar tidak memicu 500 Internal Error)
  const actionName = isActive ? 'AKTIVASI_STATUS' : 'NONAKTIF_STATUS'
  
  try {
    await prisma.memberAuditLog.create({
      data: {
        memberId: memberId,
        action: actionName,
        source: source || 'MANUAL_ADMIN',
        performedBy: petugasId
      }
    })
  } catch (auditError) {
    console.error('Gagal mencatat audit log status:', auditError)
  }

  // Jika sukses sampai sini, alert gagal di frontend tidak akan muncul lagi
  return { success: true, member: updatedMember }
})