import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body.uuid) {
    throw createError({ statusCode: 400, statusMessage: 'UUID tidak valid.' })
  }

  try {
    const member = await prisma.member.update({
      where: { uuid: body.uuid },
      data: { isActive: true }
    })
    return { success: true, member }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal mengaktifkan membership.' })
  }
})