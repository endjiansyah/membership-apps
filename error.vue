<template>
  <div class="d-flex align-items-center justify-content-center vh-100 bg-black text-white">
    <div class="text-center">
      <h1 class="display-1 fw-bold text-danger">{{ error.statusCode }}</h1>
      <h4 class="mb-3">{{ error.statusCode === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}</h4>
      <p class="text-secondary mb-4">
        {{ error.message || 'Sepertinya Anda tersesat ke rute yang salah.' }}
      </p>
      <button @click="handleError" class="btn btn-primary rounded-pill px-4 fw-bold text-dark">
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>