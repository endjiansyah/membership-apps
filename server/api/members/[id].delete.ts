import { prisma } from '~~/server/utils/prisma'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member tidak valid.' })
  }

  const memberId = Number(id)

  // 1. Cek eksistensi member
  const existingMember = await prisma.member.findUnique({
    where: { id: memberId }
  })

  if (!existingMember) {
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })
  }

  // 2. Validasi keamanan
  if (existingMember.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Member masih aktif. Nonaktifkan terlebih dahulu sebelum menghapus.'
    })
  }

  // 3. EKSEKUSI PENGHAPUSAN FILE FOTO FISIK
  if (existingMember.photoPath && existingMember.photoPath.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', existingMember.photoPath)
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath) // Menghapus file gambar dari hardisk/server
      }
    } catch (err) {
      console.error('Gagal menghapus file foto fisik:', err)
      // Kita hanya log errornya, jangan biarkan sistem berhenti jika file sudah hilang duluan
    }
  }

  // 4. Hapus data dari database (Cascade manual via Transaction)
  await prisma.$transaction([
    prisma.attendanceLog.deleteMany({ where: { memberId } }),
    prisma.memberAuditLog.deleteMany({ where: { memberId } }),
    prisma.member.delete({ where: { id: memberId } })
  ])

  return { success: true, message: 'Member, foto, dan seluruh riwayatnya berhasil dihapus.' }
})