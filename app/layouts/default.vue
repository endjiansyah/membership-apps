<template>
  <div class="bg-light min-vh-100 d-flex flex-column">
    <!-- Top App Bar (Sederhana & Bersih) -->
    <header class="bg-white sticky-top shadow-sm border-bottom text-center py-3" style="z-index: 1020;">
      <h5 class="mb-0 fw-bold text-dark">Sidomunclut Admin</h5>
    </header>

    <!-- Area Konten Utama -->
    <!-- pb-5 dan mb-5 sangat penting agar konten terbawah tidak tertutup oleh navbar bawah -->
    <main class="container py-3 pb-5 mb-5 flex-grow-1">
      <slot />
    </main>

    <!-- Bottom Navigation Bar (Jantung Mobile Experience) -->
    <nav class="fixed-bottom bg-white border-top shadow-lg pb-safe" style="z-index: 1030;">
      <div class="d-flex justify-content-between px-2 py-2">
        
        <NuxtLink to="/" class="nav-btn text-decoration-none d-flex flex-column align-items-center w-25" active-class="active-nav">
          <span class="fs-4 mb-1">📊</span>
          <span class="nav-text">Dashboard</span>
        </NuxtLink>

        <NuxtLink to="/members" class="nav-btn text-decoration-none d-flex flex-column align-items-center w-25" active-class="active-nav">
          <span class="fs-4 mb-1">👥</span>
          <span class="nav-text">Member</span>
        </NuxtLink>

        <!-- Tombol Scanner Dibuat Menonjol (Floating Style) -->
        <NuxtLink to="/scanner" class="nav-btn text-decoration-none d-flex flex-column align-items-center w-25 position-relative" active-class="active-nav">
          <div class="scanner-btn bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow">
            <span class="fs-4">📷</span>
          </div>
          <span class="nav-text mt-1 text-primary fw-bold">Scan</span>
        </NuxtLink>

        <NuxtLink to="/settings" class="nav-btn text-decoration-none d-flex flex-column align-items-center w-25" active-class="active-nav">
          <span class="fs-4 mb-1">⚙️</span>
          <span class="nav-text">Setting</span>
        </NuxtLink>

      </div>
    </nav>
  </div>
</template>

<script setup>
// State isMenuOpen dihapus karena menu sekarang selalu tampil di bawah (tanpa perlu di-toggle)
</script>

<style scoped>
/* Support padding ekstra untuk HP modern (iPhone notch / home indicator) */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-btn {
  color: #94a3b8; /* Abu-abu redup untuk menu tidak aktif */
  transition: all 0.2s ease;
}

.nav-text {
  font-size: 0.7rem;
  font-weight: 500;
}

/* State ketika menu sedang dibuka (aktif) */
.active-nav {
  color: #0f172a !important; /* Warna gelap tegas */
}

.active-nav .nav-text {
  font-weight: 700;
}

/* Styling Khusus Tombol Scanner agar mekar ke atas ala tombol aksi utama */
.scanner-btn {
  width: 48px;
  height: 48px;
  margin-top: -20px; /* Tarik tombol ke atas navbar */
  border: 4px solid #ffffff; /* Beri list putih agar memotong garis navbar */
}
</style>