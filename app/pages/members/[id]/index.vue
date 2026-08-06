<template>
  <div class="container-fluid px-0 py-3 pb-5 mb-5" style="max-width: 600px;">
    

    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-3 small">Memuat data member...</p>
    </div>

    <div v-else-if="member" class="px-3">
      
      <!-- AREA AVATAR & HEADER PROFIL -->
      <div class="text-center mb-4">
        <div class="d-inline-flex justify-content-center align-items-center bg-dark border border-secondary border-opacity-25 text-primary mb-3 shadow-sm" style="width: 100px; height: 100px; border-radius: 28px; overflow: hidden;">
          <img v-if="member.photoPath" :src="member.photoPath" alt="Profile" class="w-100 h-100 object-fit-cover" />
          <span v-else class="fs-1 fw-bold text-uppercase">{{ getInitials(member.name) }}</span>
        </div>
        
        <div class="mb-2">
          <span class="badge px-3 py-1 rounded-pill" :class="member.isActive ? 'bg-success text-white' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'">
            {{ member.isActive ? 'ACTIVE' : 'INACTIVE' }}
          </span>
        </div>

        <h3 class="fw-bold text-white mb-1">{{ member.name }}</h3>
        <p class="text-secondary small font-monospace mb-0">ID: {{ member.uuid }}</p>
        <p class="text-secondary small mb-3">Terdaftar sejak {{ new Date(member.createdAt).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' }) }}</p>

        <!-- Tombol Edit Profil -->
        <NuxtLink :to="`/members/${member.id}/edit`" class="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold text-white border-secondary border-opacity-50">
          Edit Data Profil
        </NuxtLink>
      </div>

      <!-- AREA AKSI UTAMA -->
       <div class="mb-4">
        <!-- Tombol Download QR Baru -->
        <button @click="showQR" class="btn btn-outline-info w-100 fw-bold rounded-pill py-3 mb-2 border-info border-opacity-50">
          Download QR Code
        </button>
      <div class="d-flex gap-2 mb-4">
        <button @click="manualCheckIn" class="btn btn-primary w-100 fw-bold rounded-pill py-3 text-dark shadow-sm" :disabled="isProcessing">
          Catat Hadir Manual
        </button>
        <button @click="toggleStatus" class="btn w-100 fw-bold rounded-pill py-3" :class="member.isActive ? 'btn-dark border border-secondary border-opacity-25 text-danger' : 'btn-success text-white'" :disabled="isProcessing">
          {{ member.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
        </button>
      </div>
      </div> 

      <!-- STATISTIK KEHADIRAN -->
      <div class="mb-4">
        <small class="text-secondary fw-bold mb-2 d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">Statistik Kehadiran</small>
        <div class="row g-2">
          <div class="col-6">
            <div class="bg-dark p-3 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Terakhir Hadir</small>
              <span class="fw-bold text-primary" style="font-size: 0.8rem;">
                {{ stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ada' }}
              </span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-dark p-3 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Bulan Ini</small>
              <span class="fw-bold fs-5 text-white">{{ stats.thisMonth }}x</span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-dark p-3 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Tahun Ini</small>
              <span class="fw-bold fs-5 text-white">{{ stats.thisYear }}x</span>
            </div>
          </div>
          <div class="col-6">
            <div class="bg-dark p-3 rounded-4 border border-secondary border-opacity-25 h-100 shadow-sm">
              <small class="text-secondary d-block mb-1" style="font-size: 0.7rem;">Total Keseluruhan</small>
              <span class="fw-bold fs-5 text-white">{{ stats.total }}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MEMBER INFORMATION -->
      <div class="mb-4">
        <small class="text-secondary fw-bold mb-2 d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">Member Information</small>
        <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 overflow-hidden shadow-sm">
          <div class="p-3 border-bottom border-secondary border-opacity-25">
            <small class="text-secondary d-block mb-1" style="font-size: 0.75rem;">Email Address</small>
            <span class="fw-bold text-white">{{ member.email || '-' }}</span>
          </div>
          <div class="p-3 border-bottom border-secondary border-opacity-25">
            <small class="text-secondary d-block mb-1" style="font-size: 0.75rem;">Phone Number</small>
            <span class="fw-bold text-white">{{ member.phoneNumber || '-' }}</span>
          </div>
          <!-- Rendering Dynamic Data -->
          <template v-if="member.dynamicData">
            <div v-for="(value, key, index) in parseDynamicData(member.dynamicData)" :key="key" class="p-3" :class="{ 'border-bottom border-secondary border-opacity-25': index !== Object.keys(parseDynamicData(member.dynamicData)).length - 1 }">
              <small class="text-secondary d-block mb-1" style="font-size: 0.75rem;">{{ getFieldLabel(key) }}</small>
              <span class="fw-bold text-white">{{ value || '-' }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- RIWAYAT & LOGS -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-secondary fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">Riwayat & Aktivitas</small>
        </div>
        
        <!-- Tab Selector -->
        <div class="d-flex gap-2 mb-3 overflow-auto pb-1" style="scrollbar-width: none;">
          <button @click="activeTab = 'kehadiran'" class="btn rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'kehadiran' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'">
            Kehadiran
          </button>
          <button @click="activeTab = 'aktivitas'" class="btn rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'aktivitas' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'">
            Audit Trail
          </button>
        </div>

        <!-- Filter Waktu -->
        <div class="mb-3">
          <div class="d-flex gap-2 overflow-auto pb-1" style="scrollbar-width: none;">
            <button v-for="ft in filterOptions" :key="ft.value" @click="timeFilter = ft.value" class="btn btn-sm rounded-pill fw-bold px-3 border border-secondary border-opacity-25" style="font-size: 0.7rem;" :class="timeFilter === ft.value ? 'bg-secondary text-white' : 'bg-dark text-secondary'">
              {{ ft.label }}
            </button>
          </div>
          
          <!-- Custom Date Range Picker -->
          <div v-if="timeFilter === 'custom'" class="d-flex gap-2 mt-2 p-2 bg-dark rounded-3 border border-secondary border-opacity-25">
            <input type="date" v-model="customStart" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25">
            <span class="text-secondary align-self-center small">-</span>
            <input type="date" v-model="customEnd" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25">
          </div>
        </div>

        <!-- LIST: ATTENDANCE LOGS -->
        <div v-if="activeTab === 'kehadiran'" class="d-flex flex-column gap-2">
          <div v-if="filteredAttendance.length === 0" class="text-center py-4 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-sm">
            <p class="text-secondary mb-0 small">Tidak ada riwayat kehadiran pada periode ini.</p>
          </div>
          
          <div v-for="log in filteredAttendance" :key="log.id" class="card bg-dark border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-circle flex-shrink-0" :class="log.entryMethod === 'QR_SCAN' ? 'bg-success' : 'bg-primary'" style="width: 8px; height: 8px;"></div>
                <h6 class="mb-0 fw-bold text-white" style="font-size: 0.85rem;">
                  {{ new Date(log.scannedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </h6>
              </div>
              <span class="text-secondary font-monospace small">{{ new Date(log.scannedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB</span>
            </div>
            <div class="ps-3 border-start border-secondary border-opacity-25 ms-1">
              <p class="mb-1 text-secondary" style="font-size: 0.75rem;">
                Metode: <span class="text-white fw-bold">{{ log.entryMethod === 'QR_SCAN' ? 'QR Scanner' : 'Input Manual' }}</span>
              </p>
              <p class="mb-0 text-secondary" style="font-size: 0.75rem;">
                Petugas: <span class="text-white fw-bold">{{ log.scannedBy?.name || `ID #${log.scannedById}` }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- LIST: AUDIT LOGS -->
        <div v-if="activeTab === 'aktivitas'" class="d-flex flex-column gap-2">
          <div v-if="filteredAudit.length === 0" class="text-center py-4 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-sm">
            <p class="text-secondary mb-0 small">Tidak ada riwayat administratif pada periode ini.</p>
          </div>
          
          <div v-for="audit in filteredAudit" :key="audit.id" class="card bg-dark border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="mb-0 fw-bold text-white" style="font-size: 0.85rem;">{{ formatAuditAction(audit.action) }}</h6>
              <span class="text-secondary font-monospace small">{{ new Date(audit.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</span>
            </div>
            <div class="ps-3 border-start border-secondary border-opacity-25 ms-1">
              <p class="mb-1 text-secondary" style="font-size: 0.75rem;">
                Sumber: <span class="text-white">{{ audit.source }}</span>
              </p>
              <p class="mb-0 text-secondary" style="font-size: 0.75rem;">
                Dieksekusi oleh: <span class="text-white fw-bold">{{ audit.user?.name || `Petugas #${audit.performedBy}` }}</span>
              </p>

              <!-- TOMBOL & DETAIL PERUBAHAN -->
              <div v-if="isJson(audit.details)" class="mt-2">
                <button @click="toggleAudit(audit.id)" class="btn btn-sm btn-dark border border-secondary border-opacity-25 rounded text-secondary" style="font-size: 0.7rem; padding: 2px 8px;">
                  {{ expandedAuditId === audit.id ? 'Sembunyikan Detail' : 'Lihat Detail Perubahan' }}
                </button>
                
                <!-- Box Rincian Perubahan -->
                <div v-if="expandedAuditId === audit.id" class="mt-2 bg-black bg-opacity-50 p-2 rounded-3 border border-secondary border-opacity-25">
                  <div v-for="(change, idx) in parseDetails(audit.details)" :key="idx" class="mb-1">
                    <span class="text-secondary d-block fw-bold" style="font-size: 0.65rem;">{{ change.field }}</span>
                    <div class="d-flex align-items-center gap-2" style="font-size: 0.75rem;">
                      <span class="text-danger text-decoration-line-through text-truncate" style="max-width: 40%;">{{ change.old }}</span>
                      <span class="text-secondary">→</span>
                      <span class="text-success text-truncate" style="max-width: 40%;">{{ change.new }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ========================================== -->
    <!-- MODAL POPUP DOWNLOAD KARTU QR CODE         -->
    <!-- ========================================== -->
    <div v-if="showQrModal" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center px-3" style="z-index: 1060;" @click.self="showQrModal = false">
      <div class="card bg-dark border border-secondary border-opacity-50 rounded-4 p-4 text-center shadow-lg w-100" style="max-width: 350px;">
        
        <h4 class="fw-bold mb-1 text-white mb-4">{{ member.name }}</h4>
        
        <div class="bg-white p-2 rounded-4 mb-4 d-inline-block mx-auto shadow-sm">
          <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code Member" class="rounded-3" style="width: 220px; height: 220px; display: block;" />
          <div v-else class="spinner-border text-primary my-5" role="status"></div>
        </div>

        <p class="small mb-4 font-monospace text-secondary bg-black p-2 rounded-3">
          ID: {{ member.uuid }}
        </p>

        <button v-if="qrImageUrl" @click="downloadCard" class="btn btn-primary w-100 rounded-pill fw-bold mb-2 shadow py-3 text-dark" :disabled="isDownloading">
          {{ isDownloading ? 'Memproses Unduhan...' : 'Download QR' }}
        </button>
        
        <button class="btn btn-outline-secondary w-100 rounded-pill fw-bold py-3 mt-1 text-white" @click="showQrModal = false">
          Tutup Layar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'


const route = useRoute()
const memberId = route.params.id

const activeTab = ref('kehadiran')
const isProcessing = ref(false)
const expandedAuditId = ref(null)

// State Filter Waktu
const timeFilter = ref('all')
const customStart = ref('')
const customEnd = ref('')
const filterOptions = [
  { label: '7 Hari', value: '7d' },
  { label: '30 Hari', value: '30d' },
  { label: '1 Tahun', value: '1y' },
  { label: 'Semua', value: 'all' },
  { label: 'Custom', value: 'custom' }
]

const { data: member, pending, refresh } = await useFetch(`/api/members/${memberId}`, { server: false })

const { data: fields } = await useFetch('/api/fields', { server: false })

const getFieldLabel = (key) => {
  if (!fields.value) return key
  const found = fields.value.find(f => f.fieldKey === key)
  return found ? found.label : key
}

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

const toggleAudit = (id) => {
  expandedAuditId.value = expandedAuditId.value === id ? null : id
}

const isJson = (str) => {
  if (!str) return false
  try { 
    const parsed = JSON.parse(str)
    return Array.isArray(parsed)
  } catch(e) { return false }
}

const parseDetails = (str) => {
  try { return JSON.parse(str) } catch(e) { return [] }
}

const formatAuditAction = (action) => {
  const actions = {
    'AKTIVASI_STATUS': 'Aktivasi Membership',
    'NONAKTIF_STATUS': 'Penonaktifan Membership',
    'UPDATE_PROFIL': 'Pembaruan Data Member',
    'CREATE_MEMBER': 'Pendaftaran Member Baru'
  }
  return actions[action] || action
}

const isWithinDateRange = (dateString) => {
  if (!dateString) return false
  const targetDate = new Date(dateString)
  const now = new Date()
  
  if (timeFilter.value === '7d') return (now - targetDate) <= 7 * 24 * 60 * 60 * 1000
  if (timeFilter.value === '30d') return (now - targetDate) <= 30 * 24 * 60 * 60 * 1000
  if (timeFilter.value === '1y') return (now - targetDate) <= 365 * 24 * 60 * 60 * 1000
  
  if (timeFilter.value === 'custom') {
    const start = customStart.value ? new Date(customStart.value) : new Date(0)
    const end = customEnd.value ? new Date(customEnd.value) : new Date()
    end.setHours(23, 59, 59, 999)
    return targetDate >= start && targetDate <= end
  }
  
  return true
}

const filteredAttendance = computed(() => {
  if (!member.value?.logs) return []
  return member.value.logs.filter(log => isWithinDateRange(log.scannedAt)).sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
})

const filteredAudit = computed(() => {
  if (!member.value?.auditLogs) return []
  return member.value.auditLogs.filter(audit => isWithinDateRange(audit.createdAt)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const stats = computed(() => {
  const logs = member.value?.logs || []
  const now = new Date()
  
  const thisMonthCount = logs.filter(log => {
    const d = new Date(log.scannedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const thisYearCount = logs.filter(log => {
    const d = new Date(log.scannedAt)
    return d.getFullYear() === now.getFullYear()
  }).length

  const latestLog = logs.reduce((latest, current) => {
    return new Date(latest.scannedAt) > new Date(current.scannedAt) ? latest : current
  }, logs[0] || null)

  return {
    total: logs.length,
    thisMonth: thisMonthCount,
    thisYear: thisYearCount,
    lastVisit: latestLog ? latestLog.scannedAt : null
  }
})

const manualCheckIn = async () => {
  if (!confirm('Catat kehadiran manual tanpa scan QR untuk member ini?')) return
  isProcessing.value = true
  try {
    await $fetch('/api/attendance/manual', {
      method: 'POST',
      body: { memberId: member.value.id }
    })
    alert('Berhasil mencatat kehadiran manual.')
    refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal mencatat kehadiran.')
  } finally {
    isProcessing.value = false
  }
}

const toggleStatus = async () => {
  const targetAction = member.value.isActive ? 'menonaktifkan' : 'mengaktifkan'
  if (!confirm(`Anda yakin ingin ${targetAction} membership ini secara manual?`)) return
  
  isProcessing.value = true
  try {
    await $fetch(`/api/members/${member.value.id}/status`, {
      method: 'PUT',
      body: { 
        isActive: !member.value.isActive,
        source: 'MANUAL_ADMIN'
      }
    })
    refresh()
  } catch (error) {
    alert('Gagal mengubah status.')
  } finally {
    isProcessing.value = false
  }
}

const downloadQR = async () => {
  if (!member.value?.uuid) {
    return alert('Data UUID tidak ditemukan.')
  }
  
  isProcessing.value = true
  try {
    // Memanfaatkan public API untuk generate QR dengan UUID member
    // (Bisa disesuaikan jika Anda memakai library lokal di halaman List)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${member.value.uuid}`
    
    // Fetch blob agar memicu file download, bukan open-in-new-tab
    const response = await fetch(qrUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    // Format nama file: QR-NamaMember-12345.png
    link.download = `QR-${member.value.name.replace(/\s+/g, '-')}-${member.value.id}.png`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    alert('Terjadi kesalahan saat mengunduh QR Code.')
  } finally {
    isProcessing.value = false
  }
}

// STATE BARU UNTUK KARTU QR
const showQrModal = ref(false)
const qrImageUrl = ref('')
const isDownloading = ref(false)

// FUNGSI MEMBUKA MODAL DAN GENERATE QR
const showQR = async () => {
  if (!member.value?.uuid) return alert('Data UUID tidak ditemukan.')
  
  showQrModal.value = true
  qrImageUrl.value = ''
  try {
    qrImageUrl.value = await QRCode.toDataURL(member.value.uuid, { width: 500, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
  } catch (err) {
    console.error('Gagal membuat QR:', err)
  }
}

// FUNGSI MENGGAMBAR KARTU DAN MENDOWNLOAD (Persis dengan halaman List)
const downloadCard = async () => {
  if (!member.value || !qrImageUrl.value) return
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
    ctx.fillText(member.value.name, canvas.width / 2, 120)
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
    ctx.fillText(`ID: ${member.value.uuid}`, canvas.width / 2, 960)

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `Member_Card_${member.value.name.replace(/\s+/g, '_')}.png`
    link.click()
  } catch (error) {
    alert('Terjadi kesalahan saat mengunduh kartu.')
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>