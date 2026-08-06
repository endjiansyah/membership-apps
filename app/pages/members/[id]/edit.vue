<template>
  <div class="container-fluid px-0 py-3 pb-5 mb-5" style="max-width: 600px;">
    
    <!-- HEADER -->
    <div class="d-flex align-items-center mb-4 px-3 sticky-top bg-black bg-opacity-75 py-2" style="z-index: 1020; backdrop-filter: blur(8px);">
      <NuxtLink :to="`/members/${memberId}`" class="text-decoration-none text-secondary me-3" aria-label="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
      </NuxtLink>
      <h6 class="mb-0 fw-bold text-secondary text-uppercase tracking-wider mx-auto" style="font-size: 0.75rem; letter-spacing: 1px;">Edit Member</h6>
      <div style="width: 24px;"></div>
    </div>

    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-3 small">Memuat data member...</p>
    </div>

    <form v-else @submit.prevent="updateMember" class="px-3 pb-5">
      
      <!-- AREA UPLOAD / EDIT FOTO -->
      <div class="d-flex flex-column align-items-center mb-4">
        <div 
          class="position-relative d-inline-flex justify-content-center align-items-center bg-dark border border-secondary border-opacity-50 text-secondary shadow-sm" 
          style="width: 100px; height: 100px; border-radius: 28px; overflow: hidden; cursor: pointer;"
          @click="triggerFileInput"
        >
          <img v-if="form.photoPath" :src="form.photoPath" alt="Preview" class="w-100 h-100 object-fit-cover" />
          
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/>
            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
          </svg>

          <div class="position-absolute bottom-0 w-100 bg-black bg-opacity-50 text-center py-1">
            <small class="text-white fw-bold" style="font-size: 0.6rem;">GANTI</small>
          </div>
        </div>
        <p class="text-secondary small mt-2 fw-bold">Ubah Foto Profil</p>
        
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
          
          <div class="mb-4">
            <label class="form-label text-secondary small fw-bold">Nama Lengkap <span class="text-danger">*</span></label>
            <input type="text" v-model="form.name" class="form-control form-control-lg bg-black border-secondary border-opacity-25 text-white shadow-none" required placeholder="Cth: Budi Santoso">
          </div>
          
          <div class="mb-4">
            <label class="form-label text-secondary small fw-bold">No. WhatsApp</label>
            <input type="tel" v-model="form.phoneNumber" class="form-control form-control-lg bg-black border-secondary border-opacity-25 text-white shadow-none" placeholder="Cth: 08123456789">
          </div>
          
          <div class="mb-4">
            <label class="form-label text-secondary small fw-bold">Alamat Email</label>
            <input type="email" v-model="form.email" class="form-control form-control-lg bg-black border-secondary border-opacity-25 text-white shadow-none" placeholder="Cth: budi@email.com">
          </div>

          <!-- Input Dinamis Berdasarkan Master Fields -->
          <template v-if="fields && fields.length > 0">
            <div v-for="field in fields" :key="field.id" class="mb-4">
              <label class="form-label text-secondary small fw-bold">
                {{ field.label }} 
                <span v-if="field.isRequired" class="text-danger">*</span>
              </label>
              
              <input 
                v-if="field.type === 'text'" 
                type="text" 
                v-model="form.dynamicData[field.fieldKey]" 
                class="form-control form-control-lg bg-black border-secondary border-opacity-25 text-white shadow-none" 
                :required="field.isRequired"
                :placeholder="'Masukkan ' + field.label"
              >
              <input 
                v-else-if="field.type === 'number'" 
                type="number" 
                v-model="form.dynamicData[field.fieldKey]" 
                class="form-control form-control-lg bg-black border-secondary border-opacity-25 text-white shadow-none" 
                :required="field.isRequired"
                placeholder="0"
              >
              <input 
                v-else-if="field.type === 'date'" 
                type="date" 
                v-model="form.dynamicData[field.fieldKey]" 
                class="form-control form-control-lg bg-black border-secondary border-opacity-25 text-white shadow-none" 
                :required="field.isRequired"
              >
            </div>
          </template>

        </div>
      </div>

      <!-- TOMBOL SIMPAN -->
      <div>
        <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold py-3 shadow text-dark rounded-pill" :disabled="isLoading">
          {{ isLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const memberId = route.params.id

const isLoading = ref(false)
const fileInput = ref(null)

const form = ref({
  name: '',
  phoneNumber: '',
  email: '',
  photoPath: '',
  dynamicData: {}
})

// Ambil data master fields dan data member saat ini
const { data: fields } = await useFetch('/api/fields', { server: false })
const { data: memberData, pending } = await useFetch(`/api/members/${memberId}`, { server: false })

// Inisialisasi form dengan data member yang ada
if (memberData.value) {
  form.value.name = memberData.value.name || ''
  form.value.phoneNumber = memberData.value.phoneNumber || ''
  form.value.email = memberData.value.email || ''
  form.value.photoPath = memberData.value.photoPath || ''
  
  try {
    form.value.dynamicData = typeof memberData.value.dynamicData === 'string' 
      ? JSON.parse(memberData.value.dynamicData) 
      : (memberData.value.dynamicData || {})
  } catch (e) {
    form.value.dynamicData = {}
  }
}

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2MB.")
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.photoPath = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateMember = async () => {
  isLoading.value = true
  try {
    await $fetch(`/api/members/${memberId}`, {
      method: 'PUT',
      body: form.value
    })
    
    alert('Data member berhasil diperbarui!')
    router.push(`/members/${memberId}`)
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal memperbarui data member.')
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