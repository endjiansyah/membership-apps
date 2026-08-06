import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const sessionCookie = getCookie(event, 'user_session')

  if (!sessionCookie) {
    throw createError({ statusCode: 401, message: 'Unauthorized: Sesi tidak ditemukan.' })
  }

  try {
    const sessionData = JSON.parse(sessionCookie)
    const user = await prisma.user.findUnique({
      where: { id: sessionData.id },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      throw createError({ statusCode: 401, message: 'Unauthorized: User tidak valid.' })
    }

    return { success: true, user }
  } catch {
    throw createError({ statusCode: 401, message: 'Unauthorized: Sesi rusak atau kedaluwarsa.' })
  }
})