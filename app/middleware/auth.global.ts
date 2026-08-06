export default defineNuxtRouteMiddleware(async (to) => {
  // Biarkan halaman login bebas diakses tanpa redirect berulang
  if (to.path === '/login') {
    return
  }

  // Cek keberadaan cookie sesi di sisi klien/server
  const sessionCookie = useCookie('user_session')
  
  if (!sessionCookie.value) {
    return navigateTo('/login')
  }
})