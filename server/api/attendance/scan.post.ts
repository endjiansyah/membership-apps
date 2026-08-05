import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uuid, activateMembership } = body

  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'QR Code tidak terbaca dengan benar.' })
  }

  const member = await prisma.member.findUnique({
    where: { uuid: uuid }
  })

  if (!member) {
    throw createError({ statusCode: 404, statusMessage: 'QR Code tidak terdaftar di sistem!' })
  }

  // Jika tombol "Aktifkan Membership" ditekan di frontend
  if (activateMembership && !member.isActive) {
    await prisma.member.update({
      where: { id: member.id },
      data: { isActive: true }
    })
  }

  let petugas = await prisma.user.findFirst()
  if (!petugas) {
    petugas = await prisma.user.create({
      data: {
        name: 'Petugas Pintu 1',
        email: 'petugas1@event.com',
        password: 'password123',
        role: 'PETUGAS'
      }
    })
  }

  const log = await prisma.attendanceLog.create({
    data: {
      memberId: member.id,
      scannedById: petugas.id,
      entryMethod: 'QR_SCAN',
    }
  })

  return {
    success: true,
    member: {
      name: member.name,
      waktu: log.scannedAt
    }
  }
})