import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // Menarik semua data member, diurutkan dari yang paling baru mendaftar
  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      uuid: true,
      name: true,
      email: true,
      phoneNumber: true,
      isActive: true,
      createdAt: true,
      dynamicData: true // <--- INI KUNCINYA AGAR MUNCUL DI MODAL
    }
  })
  
  return members
})