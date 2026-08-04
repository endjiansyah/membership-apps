<template>
  <div class="mobile-container pb-5">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 sticky-top bg-white py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Daftar Member</h3>
      <NuxtLink to="/members/create" class="btn btn-primary shadow-sm fw-bold rounded-pill px-3">
        + Tambah
      </NuxtLink>
    </div>

    <!-- List Member -->
    <div v-if="pending" class="text-center text-muted py-5">
      Memuat data member...
    </div>
    
    <div v-else-if="!members || members.length === 0" class="text-center text-muted py-5">
      Belum ada member yang terdaftar.
    </div>

    <!-- Card Member ala Mobile -->
    <div v-else class="row g-3">
      <div class="col-12" v-for="member in members" :key="member.id">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <h5 class="mb-1 fw-bold text-dark">{{ member.name }}</h5>
              <p class="mb-0 text-muted small">
                {{ member.phoneNumber || member.email || 'Tanpa Kontak' }}
              </p>
            </div>
            <!-- Tombol untuk memunculkan QR Code -->
            <button @click="showQR(member)" class="btn btn-light border rounded-circle p-2 shadow-sm d-flex justify-content-center align-items-center" style="width: 45px; height: 45px;">
              📷
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup / Overlay Tampil QR Code -->
    <!-- Dibuat custom agar ringan di mobile dan terhindar dari bug Bootstrap JS -->
    <div v-if="selectedMember" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style="z-index: 9999;" @click.self="selectedMember = null">
      <div class="card border-0 rounded-4 p-4 text-center mx-3 shadow-lg" style="max-width: 350px; width: 100%;">
        <h4 class="fw-bold mb-1">{{ selectedMember.name }}</h4>
        <p class="text-muted small mb-3">Scan QR ini untuk Presensi</p>
        
        <!-- Gambar QR Code -->
        <div class="bg-light p-2 rounded-3 mb-3 d-inline-block border">
          <img :src="qrImageUrl" alt="QR Code Member" class="img-fluid rounded" v-if="qrImageUrl" />
          <div v-else class="spinner-border text-primary my-4" role="status"></div>
        </div>

        <p class="text-muted small mb-4 font-monospace" style="font-size: 11px;">
          UUID: {{ selectedMember.uuid }}
        </p>
        
        <button class="btn btn-secondary w-100 rounded-pill fw-bold" @click="selectedMember = null">
          Tutup Layar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode' // Import library bawaan Anda

// Fetch otomatis data member dari API yang baru kita buat
const { data: members, pending } = await useFetch('/api/members', { server: false })

// State untuk mengatur popup QR Code
const selectedMember = ref(null)
const qrImageUrl = ref('')

// Fungsi ketika tombol kamera/QR diklik
const showQR = async (member) => {
  selectedMember.value = member
  qrImageUrl.value = '' // Reset gambar sebelum memuat ulang
  
  try {
    // Ubah text (UUID) menjadi gambar format Base64 secara instan
    qrImageUrl.value = await QRCode.toDataURL(member.uuid, {
      width: 250,
      margin: 2,
      color: {
        dark: '#000000', // Warna QR
        light: '#ffffff' // Background QR
      }
    })
  } catch (err) {
    console.error('Gagal membuat QR:', err)
    alert('Sistem gagal memuat gambar QR Code.')
  }
}
</script>