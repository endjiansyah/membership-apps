<template>
  <div class="container-fluid px-1 px-md-3 py-2 py-md-3 pb-5 mb-5" style="max-width: 800px;">
    
    <!-- HEADER -->
    <div class="d-flex align-items-center mb-3 px-2">
      <h4 class="mb-0 fw-bold text-white">Log & Histori Aktivitas</h4>
    </div>

    <!-- FILTER WAKTU (Gaya Aplikasi Bank) -->
    <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-4 mx-2">
      <div class="card-body p-3">
        <h6 class="fw-bold text-secondary mb-3" style="font-size: 0.8rem;">FILTER WAKTU</h6>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label text-secondary small mb-1" style="font-size: 0.7rem;">Dari Tanggal</label>
            <input type="date" v-model="filters.startDate" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" style="font-size: 0.8rem;">
          </div>
          <div class="col-6">
            <label class="form-label text-secondary small mb-1" style="font-size: 0.7rem;">Sampai Tanggal</label>
            <input type="date" v-model="filters.endDate" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" style="font-size: 0.8rem;">
          </div>
        </div>
        <button @click="fetchLogs" class="btn btn-primary w-100 rounded-pill fw-bold py-2 mt-3 text-dark shadow-sm" style="font-size: 0.8rem;" :disabled="pending">
          {{ pending ? 'Memuat Histori...' : 'Terapkan Filter' }}
        </button>
      </div>
    </div>

    <!-- DAFTAR LOG (Timeline) -->
    <div class="px-2">
      <div v-if="pending" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      
      <div v-else-if="!logs || logs.length === 0" class="text-center py-5 bg-dark rounded-4 border border-secondary border-opacity-25">
        <p class="text-secondary small mb-0">Tidak ada histori aktivitas pada periode ini.</p>
      </div>

      <div v-else class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm overflow-hidden">
        <div class="list-group list-group-flush">
          
          <div v-for="log in logs" :key="log.id" class="list-group-item bg-transparent border-bottom border-secondary border-opacity-25 p-3">
            
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge rounded-pill mb-1" :class="getActionBadge(log.action).class" style="font-size: 0.65rem;">
                  {{ getActionBadge(log.action).label }}
                </span>
                <h6 class="fw-bold text-white mb-0" style="font-size: 0.95rem;">
                  {{ log.memberName }}
                </h6>
              </div>
              <div class="text-end">
                <small class="text-secondary d-block font-monospace" style="font-size: 0.7rem;">
                  {{ formatDate(log.createdAt) }}
                </small>
                <small class="text-secondary font-monospace" style="font-size: 0.65rem;">
                  {{ formatTime(log.createdAt) }} WIB
                </small>
              </div>
            </div>

            <!-- Identitas Pelaku (Aktor) -->
            <div class="d-flex align-items-center mt-2 p-2 bg-black bg-opacity-50 rounded-3 border border-secondary border-opacity-10">
              <div class="text-secondary me-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
              </div>
              <small class="text-secondary" style="font-size: 0.7rem;">
                Oleh: <span class="fw-bold text-white">{{ log.actorName }}</span>
              </small>
            </div>

          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const today = new Date()
const sevenDaysAgo = new Date(today)
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

const formatForInput = (date) => {
  return date.toISOString().split('T')[0]
}

const filters = ref({
  startDate: formatForInput(sevenDaysAgo),
  endDate: formatForInput(today)
})

const logs = ref([])
const pending = ref(false)

const fetchLogs = async () => {
  pending.value = true
  try {
    const query = new URLSearchParams({
      startDate: filters.value.startDate,
      endDate: filters.value.endDate
    }).toString()

    logs.value = await $fetch(`/api/logs?${query}`)
  } catch (error) {
    alert('Gagal mengambil data histori.')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchLogs() 
})

const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })
}

// Warna indikator badge diperkaya
const getActionBadge = (action) => {
  if (!action) return { label: 'LAINNYA', class: 'bg-secondary text-white' }
  const act = action.toUpperCase()
  
  if (act.includes('CREATE')) return { label: 'DAFTAR BARU', class: 'bg-success text-white' }
  if (act.includes('DELETE')) return { label: 'HAPUS PERMANEN', class: 'bg-danger text-white' }
  if (act.includes('CHECK_IN') || act.includes('SCAN')) return { label: 'HADIR (CHECK-IN)', class: 'bg-primary text-dark' }
  if (act.includes('UPDATE') || act.includes('EDIT')) return { label: 'PERUBAHAN DATA', class: 'bg-info text-dark' }
  if (act.includes('ACTIVATE')) return { label: 'AKTIVASI', class: 'bg-warning text-dark' }
  if (act.includes('DEACTIVATE')) return { label: 'NONAKTIF', class: 'bg-secondary border border-secondary text-secondary' }
  
  return { label: action, class: 'bg-secondary text-white' }
}
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>