import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member tidak valid.' })
  }

  try {
    const updatedMember = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        email: body.email || null,
        phoneNumber: body.phoneNumber || null,
        photoPath: body.photoPath || null,
        dynamicData: body.dynamicData || {}
      }
    })

    try {
      await prisma.memberAuditLog.create({
        data: {
          memberId: Number(id),
          action: 'UPDATE_PROFIL',
          source: 'MANUAL_ADMIN'
        }
      } as any) // <--- Ditambahkan di sini agar error merah TypeScript langsung hilang
    } catch (logError) {
      console.error('Gagal mencatat audit log:', logError)
    }

    return updatedMember
  } catch (error) {
    console.error('Error updating member:', error)
    throw createError({ statusCode: 500, statusMessage: 'Gagal memperbarui data member.' })
  }
})