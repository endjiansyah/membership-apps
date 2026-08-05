<template>
  <div class="min-vh-100 pb-5">
    
    <!-- Header -->
    <!-- Menggunakan class bg-dark (yang otomatis menjadi warna Mocha karena CSS di atas) -->
    <div class="d-flex justify-content-between align-items-center mb-4 sticky-top py-3 px-3 bg-dark border-bottom" style="z-index: 1010;">
      <div>
        <!-- Menggunakan class text-primary (Otomatis menjadi warna Amber) -->
        <span class="text-primary fw-bolder text-uppercase" style="font-size: 0.75rem;">DIRECTORY</span>
        <h3 class="mb-0 fw-bold text-white">Daftar Member</h3>
      </div>
      <!-- Menggunakan class btn-primary -->
      <NuxtLink to="/members/create" class="btn btn-primary shadow-sm fw-bold rounded-pill px-4 py-2 text-dark">
        + Baru
      </NuxtLink>
    </div>

    <!-- List Member -->
    <div class="px-3">
      <div v-if="pending" class="text-center py-5">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <p class="text-secondary">Memuat data member...</p>
      </div>
      
      <div v-else-if="!members || members.length === 0" class="text-center py-5 text-secondary">
        Belum ada member yang terdaftar.
      </div>

      <!-- Card Member -->
      <div v-else class="d-flex flex-column gap-3">
        <!-- Menggunakan class bg-dark dan border bawaan Bootstrap -->
        <NuxtLink 
          v-for="member in members" 
          :key="member.id" 
          :to="`/members/${member.id}`"
          class="card border bg-dark p-3 text-decoration-none d-flex flex-row justify-content-between align-items-center rounded-4"
        >
          <div class="text-truncate pe-2">
            <h5 class="mb-1 fw-bold text-white text-truncate">{{ member.name }}</h5>
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-circle" :class="member.isActive ? 'bg-success' : 'bg-danger'" style="width: 8px; height: 8px;"></div>
              <!-- Menggunakan class text-secondary bawaan Bootstrap -->
              <p class="mb-0 text-secondary small text-truncate">
                {{ member.phoneNumber || member.email || 'Lihat Detail' }}
              </p>
            </div>
          </div>
          <!-- Tombol QR Code -->
          <button @click.prevent="showQR(member)" class="btn btn-outline-secondary rounded-circle p-2 d-flex justify-content-center align-items-center flex-shrink-0" style="width: 45px; height: 45px;">
            📷
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL POPUP DOWNLOAD KARTU QR CODE -->
    <!-- ========================================== -->
    <div v-if="selectedMember" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center" style="z-index: 1060;" @click.self="selectedMember = null">
      <!-- Modal background menggunakan bg-dark -->
      <div class="card bg-dark border-0 rounded-4 p-4 text-center mx-3 shadow-lg" style="max-width: 350px; width: 100%;">
        
        <h4 class="fw-bold mb-1 text-white">{{ selectedMember.name }}</h4>
        <p class="small mb-3 text-secondary">Tunjukkan QR ini saat Presensi</p>
        
        <div class="bg-white p-2 rounded-3 mb-3 d-inline-block mx-auto">
          <img :src="qrImageUrl" alt="QR Code Member" class="rounded" style="width: 250px; height: 250px; display: block;" v-if="qrImageUrl" />
          <div v-else class="spinner-border text-primary my-4" role="status"></div>
        </div>

        <p class="small mb-3 font-monospace text-secondary" style="font-size: 11px;">
          ID: {{ selectedMember.uuid }}
        </p>

        <!-- Tombol download menggunakan btn-primary -->
        <button v-if="qrImageUrl" @click="downloadCard" class="btn btn-primary w-100 rounded-pill fw-bold mb-2 shadow-sm py-3 text-dark" :disabled="isDownloading">
          {{ isDownloading ? 'Memproses...' : '📥 Download Kartu' }}
        </button>
        
        <button class="btn btn-outline-secondary w-100 rounded-pill fw-bold py-2 mt-1" @click="selectedMember = null">
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
const isDownloading = ref(false)

const showQR = async (member) => {
  selectedMember.value = member
  qrImageUrl.value = ''
  try {
    qrImageUrl.value = await QRCode.toDataURL(member.uuid, { width: 500, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
  } catch (err) {
    console.error('Gagal membuat QR:', err)
  }
}

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
      qrImage.onload = () => { ctx.drawImage(qrImage, 90, 240, 620, 620); resolve() }
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
    alert('Terjadi kesalahan saat mengunduh kartu.')
  } finally {
    isDownloading.value = false
  }
}
</script>