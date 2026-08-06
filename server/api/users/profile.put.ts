import { prisma } from '~~/server/utils/prisma'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, name, oldPassword, newPassword } = body

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi tidak valid.' })
  }

  // 1. Cari user di database
  const user = await prisma.user.findUnique({ 
    where: { id: Number(userId) } 
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan.' })
  }

  // Objek data yang akan diupdate
  const updateData: { name?: string; password?: string } = { name }

  // 2. Jika user mengisi kolom password baru
  if (newPassword) {
    if (!oldPassword) {
      throw createError({ statusCode: 400, statusMessage: 'Password lama wajib diisi.' })
    }
    
    // Bandingkan password lama dari form dengan yang ada di database
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      throw createError({ statusCode: 400, statusMessage: 'Password lama tidak sesuai.' })
    }

    // Jika cocok, acak password baru
    const salt = await bcrypt.genSalt(10)
    updateData.password = await bcrypt.hash(newPassword, salt)
  }

  // 3. Simpan perubahan ke database
  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: updateData,
    select: { id: true, name: true, email: true, role: true } // Jangan kembalikan password
  })

  return { success: true, message: 'Profil berhasil diperbarui.', user: updatedUser }
})