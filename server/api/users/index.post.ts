import { prisma } from '~~/server/utils/prisma'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, role } = body

  // 1. Validasi Input Dasar
  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, dan password wajib diisi.' })
  }

  // 2. Cek Duplikasi Email
  const existingUser = await prisma.user.findUnique({ 
    where: { email } 
  })
  
  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'Email ini sudah terdaftar sebagai petugas.' })
  }

  // 3. Hash Password (Mengacak password sebanyak 10 putaran)
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // 4. Simpan ke Database
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'PETUGAS'
    },
    // Jangan kembalikan password yang sudah di-hash ke frontend
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  return newUser
})