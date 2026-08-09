<script setup>
const route = useRoute()

// Fungsi untuk mengecek apakah rute saat ini bagian dari members
function isMemberActive() {
  return route.path.startsWith('/members')
}

// FUNGSI BARU: Cek apakah di Dashboard ATAU di halaman Logs
function isDashboardActive() {
  return route.path === '/' || route.path.startsWith('/logs')
}

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  } catch (error) {
    console.error('Gagal logout', error)
  }
}
</script>

<template>
  <div class="d-flex min-vh-100 flex-column flex-md-row bg-body text-white">
    
    <!-- DESKTOP SIDEBAR -->
    <aside class="d-none d-md-flex flex-column bg-dark border-end shadow-sm" style="width: 250px; position: sticky; top: 0; height: 100vh; z-index: 1030;">
      <div class="p-4 border-bottom text-center">
        <h5 class="fw-bold mb-0 text-white">MemberTrack</h5>
      </div>
      <nav class="nav flex-column p-3 gap-2 flex-grow-1">
        
        <!-- PERUBAHAN: Gunakan :class dinamis dengan isDashboardActive() -->
        <NuxtLink to="/" class="d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 fw-medium" :class="isDashboardActive() ? 'bg-primary bg-opacity-10 text-primary fw-bold' : 'text-secondary'">
          <Icon name="bi:bi-grid-1x2-fill" class="fs-5 me-3"/> Dashboard
        </NuxtLink>

        <NuxtLink to="/members" class="d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 fw-medium" :class="isMemberActive() ? 'bg-primary bg-opacity-10 text-primary fw-bold' : 'text-secondary'">
          <Icon name="bi:bi-people-fill" class="fs-4 me-3"/> Members
        </NuxtLink>
        <NuxtLink to="/scanner" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <Icon name="bi:bi-qr-code-scan" class="fs-4 me-3"/> Scanner
        </NuxtLink>
        <NuxtLink to="/settings" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <Icon name="bi:bi-gear-fill" class="fs-4 me-3"/> Settings
        </NuxtLink>
        <NuxtLink to="/profile" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <Icon name="bi:bi-person-fill" class="fs-4 me-3"/> Profile
        </NuxtLink>
      </nav>

      <!-- Tombol Logout Desktop -->
      <div class="p-3 border-top border-secondary">
        <button @click="handleLogout" class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold">
          <Icon name="bi:bi-box-arrow-right"/> Logout
        </button>
      </div>
    </aside>

    <!-- MOBILE TOP HEADER -->
    <header class="d-md-none bg-dark sticky-top shadow-sm border-bottom d-flex justify-content-between align-items-center px-3 py-3" style="z-index: 1020;">
      <h5 class="mb-0 fw-bold text-white">MemberTrack</h5>
      <button @click="handleLogout" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
        <Icon name="bi:bi-box-arrow-right"/> Logout
      </button>
    </header>

    <!-- AREA KONTEN UTAMA -->
    <main class="flex-grow-1 p-md-4 pb-5 mb-5 mb-md-0">
      <div class="container-fluid" style="max-width: 1000px;">
        <slot />
      </div>
    </main>

    <!-- MOBILE BOTTOM NAV -->
    <nav class="d-md-none fixed-bottom bg-dark border-top shadow-lg" style="z-index: 1030; padding-bottom: env(safe-area-inset-bottom);">
      <div class="d-flex justify-content-around px-2 py-2">
        
        <!-- PERUBAHAN: Gunakan :class dinamis dengan isDashboardActive() -->
        <NuxtLink to="/" class="d-flex flex-column align-items-center justify-content-center p-2 text-decoration-none rounded-3" :class="isDashboardActive() ? 'text-primary fw-bold' : 'text-secondary'">
          <Icon name="bi:bi-grid-1x2-fill" class="fs-5 mb-1"/>
          <span style="font-size: 0.7rem;">Dashboard</span>
        </NuxtLink>
        
        <NuxtLink to="/members" class="d-flex flex-column align-items-center justify-content-center p-2 text-decoration-none rounded-3" :class="isMemberActive() ? 'text-primary fw-bold' : 'text-secondary'">
          <Icon name="bi:bi-people-fill" class="fs-4 mb-1"/>
          <span style="font-size: 0.7rem;">Members</span>
        </NuxtLink>
        
        <NuxtLink to="/scanner" class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <Icon name="bi:bi-qr-code-scan" class="fs-4 mb-1"/>
          <span style="font-size: 0.7rem;">Scanner</span>
        </NuxtLink>
        
        <NuxtLink to="/settings" class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <Icon name="bi:bi-gear-fill" class="fs-4 mb-1"/>
          <span style="font-size: 0.7rem;">Settings</span>
        </NuxtLink>

        <NuxtLink to="/profile"  class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <Icon name="bi:bi-person-fill" class="fs-4 mb-1"/> <span style="font-size: 0.7rem;">Profile</span>
        </NuxtLink>
      </div>
    </nav>

  </div>
</template>