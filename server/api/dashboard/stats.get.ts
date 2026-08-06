import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const range = (query.range as string) || 'today'

  const now = new Date()
  let startDate = new Date()

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0)
  } else if (range === '7d') {
    startDate.setDate(now.getDate() - 7)
  } else if (range === '30d') {
    startDate.setDate(now.getDate() - 30)
  } else if (range === '1y') {
    startDate.setFullYear(now.getFullYear() - 1)
  } else {
    startDate = new Date(0) // All time
  }

  const [totalAttendance, activeMembers, topMembers, recentLogs] = await Promise.all([
    // Total kehadiran berdasarkan filter rentang waktu
    prisma.attendanceLog.count({
      where: { scannedAt: { gte: startDate }, deletedAt: null }
    }),
    // Total keseluruhan member aktif
    prisma.member.count({
      where: { isActive: true }
    }),
    // Peringkat member paling rajin (Leaderboard)
    prisma.attendanceLog.groupBy({
      by: ['memberId'],
      where: { scannedAt: { gte: startDate }, deletedAt: null },
      _count: { memberId: true },
      orderBy: { _count: { memberId: 'desc' } },
      take: 5
    }),
    // Log aktivitas terbaru dalam rentang waktu
    prisma.attendanceLog.findMany({
      where: { scannedAt: { gte: startDate }, deletedAt: null },
      include: {
        member: { select: { name: true, uuid: true } },
        scannedBy: { select: { name: true } }
      },
      orderBy: { scannedAt: 'desc' },
      take: 10
    })
  ])

  // Ambil detail nama member untuk leaderboard
  const memberIds = topMembers.map(item => item.memberId)
  const membersData = await prisma.member.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, name: true, uuid: true }
  })

  const leaderboard = topMembers.map(item => {
    const m = membersData.find(x => x.id === item.memberId)
    return {
      name: m?.name || 'Member Tidak Dikenal',
      uuid: m?.uuid,
      count: item._count.memberId
    }
  })

  return {
    success: true,
    stats: {
      totalAttendance,
      activeMembers,
      range
    },
    leaderboard,
    data: recentLogs
  }
})