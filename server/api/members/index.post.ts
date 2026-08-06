import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const newMember = await prisma.member.create({
      data: {
        name: body.name,
        email: body.email || null,
        phoneNumber: body.phoneNumber || null,
        photoPath: body.photoPath || null,
        // Menyimpan jawaban form dinamis langsung sebagai objek JSON
        dynamicData: body.dynamicData || {}
      }
    })
    
    return {
      success: true,
      data: newMember
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal menyimpan member. Pastikan data sudah benar.'
    })
  }
})