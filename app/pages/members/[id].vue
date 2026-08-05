<template>
  <div class="mobile-container pb-5 mb-5">
    <!-- Header -->
    <div class="d-flex align-items-center mb-4 sticky-top bg-light py-3" style="z-index: 1020;">
      <NuxtLink to="/members" class="text-decoration-none text-dark me-3">
        <span class="fs-2 fw-bold">←</span>
      </NuxtLink>
      <h3 class="mb-0 fw-bold">Detail Member</h3>
    </div>

    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="member">
      <!-- Kartu Profil -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 class="fw-bold mb-1 text-dark">{{ member.name }}</h4>
              <p class="text-muted small mb-0 font-monospace">ID: {{ member.uuid }}</p>
            </div>
            <span class="badge" :class="member.isActive ? 'bg-success' : 'bg-danger'">
              {{ member.isActive ? 'Aktif' : 'Non-Aktif' }}
            </span>
          </div>

          <hr class="text-muted">

          <!-- Data Utama -->
          <div class="mb-2">
            <small class="text-muted d-block">Nomor Telepon</small>
            <span class="fw-bold text-dark">{{ member.phoneNumber || '-' }}</span>
          </div>
          <div class="mb-2">
            <small class="text-muted d-block">Email</small>
            <span class="fw-bold text-dark">{{ member.email || '-' }}</span>
          </div>

          <!-- Data Dinamis -->
          <template v-if="member.dynamicData">
            <div v-for="(value, key) in parseDynamicData(member.dynamicData)" :key="key" class="mb-2 mt-2">
              <small class="text-muted d-block">{{ key }}</small>
              <span class="fw-bold text-dark">{{ value || '-' }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Area Aksi Manual -->
      <div class="row g-2 mb-4">
        <div class="col-6">
          <button @click="manualCheckIn" class="btn btn-primary w-100 fw-bold rounded-3 py-2 shadow-sm" :disabled="isProcessing">
            📝 Catat Hadir
          </button>
        </div>
        <div class="col-6">
          <button @click="toggleStatus" class="btn w-100 fw-bold rounded-3 py-2 shadow-sm" :class="member.isActive ? 'btn-outline-danger' : 'btn-success'" :disabled="isProcessing">
            {{ member.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
          </button>
        </div>
      </div>

      <!-- Area Tab Log Riwayat -->
      <ul class="nav nav-pills nav-fill mb-3 bg-white rounded-3 shadow-sm p-1" id="logTab">
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active': activeTab === 'kehadiran' }" @click="activeTab = 'kehadiran'">Log Kehadiran</button>
        </li>
        <li class="nav-item">
          <button class="nav-link fw-bold" :class="{ 'active': activeTab === 'aktivitas' }" @click="activeTab = 'aktivitas'">Log Aktivitas</button>
        </li>
      </ul>

      <!-- Tabel Log Kehadiran -->
      <div v-if="activeTab === 'kehadiran'" class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-0">
          <ul class="list-group list-group-flush rounded-4">
            <li v-if="!member.logs || member.logs.length === 0" class="list-group-item p-4 text-center text-muted">
              Belum ada riwayat kehadiran.
            </li>
            <li v-for="log in member.logs" :key="log.id" class="list-group-item p-3 d-flex justify-content-between align-items-center">
              <div>
                <span class="d-block fw-bold">{{ new Date(log.scannedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
                <span class="small text-muted">{{ new Date(log.scannedAt).toLocaleTimeString('id-ID') }} WIB</span>
              </div>
              <span class="badge bg-light text-dark border">{{ log.entryMethod === 'QR_SCAN' ? 'Scan' : 'Manual' }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tabel Log Aktivitas (Audit Trail) -->
      <div v-if="activeTab === 'aktivitas'" class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-0">
          <ul class="list-group list-group-flush rounded-4">
            <li v-if="!member.auditLogs || member.auditLogs.length === 0" class="list-group-item p-4 text-center text-muted">
              Belum ada riwayat aktivitas administratif.
            </li>
            <li v-for="audit in member.auditLogs" :key="audit.id" class="list-group-item p-3">
              <div class="d-flex justify-content-between">
                <span class="fw-bold text-dark">{{ formatAuditAction(audit.action) }}</span>
                <span class="small text-muted">{{ new Date(audit.createdAt).toLocaleDateString('id-ID') }}</span>
              </div>
              <small class="text-muted d-block mt-1">Metode: {{ audit.source }} | Oleh: Petugas #{{ audit.performedBy }}</small>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const memberId = route.params.id

const activeTab = ref('kehadiran')
const isProcessing = ref(false)

// Tarik data member lengkap dengan relasi logs & auditLogs
const { data: member, pending, refresh } = await useFetch(`/api/members/${memberId}`, { server: false })

const parseDynamicData = (data) => {
  if (!data) return {}
  try { return typeof data === 'string' ? JSON.parse(data) : data } 
  catch (e) { return {} }
}

const formatAuditAction = (action) => {
  const actions = {
    'AKTIVASI_STATUS': 'Aktivasi Membership',
    'NONAKTIF_STATUS': 'Penonaktifan Membership',
    'UPDATE_PROFIL': 'Pembaruan Data Profil',
    'CREATE_MEMBER': 'Pendaftaran Member Baru'
  }
  return actions[action] || action
}

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
    alert('Status membership berhasil diubah.')
    refresh()
  } catch (error) {
    alert('Gagal mengubah status.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.mobile-container { padding-bottom: 120px; }
.nav-pills .nav-link { color: #6c757d; border-radius: 8px; }
.nav-pills .nav-link.active { background-color: #f8f9fa; color: #0d6efd; }
</style>