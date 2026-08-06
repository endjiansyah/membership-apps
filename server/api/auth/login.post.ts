import { prisma } from '~~/server/utils/prisma'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ 
      statusCode: 400, 
      message: 'Email dan password wajib diisi.' 
    })
  }

  const user = await prisma.user.findUnique({ 
    where: { email } 
  })

  if (!user) {
    throw createError({ 
      statusCode: 401, 
      message: 'Email atau password salah.' 
    })
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    throw createError({ 
      statusCode: 401, 
      message: 'Email atau password salah.' 
    })
  }

  // httpOnly dihapus agar bisa dibaca oleh useCookie di middleware client-side
  setCookie(event, 'user_session', JSON.stringify({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role 
  }), {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/'
  })

  return { 
    success: true, 
    message: 'Login berhasil', 
    user: { id: user.id, name: user.name, email: user.email, role: user.role } 
  }
})