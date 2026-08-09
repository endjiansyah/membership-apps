<template>
  <!-- PERBAIKAN 1: Hapus container-fluid dan px-*, gunakan mx-auto agar rata tengah -->
  <div class="py-2 py-md-3 pb-5 mb-5 mx-auto" style="max-width: 800px;">
    
    <!-- HEADER DENGAN TOMBOL KEMBALI -->
    <!-- PERBAIKAN 2: Hapus px-2 -->
    <div class="d-flex align-items-center gap-3 mb-4 mt-2">
      <NuxtLink to="/" class="btn btn-dark border border-secondary border-opacity-50 rounded-circle d-flex justify-content-center align-items-center text-white shadow-sm" style="width: 38px; height: 38px;">
        <!-- Menggunakan modul Icon yang baru diinstal -->
        <Icon name="bi:arrow-left" class="fs-5" />
      </NuxtLink>
      <h4 class="mb-0 fw-bold text-white">Histori Sistem</h4>
    </div>

    <!-- FILTER WAKTU -->
    <!-- PERBAIKAN 3: Hapus mx-2 pada card -->
    <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-3">
      <div class="card-body p-3 p-md-4">
        <h6 class="fw-bold text-secondary mb-3" style="font-size: 0.8rem;">PENGATURAN FILTER WAKTU</h6>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label text-secondary small mb-1" style="font-size: 0.7rem;">Dari Tanggal</label>
            <input type="date" v-model="filters.startDate" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" style="font-size: 0.8rem;">
          </div>
          <div class="col-6">
            <label class="form-label text-secondary small mb-1" style="font-size: 0.7rem;">Sampai Tanggal</label>
            <input type="date" v-model="filters.endDate" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" style="font-size: 0.8rem;">
          </div>
        </div>
        <div class="d-flex gap-2">
          <button @click="resetFilter" class="btn btn-outline-secondary w-50 rounded-pill fw-bold py-2 text-white border-secondary border-opacity-50" style="font-size: 0.8rem;" :disabled="pending">
            Tampilkan Semua
          </button>
          <button @click="applyFilter" class="btn btn-primary w-50 rounded-pill fw-bold py-2 text-dark shadow-sm" style="font-size: 0.8rem;" :disabled="pending">
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>

    <!-- STATUS INDIKATOR -->
    <!-- PERBAIKAN 4: Hapus px-3 -->
    <div class="mb-3">
      <div class="p-2 p-md-3 bg-black bg-opacity-50 rounded-3 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
        <small class="text-info fw-bold" style="font-size: 0.75rem;">
          <span v-if="activeFilter.isFiltered">
            📅 {{ formatDateOnly(activeFilter.startDate) }} s/d {{ formatDateOnly(activeFilter.endDate) }}
          </span>
          <span v-else>🌍 Menampilkan: Semua Histori</span>
        </small>
        <small class="text-secondary" style="font-size: 0.75rem;">Total: {{ totalData }} catatan</small>
      </div>
    </div>

    <!-- DAFTAR LOG -->
    <!-- PERBAIKAN 5: Hapus px-2 -->
    <div>
      <div v-if="pending" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      
      <div v-else-if="!logs || logs.length === 0" class="text-center py-4 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-sm">
        <p class="text-secondary mb-0 small">Tidak ada histori aktivitas ditemukan pada periode ini.</p>
      </div>

      <div v-else class="d-flex flex-column gap-2 mb-4">
        <div v-for="log in logs" :key="log.id" class="card bg-dark border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm">
          
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="mb-0 fw-bold text-white" style="font-size: 0.85rem;">
              {{ formatActionLabel(log.action) }}
            </h6>
            <div class="text-end">
              <span class="text-secondary font-monospace small d-block" style="font-size: 0.7rem;">
                {{ formatDateOnly(log.createdAt) }}
              </span>
              <span class="text-secondary font-monospace" style="font-size: 0.65rem;">
                {{ formatTime(log.createdAt) }} WIB
              </span>
            </div>
          </div>

          <div class="ps-3 border-start border-secondary border-opacity-25 ms-1">
            <p class="mb-1 text-secondary" style="font-size: 0.75rem;">
              Target: <span class="text-warning fw-bold">{{ log.memberName }}</span>
            </p>
            <p class="mb-0 text-secondary" style="font-size: 0.75rem;">
              Oleh: <span class="text-white fw-bold">{{ log.actorName }}</span>
            </p>

            <!-- TOMBOL & DETAIL PERUBAHAN -->
            <div v-if="log.type === 'AUDIT' && isJson(log.details)" class="mt-2">
              <button @click="toggleAudit(log.id)" class="btn btn-sm btn-dark border border-secondary border-opacity-25 rounded text-secondary" style="font-size: 0.7rem; padding: 2px 8px;">
                {{ expandedAuditId === log.id ? 'Sembunyikan Detail' : 'Lihat Detail Perubahan' }}
              </button>
              
              <div v-if="expandedAuditId === log.id" class="mt-2 bg-black bg-opacity-50 p-2 rounded-3 border border-secondary border-opacity-25">
                <div v-for="(change, idx) in parseDetails(log.details)" :key="idx" class="mb-1">
                  <span class="text-secondary d-block fw-bold" style="font-size: 0.65rem;">{{ change.field }}</span>
                  <div class="d-flex align-items-center gap-2" style="font-size: 0.75rem;">
                    <span class="text-danger text-decoration-line-through text-truncate" style="max-width: 40%;">{{ change.old || '(kosong)' }}</span>
                    <span class="text-secondary">→</span>
                    <span class="text-success text-truncate" style="max-width: 40%;">{{ change.new || '(kosong)' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- PAGINATION KONTROL -->
      <!-- PERBAIKAN 6: Hapus px-2 -->
      <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mb-4">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.75rem;">
          &laquo; Prev
        </button>
        <span class="text-secondary fw-bold" style="font-size: 0.8rem;">
          Halaman {{ currentPage }} dari {{ totalPages }}
        </span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.75rem;">
          Next &raquo;
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const formatForInput = (date) => date.toISOString().split('T')[0]
const today = new Date()
const sevenDaysAgo = new Date(today)
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

const filters = ref({
  startDate: formatForInput(sevenDaysAgo),
  endDate: formatForInput(today)
})

const activeFilter = ref({
  isFiltered: false,
  startDate: '',
  endDate: ''
})

const logs = ref([])
const pending = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalData = ref(0)
const limit = 15 

const expandedAuditId = ref(null)

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

const fetchLogs = async (page = 1) => {
  pending.value = true
  try {
    const queryParams = { page, limit }
    
    if (activeFilter.value.isFiltered) {
      queryParams.startDate = activeFilter.value.startDate
      queryParams.endDate = activeFilter.value.endDate
    }

    const query = new URLSearchParams(queryParams).toString()
    const response = await $fetch(`/api/logs?${query}`)
    
    logs.value = response.data
    currentPage.value = response.meta.page
    totalPages.value = response.meta.totalPages
    totalData.value = response.meta.totalRecords

  } catch (error) {
    alert('Gagal mengambil data histori.')
  } finally {
    pending.value = false
  }
}

const applyFilter = () => {
  activeFilter.value = {
    isFiltered: true,
    startDate: filters.value.startDate,
    endDate: filters.value.endDate
  }
  fetchLogs(1) 
}

const resetFilter = () => {
  filters.value.startDate = ''
  filters.value.endDate = ''
  activeFilter.value = { isFiltered: false, startDate: '', endDate: '' }
  fetchLogs(1)
}

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    fetchLogs(newPage)
  }
}

onMounted(() => { fetchLogs(1) })

const formatDateOnly = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })
}

const formatActionLabel = (action) => {
  const actions = {
    'AKTIVASI_STATUS': '✅ Aktivasi Membership',
    'NONAKTIF_STATUS': '❌ Penonaktifan Membership',
    'UPDATE_PROFIL': '📝 Pembaruan Data Profil',
    'CREATE_MEMBER': '🆕 Pendaftaran Member Baru',
    'DELETE_MEMBER': '🗑️ Penghapusan Permanen Member',
    'CHECK_IN (QR)': '📸 Hadir (Scan QR Code)',
    'CHECK_IN (MANUAL)': '✍️ Hadir (Input Manual)'
  }
  return actions[action] || action
}
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
</style>