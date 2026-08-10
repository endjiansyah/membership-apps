<template>
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
      
      <template v-else>
        <div v-for="log in paginatedAttendance" :key="log.id" class="card bg-dark border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm">
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

        <div v-if="totalAttPages > 1" class="d-flex justify-content-between align-items-center mt-2">
          <button @click="prevAttPage" :disabled="currentAttPage === 1" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.7rem;">&laquo; Prev</button>
          <span class="text-secondary fw-bold" style="font-size: 0.75rem;">Hal {{ currentAttPage }} / {{ totalAttPages }}</span>
          <button @click="nextAttPage" :disabled="currentAttPage === totalAttPages" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.7rem;">Next &raquo;</button>
        </div>
      </template>
    </div>

    <!-- LIST: AUDIT LOGS -->
    <div v-if="activeTab === 'aktivitas'" class="d-flex flex-column gap-2">
      <div v-if="filteredAudit.length === 0" class="text-center py-4 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-sm">
        <p class="text-secondary mb-0 small">Tidak ada riwayat administratif pada periode ini.</p>
      </div>
      
      <template v-else>
        <div v-for="audit in paginatedAudit" :key="audit.id" class="card bg-dark border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm">
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

            <div v-if="isJson(audit.details)" class="mt-2">
              <button @click="toggleAudit(audit.id)" class="btn btn-sm btn-dark border border-secondary border-opacity-25 rounded text-secondary" style="font-size: 0.7rem; padding: 2px 8px;">
                {{ expandedAuditId === audit.id ? 'Sembunyikan Detail' : 'Lihat Detail Perubahan' }}
              </button>
              
              <div v-if="expandedAuditId === audit.id" class="mt-2 bg-black bg-opacity-50 p-2 rounded-3 border border-secondary border-opacity-25">
                <div v-for="(change, idx) in parseDetails(audit.details)" :key="idx" class="mb-1">
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

        <div v-if="totalAuditPages > 1" class="d-flex justify-content-between align-items-center mt-2">
          <button @click="prevAuditPage" :disabled="currentAuditPage === 1" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.7rem;">&laquo; Prev</button>
          <span class="text-secondary fw-bold" style="font-size: 0.75rem;">Hal {{ currentAuditPage }} / {{ totalAuditPages }}</span>
          <button @click="nextAuditPage" :disabled="currentAuditPage === totalAuditPages" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.7rem;">Next &raquo;</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  member: Object
})

const activeTab = ref('kehadiran')
const expandedAuditId = ref(null)
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

const toggleAudit = (id) => { expandedAuditId.value = expandedAuditId.value === id ? null : id }

const isJson = (str) => {
  if (!str) return false
  try { return Array.isArray(JSON.parse(str)) } catch(e) { return false }
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
  if (!props.member?.logs) return []
  return props.member.logs.filter(log => isWithinDateRange(log.scannedAt)).sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
})

const filteredAudit = computed(() => {
  if (!props.member?.auditLogs) return []
  return props.member.auditLogs.filter(audit => isWithinDateRange(audit.createdAt)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// === PAGINATION ===
const currentAttPage = ref(1)
const currentAuditPage = ref(1)
const itemsPerPage = 10

watch([timeFilter, customStart, customEnd, activeTab], () => {
  currentAttPage.value = 1
  currentAuditPage.value = 1
})

const totalAttPages = computed(() => Math.ceil(filteredAttendance.value.length / itemsPerPage) || 1)
const paginatedAttendance = computed(() => filteredAttendance.value.slice((currentAttPage.value - 1) * itemsPerPage, currentAttPage.value * itemsPerPage))
const prevAttPage = () => { if (currentAttPage.value > 1) currentAttPage.value-- }
const nextAttPage = () => { if (currentAttPage.value < totalAttPages.value) currentAttPage.value++ }

const totalAuditPages = computed(() => Math.ceil(filteredAudit.value.length / itemsPerPage) || 1)
const paginatedAudit = computed(() => filteredAudit.value.slice((currentAuditPage.value - 1) * itemsPerPage, currentAuditPage.value * itemsPerPage))
const prevAuditPage = () => { if (currentAuditPage.value > 1) currentAuditPage.value-- }
const nextAuditPage = () => { if (currentAuditPage.value < totalAuditPages.value) currentAuditPage.value++ }
</script>
<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
</style>