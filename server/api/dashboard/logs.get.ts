import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  // Ambil data statistik secara paralel
  const [todayAttendanceCount, activeMembersCount, logs] = await Promise.all([
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: startOfDay },
        deletedAt: null
      }
    }),
    prisma.member.count({
      where: { isActive: true }
    }),
    prisma.attendanceLog.findMany({
      where: {
        scannedAt: { gte: startOfDay },
        deletedAt: null
      },
      include: {
        member: { select: { name: true, uuid: true } },
        scannedBy: { select: { name: true } }
      },
      orderBy: { scannedAt: 'desc' },
      take: 10
    })
  ])

  return {
    success: true,
    stats: {
      todayAttendance: todayAttendanceCount,
      activeMembers: activeMembersCount
    },
    data: logs
  }
})