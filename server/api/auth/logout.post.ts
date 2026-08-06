export default defineEventHandler(async (event) => {
  deleteCookie(event, 'user_session', { path: '/' })
  return { success: true, message: 'Logout berhasil' }
})