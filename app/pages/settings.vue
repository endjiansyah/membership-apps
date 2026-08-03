<!-- app/pages/settings.vue -->
<template>
  <div>
    <div class="mb-4">
      <h2>Pengaturan Form Dinamis</h2>
      <p class="text-muted">Tambahkan kolom data baru yang wajib diisi saat pendaftaran member.</p>
    </div>
    
    <div class="row">
      <!-- Bagian Form Tambah Field -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white fw-bold">
            + Tambah Kolom Baru
          </div>
          <div class="card-body">
            <form @submit.prevent="saveField">
              <div class="mb-3">
                <label class="form-label">Nama Label (Pertanyaan)</label>
                <input type="text" v-model="form.label" class="form-control" placeholder="Contoh: Asal Kota" required>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Tipe Data</label>
                <select v-model="form.type" class="form-select">
                  <option value="text">Teks Pendek (Text)</option>
                  <option value="number">Angka (Number)</option>
                  <option value="date">Tanggal (Date)</option>
                </select>
              </div>

              <div class="mb-4 form-check">
                <input type="checkbox" v-model="form.isRequired" class="form-check-input" id="checkRequired">
                <label class="form-check-label" for="checkRequired">Wajib Diisi (Required)</label>
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                {{ isLoading ? 'Menyimpan...' : 'Simpan Kolom' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Bagian Tabel Data Field -->
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Label</th>
                  <th>Field Key (Sistem)</th>
                  <th>Tipe</th>
                  <th>Wajib?</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!fields || fields.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">Belum ada custom kolom tambahan.</td>
                </tr>
                <tr v-for="field in fields" :key="field.id">
                  <td class="fw-bold">{{ field.label }}</td>
                  <td><code class="text-secondary">{{ field.fieldKey }}</code></td>
                  <td>
                    <span class="badge bg-secondary">{{ field.type }}</span>
                  </td>
                  <td>
                    <span v-if="field.isRequired" class="badge bg-danger">Ya</span>
                    <span v-else class="badge bg-light text-dark border">Tidak</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger">Hapus</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Mengambil data dari API GET (Nuxt otomatis menangani fetching data)
const { data: fields, refresh } = await useFetch('/api/fields', { server: false })

const isLoading = ref(false)
const form = ref({
  label: '',
  type: 'text',
  isRequired: false
})

// Fungsi menyimpan data ke API POST
const saveField = async () => {
  isLoading.value = true
  try {
    await $fetch('/api/fields', {
      method: 'POST',
      body: form.value
    })
    
    // Reset form setelah sukses
    form.value.label = ''
    form.value.type = 'text'
    form.value.isRequired = false
    
    // Refresh tabel data
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'Terjadi kesalahan saat menyimpan data.')
  } finally {
    isLoading.value = false
  }
}
</script>