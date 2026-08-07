<template>
  <div class="container-fluid px-0 py-3 pb-5 mb-5" style="max-width: 600px;">


    <form @submit.prevent="saveMember" class="px-3 pb-5 mb-5">
      
      <!-- AREA UPLOAD FOTO (Mempertahankan UI Lama Anda) -->
      <div class="d-flex flex-column align-items-center mb-4">
        <div 
          class="position-relative d-inline-flex justify-content-center align-items-center bg-dark border border-secondary border-opacity-50 text-secondary shadow-sm" 
          style="width: 100px; height: 100px; border-radius: 28px; overflow: hidden; cursor: pointer;"
          @click="triggerFileInput"
        >
          <img v-if="photoPreview" :src="photoPreview" alt="Preview" class="w-100 h-100 object-fit-cover" />
          
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/>
            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
          </svg>

          <div v-if="photoPreview" class="position-absolute bottom-0 w-100 bg-black bg-opacity-50 text-center py-1">
            <small class="text-white fw-bold" style="font-size: 0.6rem;">GANTI</small>
          </div>
        </div>
        <p class="text-secondary small mt-2 fw-bold">Unggah Foto Profil (Opsional)</p>
        
        <input 
          type="file" 
          ref="fileInput" 
          accept="image/*" 
          class="d-none" 
          @change="handlePhotoUpload" 
        />
      </div>

      <!-- FORM INPUT SECTION -->
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-4 overflow-hidden">
        <div class="card-body p-4">
          
          <div class="mb-3">
            <label class="form-label text-secondary small fw-bold">Nama Lengkap <span class="text-danger">*</span></label>
            <input type="text" v-model="form.name" class="form-control bg-dark border-secondary border-opacity-25 text-white py-2 shadow-none" required placeholder="Cth: Budi Santoso">
          </div>
          
          <div class="mb-3">
            <label class="form-label text-secondary small fw-bold">No. WhatsApp</label>
            <input type="tel" v-model="form.phoneNumber" class="form-control bg-dark border-secondary border-opacity-25 text-white py-2 shadow-none" placeholder="Cth: 08123456789">
          </div>
          
          <div class="mb-3">
            <label class="form-label text-secondary small fw-bold">Alamat Email</label>
            <input type="email" v-model="form.email" class="form-control bg-dark border-secondary border-opacity-25 text-white py-2 shadow-none" placeholder="Cth: budi@email.com">
          </div>

          <!-- Input Dinamis -->
          <template v-if="fields && fields.length > 0">
            <div v-for="field in fields" :key="field.id" class="mb-3">
              <label class="form-label text-secondary small fw-bold">
                {{ field.label }} 
                <span v-if="field.isRequired" class="text-danger">*</span>
              </label>
              
              <input 
                v-if="field.type === 'text'" 
                type="text" 
                v-model="form.dynamicData[field.fieldKey]" 
                class="form-control bg-dark border-secondary border-opacity-25 text-white py-2 shadow-none" 
                :required="field.isRequired"
                :placeholder="'Masukkan ' + field.label"
              >
              <input 
                v-else-if="field.type === 'number'" 
                type="number" 
                v-model="form.dynamicData[field.fieldKey]" 
                class="form-control bg-dark border-secondary border-opacity-25 text-white py-2 shadow-none" 
                :required="field.isRequired"
                placeholder="0"
              >
              <input 
                v-else-if="field.type === 'date'" 
                type="date" 
                v-model="form.dynamicData[field.fieldKey]" 
                class="form-control bg-dark border-secondary border-opacity-25 text-white py-2 shadow-none" 
                :required="field.isRequired"
              >
            </div>
          </template>

        </div>
      </div>

      <!-- TOMBOL SIMPAN -->
      <div>
        <!-- Tambahan: style="font-size: 0.8rem;" -->
        <button type="submit" class="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm text-dark" style="font-size: 0.8rem;" :disabled="isLoading">
          {{ isLoading ? 'Menyimpan...' : 'Simpan Member' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { data: fields } = await useFetch('/api/fields', { server: false })

const isLoading = ref(false)
const photoPreview = ref(null)
const fileInput = ref(null)

// KUNCI: Kita siapkan state khusus untuk menampung FILE ASLI (Binary)
const selectedFile = ref(null) 

const form = ref({
  name: '',
  phoneNumber: '',
  email: '',
  dynamicData: {} 
})

// Fungsi klik buatan untuk memicu input file yang tersembunyi
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Fungsi ini MURNI HANYA UNTUK MEMBUAT PREVIEW GAMBAR
// (Kompresinya biarkan Backend/Sharp yang mengurus agar hasilnya lebih optimal)
const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file // SIMPAN FILE ASLI KE VARIABEL INI

    // Buat URL sementara HANYA UNTUK PREVIEW di browser
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result 
    }
    reader.readAsDataURL(file)
  }
}

const saveMember = async () => {
  isLoading.value = true
  
  try {
    const formData = new FormData()
    
    // Masukkan data teks
    formData.append('name', form.value.name)
    formData.append('phoneNumber', form.value.phoneNumber)
    formData.append('email', form.value.email)
    formData.append('dynamicData', JSON.stringify(form.value.dynamicData))
    
    // Masukkan FILE FISIK, bukan base64 preview-nya
    if (selectedFile.value) {
      formData.append('photo', selectedFile.value)
    }

    await $fetch('/api/members', {
      method: 'POST',
      body: formData
    })
    
    alert('Member berhasil dibuat!')
    navigateTo('/members')
  } catch (error) {
    console.error(error)
    alert('Gagal membuat member. Pastikan semua kolom wajib diisi.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>