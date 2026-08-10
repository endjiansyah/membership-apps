<template>
  <div class="py-2 py-md-3 pb-5 mb-5 mx-auto px-2 px-md-0" style="max-width: 600px;">
    
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-3 small">Memuat data member...</p>
    </div>

    <div v-else-if="member">
      
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

        <NuxtLink :to="`/members/${member.id}/edit`" class="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold text-white border-secondary border-opacity-50">
          Edit Data Profil
        </NuxtLink>
      </div>

      <!-- AREA AKSI UTAMA -->
      <div class="mb-3">
        <button @click="showQR" class="btn btn-outline-info w-100 fw-bold rounded-pill py-2 mb-2 border-info border-opacity-50" style="font-size: 0.8rem;">
          Download QR
        </button>
        
        <div class="d-flex gap-2 mb-2">
          <button @click="manualCheckIn" class="btn btn-primary w-100 fw-bold rounded-pill py-2 text-dark shadow-sm" style="font-size: 0.8rem;" :disabled="isProcessing">
            Hadir Manual
          </button>
          <button @click="toggleStatus" class="btn w-100 fw-bold rounded-pill py-2" style="font-size: 0.8rem;" :class="member.isActive ? 'btn-dark border border-secondary border-opacity-25 text-danger' : 'btn-success text-white'" :disabled="isProcessing">
            {{ member.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
          </button>
        </div>

        <button v-if="!member.isActive" @click="deleteMember" class="btn btn-outline-danger w-100 fw-bold rounded-pill py-2 mt-1 border-danger border-opacity-50" style="font-size: 0.8rem;" :disabled="isProcessing">
          Hapus Permanen
        </button>
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
          <template v-if="member.dynamicData">
            <div v-for="(value, key, index) in parseDynamicData(member.dynamicData)" :key="key" class="p-3" :class="{ 'border-bottom border-secondary border-opacity-25': index !== Object.keys(parseDynamicData(member.dynamicData)).length - 1 }">
              <small class="text-secondary d-block mb-1" style="font-size: 0.75rem;">{{ getFieldLabel(key) }}</small>
              <span class="fw-bold text-white">{{ value || '-' }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- MEMANGGIL KOMPONEN HISTORY YANG BARU -->
      <MemberHistory :member="member" />

    </div>

    <!-- MEMANGGIL KOMPONEN MODAL QR KITA -->
    <QrCardModal :member="selectedMember" @close="selectedMember = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const { showToast } = useToast()
const route = useRoute()
const memberId = route.params.id
const isProcessing = ref(false)

const selectedMember = ref(null)
const showQR = () => {
  selectedMember.value = member.value
}

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
    await $fetch('/api/attendance/manual', { method: 'POST', body: { memberId: member.value.id } })
    showToast('Berhasil mencatat kehadiran manual.', 'success')
    refresh()
  } catch (error) {
    showToast(error.data?.statusMessage || 'Gagal mencatat kehadiran.', 'error')
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
      body: { isActive: !member.value.isActive, source: 'MANUAL_ADMIN' }
    })
    refresh()
  } catch (error) {
    showToast('Gagal mengubah status.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const deleteMember = async () => {
  if (!confirm('PERINGATAN: Anda yakin ingin menghapus member ini?')) return
  isProcessing.value = true
  try {
    await $fetch(`/api/members/${member.value.id}`, { method: 'DELETE' })
    showToast('Member berhasil dihapus secara permanen.', 'success')
    navigateTo('/members') 
  } catch (error) {
    showToast(error.data?.statusMessage || 'Gagal menghapus member.', 'error')
    isProcessing.value = false 
  }
}
</script>