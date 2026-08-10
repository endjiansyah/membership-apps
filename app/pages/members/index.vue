<template>
  <!-- PERBAIKAN PADDING: Hapus container-fluid dan px-*, gunakan mx-auto -->
  <div class="py-2 py-md-3 pb-5 mb-5 mx-auto" style="max-width: 600px;">
    
    <!-- HEADER -->
    <!-- Hapus p-2 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0 fw-bold text-white">Members</h4>
      </div>
      <NuxtLink to="/members/create" class="btn btn-primary shadow-sm fw-bold rounded-3 px-3 py-2 text-dark">
        + Baru
      </NuxtLink>
    </div>

    <!-- SEARCH & FILTER SECTION -->
    <!-- Hapus px-2 -->
    <div class="mb-4">
      <!-- Search Bar -->
      <div class="input-group mb-3 shadow-sm rounded-4 overflow-hidden">
        <span class="input-group-text bg-dark border-secondary border-opacity-25 border-end-0 d-flex align-items-center">
          <Icon name="bi:search" class="text-secondary" />
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
    <!-- Hapus px-2 -->
    <div>
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
      <div v-else>
        <div class="d-flex flex-column gap-3">
          <!-- PERBAIKAN: Gunakan paginatedMembers, bukan filteredMembers -->
          <div 
            v-for="member in paginatedMembers" 
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
              <button @click.prevent="showQR(member)" class="btn btn-primary btn-sm rounded-pill fw-bold px-3 py-2 w-100" style="font-size: 0.75rem;">
                QR
              </button>
              <NuxtLink :to="`/members/${member.id}`" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold px-3 py-2 w-100 text-white" style="font-size: 0.75rem;">
                Details
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- PAGINATION KONTROL -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
          <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.75rem;">
            &laquo; Prev
          </button>
          <span class="text-secondary fw-bold" style="font-size: 0.8rem;">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-sm btn-dark border border-secondary border-opacity-50 rounded-pill px-3 text-white fw-bold" style="font-size: 0.75rem;">
            Next &raquo;
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL POPUP DOWNLOAD KARTU QR CODE         -->
    <!-- ========================================== -->
    <QrCardModal :member="selectedMember" @close="selectedMember = null" />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const { data: members, pending } = await useFetch('/api/members', { server: false })

// State untuk Pencarian dan Filter
const searchQuery = ref('')
const filterStatus = ref('all') // 'all', 'active', 'inactive'

const selectedMember = ref(null)

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

// ==========================================
// LOGIKA PAGINATION FRONTEND
// ==========================================
const currentPage = ref(1)
const itemsPerPage = 15

// Kembalikan ke halaman 1 jika user melakukan pencarian atau mengganti filter
watch([searchQuery, filterStatus], () => {
  currentPage.value = 1
})

const totalPages = computed(() => {
  return Math.ceil(filteredMembers.value.length / itemsPerPage) || 1
})

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMembers.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
// ==========================================

const showQR = (member) => {
  selectedMember.value = member
}
</script>

<style scoped>
/* Menghilangkan border focus biru dari input bawaan bootstrap saat diklik */
input:focus {
  outline: none;
  box-shadow: none;
}
</style>