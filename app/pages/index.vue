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
  <div class="container py-4 mb-5 text-light">
    <!-- Header: Judul Bersanding dengan Tombol Refresh -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-1">Dashboard Analitik</h4>
        <p class="text-secondary small mb-0">Statistik dan performa kehadiran member</p>
      </div>
      <button @click="refresh" class="btn btn-outline-light btn-sm px-3 py-2 d-flex align-items-center gap-2 fw-bold">
        <i class="bi bi-arrow-clockwise"></i> <span>Refresh</span>
      </button>
    </div>

    <!-- Filter Rentang Waktu -->
    <div class="btn-group w-100 overflow-auto mb-4" role="group">
      <button 
        type="button" 
        class="btn btn-sm" 
        :class="selectedRange === 'today' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'"
        @click="selectedRange = 'today'"
      >
        Hari Ini
      </button>
      <button 
        type="button" 
        class="btn btn-sm" 
        :class="selectedRange === '7d' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'"
        @click="selectedRange = '7d'"
      >
        7 Hari
      </button>
      <button 
        type="button" 
        class="btn btn-sm" 
        :class="selectedRange === '30d' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'"
        @click="selectedRange = '30d'"
      >
        30 Hari
      </button>
      <button 
        type="button" 
        class="btn btn-sm" 
        :class="selectedRange === '1y' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'"
        @click="selectedRange = '1y'"
      >
        1 Tahun
      </button>
      <button 
        type="button" 
        class="btn btn-sm" 
        :class="selectedRange === 'all' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'"
        @click="selectedRange = 'all'"
      >
        Semua
      </button>
    </div>

    <!-- Kartu Statistik Utama -->
    <div class="row g-3 mb-4">
      <div class="col-6">
        <div class="card bg-secondary text-light border-0 p-3 shadow-sm h-100">
          <div class="text-secondary small mb-1">Total Kehadiran</div>
          <h3 class="fw-bold mb-0 text-success">{{ stats.totalAttendance }}</h3>
        </div>
      </div>
      <div class="col-6">
        <div class="card bg-secondary text-light border-0 p-3 shadow-sm h-100">
          <div class="text-secondary small mb-1">Member Aktif</div>
          <h3 class="fw-bold mb-0 text-warning">{{ stats.activeMembers }}</h3>
        </div>
      </div>
    </div>

    <!-- Quick Action Scanner -->
    <div class="mb-4">
      <NuxtLink to="/scanner" class="btn btn-warning text-dark fw-bold w-100 py-2 shadow-sm">
        <i class="bi bi-camera-fill me-2"></i> Buka Scanner Presensi
      </NuxtLink>
    </div>

    <!-- Leaderboard: Member Paling Rajin -->
    <div class="card bg-secondary text-light border-0 shadow-sm mb-4">
      <div class="card-header bg-dark border-secondary py-3 d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold"><i class="bi bi-trophy-fill text-warning me-2"></i> Member Terajin</h6>
        <span class="badge bg-secondary text-light small">Top 5</span>
      </div>

      <div v-if="pending" class="text-center py-4">
        <div class="spinner-border text-warning spinner-border-sm" role="status"></div>
      </div>

      <div v-else-if="leaderboard.length === 0" class="text-center py-4 text-secondary small">
        Belum ada data peringkat pada periode ini.
      </div>

      <div v-else class="list-group list-group-flush bg-secondary">
        <div v-for="(item, index) in leaderboard" :key="item.uuid" class="list-group-item bg-secondary text-light border-secondary d-flex justify-content-between align-items-center py-2">
          <div class="d-flex align-items-center">
            <span class="badge rounded-pill bg-dark text-warning me-3 fw-bold" style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              #{{ index + 1 }}
            </span>
            <div>
              <h6 class="mb-0 fw-bold fs-6">{{ item.name }}</h6>
              <small class="text-secondary font-monospace" style="font-size: 0.75rem;">{{ item.uuid }}</small>
            </div>
          </div>
          <span class="badge bg-success text-light px-2 py-1">{{ item.count }}x Hadir</span>
        </div>
      </div>
    </div>

    <!-- Log Aktivitas Kehadiran -->
    <div class="card bg-secondary text-light border-0 shadow-sm">
      <div class="card-header bg-dark border-secondary py-3">
        <h6 class="mb-0 fw-bold">Log Aktivitas Kehadiran</h6>
      </div>
      
      <div v-if="pending" class="text-center py-5">
        <div class="spinner-border text-warning spinner-border-sm" role="status"></div>
      </div>

      <div v-else-if="logs.length === 0" class="text-center py-5 text-secondary">
        <p class="mb-0">Tidak ada riwayat aktivitas pada periode ini.</p>
      </div>

      <div v-else class="list-group list-group-flush bg-secondary">
        <div v-for="log in logs" :key="log.id" class="list-group-item bg-secondary text-light border-secondary d-flex justify-content-between align-items-center py-3">
          <div>
            <h6 class="mb-1 fw-bold">{{ log.member?.name || 'Member Tidak Dikenal' }}</h6>
            <div class="small text-secondary">
              Metode: <span class="badge bg-dark text-warning">{{ log.entryMethod }}</span> 
              <span class="ms-2">Petugas: <strong>{{ log.scannedBy?.name || 'Sistem' }}</strong></span>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-success text-light px-2 py-1">{{ formatTime(log.scannedAt) }}</span>
            <div class="text-secondary small mt-1" style="font-size: 0.7rem;">
              {{ new Date(log.scannedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>