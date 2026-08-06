import { prisma } from '~~/server/utils/prisma'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid.' })

  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'Data tidak valid.' })

  let name = ''
  let phoneNumber = ''
  let email = ''
  let dynamicData = {}
  let newPhotoPath = undefined

  // Ambil data member lama untuk cek foto lama & komparasi perubahan
  const existingMember = await prisma.member.findUnique({
    where: { id: Number(id) }
  })

  for (const field of formData) {
    if (field.name === 'name') name = field.data.toString()
    if (field.name === 'phoneNumber') phoneNumber = field.data.toString()
    if (field.name === 'email') email = field.data.toString()
    if (field.name === 'dynamicData') {
      try { dynamicData = JSON.parse(field.data.toString()) } catch (e) {}
    }
    if (field.name === 'photo' && field.filename && field.data.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'members')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const ext = path.extname(field.filename) || '.jpg'
      const filename = `member-${id}-${Date.now()}${ext}`
      const absolutePath = path.join(uploadDir, filename)

      fs.writeFileSync(absolutePath, field.data)
      newPhotoPath = `/uploads/members/${filename}`

      if (existingMember?.photoPath && existingMember.photoPath.startsWith('/uploads/')) {
        const oldFile = path.join(process.cwd(), 'public', existingMember.photoPath)
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile)
      }
    }
  }

  // ==== DETEKSI PERUBAHAN ====
  const changes = []
  if (existingMember?.name !== name) changes.push({ field: 'Nama Lengkap', old: existingMember?.name || '-', new: name || '-' })
  if (existingMember?.phoneNumber !== phoneNumber) changes.push({ field: 'Nomor HP', old: existingMember?.phoneNumber || '-', new: phoneNumber || '-' })
  if (existingMember?.email !== email) changes.push({ field: 'Email', old: existingMember?.email || '-', new: email || '-' })
  
  if (JSON.stringify(existingMember?.dynamicData || {}) !== JSON.stringify(dynamicData || {})) {
    changes.push({ field: 'Data Tambahan', old: 'Format Lama', new: 'Format Baru' })
  }
  
  if (newPhotoPath) {
    changes.push({ field: 'Foto Member', old: existingMember?.photoPath ? 'Terganti' : 'Tidak Ada', new: 'Diperbarui' })
  }

  // Jika tidak ada perubahan sama sekali tapi tombol save ditekan, kita hindari menyimpan array kosong
  const detailsJson = changes.length > 0 ? JSON.stringify(changes) : null
  // ============================

  const updatedMember = await prisma.member.update({
    where: { id: Number(id) },
    data: {
      name,
      phoneNumber,
      email,
      dynamicData,
      ...(newPhotoPath ? { photoPath: newPhotoPath } : {})
    }
  })

  const petugas = await prisma.user.findFirst()
  const petugasId = petugas?.id || 1

  try {
    await prisma.memberAuditLog.create({
      data: {
        memberId: Number(id),
        action: 'UPDATE_PROFIL', // Kita tetap gunakan key ini di DB, labelnya kita ganti di UI
        source: 'MANUAL_ADMIN',
        performedBy: petugasId,
        details: detailsJson // Menyimpan detail dalam format JSON
      }
    })
  } catch (auditError) {
    console.error('Gagal mencatat audit log:', auditError)
  }

  return { success: true, data: updatedMember }
})