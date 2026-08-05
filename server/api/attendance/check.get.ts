import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const uuid = query.uuid as string

  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'QR Code tidak valid.' })
  }

  const member = await prisma.member.findUnique({
    where: { uuid: uuid },
    include: {
      logs: {
        orderBy: { scannedAt: 'desc' }
      }
    }
  })

  if (!member) {
    throw createError({ statusCode: 404, statusMessage: 'QR Code tidak terdaftar di sistem!' })
  }

  // Waktu saat ini untuk perbandingan
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Kalkulasi Statistik
  const totalVisits = member.logs?.length || 0
  const lastVisit = totalVisits > 0 ? member.logs[0]?.scannedAt : null
  
  const visitsThisMonth = member.logs?.filter(log => {
    const logDate = new Date(log.scannedAt)
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
  }).length || 0

  const visitsThisYear = member.logs?.filter(log => {
    const logDate = new Date(log.scannedAt)
    return logDate.getFullYear() === currentYear
  }).length || 0

  // Kembalikan semua data yang dibutuhkan frontend
  return {
    uuid: member.uuid,
    name: member.name,
    isActive: member.isActive,
    email: member.email,
    phoneNumber: member.phoneNumber,
    dynamicData: member.dynamicData, // Pastikan data dinamis terkirim
    totalVisits,
    visitsThisMonth,
    visitsThisYear,
    lastVisit
  }
})