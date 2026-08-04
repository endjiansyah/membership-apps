<template>
  <div class="mobile-container pb-5">
    <!-- Header -->
    <div class="d-flex align-items-center mb-4 sticky-top bg-white py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Scanner Presensi</h3>
    </div>

    <!-- Area Kamera Scanner -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-dark text-white text-center">
      <!-- ID "reader" ini wajib ada dan akan digunakan oleh html5-qrcode -->
      <div id="reader" width="100%" class="w-100 min-vh-50 d-flex justify-content-center align-items-center">
        <p v-if="!isScanning" class="my-5 py-5 text-secondary">Kamera Belum Aktif</p>
      </div>
    </div>

    <!-- Tombol Kontrol -->
    <div class="text-center">
      <button 
        v-if="!isScanning" 
        @click="startScanner" 
        class="btn btn-primary btn-lg rounded-pill px-5 shadow-sm fw-bold w-100 py-3"
      >
        📷 Aktifkan Kamera
      </button>
      
      <button 
        v-else 
        @click="stopScanner" 
        class="btn btn-danger btn-lg rounded-pill px-5 shadow-sm fw-bold w-100 py-3"
      >
        Hentikan Kamera
      </button>
    </div>

    <!-- Feedback Hasil Scan Sementara -->
    <div v-if="scanResult" class="alert alert-success mt-4 rounded-4 shadow-sm border-0">
      <h5 class="fw-bold mb-1">Berhasil Membaca QR!</h5>
      <p class="mb-0 small font-monospace text-break">UUID: {{ scanResult }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const isScanning = ref(false)
const scanResult = ref(null)
let html5Qrcode = null

const startScanner = async () => {
  // Kita melakukan import secara dinamis agar tidak error saat proses SSR di server Nuxt
  const { Html5Qrcode } = await import('html5-qrcode')
  html5Qrcode = new Html5Qrcode("reader")
  
  // Konfigurasi ukuran area fokus QR (qrbox) dan frame rate
  const config = { fps: 10, qrbox: { width: 250, height: 250 } }
  
  try {
    // Meminta izin dan menyalakan kamera belakang (environment)
    await html5Qrcode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        // Callback ketika QR Code sukses terbaca
        scanResult.value = decodedText
        
        // Membunyikan suara 'beep' pendek bawaan device (opsional, sebagai feedback)
        if (navigator.vibrate) navigator.vibrate(200)

        // Matikan kamera langsung setelah mendapat hasil untuk menghemat baterai HP
        stopScanner() 
      },
      (errorMessage) => {
        // Callback jika error frame per frame (wajar saat sedang mencari fokus, abaikan saja)
      }
    )
    isScanning.value = true
    scanResult.value = null // Reset hasil sebelumnya
  } catch (err) {
    console.error('Kamera gagal diakses:', err)
    alert("Gagal mengakses kamera. Pastikan Anda memberikan izin (allow) penggunaan kamera di browser.")
  }
}

const stopScanner = async () => {
  if (html5Qrcode && isScanning.value) {
    await html5Qrcode.stop()
    html5Qrcode.clear()
    isScanning.value = false
  }
}

// Keamanan ekstra: Matikan kamera otomatis jika petugas pindah ke halaman lain
onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
/* Memaksa elemen kamera dari html5-qrcode agar rapi di dalam card */
#reader video {
  object-fit: cover !important;
  border-radius: 1rem;
}
</style>