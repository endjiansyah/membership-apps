export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Tambahkan blok app ini untuk mengunci tema gelap secara global
  app: {
    head: {
      htmlAttrs: {
        'data-bs-theme': 'dark'
      }
    }
  },

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~~/assets/css/main.css',
    'bootstrap-icons/font/bootstrap-icons.css'
  ]
})