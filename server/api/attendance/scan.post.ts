import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uuid } = body

  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'QR Code tidak terbaca dengan benar.' })
  }

  // 1. Cek apakah UUID tersebut valid milik member kita
  const member = await prisma.member.findUnique({
    where: { uuid: uuid }
  })

  if (!member) {
    throw createError({ statusCode: 404, statusMessage: 'QR Code tidak terdaftar di sistem!' })
  }

  // 2. Karena fitur Login belum ada, kita butuh 1 "User" (Petugas) dummy untuk mengisi kolom scannedById
  let petugas = await prisma.user.findFirst()
  if (!petugas) {
    // Jika tabel User kosong, sistem akan otomatis membuat 1 petugas cadangan
    petugas = await prisma.user.create({
      data: {
        name: 'Petugas Pintu 1',
        email: 'petugas1@event.com',
        password: 'password123',
        role: 'PETUGAS'
      }
    })
  }

  // 3. Masukkan data ke tabel log presensi
  const log = await prisma.attendanceLog.create({
    data: {
      memberId: member.id,
      scannedById: petugas.id,
      entryMethod: 'QR_SCAN',
    }
  })

  // 4. Kembalikan data sukses ke HP petugas
  return {
    success: true,
    member: {
      name: member.name,
      waktu: log.scannedAt
    }
  }
})