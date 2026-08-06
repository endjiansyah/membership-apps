import { prisma } from '~~/server/utils/prisma'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID Member tidak valid.' })
  }
  
  // 1. Ambil data member lama untuk mengecek apakah punya file foto fisik di server
  const existingMember = await prisma.member.findUnique({
    where: { id: Number(id) }
  })

  if (existingMember && existingMember.photoPath && !existingMember.photoPath.startsWith('data:image')) {
    // Tentukan path absolut file jika disimpan sebagai file fisik
    const filePath = path.join(process.cwd(), 'public', existingMember.photoPath)
    
    // 2. Hapus file fisik jika ada di server
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  // 3. Lanjutkan proses hapus data member dari database
  await prisma.member.delete({
    where: { id: Number(id) }
  })

  return { success: true, message: 'Member dan file foto berhasil dibersihkan.' }
})