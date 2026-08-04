<template>
  <div class="pb-5">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 sticky-top bg-light py-3" style="z-index: 1010;">
      <h3 class="mb-0 fw-bold">Daftar Member</h3>
      <NuxtLink to="/members/create" class="btn btn-primary shadow-sm fw-bold rounded-pill px-4">
        + Tambah
      </NuxtLink>
    </div>

    <!-- List Member -->
    <div v-if="pending" class="text-center text-muted py-5">
      <div class="spinner-border text-primary mb-2" role="status"></div>
      <p>Memuat data member...</p>
    </div>
    
    <div v-else-if="!members || members.length === 0" class="text-center text-muted py-5">
      Belum ada member yang terdaftar.
    </div>

    <!-- Card Member ala Mobile -->
    <div v-else class="row g-3">
      <div class="col-12" v-for="member in members" :key="member.id">
        <!-- Tambahkan event @click untuk membuka detail, kursor pointer untuk UX -->
        <div @click="openDetail(member)" class="card border-0 shadow-sm rounded-4" style="cursor: pointer;">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div class="text-truncate pe-2">
              <h5 class="mb-1 fw-bold text-dark text-truncate">{{ member.name }}</h5>
              <p class="mb-0 text-muted small text-truncate">
                {{ member.phoneNumber || member.email || 'Lihat Detail' }}
              </p>
            </div>
            <!-- Tombol QR Code menggunakan .stop agar tidak memicu klik detail saat tombol ini ditekan -->
            <button @click.stop="showQR(member)" class="btn btn-light border rounded-circle p-2 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" style="width: 45px; height: 45px;">
              📷
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL 1: BOTTOM SHEET DETAIL PROFIL MEMBER -->
    <!-- ========================================== -->
    <div v-if="selectedDetail" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-end transition-all" style="z-index: 1050;" @click.self="selectedDetail = null">
      <div class="bg-white w-100 p-4 shadow-lg" style="border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; max-height: 85vh; overflow-y: auto;">
        
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-bold mb-0">Profil Member</h4>
          <button class="btn-close" @click="selectedDetail = null"></button>
        </div>

        <!-- Menampilkan Seluruh Data Secara Seamless -->
        <div class="list-group list-group-flush mb-4">
          <!-- Data Pasti -->
          <div class="list-group-item px-0 py-2 border-0">
            <small class="text-muted d-block mb-1">Nama Lengkap</small>
            <span class="fw-bold fs-5 text-dark">{{ selectedDetail.name }}</span>
          </div>
          
          <div class="list-group-item px-0 py-2 border-0" v-if="selectedDetail.phoneNumber">
            <small class="text-muted d-block mb-1">Nomor Telepon</small>
            <span class="fw-bold text-dark">{{ selectedDetail.phoneNumber }}</span>
          </div>
          
          <div class="list-group-item px-0 py-2 border-0" v-if="selectedDetail.email">
            <small class="text-muted d-block mb-1">Email</small>
            <span class="fw-bold text-dark">{{ selectedDetail.email }}</span>
          </div>

          <!-- Looping Data Dinamis (Seolah-olah bagian dari data utama) -->
          <template v-if="selectedDetail.dynamicData">
            <div class="list-group-item px-0 py-2 border-0" v-for="(value, key) in parseDynamicData(selectedDetail.dynamicData)" :key="key">
              <small class="text-muted d-block mb-1">{{ key }}</small>
              <span class="fw-bold text-dark">{{ value || '-' }}</span>
            </div>
          </template>
          
          <div class="list-group-item px-0 py-2 border-0 mt-2">
            <small class="text-muted d-block mb-1">Status Sistem</small>
            <span class="badge" :class="selectedDetail.isActive ? 'bg-success' : 'bg-danger'">
              {{ selectedDetail.isActive ? 'Aktif' : 'Tidak Aktif' }}
            </span>
          </div>
        </div>

        <!-- Tombol Aksi Tambahan (Edit akan menyusul) -->
        <div class="d-flex gap-2">
          <!-- <button class="btn btn-outline-primary fw-bold w-100 rounded-pill py-2">✏️ Edit Data</button> -->
          <button @click="showQR(selectedDetail); selectedDetail = null" class="btn btn-dark fw-bold w-100 rounded-pill py-2 shadow-sm">
            Tampilkan QR Code
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL 2: POPUP DOWNLOAD KARTU QR CODE -->
    <!-- ========================================== -->
    <div v-if="selectedMember" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style="z-index: 1060;" @click.self="selectedMember = null">
      <div class="card border-0 rounded-4 p-4 text-center mx-3 shadow-lg bg-white" style="max-width: 350px; width: 100%;">
        
        <h4 class="fw-bold mb-1">{{ selectedMember.name }}</h4>
        <p class="text-muted small mb-3">Tunjukkan QR ini saat Presensi</p>
        
        <div class="bg-light p-2 rounded-3 mb-3 d-inline-block border">
          <img :src="qrImageUrl" alt="QR Code Member" class="rounded" style="width: 250px; height: 250px; display: block;" v-if="qrImageUrl" />
          <div v-else class="spinner-border text-primary my-4" role="status"></div>
        </div>

        <p class="text-muted small mb-3 font-monospace" style="font-size: 11px;">
          ID: {{ selectedMember.uuid }}
        </p>

        <button v-if="qrImageUrl" @click="downloadCard" class="btn btn-success w-100 rounded-pill fw-bold mb-2 shadow-sm py-3" :disabled="isDownloading">
          {{ isDownloading ? 'Memproses...' : '📥 Download Kartu' }}
        </button>
        
        <button class="btn btn-light w-100 rounded-pill fw-bold py-2 border text-muted" @click="selectedMember = null">
          Tutup Layar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'

// Fetch data member dari backend
const { data: members, pending } = await useFetch('/api/members', { server: false })

// State untuk Modal QR
const selectedMember = ref(null)
const qrImageUrl = ref('')
const isDownloading = ref(false)

// State untuk Modal Detail Profil
const selectedDetail = ref(null)

// Fungsi buka detail
const openDetail = (member) => {
  selectedDetail.value = member
}

// Fungsi parsing JSON data dinamis agar aman di-render
const parseDynamicData = (data) => {
  if (!data) return {}
  try {
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch (e) {
    console.error("Gagal membaca data tambahan:", e)
    return {}
  }
}

// Fungsi memunculkan modal QR Code
const showQR = async (member) => {
  selectedMember.value = member
  qrImageUrl.value = ''
  
  try {
    qrImageUrl.value = await QRCode.toDataURL(member.uuid, {
      width: 500, // Render awal kualitas tinggi
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('Gagal membuat QR:', err)
  }
}

// Fungsi Download menggunakan Canvas murni (Sudah fixed ukuran besar full width)
const downloadCard = async () => {
  if (!selectedMember.value || !qrImageUrl.value) return
  isDownloading.value = true

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1050
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 56px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(selectedMember.value.name, canvas.width / 2, 120)

    ctx.fillStyle = '#64748b'
    ctx.font = '26px sans-serif'
    ctx.fillText('Tunjukkan QR Code ini saat Presensi', canvas.width / 2, 180)

    await new Promise((resolve, reject) => {
      const qrImage = new Image()
      qrImage.crossOrigin = 'anonymous'
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 90, 240, 620, 620)
        resolve()
      }
      qrImage.onerror = reject
      qrImage.src = qrImageUrl.value
    })

    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(90, 900)
    ctx.lineTo(710, 900)
    ctx.stroke()

    ctx.fillStyle = '#475569'
    ctx.font = '22px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`ID: ${selectedMember.value.uuid}`, canvas.width / 2, 960)

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `Member_Card_${selectedMember.value.name.replace(/\s+/g, '_')}.png`
    link.click()
  } catch (error) {
    console.error('Gagal membuat gambar kartu:', error)
    alert('Terjadi kesalahan saat mengunduh kartu.')
  } finally {
    isDownloading.value = false
  }
}
</script>