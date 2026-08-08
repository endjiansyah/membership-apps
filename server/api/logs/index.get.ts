import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { startDate, endDate } = query

  const whereClauseAudit: any = {}
  const whereClauseAttendance: any = {}
  
  if (startDate && endDate) {
    const end = new Date(endDate as string)
    end.setHours(23, 59, 59, 999) 
    
    const dateFilter = {
      gte: new Date(startDate as string),
      lte: end
    }
    
    whereClauseAudit.createdAt = dateFilter
    // Asumsi tabel attendanceLog menggunakan field 'scannedAt' untuk waktu check-in.
    // Jika menggunakan 'createdAt', ubah kembali ke 'createdAt'.
    whereClauseAttendance.scannedAt = dateFilter 
  }

  try {
    const auditLogs = await prisma.memberAuditLog.findMany({
      where: whereClauseAudit,
      include: { member: { select: { name: true } } }
    })

    // PERBAIKAN: Menggunakan prisma.attendanceLog
    const attendances = await prisma.attendanceLog.findMany({
      where: whereClauseAttendance,
      include: { member: { select: { name: true } } }
    })

    const users = await prisma.user.findMany({ 
      select: { id: true, name: true, role: true } 
    })
    
    const formattedAuditLogs = auditLogs.map(log => {
      const actor = users.find(u => u.id === log.performedBy)
      return {
        id: `audit-${log.id}`,
        type: 'AUDIT',
        action: log.action,
        memberName: log.member?.name || 'Member (Telah Dihapus)',
        actorName: actor ? actor.name : 'Super Admin / Sistem',
        createdAt: log.createdAt
      }
    })

    const formattedAttendances = attendances.map(att => {
      // PERBAIKAN: Ambil nama petugas yang melakukan scan dari tabel users (jika ada)
      const actor = users.find(u => u.id === att.scannedById)
      
      return {
        id: `att-${att.id}`,
        type: 'ATTENDANCE',
        // Bedakan label antara scan QR dan input manual berdasarkan entryMethod
        action: att.entryMethod === 'QR_SCAN' ? 'CHECK_IN (QR)' : 'CHECK_IN (MANUAL)', 
        memberName: att.member?.name || 'Member (Telah Dihapus)',
        actorName: actor ? actor.name : 'Sistem',
        // Gunakan scannedAt sebagai patokan waktu kejadian
        createdAt: att.scannedAt 
      }
    })

    const combinedLogs = [...formattedAuditLogs, ...formattedAttendances]
    combinedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return combinedLogs
  } catch (error) {
    console.error('Error fetching combined logs:', error)
    throw createError({ statusCode: 500, statusMessage: 'Gagal mengambil data log sistem.' })
  }
})