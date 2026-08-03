<!-- layouts/default.vue -->
<template>
  <div>
    <!-- Navbar Bootstrap -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <NuxtLink class="navbar-brand fw-bold" to="/">Admin Membership</NuxtLink>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span> 
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <NuxtLink class="nav-link" active-class="active" to="/">Dashboard</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" active-class="active" to="/members">Data Member</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link text-warning fw-bold" active-class="active" to="/scanner">
                📷 Scanner
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" active-class="active" to="/settings">Pengaturan Form</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Konten Halaman Akan Muncul di Sini -->
    <main class="container py-4">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Sedikit styling tambahan jika diperlukan */
.navbar-brand {
  letter-spacing: 1px;
}
</style>