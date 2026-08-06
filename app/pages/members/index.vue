<template>
  <div class="container-fluid px-3 py-3 pb-5 mb-5" style="max-width: 600px;">
    
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 p-2">
      <div>
        <h4 class="mb-0 fw-bold text-white">Members</h4>
      </div>
      <NuxtLink to="/members/create" class="btn btn-primary shadow-sm fw-bold rounded-3 px-3 py-2 text-dark">
        + Baru
      </NuxtLink>
    </div>

    <!-- SEARCH & FILTER SECTION -->
    <div class="px-2 mb-4">
      <!-- Search Bar -->
      <div class="input-group mb-3 shadow-sm rounded-4 overflow-hidden">
        <span class="input-group-text bg-dark border-secondary border-opacity-25 text-secondary border-end-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
          </svg>
        </span>
        <input 
          type="text" 
          class="form-control bg-dark border-secondary border-opacity-25 text-white border-start-0 py-2 shadow-none" 
          placeholder="Search members..." 
          v-model="searchQuery"
        >
      </div>

      <!-- Filter Pills -->
      <div class="d-flex gap-2 overflow-auto" style="scrollbar-width: none;">
        <button 
          @click="filterStatus = 'all'" 
          class="btn rounded-pill fw-bold text-uppercase"
          style="font-size: 0.75rem; letter-spacing: 0.5px;"
          :class="filterStatus === 'all' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'"
        >
          All ({{ members?.length || 0 }})
        </button>
        <button 
          @click="filterStatus = 'active'" 
          class="btn rounded-pill fw-bold text-uppercase"
          style="font-size: 0.75rem; letter-spacing: 0.5px;"
          :class="filterStatus === 'active' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'"
        >
          Active
        </button>
        <button 
          @click="filterStatus = 'inactive'" 
          class="btn rounded-pill fw-bold text-uppercase"
          style="font-size: 0.75rem; letter-spacing: 0.5px;"
          :class="filterStatus === 'inactive' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'"
        >
          Inactive
        </button>
      </div>
    </div>

    <!-- LIST MEMBER -->
    <div class="px-2">
      <!-- State: Loading -->
      <div v-if="pending" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-secondary fw-bold small">Memuat data...</p>
      </div>
      
      <!-- State: Empty / Not Found -->
      <div v-else-if="filteredMembers.length === 0" class="text-center py-5 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-sm">
        <p class="text-secondary mb-0">Tidak ada member yang ditemukan.</p>
      </div>

      <!-- State: Data Ready (Sesuai Layout Desain) -->
      <div v-else class="d-flex flex-column gap-3">
        <div 
          v-for="member in filteredMembers" 
          :key="member.id" 
          class="card bg-dark border border-secondary border-opacity-25 p-3 rounded-4 shadow-sm"
        >
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="pe-3">
              <h5 class="mb-1 fw-bold text-white">{{ member.name }}</h5>
              <p class="mb-0 text-secondary small font-monospace">
                ID: {{ member.uuid?.slice(0,8) || 'N/A' }}
              </p>
            </div>
            <!-- Status Text yang Tegas -->
            <span class="small fw-bold tracking-wider" :class="member.isActive ? 'text-success' : 'text-secondary'">
              {{ member.isActive ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>
          
          <!-- Tombol Aksi Bawah Kartu -->
          <div class="d-flex gap-2">
            <button @click.prevent="showQR(member)" class="btn btn-primary btn-sm rounded-pill fw-bold px-3 py-2 w-100">
              Download QR
            </button>
            <NuxtLink :to="`/members/${member.id}`" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold px-3 py-2 w-100 text-white">
              Details
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL POPUP DOWNLOAD KARTU QR CODE -->
    <!-- ========================================== -->
    <div v-if="selectedMember" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center px-3" style="z-index: 1060;" @click.self="selectedMember = null">
      <div class="card bg-dark border border-secondary border-opacity-50 rounded-4 p-4 text-center shadow-lg w-100" style="max-width: 350px;">
        
        <h4 class="fw-bold mb-1 text-white mb-4">{{ selectedMember.name }}</h4>
        
        <div class="bg-white p-2 rounded-4 mb-4 d-inline-block mx-auto shadow-sm">
          <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code Member" class="rounded-3" style="width: 220px; height: 220px; display: block;" />
          <div v-else class="spinner-border text-primary my-5" role="status"></div>
        </div>

        <p class="small mb-4 font-monospace text-secondary bg-black p-2 rounded-3">
          ID: {{ selectedMember.uuid }}
        </p>

        <button v-if="qrImageUrl" @click="downloadCard" class="btn btn-primary w-100 rounded-pill fw-bold mb-2 shadow py-3 text-dark" :disabled="isDownloading">
          {{ isDownloading ? 'Memproses Unduhan...' : 'Download Kartu' }}
        </button>
        
        <button class="btn btn-outline-secondary w-100 rounded-pill fw-bold py-3 mt-1 text-white" @click="selectedMember = null">
          Tutup Layar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRCode from 'qrcode'

const { data: members, pending } = await useFetch('/api/members', { server: false })

// State untuk Pencarian dan Filter
const searchQuery = ref('')
const filterStatus = ref('all') // 'all', 'active', 'inactive'

const selectedMember = ref(null)
const qrImageUrl = ref('')
const isDownloading = ref(false)

// Logic Filter & Pencarian
const filteredMembers = computed(() => {
  if (!members.value) return []
  
  let result = members.value

  // 1. Terapkan Filter Status
  if (filterStatus.value === 'active') {
    result = result.filter(m => m.isActive)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(m => !m.isActive)
  }

  // 2. Terapkan Pencarian Teks
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => 
      (m.name && m.name.toLowerCase().includes(query)) ||
      (m.phoneNumber && m.phoneNumber.toLowerCase().includes(query)) ||
      (m.uuid && m.uuid.toLowerCase().includes(query))
    )
  }

  return result
})

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
    ctx.fillText('Tunjukkan QR Code ini untuk scan Membership', canvas.width / 2, 180)

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

<style scoped>
/* Menghilangkan border focus biru dari input bawaan bootstrap saat diklik */
input:focus {
  outline: none;
  box-shadow: none;
}
</style>