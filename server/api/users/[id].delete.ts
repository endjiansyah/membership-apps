import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID User tidak valid.' })
  }

  // 1. Pastikan user yang akan dihapus itu ada
  const user = await prisma.user.findUnique({ 
    where: { id: Number(id) } 
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Akun petugas tidak ditemukan.' })
  }

  // 2. Hapus dari database
  // Catatan: Jika ada riwayat scan yang terikat ke ID petugas ini, 
  // pastikan relasi di schema.prisma (AttendanceLog -> scannedBy) sudah di-set 'onDelete: Cascade'
  // atau 'onDelete: SetNull' agar tidak error constraint.
  await prisma.user.delete({
    where: { id: Number(id) }
  })

  return { success: true, message: 'Akun petugas berhasil dihapus.' }
})