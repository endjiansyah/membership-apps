<template>
  <div class="mobile-container pb-5 mb-5">
    <div class="d-flex align-items-center mb-4 sticky-top bg-light py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Scan Check-in</h3>
    </div>

    <!-- Area Kamera -->
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
          <span v-if="scannedMember.isActive" class="badge bg-success mb-2 px-3 py-2 rounded-pill shadow-sm">Membership Aktif</span>
          <span v-else class="badge bg-danger mb-2 px-3 py-2 rounded-pill shadow-sm">NON-AKTIF</span>
          <h3 class="fw-bold mb-0" :class="scannedMember.isActive ? 'text-dark' : 'text-danger'">{{ scannedMember.name }}</h3>
        </div>

        <div v-if="scannedMember.visitedToday" class="alert alert-warning py-2 px-3 rounded-3 mb-3 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2">
          <span>⚠️</span> Hari ini sudah melakukan check-in.
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <div class="bg-light p-2 rounded-4 border h-100 d-flex flex-column justify-content-center">
              <small class="text-muted d-block mb-1" style="font-size: 0.75rem;">Terakhir Hadir</small>
              <span class="fw-bold text-primary" style="font-size: 0.85rem;">
                {{ scannedMember.lastVisit ? new Date(scannedMember.lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ada' }}
              </span>
            </div>
          </div>
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
              <small class="text-muted d-block mb-1" style="font-size: 0.75rem;">Total Keseluruhan</small>
              <span class="fw-bold fs-5 text-primary">{{ scannedMember.totalVisits }}x</span>
            </div>
          </div>
        </div>

        <button @click="showDetails = !showDetails" class="btn btn-sm btn-link text-decoration-none mb-3 fw-bold" :class="scannedMember.isActive ? 'text-primary' : 'text-danger'">
          {{ showDetails ? '▲ Sembunyikan Detail' : '▼ Lihat Detail Lengkap' }}
        </button>

        <div v-if="showDetails" class="text-start mb-4 bg-light p-3 rounded-4 border shadow-sm" style="font-size: 0.9rem;">
          <div v-if="scannedMember.phoneNumber" class="mb-2">
            <span class="text-muted d-block" style="font-size: 0.75rem;">Nomor Telepon</span>
            <span class="fw-bold text-dark">{{ scannedMember.phoneNumber }}</span>
          </div>
          <div v-if="scannedMember.email" class="mb-2">
            <span class="text-muted d-block" style="font-size: 0.75rem;">Email</span>
            <span class="fw-bold text-dark">{{ scannedMember.email }}</span>
          </div>
          <template v-if="scannedMember.dynamicData">
            <div v-for="(value, key) in parseDynamicData(scannedMember.dynamicData)" :key="key" class="mb-2">
              <span class="text-muted d-block" style="font-size: 0.75rem;">{{ key }}</span>
              <span class="fw-bold text-dark">{{ value || '-' }}</span>
            </div>
          </template>
        </div>

        <!-- AREA TOMBOL (TERPAMPANG SETELAH SCAN) -->
        <div class="d-flex flex-column gap-2 mt-2">
          <template v-if="!scannedMember.isActive">
            <button @click="modal.step = 'CONFIRM_ACTIVATE'" class="btn btn-success btn-lg w-100 fw-bold rounded-pill shadow py-3">
              💳 Aktivasi Membership
            </button>
            <button @click="modal.step = 'CONFIRM_NONACTIVE_RECORD'" class="btn btn-outline-danger w-100 fw-bold rounded-pill py-3 bg-white">
              ✅ Catat Check-in Saja
            </button>
          </template>

          <template v-else>
            <button @click="checkDoubleVisitAndExecute" class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow py-3">
              ✅ Catat Check-in
            </button>
          </template>
          
          <button @click="resetScanner" class="btn btn-light w-100 fw-bold rounded-pill border py-3 text-muted">
            Batal & Scan Ulang
          </button>
        </div>

      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL KONFIRMASI SMART FLOW -->
    <!-- ========================================== -->
    <div v-if="modal.step !== ''" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style="z-index: 1060;">
      <div class="card border-0 rounded-4 p-4 text-center mx-3 shadow-lg bg-white" style="max-width: 350px; width: 100%;">
        
        <!-- Failsafe 1: Jika pilih "Catat Saja", tawarkan opsi Aktivasi lagi di sini -->
        <template v-if="modal.step === 'CONFIRM_NONACTIVE_RECORD'">
          <div class="fs-1 mb-2">⚠️</div>
          <h5 class="fw-bold text-danger mb-3">Konfirmasi Pencatatan</h5>
          <p class="text-muted small mb-4">Member ini masih Non-Aktif. Apakah Anda ingin mengaktifkannya terlebih dahulu sebelum mencatat kehadiran?</p>
          <div class="d-flex flex-column gap-2">
            <!-- Jika ditekan, pindah ke layar konfirmasi aktivasi -->
            <button @click="modal.step = 'CONFIRM_ACTIVATE'" class="btn btn-success fw-bold rounded-pill py-2 shadow-sm">Aktifkan Membership Dulu</button>
            <button @click="checkDoubleVisitAndExecute" class="btn btn-outline-danger fw-bold rounded-pill py-2">Tetap Catat Check-in Saja</button>
            <button @click="modal.step = ''" class="btn btn-light border fw-bold rounded-pill py-2 mt-2">Batal</button>
          </div>
        </template>

        <!-- Lapis 2 Aktivasi: Konfirmasi Final sebelum Eksekusi Aktivasi -->
        <template v-if="modal.step === 'CONFIRM_ACTIVATE'">
          <div class="fs-1 mb-2">💳</div>
          <h5 class="fw-bold text-success mb-3">Konfirmasi Aktivasi</h5>
          <p class="text-muted small mb-4">Anda yakin ingin mengaktifkan membership ini? (Pastikan pembayaran/syarat terpenuhi).</p>
          <div class="d-flex flex-column gap-2">
            <button @click="executeActivation" class="btn btn-success fw-bold rounded-pill py-2 shadow-sm" :disabled="isProcessing">
              {{ isProcessing ? 'Mengaktifkan...' : 'Ya, Aktifkan Sekarang' }}
            </button>
            <!-- Tombol kembali yang cerdas (Tergantung dari mana dia masuk ke sini) -->
            <button @click="modal.step = ''" class="btn btn-light border fw-bold rounded-pill py-2" :disabled="isProcessing">Batal</button>
          </div>
        </template>

        <!-- Flow Lanjutan: Menawarkan Check-in SETELAH Aktivasi Sukses -->
        <template v-if="modal.step === 'POST_ACTIVATE_PROMPT'">
          <div class="fs-1 mb-2">🎉</div>
          <h5 class="fw-bold text-primary mb-3">Berhasil Diaktifkan</h5>
          <p class="text-muted small mb-4">Membership berhasil diaktifkan. Apakah Anda ingin langsung mencatat kehadirannya sekarang?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="checkDoubleVisitAndExecute" class="btn btn-primary fw-bold rounded-pill py-2 shadow-sm">Ya, Catat Kehadiran</button>
            <button @click="resetScanner" class="btn btn-light border fw-bold rounded-pill py-2">Tidak, Selesai</button>
          </div>
        </template>

        <!-- Peringatan Kunjungan Ganda -->
        <template v-if="modal.step === 'ALREADY_VISITED'">
          <div class="fs-1 mb-2">🔄</div>
          <h5 class="fw-bold text-warning mb-3">Kunjungan Ganda</h5>
          <p class="text-muted small mb-4">Member ini sudah tercatat check-in hari ini. Yakin ingin mencatat kehadirannya lagi?</p>
          <div class="d-flex flex-column gap-2">
            <button @click="executeRecord" class="btn btn-warning fw-bold rounded-pill py-2 shadow-sm" :disabled="isProcessing">
              {{ isProcessing ? 'Mencatat...' : 'Ya, Catat Lagi' }}
            </button>
            <button @click="modal.step = ''" class="btn btn-light border fw-bold rounded-pill py-2" :disabled="isProcessing">Batal</button>
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

// ------------------------------------
// FUNGSI 1: AKTIVASI MEMBERSHIP
// ------------------------------------
const executeActivation = async () => {
  isProcessing.value = true
  
  try {
    await $fetch('/api/members/activate', {
      method: 'POST',
      body: { uuid: scannedMember.value?.uuid }
    })
    
    // Ubah state UI jadi hijau tanpa scan ulang
    scannedMember.value.isActive = true
    
    // Munculkan opsi pencatatan kehadiran pasca-aktivasi
    modal.value.step = 'POST_ACTIVATE_PROMPT'
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal mengaktifkan membership.')
    modal.value.step = ''
  } finally {
    isProcessing.value = false
  }
}

// ------------------------------------
// FUNGSI 2: PENCATATAN CHECK-IN
// ------------------------------------
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
    // API ini HANYA mengurus scan kehadiran sesuai API asli Anda
    await $fetch('/api/attendance/scan', {
      method: 'POST',
      body: { uuid: scannedMember.value?.uuid }
    })
    
    alert(`✅ Berhasil mencatat check-in untuk ${scannedMember.value.name}!`)
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

<style scoped>
.mobile-container {
  padding-bottom: 120px; 
}
</style>