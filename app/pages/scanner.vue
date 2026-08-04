<template>
  <div class="mobile-container pb-5">
    <!-- Header -->
    <div class="d-flex align-items-center mb-4 sticky-top bg-white py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Scanner Presensi</h3>
    </div>

    <!-- Area Kamera Scanner -->
<!-- Area Kamera Scanner -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-dark text-white text-center">
      <!-- Biarkan div ini KOSONG. Jangan ada elemen Vue (seperti v-if) di dalamnya -->
      <div id="reader" class="w-100 d-flex justify-content-center align-items-center" style="min-height: 300px;"></div>
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

    <!-- Feedback Hasil Scan -->
    <div v-if="scanResult" class="mt-4 rounded-4 shadow-sm border-0 p-4 text-center" :class="scanStatus === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      <h3 class="fw-bold mb-2">
        {{ scanStatus === 'success' ? '✅ BERHASIL' : '❌ GAGAL' }}
      </h3>
      
      <div v-if="scanStatus === 'success'">
        <h1 class="fw-bold text-uppercase">{{ scanResult.name }}</h1>
        <p class="mb-0 opacity-75">Tercatat pada sistem</p>
      </div>
      <div v-else>
        <p class="mb-0">{{ errorMessage }}</p>
      </div>

      <button @click="resetAndScanAgain" class="btn btn-light btn-lg rounded-pill fw-bold w-100 mt-4 shadow-sm text-dark">
        📷 Scan Berikutnya
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const isScanning = ref(false)
const scanResult = ref(null)
const scanStatus = ref('') 
const errorMessage = ref('')

let html5Qrcode = null
let isProcessing = false // Kunci agar tidak scan berulang kali (double hit)

const startScanner = async () => {
  const { Html5Qrcode } = await import('html5-qrcode')
  html5Qrcode = new Html5Qrcode("reader")
  const config = { fps: 10, qrbox: { width: 250, height: 250 } }
  
  // Buka kunci setiap kali kamera baru dinyalakan
  isProcessing = false 

  try {
    await html5Qrcode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        // Jika sedang memproses data sebelumnya, abaikan pindaian baru
        if (isProcessing) return
        isProcessing = true 

        // Bip jika HP mendukung
        if (navigator.vibrate) navigator.vibrate(200)

        // GUNAKAN SET-TIMEOUT
        // Mengakali bug html5-qrcode dengan mengeluarkan perintah stop 
        // dari putaran frame-rate kamera
        setTimeout(() => {
          // HAPUS kata 'await' di sini agar sistem tidak hang jika kamera gagal mati
          stopScanner().catch(e => console.log('Kamera stop ditangguhkan')) 
          
          // Langsung tembak ke backend tanpa menunggu kamera benar-benar mati
          processPresensi(decodedText)
        }, 100)
      },
      (errorMessage) => {
        // Abaikan error saat sedang mencari fokus
      }
    )
    isScanning.value = true
    scanResult.value = null 
  } catch (err) {
    console.error('Kamera gagal diakses:', err)
    alert("Gagal mengakses kamera. Pastikan Anda mengizinkannya di browser.")
  }
}

const stopScanner = async () => {
  if (html5Qrcode && isScanning.value) {
    try {
      await html5Qrcode.stop()
      html5Qrcode.clear()
    } catch (e) {
      console.warn("Kamera dihentikan secara paksa.")
    }
    isScanning.value = false
  }
}

const processPresensi = async (uuidString) => {
  try {
    const response = await $fetch('/api/attendance/scan', {
      method: 'POST',
      body: { uuid: uuidString }
    })
    
    scanStatus.value = 'success'
    scanResult.value = response.member
  } catch (error) {
    scanStatus.value = 'error'
    scanResult.value = true
    errorMessage.value = error.data?.statusMessage || 'QR Code tidak terdaftar di sistem'
  }
}

const resetAndScanAgain = () => {
  scanResult.value = null
  startScanner()
}

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
#reader video {
  object-fit: cover !important;
  border-radius: 1rem;
}
</style>