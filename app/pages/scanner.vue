<template>
  <div class="container-fluid px-3 py-3 pb-5 mb-5" style="max-width: 600px;">
    
    <!-- TOP HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 p-2">
      <h4 class="mb-0 fw-bold text-white">Scan Check-in</h4>
      <span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 rounded-pill fw-bold">
        LIVE
      </span>
    </div>

    <!-- AREA KAMERA / SCANNER (Dibuat Persegi 1:1) -->
    <div v-show="!scannedMember" class="bg-black rounded-4 overflow-hidden mb-4 position-relative shadow">
      <div class="p-2 bg-dark text-center border-bottom border-secondary border-opacity-25">
        <small class="fw-bold text-secondary text-uppercase" style="font-size: 0.75rem;">Arahkan QR Code ke Kamera</small>
      </div>
      
      <!-- Wadah kamera dipaksa menjadi persegi (aspect-ratio: 1/1) -->
      <div id="reader" class="w-100 bg-black" style="aspect-ratio: 1 / 1;"></div>
      
      <div v-if="isLoading" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column justify-content-center align-items-center" style="z-index: 10;">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <span class="text-white fw-bold">Memeriksa Data...</span>
      </div>
    </div>

    <!-- KARTU HASIL SCAN -->
    <div v-if="scannedMember" class="card border border-secondary border-opacity-25 shadow-lg rounded-4 bg-dark text-white mb-3">
      <div class="card-body p-4">
        
        <!-- Status & Nama Member -->
        <div class="text-center mb-4">
          <span v-if="scannedMember.isActive" class="badge bg-success mb-2 px-3 py-2 rounded-pill shadow-sm">Aktif</span>
          <span v-else class="badge bg-danger mb-2 px-3 py-2 rounded-pill shadow-sm">Non-Aktif</span>
          <h3 class="fw-bold mb-1" :class="scannedMember.isActive ? 'text-white' : 'text-danger'">{{ scannedMember.name }}</h3>
          <p class="text-secondary small mb-0 font-monospace">ID: {{ scannedMember.uuid?.slice(0, 8) }}...</p>
        </div>

        <div v-if="scannedMember.visitedToday" class="alert alert-warning py-2 px-3 rounded-3 mb-3 fw-bold small text-center shadow-sm">
          Pemberitahuan: Anggota ini sudah melakukan check-in hari ini.
        </div>

        <!-- STATISTIK GRID -->
        <div class="row g-2 mb-4">
          <div class="col-6">
            <div class="bg-body p-3 rounded-4 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Terakhir Hadir</small>
              <span class="fw-bold text-primary" style="font-size: 0.8rem;">
                {{ scannedMember.lastVisit ? new Date(scannedMember.lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ada' }}
              </span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-body p-3 rounded-4 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Bulan Ini</small>
              <span class="fw-bold fs-4 text-primary">{{ scannedMember.visitsThisMonth }}<small class="fs-6">x</small></span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-body p-3 rounded-4 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Tahun Ini</small>
              <span class="fw-bold fs-4 text-primary">{{ scannedMember.visitsThisYear }}<small class="fs-6">x</small></span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-body p-3 rounded-4 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Total Keseluruhan</small>
              <span class="fw-bold fs-4 text-primary">{{ scannedMember.totalVisits }}<small class="fs-6">x</small></span>
            </div>
          </div>
        </div>

        <!-- Tombol Toggle Detail -->
        <div class="text-center mb-3">
          <button @click="showDetails = !showDetails" class="btn btn-sm btn-link text-decoration-none fw-bold text-primary p-0">
            {{ showDetails ? 'Tutup Detail' : 'Lihat Detail Lengkap' }}
          </button>
        </div>

        <!-- Detail Tambahan -->
        <div v-if="showDetails" class="text-start mb-4 bg-body p-3 rounded-4 border border-secondary border-opacity-25 shadow-sm" style="font-size: 0.85rem;">
          <div v-if="scannedMember.phoneNumber" class="mb-2">
            <span class="text-secondary d-block" style="font-size: 0.7rem;">Nomor Telepon</span>
            <span class="fw-bold text-white">{{ scannedMember.phoneNumber }}</span>
          </div>
          <div v-if="scannedMember.email" class="mb-2">
            <span class="text-secondary d-block" style="font-size: 0.7rem;">Email</span>
            <span class="fw-bold text-white">{{ scannedMember.email }}</span>
          </div>
          <template v-if="scannedMember.dynamicData">
            <div v-for="(value, key) in parseDynamicData(scannedMember.dynamicData)" :key="key" class="mb-2">
              <span class="text-secondary d-block" style="font-size: 0.7rem;">{{ key }}</span>
              <span class="fw-bold text-white">{{ value || '-' }}</span>
            </div>
          </template>
        </div>

        <!-- TOMBOL AKSI UTAMA -->
        <div class="d-flex flex-column gap-2">
          <template v-if="!scannedMember.isActive">
            <button @click="modal.step = 'CONFIRM_ACTIVATE'" class="btn btn-success btn-lg w-100 fw-bold rounded-pill shadow py-3">
              Aktivasi Membership
            </button>
            <button @click="modal.step = 'CONFIRM_NONACTIVE_RECORD'" class="btn btn-outline-danger w-100 fw-bold rounded-pill py-3">
              Catat Check-in Saja
            </button>
          </template>

          <template v-else>
            <button @click="checkDoubleVisitAndExecute" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow py-3 text-dark">
              Catat Check-in
            </button>
          </template>
          
          <button @click="resetScanner" class="btn btn-outline-secondary w-100 fw-bold rounded-pill py-3 text-white mt-1">
            Batal & Scan Ulang
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL KONFIRMASI -->
    <div v-if="modal.step !== ''" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center px-3" style="z-index: 1060;">
      <div class="card border border-secondary border-opacity-50 bg-dark rounded-4 p-4 text-center shadow-lg text-white w-100" style="max-width: 350px;">
        
        <template v-if="modal.step === 'CONFIRM_NONACTIVE_RECORD'">
          <h5 class="fw-bold text-danger mb-3">Konfirmasi Pencatatan</h5>
          <p class="text-secondary small mb-4">Status anggota ini Non-Aktif. Apakah Anda ingin mengaktifkannya terlebih dahulu?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="modal.step = 'CONFIRM_ACTIVATE'" class="btn btn-success fw-bold rounded-pill py-2 shadow-sm">Aktifkan Dulu</button>
            <button @click="checkDoubleVisitAndExecute" class="btn btn-outline-danger fw-bold rounded-pill py-2">Tetap Catat Check-in</button>
            <button @click="modal.step = ''" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white">Batal</button>
          </div>
        </template>

        <template v-if="modal.step === 'CONFIRM_ACTIVATE'">
          <h5 class="fw-bold text-success mb-3">Konfirmasi Aktivasi</h5>
          <p class="text-secondary small mb-4">Konfirmasi pengaktifan status membership anggota ini?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="executeActivation" class="btn btn-success fw-bold rounded-pill py-2 shadow-sm" :disabled="isProcessing">
              {{ isProcessing ? 'Memproses...' : 'Ya, Aktifkan' }}
            </button>
            <button @click="modal.step = ''" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white" :disabled="isProcessing">Batal</button>
          </div>
        </template>

        <template v-if="modal.step === 'POST_ACTIVATE_PROMPT'">
          <h5 class="fw-bold text-primary mb-3">Aktivasi Berhasil</h5>
          <p class="text-secondary small mb-4">Apakah Anda ingin langsung mencatat kehadiran anggota ini?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="checkDoubleVisitAndExecute" class="btn btn-primary fw-bold rounded-pill py-2 shadow-sm text-dark">Catat Kehadiran</button>
            <button @click="resetScanner" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white">Selesai</button>
          </div>
        </template>

        <template v-if="modal.step === 'ALREADY_VISITED'">
          <h5 class="fw-bold text-warning mb-3">Peringatan Kunjungan Ganda</h5>
          <p class="text-secondary small mb-4">Anggota ini sudah tercatat check-in pada hari ini. Lanjutkan pencatatan?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="executeRecord" class="btn btn-warning fw-bold rounded-pill py-2 shadow-sm text-dark" :disabled="isProcessing">
              {{ isProcessing ? 'Memproses...' : 'Ya, Catat Lagi' }}
            </button>
            <button @click="modal.step = ''" class="btn btn-outline-secondary fw-bold rounded-pill py-2 text-white" :disabled="isProcessing">Batal</button>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scannedMember = ref(null)
const isLoading = ref(false)
const isProcessing = ref(false)
const showDetails = ref(false)
let html5QrcodeScanner = null

const modal = ref({ step: '' }) 

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
  
  const config = { 
    fps: 10, 
    aspectRatio: 1.0,
    // Membuat ukuran kotak scan responsif: mengambil 85% dari layar kamera
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      const dynamicSize = Math.floor(minEdgeSize * 0.85);
      return { width: dynamicSize, height: dynamicSize };
    }
  }
  
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    async (decodedText) => {
      if (html5QrcodeScanner.isScanning) {
        await html5QrcodeScanner.stop()
      }
      fetchMemberData(decodedText)
    },
    (errorMessage) => {}
  ).catch(err => console.error("Kamera gagal dimuat", err))
}

const fetchMemberData = async (uuid) => {
  isLoading.value = true
  showDetails.value = false
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
  showDetails.value = false
  modal.value.step = ''
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