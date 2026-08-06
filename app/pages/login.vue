<script setup>
import { ref } from 'vue'

// Definisikan layout kosong khusus halaman login agar tidak memakai bottom navigation / layout utama
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const router = useRouter()

async function handleLogin() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { 
        email: email.value, 
        password: password.value 
      }
    })

    if (res.success) {
      // Gunakan window.location agar browser memuat ulang cookie dan state secara penuh
      window.location.href = '/'
    }
  } catch (error) {
    errorMessage.value = error.data?.message || 'Terjadi kesalahan pada server.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper bg-dark text-light d-flex align-items-center justify-content-center min-vh-100 px-3">
    <div class="card bg-secondary text-light p-4 shadow border-0 w-100" style="max-width: 400px;">
      <h3 class="text-center mb-4 fw-bold">MemberTrack Login</h3>
      
      <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="form-control bg-dark text-light border-secondary" 
            placeholder="admin@sidomuncul.com" 
            required 
          />
        </div>

        <div class="mb-4">
          <label class="form-label">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="form-control bg-dark text-light border-secondary" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button 
          type="submit" 
          class="btn btn-warning w-100 fw-bold py-2" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Memastikan halaman login bersih dari scroll vertikal yang tidak perlu */
.login-wrapper {
  overflow-x: hidden;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
</style>