<template>
  <div class="mobile-container pb-5">
    <!-- Header Navigasi Mobile -->
    <div class="d-flex align-items-center mb-4 sticky-top bg-white py-3" style="z-index: 1020;">
      <NuxtLink to="/members" class="text-decoration-none text-dark me-3">
        <span class="fs-2 fw-bold">←</span>
      </NuxtLink>
      <h3 class="mb-0 fw-bold">Tambah Member</h3>
    </div>

    <form @submit.prevent="saveMember">
      <!-- Data Utama -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <h5 class="text-primary mb-3">Data Utama</h5>
          
          <div class="mb-4">
            <label class="form-label text-muted fw-bold">Nama Lengkap <span class="text-danger">*</span></label>
            <input type="text" v-model="form.name" class="form-control form-control-lg" required placeholder="Cth: Budi Santoso">
          </div>
          
          <div class="mb-4">
            <label class="form-label text-muted fw-bold">No. WhatsApp</label>
            <input type="tel" v-model="form.phoneNumber" class="form-control form-control-lg" placeholder="0812...">
          </div>
          
          <div class="mb-2">
            <label class="form-label text-muted fw-bold">Email</label>
            <input type="email" v-model="form.email" class="form-control form-control-lg" placeholder="budi@email.com">
          </div>
        </div>
      </div>

      <!-- Data Tambahan (Hasil dari Form Dinamis) -->
      <div v-if="fields && fields.length > 0" class="card border-0 shadow-sm mb-5">
        <div class="card-body p-4">
          <h5 class="text-primary mb-3">Informasi Tambahan</h5>
          
          <div v-for="field in fields" :key="field.id" class="mb-4">
            <label class="form-label text-muted fw-bold">
              {{ field.label }} 
              <span v-if="field.isRequired" class="text-danger">*</span>
            </label>
            
            <input 
              v-if="field.type === 'text'" 
              type="text" 
              v-model="form.dynamicData[field.fieldKey]" 
              class="form-control form-control-lg" 
              :required="field.isRequired"
              :placeholder="'Masukkan ' + field.label"
            >
            <input 
              v-else-if="field.type === 'number'" 
              type="number" 
              v-model="form.dynamicData[field.fieldKey]" 
              class="form-control form-control-lg" 
              :required="field.isRequired"
              placeholder="0"
            >
            <input 
              v-else-if="field.type === 'date'" 
              type="date" 
              v-model="form.dynamicData[field.fieldKey]" 
              class="form-control form-control-lg" 
              :required="field.isRequired"
            >
          </div>
        </div>
      </div>

      <!-- Tombol Simpan Sticky di Bawah Layar -->
      <div class="fixed-bottom p-3 bg-white border-top shadow-lg" style="z-index: 1030;">
        <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold py-3 shadow" :disabled="isLoading">
          {{ isLoading ? 'Menyimpan Data...' : 'Simpan & Buat QR Code' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// Tarik konfigurasi form dinamis (tanpa SSR agar ringan di mobile)
const { data: fields } = await useFetch('/api/fields', { server: false })

const isLoading = ref(false)
const form = ref({
  name: '',
  phoneNumber: '',
  email: '',
  dynamicData: {} // Jawaban dinamis akan otomatis di-bind ke sini
})

const saveMember = async () => {
  isLoading.value = true
  try {
    await $fetch('/api/members', {
      method: 'POST',
      body: form.value
    })
    
    // Redirect kembali ke daftar member setelah sukses
    alert('Member berhasil ditambahkan!')
    router.push('/members')
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal menyimpan data member.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Memastikan area bawah tidak tertutup oleh tombol sticky */
.mobile-container {
  padding-bottom: 100px; 
}
</style>