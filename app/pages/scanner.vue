<template>
  <div class="container-fluid px-1 px-md-3 py-2 py-md-3 pb-5 mb-5" style="max-width: 600px;">
    
    <!-- TOP HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 p-2">
      <h4 class="mb-0 fw-bold text-white">Scan Check-in</h4>
      <span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 rounded-pill fw-bold">
        LIVE
      </span>
    </div>

    <!-- AREA KAMERA / SCANNER -->
    <div v-show="!scannedMember" class="bg-black rounded-4 overflow-hidden mb-4 position-relative shadow">
      <div class="p-2 bg-dark text-center border-bottom border-secondary border-opacity-25">
        <small class="fw-bold text-secondary text-uppercase" style="font-size: 0.75rem;">Arahkan QR Code ke Kamera</small>
      </div>
      
      <div id="reader" class="w-100 bg-black" style="aspect-ratio: 1 / 1;"></div>
      
      <div v-if="isLoading" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column justify-content-center align-items-center" style="z-index: 10;">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <span class="text-white fw-bold">Memeriksa Data...</span>
      </div>
    </div>

    <!-- KARTU HASIL SCAN (PROFIL & AKSI) -->
    <!-- PERBAIKAN: Padding dikurangi jadi p-3 -->
    <div v-if="scannedMember" class="card border border-secondary border-opacity-25 shadow-lg rounded-4 bg-dark text-white mb-3">
      <div class="card-body p-3">
        
        <!-- Area Avatar & Identitas Utama -->
        <div class="text-center mb-3">
          <div class="d-inline-flex justify-content-center align-items-center bg-dark border border-secondary border-opacity-25 text-primary mb-2 shadow-sm" style="width: 80px; height: 80px; border-radius: 20px; overflow: hidden;">
            <img v-if="scannedMember.photoPath" :src="scannedMember.photoPath" alt="Profile" class="w-100 h-100 object-fit-cover" />
            <span v-else class="fs-3 fw-bold text-uppercase">{{ getInitials(scannedMember.name) }}</span>
          </div>
          
          <div class="mb-1">
            <span class="badge px-3 py-1 rounded-pill" :class="scannedMember.isActive ? 'bg-success text-white' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'">
              {{ scannedMember.isActive ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>

          <!-- PERBAIKAN: Font size judul dan ID disesuaikan -->
          <h5 class="fw-bold text-white mb-1" style="font-size: 1.1rem;">{{ scannedMember.name }}</h5>
          <p class="text-secondary font-monospace mb-0" style="font-size: 0.75rem;">ID: {{ scannedMember.uuid }}</p>
        </div>

        <!-- Peringatan Kunjungan Ganda -->
        <!-- PERBAIKAN: Padding dan font size peringatan -->
        <div v-if="scannedMember.visitedToday" class="alert bg-warning bg-opacity-25 border border-warning text-warning py-1 px-2 rounded-3 mb-3 fw-bold text-center shadow-sm" style="font-size: 0.75rem;">
          ⚠️ Member ini sudah check-in hari ini.
        </div>

        <!-- Statistik Kehadiran -->
        <div class="mb-3">
          <div class="row g-2">
            <div class="col-6">
              <div class="bg-black p-2 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm d-flex flex-column justify-content-center">
                <small class="text-secondary d-block mb-1" style="font-size: 0.65rem;">Terakhir Hadir</small>
                <span class="fw-bold text-primary" style="font-size: 0.75rem;">
                  {{ scannedMember.lastVisit ? new Date(scannedMember.lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ada' }}
                </span>
              </div>
            </div>
            <div class="col-6">
              <div class="bg-black p-2 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm d-flex flex-column justify-content-center">
                <small class="text-secondary d-block mb-1" style="font-size: 0.65rem;">Bulan Ini</small>
                <span class="fw-bold fs-6 text-white">{{ scannedMember.visitsThisMonth }}<small class="text-secondary" style="font-size: 0.6rem;">x</small></span>
              </div>
            </div>
            <div class="col-6">
              <div class="bg-black p-2 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm d-flex flex-column justify-content-center">
                <small class="text-secondary d-block mb-1" style="font-size: 0.65rem;">Tahun Ini</small>
                <span class="fw-bold fs-6 text-white">{{ scannedMember.visitsThisYear }}<small class="text-secondary" style="font-size: 0.6rem;">x</small></span>
              </div>
            </div>
            <div class="col-6">
              <div class="bg-black p-2 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm d-flex flex-column justify-content-center">
                <small class="text-secondary d-block mb-1" style="font-size: 0.65rem;">Total Kehadiran</small>
                <span class="fw-bold fs-6 text-white">{{ scannedMember.totalVisits }}<small class="text-secondary" style="font-size: 0.6rem;">x</small></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi Utama -->
        <!-- PERBAIKAN: Tombol dirampingkan jadi py-2 dan font 0.85rem -->
        <div class="d-flex flex-column gap-2 mt-3 pt-3 border-top border-secondary border-opacity-25">
          <template v-if="!scannedMember.isActive">
            <button @click="modal.step = 'CONFIRM_ACTIVATE'" class="btn btn-success w-100 fw-bold rounded-pill shadow py-2" style="font-size: 0.85rem;">
              Aktivasi Membership
            </button>
            <button @click="modal.step = 'CONFIRM_NONACTIVE_RECORD'" class="btn btn-outline-danger w-100 fw-bold rounded-pill py-2" style="font-size: 0.85rem;">
              Catat Check-in Saja
            </button>
          </template>

          <template v-else>
            <button @click="checkDoubleVisitAndExecute" class="btn btn-primary w-100 fw-bold rounded-pill shadow py-2 text-dark" style="font-size: 0.85rem;">
              Catat Kehadiran (Scan)
            </button>
          </template>
          
          <button @click="resetScanner" class="btn btn-outline-secondary w-100 fw-bold rounded-pill py-2 text-white mt-1 border-secondary border-opacity-50" style="font-size: 0.85rem;">
            Batal & Scan Ulang
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL KONFIRMASI SMART FLOW -->
    <div v-if="modal.step !== ''" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center px-3" style="z-index: 1060; backdrop-filter: blur(4px);">
      <!-- PERBAIKAN MODAL: max-width 300px, padding p-3 -->
      <div class="card border border-secondary border-opacity-50 bg-dark rounded-4 p-3 text-center shadow-lg text-white w-100" style="max-width: 300px;">
        
        <!-- SEMUA TOMBOL DI DALAM MODAL DIJADIKAN py-2 DAN FONT 0.8rem -->
        <template v-if="modal.step === 'CONFIRM_NONACTIVE_RECORD'">
          <h6 class="fw-bold text-danger mb-2" style="font-size: 0.95rem;">Konfirmasi Pencatatan</h6>
          <p class="text-secondary mb-3" style="font-size: 0.75rem;">Status Member ini Non-Aktif. Ingin mengaktifkannya dulu?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="modal.step = 'CONFIRM_ACTIVATE'" class="btn btn-success fw-bold rounded-pill py-2 shadow-sm" style="font-size: 0.8rem;">Aktifkan Dulu</button>
            <button @click="checkDoubleVisitAndExecute" class="btn btn-outline-danger fw-bold rounded-pill py-2" style="font-size: 0.8rem;">Tetap Catat Saja</button>
            <button @click="modal.step = ''" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white border-secondary border-opacity-50" style="font-size: 0.8rem;">Batal</button>
          </div>
        </template>

        <template v-if="modal.step === 'CONFIRM_ACTIVATE'">
          <h6 class="fw-bold text-success mb-2" style="font-size: 0.95rem;">Konfirmasi Aktivasi</h6>
          <p class="text-secondary mb-3" style="font-size: 0.75rem;">Konfirmasi pengaktifan status membership ini?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="executeActivation" class="btn btn-success fw-bold rounded-pill py-2 shadow-sm" style="font-size: 0.8rem;" :disabled="isProcessing">
              {{ isProcessing ? 'Memproses...' : 'Ya, Aktifkan' }}
            </button>
            <button @click="modal.step = ''" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white border-secondary border-opacity-50" style="font-size: 0.8rem;" :disabled="isProcessing">Batal</button>
          </div>
        </template>

        <template v-if="modal.step === 'POST_ACTIVATE_PROMPT'">
          <h6 class="fw-bold text-primary mb-2" style="font-size: 0.95rem;">Aktivasi Berhasil</h6>
          <p class="text-secondary mb-3" style="font-size: 0.75rem;">Ingin langsung mencatat kehadiran member ini?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="checkDoubleVisitAndExecute" class="btn btn-primary fw-bold rounded-pill py-2 shadow-sm text-dark" style="font-size: 0.8rem;">Catat Kehadiran</button>
            <button @click="resetScanner" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white border-secondary border-opacity-50" style="font-size: 0.8rem;">Selesai</button>
          </div>
        </template>

        <template v-if="modal.step === 'ALREADY_VISITED'">
          <h6 class="fw-bold text-warning mb-2" style="font-size: 0.95rem;">Kunjungan Ganda</h6>
          <p class="text-secondary mb-3" style="font-size: 0.75rem;">Member ini sudah check-in hari ini. Lanjutkan pencatatan?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="executeRecord" class="btn btn-warning fw-bold rounded-pill py-2 shadow-sm text-dark" style="font-size: 0.8rem;" :disabled="isProcessing">
              {{ isProcessing ? 'Memproses...' : 'Ya, Catat Lagi' }}
            </button>
            <button @click="modal.step = ''" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white border-secondary border-opacity-50" style="font-size: 0.8rem;" :disabled="isProcessing">Batal</button>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// (KODE SCRIPT SAMA PERSIS, TIDAK ADA LOGIKA YANG BERUBAH)
const scannedMember = ref(null)
const isLoading = ref(false)
const isProcessing = ref(false)
let html5QrcodeScanner = null

const modal = ref({ step: '' }) 

const getInitials = (name) => {
  if (!name) return '?'
  const words = name.trim().split(' ')
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const parseDynamicData = (data) => {
  if (!data) return {}
  try { return typeof data === 'string' ? JSON.parse(data) : data } 
  catch (e) { return {} }
}

const startScanner = async () => {
  const { Html5Qrcode } = await import('html5-qrcode')
  html5QrcodeScanner = new Html5Qrcode("reader")
  
  const config = { 
    fps: 10, 
    aspectRatio: 1.0,
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      return { width: Math.floor(minEdgeSize * 0.85), height: Math.floor(minEdgeSize * 0.85) };
    }
  }
  
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    async (decodedText) => {
      if (html5QrcodeScanner.isScanning) await html5QrcodeScanner.stop()
      fetchMemberData(decodedText)
    },
    () => {}
  ).catch(err => console.error("Kamera gagal dimuat", err))
}

const fetchMemberData = async (uuid) => {
  isLoading.value = true
  modal.value.step = ''
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

const executeActivation = async () => {
  isProcessing.value = true
  try {
    await $fetch('/api/members/activate', {
      method: 'POST',
      body: { uuid: scannedMember.value?.uuid }
    })
    scannedMember.value.isActive = true
    modal.value.step = 'POST_ACTIVATE_PROMPT'
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal mengaktifkan membership.')
    modal.value.step = ''
  } finally {
    isProcessing.value = false
  }
}

const checkDoubleVisitAndExecute = () => {
  if (scannedMember.value.visitedToday) {
    modal.value.step = 'ALREADY_VISITED'
    return
  }
  executeRecord()
}

const executeRecord = async () => {
  isProcessing.value = true
  try {
    await $fetch('/api/attendance/scan', {
      method: 'POST',
      body: { uuid: scannedMember.value?.uuid }
    })
    alert(`Berhasil mencatat check-in untuk ${scannedMember.value.name}.`)
    resetScanner()
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal mencatat check-in.')
    modal.value.step = ''
  } finally {
    isProcessing.value = false
  }
}

const resetScanner = () => {
  scannedMember.value = null
  modal.value.step = ''
  startScanner()
}

onMounted(() => { startScanner() })
onUnmounted(async () => {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    await html5QrcodeScanner.stop()
  }
})
</script>