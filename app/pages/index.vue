<script setup>
import { ref, computed } from 'vue'

const selectedRange = ref('today')

const { data: response, pending, refresh } = await useAsyncData('dashboard-stats', () => 
  $fetch('/api/dashboard/stats', { params: { range: selectedRange.value } }),
  { watch: [selectedRange] }
)

const stats = computed(() => response.value?.stats || { totalAttendance: 0, activeMembers: 0 })
const leaderboard = computed(() => response.value?.leaderboard || [])
const logs = computed(() => response.value?.data || [])

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="container-fluid px-3 py-3 pb-5 mb-5" style="max-width: 600px;">
    
    <!-- HEADER & REFRESH -->
    <div class="d-flex justify-content-between align-items-center mb-4 p-2">
      <div>
        <h4 class="mb-0 fw-bold text-white">Dashboard Analitik</h4>
      </div>
      <button @click="refresh" class="btn btn-dark border border-secondary border-opacity-25 rounded-3 btn-sm px-3 py-2 text-white d-flex align-items-center gap-2 shadow-sm">
        <i class="bi bi-arrow-clockwise"></i> <span>Refresh</span>
      </button>
    </div>

    <!-- FILTER RENTANG WAKTU PILLS -->
    <div class="px-2 mb-4">
      <div class="d-flex gap-2 overflow-auto" style="scrollbar-width: none;">
        <button 
          v-for="range in [
            { id: 'today', label: 'Hari Ini' },
            { id: '7d', label: '7 Hari' },
            { id: '30d', label: '30 Hari' },
            { id: '1y', label: '1 Tahun' },
            { id: 'all', label: 'Semua' }
          ]" 
          :key="range.id"
          @click="selectedRange = range.id"
          class="btn rounded-pill fw-bold text-uppercase"
          style="font-size: 0.75rem; letter-spacing: 0.5px;"
          :class="selectedRange === range.id ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- STATISTIK KARTU UTAMA -->
    <div class="px-2 mb-4">
      <div class="row g-3">
        <div class="col-6">
          <div class="card bg-dark border border-secondary border-opacity-25 p-3 rounded-4 shadow-sm h-100">
            <div class="text-secondary small mb-1">Total Kehadiran</div>
            <h3 class="fw-bold mb-0 text-success">{{ stats.totalAttendance }}</h3>
          </div>
        </div>
        <div class="col-6">
          <div class="card bg-dark border border-secondary border-opacity-25 p-3 rounded-4 shadow-sm h-100">
            <div class="text-secondary small mb-1">Member Aktif</div>
            <h3 class="fw-bold mb-0 text-warning">{{ stats.activeMembers }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- AKSI CEPAT SCANNER -->
    <div class="px-2 mb-4">
      <NuxtLink to="/scanner" class="btn btn-primary w-100 fw-bold py-3 rounded-4 text-dark shadow-sm d-flex align-items-center justify-content-center gap-2">
        <i class="bi bi-camera-fill fs-5"></i> Buka Scanner
      </NuxtLink>
    </div>

    <!-- LEADERBOARD MEMBER TERAJIN -->
    <div class="px-2 mb-4">
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm overflow-hidden">
        <div class="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 px-3 d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold text-white d-flex align-items-center gap-2">
            <i class="bi bi-trophy-fill text-warning"></i> Member Terajin
          </h6>
          <span class="badge bg-secondary text-light small">Top 5</span>
        </div>

        <div v-if="pending" class="text-center py-4">
          <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
        </div>

        <div v-else-if="leaderboard.length === 0" class="text-center py-4 text-secondary small">
          Belum ada data peringkat pada periode ini.
        </div>

        <div v-else class="list-group list-group-flush bg-dark">
          <div v-for="(item, index) in leaderboard" :key="item.uuid" class="list-group-item bg-dark text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-3 px-3">
            <div class="d-flex align-items-center gap-3">
              <span class="badge rounded-circle bg-secondary bg-opacity-25 text-warning fw-bold d-flex align-items-center justify-content-center" style="width: 30px; height: 30px; font-size: 0.8rem;">
                #{{ index + 1 }}
              </span>
              <div>
                <h6 class="mb-0 fw-bold text-white">{{ item.name }}</h6>
                <small class="text-secondary font-monospace" style="font-size: 0.75rem;">ID: {{ item.uuid?.slice(0,8) }}</small>
              </div>
            </div>
            <span class="badge bg-success text-white px-3 py-2 rounded-pill fw-bold" style="font-size: 0.75rem;">
              {{ item.count }}x Hadir
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- LOG AKTIVITAS KEHADIRAN -->
    <div class="px-2">
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm overflow-hidden">
        <div class="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 px-3">
          <h6 class="mb-0 fw-bold text-white">Log Aktivitas Kehadiran</h6>
        </div>

        <div v-if="pending" class="text-center py-5">
          <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
        </div>

        <div v-else-if="logs.length === 0" class="text-center py-5 text-secondary">
          <p class="mb-0">Tidak ada riwayat aktivitas pada periode ini.</p>
        </div>

        <div v-else class="list-group list-group-flush bg-dark">
          <div v-for="log in logs" :key="log.id" class="list-group-item bg-dark text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-3 px-3">
            <div>
              <h6 class="mb-1 fw-bold text-white">{{ log.member?.name || 'Member Tidak Dikenal' }}</h6>
              <div class="small text-secondary">
                Metode: <span class="badge bg-secondary bg-opacity-25 text-warning">{{ log.entryMethod }}</span> 
                <span class="ms-2">Petugas: <strong>{{ log.scannedBy?.name || 'Sistem' }}</strong></span>
              </div>
            </div>
            <div class="text-end">
              <span class="badge bg-success text-white px-2 py-1 fw-bold">{{ formatTime(log.scannedAt) }}</span>
              <div class="text-secondary small mt-1" style="font-size: 0.7rem;">
                {{ new Date(log.scannedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>