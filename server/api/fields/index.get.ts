// server/api/fields/index.get.ts
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const fields = await prisma.dynamicField.findMany({
    orderBy: { createdAt: 'asc' }
  })
  
  return fields
})