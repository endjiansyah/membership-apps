import { prisma } from '~~/server/utils/prisma'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp' // Import library kompresi gambar

export default defineEventHandler(async (event) => {
  // Menggunakan formData untuk menerima file fisik, BUKAN json base64
  const formData = await readMultipartFormData(event)
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Data form tidak valid. Pastikan mengirim FormData.' })
  }

  let name = ''
  let phoneNumber = ''
  let email = ''
  let dynamicData = {}
  let photoPath = null // Default kosong

  for (const field of formData) {
    if (field.name === 'name') name = field.data.toString()
    if (field.name === 'phoneNumber') phoneNumber = field.data.toString()
    if (field.name === 'email') email = field.data.toString()
    if (field.name === 'dynamicData') {
      try { dynamicData = JSON.parse(field.data.toString()) } catch (e) {}
    }
    
    // TANGKAP FILE FOTO, KOMPRESI, DAN SIMPAN KE FOLDER
    if (field.name === 'photo' && field.filename && field.data.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'members')
      
      // Buat folder jika belum ada
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      // Generate nama file unik dengan ekstensi .webp
      const filename = `member-${Date.now()}.webp`
      const absolutePath = path.join(uploadDir, filename)

      // PROSES KOMPRESI DENGAN SHARP
      await sharp(field.data)
        .resize(500, 500, { fit: 'cover' }) // Potong kotak ukuran 500x500
        .webp({ quality: 80 }) // Kompres ke format WEBP (kualitas 80%)
        .toFile(absolutePath) // Simpan ke folder public/uploads/members/

      // Path inilah yang akan disimpan ke database
      photoPath = `/uploads/members/${filename}`
    }
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama wajib diisi.' })
  }

  // Simpan ke Database
  const newMember = await prisma.member.create({
    data: {
      name,
      phoneNumber,
      email,
      dynamicData,
      photoPath // Hanya menyimpan string seperti "/uploads/members/member-123.webp"
    }
  })

  // Catat ke Audit Trail
  const authUser = event.context.user // Asumsi Anda menyimpan sesi user di context
  await prisma.memberAuditLog.create({
    data: {
      memberId: newMember.id,
      action: 'CREATE_MEMBER',
      source: 'MANUAL_ADMIN',
      performedBy: authUser?.id || 1, 
      details: null
    }
  })

  return { success: true, data: newMember }
})