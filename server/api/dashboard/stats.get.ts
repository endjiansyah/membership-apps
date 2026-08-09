import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Parameter terpisah
  const range = query.range as string || 'today'
  const lbRange = query.lbRange as string || 'all'
  // Bebas menerima berapapun angka dari input box, default 5
  const lbLimit = parseInt(query.lbLimit as string) || 5

  const getDateFilter = (rangeType: string) => {
    if (rangeType === 'all') return undefined
    
    const now = new Date()
    const startDate = new Date()
    
    if (rangeType === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (rangeType === '7d') {
      startDate.setDate(now.getDate() - 7)
    } else if (rangeType === '30d') {
      startDate.setDate(now.getDate() - 30)
    } else if (rangeType === '1y') {
      startDate.setFullYear(now.getFullYear() - 1)
    }
    
    return { gte: startDate, lte: now }
  }

  try {
    const globalDateFilter = getDateFilter(range)
    const leaderboardDateFilter = getDateFilter(lbRange)

    // 1. MEMBER AKTIF (All Time)
    const activeMembers = await prisma.member.count({
      where: { isActive: true }
    })

    // 2. TOTAL KEHADIRAN
    const totalAttendance = await prisma.attendanceLog.count({
      where: globalDateFilter ? { scannedAt: globalDateFilter } : undefined
    })

    // 3. LOG AKTIVITAS (Limit 10 di beranda agar ringkas)
    const logs = await prisma.attendanceLog.findMany({
      where: globalDateFilter ? { scannedAt: globalDateFilter } : undefined,
      orderBy: { scannedAt: 'desc' },
      take: 10, 
      include: { 
        member: { select: { name: true } },
        scannedBy: { select: { name: true } }
      }
    })

    // 4. LEADERBOARD (Limit dinamis sesuai ketikan)
    const leaderboardGroups = await prisma.attendanceLog.groupBy({
      by: ['memberId'],
      where: leaderboardDateFilter ? { scannedAt: leaderboardDateFilter } : undefined,
      _count: { memberId: true },
      orderBy: { _count: { memberId: 'desc' } },
      take: lbLimit
    })

    const memberIds = leaderboardGroups.map(g => g.memberId)
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, uuid: true }
    })

    const leaderboard = leaderboardGroups.map(g => {
      const member = members.find(m => m.id === g.memberId)
      return {
        uuid: member?.uuid || '',
        name: member?.name || 'Member Dihapus',
        count: g._count.memberId
      }
    })

    return {
      stats: { totalAttendance, activeMembers },
      leaderboard,
      data: logs
    }
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Gagal memuat data dashboard' })
  }
})