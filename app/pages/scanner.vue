<template>
  <div class="mobile-container pb-5 mb-5">
    <div class="d-flex align-items-center mb-4 sticky-top bg-light py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Scan Check-in</h3>
    </div>

    <!-- Area Kamera Scanner -->
    <div v-show="!scannedMember" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-dark text-white text-center position-relative">
      <div id="reader" class="w-100 d-flex justify-content-center align-items-center" style="min-height: 300px;"></div>
      
      <div v-if="isLoading" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column justify-content-center align-items-center" style="z-index: 10;">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <span class="text-white fw-bold">Memeriksa Data...</span>
      </div>
    </div>

    <!-- Kartu Hasil Scan -->
    <div v-if="scannedMember" :class="['card border-0 shadow-lg rounded-4', scannedMember.isActive ? 'bg-white' : 'bg-danger text-white']" :style="!scannedMember.isActive ? 'background-color: #fff0f0 !important; border: 2px solid #dc3545 !important;' : ''">
      <div class="card-body p-3 p-md-4 text-center">
        
        <div class="mb-3">
          <span v-if="scannedMember.isActive" class="badge bg-success mb-2 px-3 py-2 rounded-pill shadow-sm">Member Aktif</span>
          <span v-else class="badge bg-danger mb-2 px-3 py-2 rounded-pill shadow-sm">NON-AKTIF</span>
          <h3 class="fw-bold mb-0" :class="scannedMember.isActive ? 'text-dark' : 'text-danger'">{{ scannedMember.name }}</h3>
        </div>

        <!-- Statistik Breakdown (Grid 2x2) -->
        <div class="row g-2 mb-3">
          <div class="col-6">
            <div class="bg-light p-2 rounded-4 border h-100 d-flex flex-column justify-content-center">
              <small class="text-muted d-block mb-1" style="font-size: 0.75rem;">Bulan Ini</small>
              <span class="fw-bold fs-5 text-primary">{{ scannedMember.visitsThisMonth }}x</span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-light p-2 rounded-4 border h-100 d-flex flex-column justify-content-center">
              <small class="text-muted d-block mb-1" style="font-size: 0.75rem;">Tahun Ini</small>
              <span class="fw-bold fs-5 text-primary">{{ scannedMember.visitsThisYear }}x</span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-light p-2 rounded-4 border h-100 d-flex flex-column justify-content-center">
              <small class="text-muted d-block mb-1" style="font-size: 0.75rem;">Total Kunjungan</small>
              <span class="fw-bold fs-5 text-primary">{{ scannedMember.totalVisits }}x</span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-light p-2 rounded-4 border h-100 d-flex flex-column justify-content-center">
              <small class="text-muted d-block mb-1" style="font-size: 0.75rem;">Kunjungan Terakhir</small>
              <span class="fw-bold text-dark" style="font-size: 0.8rem;">
                {{ scannedMember.lastVisit ? new Date(scannedMember.lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Belum Ada' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Toggle Detail Member -->
        <button @click="showDetails = !showDetails" class="btn btn-sm btn-link text-decoration-none mb-3 fw-bold" :class="scannedMember.isActive ? 'text-primary' : 'text-danger'">
          {{ showDetails ? '▲ Sembunyikan Detail' : '▼ Lihat Detail Lengkap' }}
        </button>

        <!-- Area Detail (Tampil jika toggle aktif) -->
        <div v-if="showDetails" class="text-start mb-4 bg-light p-3 rounded-4 border shadow-sm" style="font-size: 0.9rem;">
          <div v-if="scannedMember.phoneNumber" class="mb-2">
            <span class="text-muted d-block" style="font-size: 0.75rem;">Nomor Telepon</span>
            <span class="fw-bold text-dark">{{ scannedMember.phoneNumber }}</span>
          </div>
          <div v-if="scannedMember.email" class="mb-2">
            <span class="text-muted d-block" style="font-size: 0.75rem;">Email</span>
            <span class="fw-bold text-dark">{{ scannedMember.email }}</span>
          </div>
          
          <!-- Looping Data Dinamis -->
          <template v-if="scannedMember.dynamicData">
            <div v-for="(value, key) in parseDynamicData(scannedMember.dynamicData)" :key="key" class="mb-2">
              <span class="text-muted d-block" style="font-size: 0.75rem;">{{ key }}</span>
              <span class="fw-bold text-dark">{{ value || '-' }}</span>
            </div>
          </template>
        </div>

        <!-- Tombol Aksi -->
        <button @click="recordVisit" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow mb-2 py-3" :disabled="isRecording">
          {{ isRecording ? 'Mencatat...' : '✅ Catat Kunjungan' }}
        </button>
        
        <button @click="resetScanner" class="btn btn-light w-100 fw-bold rounded-pill border py-3 text-muted" :disabled="isRecording">
          Batal & Scan Ulang
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scannedMember = ref(null)
const isLoading = ref(false)
const isRecording = ref(false)
const showDetails = ref(false) // State untuk toggle
let html5QrcodeScanner = null

// Fungsi parsing data dinamis yang sama seperti di daftar member
const parseDynamicData = (data) => {
  if (!data) return {}
  try {
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch (e) {
    return {}
  }
}

const startScanner = async () => {
  const { Html5Qrcode } = await import('html5-qrcode')
  html5QrcodeScanner = new Html5Qrcode("reader")
  
  const config = { fps: 10, qrbox: { width: 250, height: 250 } }
  
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    async (decodedText) => {
      if (html5QrcodeScanner.isScanning) {
        await html5QrcodeScanner.stop()
      }
      fetchMemberData(decodedText)
    },
    (errorMessage) => { /* Abaikan error per frame */ }
  ).catch(err => console.error("Kamera gagal dimuat", err))
}

const fetchMemberData = async (uuid) => {
  isLoading.value = true
  showDetails.value = false // Reset toggle setiap scan baru
  try {
    const response = await $fetch(`/api/attendance/check?uuid=${uuid}`)
    scannedMember.value = response
  } catch (error) {
    alert(error.data?.statusMessage || 'QR Code tidak dikenali.')
    startScanner()
  } finally {
    isLoading.value = false
  }
}

const recordVisit = async () => {
  if (!scannedMember.value) return
  
  if (!scannedMember.value.isActive) {
    const confirm1 = confirm("PERINGATAN: Member ini berstatus NON-AKTIF.\n\nApakah Anda yakin ingin mencatat kunjungannya?")
    if (!confirm1) return
    
    const confirm2 = confirm("KONFIRMASI KE-2:\n\nAnda benar-benar yakin ingin memasukkan data member Non-Aktif ini ke dalam log kehadiran?")
    if (!confirm2) return
  }
  
  isRecording.value = true
  try {
    await $fetch('/api/attendance/scan', {
      method: 'POST',
      body: { uuid: scannedMember.value?.uuid }
    })
    
    alert(`✅ Berhasil mencatat kunjungan untuk ${scannedMember.value.name}!`)
    resetScanner()
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal mencatat kunjungan.')
  } finally {
    isRecording.value = false
  }
}

const resetScanner = () => {
  scannedMember.value = null
  showDetails.value = false
  startScanner()
}

onMounted(() => {
  startScanner()
})

onUnmounted(async () => {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    await html5QrcodeScanner.stop()
  }
})
</script>

<style scoped>
.mobile-container {
  padding-bottom: 120px; 
}
</style>