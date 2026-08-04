<template>
  <div class="mobile-container pb-5">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 sticky-top bg-white py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Daftar Member</h3>
      <NuxtLink to="/members/create" class="btn btn-primary shadow-sm fw-bold rounded-pill px-3">
        + Tambah
      </NuxtLink>
    </div>

    <!-- List Member -->
    <div v-if="pending" class="text-center text-muted py-5">
      Memuat data member...
    </div>
    
    <div v-else-if="!members || members.length === 0" class="text-center text-muted py-5">
      Belum ada member yang terdaftar.
    </div>

    <!-- Card Member ala Mobile -->
    <div v-else class="row g-3">
      <div class="col-12" v-for="member in members" :key="member.id">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <h5 class="mb-1 fw-bold text-dark">{{ member.name }}</h5>
              <p class="mb-0 text-muted small">
                {{ member.phoneNumber || member.email || 'Tanpa Kontak' }}
              </p>
            </div>
            <!-- Tombol untuk memunculkan QR Code -->
            <button @click="showQR(member)" class="btn btn-light border rounded-circle p-2 shadow-sm d-flex justify-content-center align-items-center" style="width: 45px; height: 45px;">
              📷
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup / Overlay Tampil QR Code -->
    <div v-if="selectedMember" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style="z-index: 9999;" @click.self="selectedMember = null">
      
      <!-- KITA BUNGKUS DENGAN ref="qrCardRef" AGAR BISA DIFOTO -->
      <div class="card border-0 rounded-4 p-4 text-center mx-3 shadow-lg" style="max-width: 350px; width: 100%;">
        
        <!-- AREA YANG AKAN MASUK KE DALAM GAMBAR DOWNLOAD -->
        <div ref="qrCardRef" class="p-3 bg-white rounded-3">
          <h4 class="fw-bold mb-1">{{ selectedMember.name }}</h4>
          <p class="text-muted small mb-3">Tunjukkan QR ini saat Presensi</p>
          
          <div class="bg-light p-2 rounded-3 mb-3 d-inline-block border">
            <img :src="qrImageUrl" alt="QR Code Member" class="img-fluid rounded" v-if="qrImageUrl" />
            <div v-else class="spinner-border text-primary my-4" role="status"></div>
          </div>

          <p class="text-muted small mb-1 font-monospace" style="font-size: 11px;">
            ID: {{ selectedMember.uuid }}
          </p>
        </div>
        <!-- BATAS AREA GAMBAR -->

        <!-- Tombol Aksi (Tidak ikut terfoto) -->
        <button 
          v-if="qrImageUrl" 
          @click="downloadCard" 
          class="btn btn-success w-100 rounded-pill fw-bold mb-2 shadow-sm py-2"
          :disabled="isDownloading"
        >
          {{ isDownloading ? 'Memproses...' : '📥 Download Kartu' }}
        </button>
        
        <button class="btn btn-light w-100 rounded-pill fw-bold py-2 border" @click="selectedMember = null">
          Tutup Layar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'

const { data: members, pending } = await useFetch('/api/members', { server: false })

const selectedMember = ref(null)
const qrImageUrl = ref('')
const qrCardRef = ref(null) // Penanda area yang akan di-screenshot
const isDownloading = ref(false)

const showQR = async (member) => {
  selectedMember.value = member
  qrImageUrl.value = ''
  
  try {
    qrImageUrl.value = await QRCode.toDataURL(member.uuid, {
      width: 250,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('Gagal membuat QR:', err)
  }
}

// Fungsi baru untuk memotret DOM menjadi gambar
const downloadCard = async () => {
  if (!qrCardRef.value) return
  isDownloading.value = true
  
  try {
    // Import dinamis agar tidak membebani render awal aplikasi
    const html2canvas = (await import('html2canvas')).default
    
    // Proses mengubah elemen ref menjadi canvas (gambar)
    const canvas = await html2canvas(qrCardRef.value, {
      scale: 3, // Skala resolusi tinggi agar gambar tidak pecah
      backgroundColor: '#ffffff' // Pastikan background putih
    })
    
    // Buat link download
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `Member_Card_${selectedMember.value.name.replace(/\s+/g, '_')}.png`
    link.click()
  } catch (error) {
    console.error('Gagal mengunduh kartu:', error)
    alert('Terjadi kesalahan saat membuat gambar.')
  } finally {
    isDownloading.value = false
  }
}
</script>