<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div class="container">
        <NuxtLink class="navbar-brand fw-bold" to="/">Admin Membership</NuxtLink>
        
        <!-- Tombol Hamburger (Vue Action) -->
        <button class="navbar-toggler" type="button" @click="isMenuOpen = !isMenuOpen">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Kontainer Menu (Vue Class Binding) -->
        <div class="collapse navbar-collapse" :class="{ 'show': isMenuOpen }">
          <ul class="navbar-nav ms-auto text-center mt-3 mt-lg-0">
            <li class="nav-item mb-2 mb-lg-0">
              <NuxtLink class="nav-link" active-class="active" to="/" @click="isMenuOpen = false">Dashboard</NuxtLink>
            </li>
            <li class="nav-item mb-2 mb-lg-0">
              <NuxtLink class="nav-link" active-class="active" to="/members" @click="isMenuOpen = false">Data Member</NuxtLink>
            </li>
            <li class="nav-item mb-2 mb-lg-0">
              <NuxtLink class="nav-link text-warning fw-bold bg-dark rounded px-3" active-class="active" to="/scanner" @click="isMenuOpen = false">
                📷 Scanner
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" active-class="active" to="/settings" @click="isMenuOpen = false">Pengaturan Form</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container py-4">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State untuk mengontrol buka-tutup navbar mobile
const isMenuOpen = ref(false)
</script>