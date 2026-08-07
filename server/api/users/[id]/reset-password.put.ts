import { prisma } from '~~/server/utils/prisma'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { newPassword } = body

  if (!id || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'ID dan password baru wajib diisi.' })
  }

  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru minimal 6 karakter.' })
  }

  // 1. Cek apakah user ada
  const targetUser = await prisma.user.findUnique({
    where: { id: Number(id) }
  })

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'Akun petugas tidak ditemukan.' })
  }

  // 2. Hash password baru
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPassword, salt)

  // 3. Update password di database
  await prisma.user.update({
    where: { id: Number(id) },
    data: { password: hashedPassword }
  })

  return { success: true, message: 'Password petugas berhasil direset.' }
})