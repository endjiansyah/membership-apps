<template>
  <div class="mobile-container pb-5 mb-5">
    <!-- Header -->
    <div class="d-flex align-items-center mb-4 sticky-top bg-light py-3" style="z-index: 1020;">
      <h3 class="mb-0 fw-bold">Pengaturan Form</h3>
    </div>
    
    <p class="text-muted mb-4">Tambahkan kolom data baru yang wajib diisi oleh petugas saat mendaftarkan member.</p>

    <!-- Bagian Form Tambah Field -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-primary text-white fw-bold rounded-top-4 py-3">
        + Tambah Kolom Baru
      </div>
      <div class="card-body p-4">
        <form @submit.prevent="saveField">
          <div class="mb-3">
            <label class="form-label fw-bold text-muted small">Nama Label (Pertanyaan)</label>
            <input type="text" v-model="form.label" class="form-control form-control-lg" placeholder="Contoh: Asal Kota" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-bold text-muted small">Tipe Data</label>
            <select v-model="form.type" class="form-select form-select-lg">
              <option value="text">Teks Pendek</option>
              <option value="number">Angka</option>
              <option value="date">Tanggal</option>
            </select>
          </div>

          <div class="mb-4 form-check mt-3">
            <input type="checkbox" v-model="form.isRequired" class="form-check-input border-secondary" id="checkRequired" style="transform: scale(1.2);">
            <label class="form-check-label ms-2 fw-bold" for="checkRequired">Wajib Diisi (Required)</label>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm" :disabled="isLoading">
            {{ isLoading ? 'Menyimpan...' : 'Simpan Kolom' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Bagian Daftar Kolom Dinamis (Mobile List) -->
    <h5 class="fw-bold text-dark mb-3">Daftar Kolom Tambahan</h5>
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-0">
        <div v-if="!fields || fields.length === 0" class="text-center py-5 text-muted">
          Belum ada kolom tambahan.
        </div>
        
        <div v-else class="list-group list-group-flush rounded-4">
          <div v-for="field in fields" :key="field.id" class="list-group-item p-3 d-flex justify-content-between align-items-center">
            <div>
              <span class="fw-bold d-block text-dark">{{ field.label }}</span>
              <div class="mt-1">
                <span class="badge bg-light text-dark border me-2">{{ field.type }}</span>
                <span v-if="field.isRequired" class="badge bg-danger">Wajib</span>
                <span v-else class="badge bg-secondary">Opsional</span>
              </div>
            </div>
            <!-- Fungsi Hapus -->
            <button @click="deleteField(field.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { data: fields, refresh } = await useFetch('/api/fields', { server: false })

const isLoading = ref(false)
const form = ref({
  label: '',
  type: 'text',
  isRequired: false
})

const saveField = async () => {
  isLoading.value = true
  try {
    // Generate fieldKey sederhana dari label (contoh: "Asal Kota" -> "asal_kota")
    const generatedKey = form.value.label.toLowerCase().replace(/[^a-z0-9]/g, '_')
    
    await $fetch('/api/fields', {
      method: 'POST',
      body: { ...form.value, fieldKey: generatedKey }
    })
    
    form.value.label = ''
    form.value.type = 'text'
    form.value.isRequired = false
    
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'Terjadi kesalahan saat menyimpan data.')
  } finally {
    isLoading.value = false
  }
}

// Fungsi eksekusi hapus data
const deleteField = async (id) => {
  if (!confirm('Hapus kolom ini? (Data member lama tidak akan hilang)')) return
  
  try {
    await $fetch(`/api/fields/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (error) {
    alert('Gagal menghapus kolom.')
  }
}
</script>

<style scoped>
.mobile-container {
  padding-bottom: 120px; 
}
</style>