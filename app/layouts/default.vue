<template>
  <div class="d-flex min-vh-100 flex-column flex-md-row text-white">
    
    <!-- DESKTOP SIDEBAR -->
    <aside class="d-none d-md-flex flex-column bg-dark border-end shadow-sm" style="width: 250px; position: sticky; top: 0; height: 100vh; z-index: 1030;">
      <div class="p-4 border-bottom text-center">
        <h5 class="fw-bold mb-0 text-white">Admin Membership</h5>
      </div>
      <nav class="nav flex-column p-3 gap-2">
        <NuxtLink to="/" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <span class="fs-5 me-3">📊</span> Dashboard
        </NuxtLink>
        <NuxtLink to="/members" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <span class="fs-5 me-3">👥</span> Member
        </NuxtLink>
        <NuxtLink to="/scanner" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <span class="fs-5 me-3">📷</span> Scanner
        </NuxtLink>
        <NuxtLink to="/settings" class="d-flex align-items-center px-3 py-2 text-secondary text-decoration-none rounded-3 fw-medium" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
          <span class="fs-5 me-3">⚙️</span> Setting
        </NuxtLink>
      </nav>
    </aside>

    <!-- MOBILE TOP HEADER -->
    <header class="d-md-none bg-dark sticky-top shadow-sm border-bottom text-center py-3" style="z-index: 1020;">
      <h5 class="mb-0 fw-bold text-white">Admin Membership</h5>
    </header>

    <!-- AREA KONTEN UTAMA -->
    <main class="flex-grow-1 p-3 p-md-4 pb-5 mb-5 mb-md-0">
      <div class="container-fluid" style="max-width: 1000px;">
        <slot />
      </div>
    </main>

    <!-- MOBILE BOTTOM NAV -->
    <nav class="d-md-none fixed-bottom bg-dark border-top shadow-lg" style="z-index: 1030; padding-bottom: env(safe-area-inset-bottom);">
      <div class="d-flex justify-content-around px-2 py-2">
        <NuxtLink to="/" class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <span class="fs-4 mb-1">📊</span>
          <span style="font-size: 0.7rem;">Dashboard</span>
        </NuxtLink>
        
        <NuxtLink to="/members" class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <span class="fs-4 mb-1">👥</span>
          <span style="font-size: 0.7rem;">Member</span>
        </NuxtLink>
        
        <NuxtLink to="/scanner" class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <span class="fs-4 mb-1">📷</span>
          <span style="font-size: 0.7rem;">Scan</span>
        </NuxtLink>
        
        <NuxtLink to="/settings" class="d-flex flex-column align-items-center justify-content-center p-2 text-secondary text-decoration-none rounded-3" active-class="text-primary fw-bold">
          <span class="fs-4 mb-1">⚙️</span>
          <span style="font-size: 0.7rem;">Setting</span>
        </NuxtLink>
      </div>
    </nav>

  </div>
</template>