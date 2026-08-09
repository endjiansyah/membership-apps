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
  ],

  // ==========================================
  // PENGATURAN OPTIMASI PRODUCTION (AGAR RINGAN)
  // ==========================================
  
  nitro: {
    // Otomatis membuat versi kompresi (Gzip & Brotli) untuk semua file statis (CSS/JS)
    // Server akan mengirimkan file berukuran jauh lebih kecil ke HP pengguna.
    compressPublicAssets: true,
    
    // Memastikan ukuran file mesin backend juga dikecilkan.
    minify: true,
  },

  vite: {
    // Memaksa proses build untuk memadatkan kode secara maksimal
    esbuild: {
      // Otomatis menghapus semua console.log() dan debugger yang tertinggal
      // agar tidak membebani memori browser pengguna.
      drop: ['console', 'debugger'],
    },
    build: {
      // Memastikan file CSS bawaan dan kustom dipadatkan (minify) tanpa sisa spasi kosong
      cssMinify: true
    }
  }
})