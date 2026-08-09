import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  
  // Ambil parameter pagination (default ke halaman 1, limit 15 data per halaman)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 15

  const whereClauseAudit: any = {}
  const whereClauseAttendance: any = {}
  
  // Jika ada filter tanggal
  if (startDate && endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) 
    
    const dateFilter = {
      gte: new Date(startDate),
      lte: end
    }
    
    whereClauseAudit.createdAt = dateFilter
    whereClauseAttendance.scannedAt = dateFilter 
  }

  try {
    // 1. Ambil data Audit Log
    const auditLogs = await prisma.memberAuditLog.findMany({
      where: whereClauseAudit,
      include: { member: { select: { name: true } } }
    })

    // 2. Ambil data Kehadiran
    const attendances = await prisma.attendanceLog.findMany({
      where: whereClauseAttendance,
      include: { member: { select: { name: true } } }
    })

    // 3. Ambil data Petugas untuk referensi nama
    const users = await prisma.user.findMany({ 
      select: { id: true, name: true, role: true } 
    })
    
    // 4. Standarisasi Format Data
    const formattedAuditLogs = auditLogs.map(log => {
      const actor = users.find(u => u.id === log.performedBy)
      return {
        id: `audit-${log.id}`,
        type: 'AUDIT',
        action: log.action,
        memberName: log.member?.name || 'Member (Telah Dihapus)',
        actorName: actor ? actor.name : 'Super Admin / Sistem',
        createdAt: log.createdAt,
        details: log.details // <--- PASTIKAN BARIS INI DITAMBAHKAN
      }
    })

    const formattedAttendances = attendances.map(att => {
      const actor = users.find(u => u.id === att.scannedById)
      return {
        id: `att-${att.id}`,
        type: 'ATTENDANCE',
        action: att.entryMethod === 'QR_SCAN' ? 'CHECK_IN (QR)' : 'CHECK_IN (MANUAL)', 
        memberName: att.member?.name || 'Member (Telah Dihapus)',
        actorName: actor ? actor.name : 'Sistem',
        createdAt: att.scannedAt 
      }
    })

    // 5. Gabungkan kedua data, lalu urutkan berdasarkan waktu (Terbaru di atas)
    const combinedLogs = [...formattedAuditLogs, ...formattedAttendances]
    combinedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // ==========================================
    // 6. PROSES PAGINATION DI SINI
    // ==========================================
    const totalRecords = combinedLogs.length
    const totalPages = Math.ceil(totalRecords / limit)
    
    // Hitung indeks awal dan akhir potongan data
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    // Potong array (hanya ambil 15 data sesuai halaman saat ini)
    const paginatedLogs = combinedLogs.slice(startIndex, endIndex)

    // 7. Kembalikan data dengan format Meta Pagination
    return {
      data: paginatedLogs,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: totalPages === 0 ? 1 : totalPages
      }
    }

  } catch (error) {
    console.error('Error fetching combined logs:', error)
    throw createError({ statusCode: 500, statusMessage: 'Gagal mengambil data log sistem.' })
  }
})