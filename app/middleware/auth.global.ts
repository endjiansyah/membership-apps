export default defineNuxtRouteMiddleware((to) => {
  const sessionCookie = useCookie('user_session')

  // 1. Jika TIDAK ADA cookie dan mencoba akses halaman selain login -> tendang ke login
  if (!sessionCookie.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 2. Jika SUDAH ADA cookie tapi malah mencoba buka halaman login -> arahkan ke dasbor
  if (sessionCookie.value && to.path === '/login') {
    return navigateTo('/') // Sesuaikan dengan route dasbor Anda (misal: '/members' atau '/')
  }
})