// server/api/attendance/scan.post.ts
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uuid } = body

  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'QR Code tidak terbaca dengan benar.' })
  }

  // 1. Cek validitas UUID
  const member = await prisma.member.findUnique({
    where: { uuid: uuid }
  })

  if (!member) {
    throw createError({ statusCode: 404, statusMessage: 'QR Code tidak terdaftar di sistem!' })
  }

  // 2. CEK STATUS AKTIF (Baru ditambahkan sesuai request)
  if (!member.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Gagal! Member ini berstatus Non-Aktif.' })
  }

  // 3. User / Petugas dummy
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

  // 4. Masukkan data ke tabel log
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