<template>
  <div class="d-flex min-vh-100 bg-light flex-column flex-md-row">
    
    <!-- ========================================== -->
    <!-- DESKTOP SIDEBAR (Otomatis muncul di layar besar) -->
    <!-- ========================================== -->
    <aside class="d-none d-md-flex flex-column bg-white border-end shadow-sm" style="width: 250px; position: sticky; top: 0; height: 100vh; z-index: 1030;">
      <div class="p-4 border-bottom text-center">
        <h5 class="fw-bold mb-0 text-dark">Admin Membership</h5>
      </div>
      <nav class="nav flex-column p-3 gap-2">
        <NuxtLink to="/" class="nav-item-desktop" active-class="active-nav">
          <span class="fs-5 me-3">📊</span> Dashboard
        </NuxtLink>
        <NuxtLink to="/members" class="nav-item-desktop" active-class="active-nav">
          <span class="fs-5 me-3">👥</span> Member
        </NuxtLink>
        <NuxtLink to="/scanner" class="nav-item-desktop" active-class="active-nav">
          <span class="fs-5 me-3">📷</span> Scanner
        </NuxtLink>
        <NuxtLink to="/settings" class="nav-item-desktop" active-class="active-nav">
          <span class="fs-5 me-3">⚙️</span> Setting
        </NuxtLink>
      </nav>
    </aside>

    <!-- ========================================== -->
    <!-- MOBILE TOP HEADER (Otomatis muncul di HP) -->
    <!-- ========================================== -->
    <header class="d-md-none bg-white sticky-top shadow-sm border-bottom text-center py-3" style="z-index: 1020;">
      <h5 class="mb-0 fw-bold text-dark">Admin Membership</h5>
    </header>

    <!-- ========================================== -->
    <!-- AREA KONTEN UTAMA -->
    <!-- ========================================== -->
    <main class="flex-grow-1 p-3 p-md-4 main-content">
      <!-- Container untuk membatasi lebar konten di desktop agar tidak melar berlebihan -->
      <div class="container-fluid" style="max-width: 1000px;">
        <slot />
      </div>
    </main>

    <!-- ========================================== -->
    <!-- MOBILE BOTTOM NAV (Otomatis muncul di HP) -->
    <!-- ========================================== -->
    <nav class="d-md-none fixed-bottom bg-white border-top shadow-lg pb-safe" style="z-index: 1030;">
      <div class="d-flex justify-content-around px-2 py-2">
        <NuxtLink to="/" class="nav-item-mobile" active-class="active-nav">
          <span class="fs-4 mb-1 icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </NuxtLink>
        
        <NuxtLink to="/members" class="nav-item-mobile" active-class="active-nav">
          <span class="fs-4 mb-1 icon">👥</span>
          <span class="nav-text">Member</span>
        </NuxtLink>
        
        <NuxtLink to="/scanner" class="nav-item-mobile" active-class="active-nav">
          <span class="fs-4 mb-1 icon">📷</span>
          <span class="nav-text">Scan</span>
        </NuxtLink>
        
        <NuxtLink to="/settings" class="nav-item-mobile" active-class="active-nav">
          <span class="fs-4 mb-1 icon">⚙️</span>
          <span class="nav-text">Setting</span>
        </NuxtLink>
      </div>
    </nav>

  </div>
</template>

<style scoped>
/* Ruang aman untuk gesture bar di iPhone/Android modern */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Margin bawah khusus mobile agar konten tidak tertutup Bottom Nav */
@media (max-width: 767px) {
  .main-content {
    padding-bottom: 90px !important; 
  }
}

/* =========================================
   STYLING DESKTOP SIDEBAR
   ========================================= */
.nav-item-desktop {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #64748b;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item-desktop:hover {
  background-color: #f8fafc;
}

/* =========================================
   STYLING MOBILE BOTTOM NAV
   ========================================= */
.nav-item-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  padding: 6px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-text {
  font-size: 0.7rem;
  font-weight: 500;
}

.icon {
  opacity: 0.7;
}

/* =========================================
   STATE AKTIF (Penanda Halaman Saat Ini)
   Berlaku untuk Desktop maupun Mobile
   ========================================= */
.active-nav {
  background-color: #e0e7ff; /* Latar belakang biru muda tegas */
  color: #4f46e5 !important; /* Teks biru tua */
}

.active-nav .icon {
  opacity: 1; /* Ikon lebih terang */
}

.active-nav .nav-text,
.active-nav {
  font-weight: 700;
}
</style>