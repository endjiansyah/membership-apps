import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { memberId } = body

  if (!memberId) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member wajib diisi.' })
  }

  // Gunakan user dummy sementara sampai fitur login siap
  let petugas = await prisma.user.findFirst()
  
  const log = await prisma.attendanceLog.create({
    data: {
      memberId: Number(memberId),
      scannedById: petugas?.id || 1, 
      entryMethod: 'MANUAL', // Sesuai dengan enum EntryMethod di schema
    }
  })

  return { success: true, log }
})