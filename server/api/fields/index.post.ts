// server/api/fields/index.post.ts
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const generatedKey = body.label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') 
    .replace(/\s+/g, '_')        

  try {
    const newField = await prisma.dynamicField.create({
      data: {
        label: body.label,
        fieldKey: generatedKey,
        type: body.type, 
        isRequired: body.isRequired || false
      }
    })
    return newField
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Gagal menyimpan. Label ini mungkin sudah ada.'
    })
  }
})