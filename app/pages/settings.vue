<template>
  <div class="py-2 py-md-3 pb-5 mb-5 mx-auto px-2 px-md-0" style="max-width: 800px;">
    
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold text-white d-flex align-items-center gap-2">
        <Icon name="bi:gear-fill" class="text-secondary" /> System Settings
      </h4>
    </div>

    <!-- TABS -->
    <div class="d-flex gap-2 mb-3 overflow-auto" style="scrollbar-width: none;">
      <button @click="activeTab = 'fields'" class="btn rounded-pill fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'fields' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'">
        <Icon name="bi:ui-radios" class="fs-6" /> Dynamic Fields
      </button>
      <button v-if="authUser?.role === 'SUPER_ADMIN'" @click="activeTab = 'users'" class="btn rounded-pill fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'users' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'">
        <Icon name="bi:person-badge-fill" class="fs-6" /> Kelola Petugas
      </button>
    </div>

    <!-- TAB: DYNAMIC FIELDS -->
    <div v-if="activeTab === 'fields'">
      <!-- Form Input Tetap Sama -->
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-4">
        <div class="card-body p-3">
          <h6 class="fw-bold text-white mb-3" style="font-size: 0.9rem;">Form Kolom Tambahan</h6>
          <form @submit.prevent="saveField">
            <div class="row g-2">
              <div class="col-12 col-md-6 mb-2">
                <label class="form-label text-secondary fw-bold" style="font-size: 0.75rem;">Label (Contoh: Asal Sekolah)</label>
                <input type="text" v-model="fieldForm.label" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" required>
              </div>
              <div class="col-12 col-md-6 mb-2">
                <label class="form-label text-secondary fw-bold" style="font-size: 0.75rem;">Tipe Input</label>
                <select v-model="fieldForm.type" class="form-select form-select-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2">
                  <option value="text">Teks Singkat (Text)</option>
                  <option value="number">Angka (Number)</option>
                  <option value="date">Tanggal (Date)</option>
                </select>
              </div>
              <div class="col-12 mb-3">
                <div class="form-check">
                  <input class="form-check-input bg-black border-secondary" type="checkbox" v-model="fieldForm.isRequired" id="reqCheck">
                  <label class="form-check-label text-secondary fw-bold" for="reqCheck" style="font-size: 0.75rem;">
                    Kolom ini Wajib Diisi (Required)
                  </label>
                </div>
              </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2">
              <button v-if="isEditingField" type="button" @click="resetFieldForm" class="btn btn-outline-secondary rounded-pill py-2 px-4 fw-bold" style="font-size: 0.8rem;">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill py-2 px-4 fw-bold text-dark w-100 w-md-auto" style="font-size: 0.8rem;">
                {{ isEditingField ? 'Simpan Perubahan' : '+ Tambah Kolom' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PERBAIKAN: List Fields menggunakan Card Layout yang ramah HP -->
      <div>
        <h6 class="fw-bold text-secondary mb-3" style="font-size: 0.8rem;">DAFTAR KOLOM AKTIF</h6>
        
        <div v-if="fieldsPending" class="text-center py-4 text-secondary small">
          <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
          <div>Memuat data...</div>
        </div>
        
        <div v-else-if="!fields || fields.length === 0" class="text-center py-4 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-sm">
          <p class="text-secondary mb-0 small">Belum ada kolom tambahan.</p>
        </div>
        
        <div v-else class="d-flex flex-column gap-3">
          <div v-for="field in fields" :key="field.id" class="card bg-dark border border-secondary border-opacity-25 p-3 rounded-4 shadow-sm">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="fw-bold text-white mb-1">
                  {{ field.label }} 
                  <span v-if="field.isRequired" class="text-danger" title="Wajib Diisi">*</span>
                </h6>
                <div class="text-secondary font-monospace" style="font-size: 0.65rem;">Key: {{ field.fieldKey }}</div>
              </div>
              <span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25" style="font-size: 0.65rem;">
                {{ field.type.toUpperCase() }}
              </span>
            </div>
            
            <div class="d-flex gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25">
              <button @click="editField(field)" class="btn btn-outline-info btn-sm rounded-pill w-100 fw-bold py-2" style="font-size: 0.75rem;">Edit</button>
              <button @click="deleteField(field.id)" class="btn btn-outline-danger btn-sm rounded-pill w-100 fw-bold py-2" style="font-size: 0.75rem;">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: USERS / PETUGAS (Hanya Super Admin) -->
    <div v-if="activeTab === 'users' && authUser?.role === 'SUPER_ADMIN'">
      <!-- Form Input Tetap Sama -->
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-4">
        <div class="card-body p-3">
          <h6 class="fw-bold text-white mb-3" style="font-size: 0.9rem;">Daftarkan Petugas Baru</h6>
          <form @submit.prevent="saveUser">
            <div class="row g-2">
              <div class="col-12 col-md-6 mb-2">
                <label class="form-label text-secondary fw-bold" style="font-size: 0.75rem;">Nama Lengkap</label>
                <input type="text" v-model="userForm.name" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" required>
              </div>
              <div class="col-12 col-md-6 mb-2">
                <label class="form-label text-secondary fw-bold" style="font-size: 0.75rem;">Email Login</label>
                <input type="email" v-model="userForm.email" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" required>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label text-secondary fw-bold" style="font-size: 0.75rem;">Password</label>
                <input type="password" v-model="userForm.password" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" required placeholder="Minimal 6 karakter">
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button type="submit" class="btn btn-primary rounded-pill py-2 px-4 fw-bold text-dark w-100 w-md-auto" style="font-size: 0.8rem;">
                + Daftarkan Petugas
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PERBAIKAN: List Users menggunakan Card Layout yang ramah HP -->
      <div>
        <h6 class="fw-bold text-secondary mb-3" style="font-size: 0.8rem;">DAFTAR PENGGUNA SISTEM</h6>
        
        <div v-if="usersPending" class="text-center py-4 text-secondary small">
          <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
          <div>Memuat data...</div>
        </div>
        
        <div v-else class="d-flex flex-column gap-3">
          <div v-for="user in users" :key="user.id" class="card bg-dark border border-secondary border-opacity-25 p-3 rounded-4 shadow-sm">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="fw-bold text-white mb-1">{{ user.name }}</h6>
                <div class="text-secondary small">{{ user.email }}</div>
              </div>
              <span class="badge" style="font-size: 0.65rem;" :class="user.role === 'SUPER_ADMIN' ? 'bg-primary text-dark' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'">
                {{ user.role }}
              </span>
            </div>
            
            <div class="d-flex gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25">
              <template v-if="user.id !== authUser?.id">
                <button @click="resetPassword(user.id)" class="btn btn-outline-warning btn-sm rounded-pill w-100 fw-bold py-2" style="font-size: 0.75rem;">Reset Sandi</button>
                <button @click="deleteUser(user.id)" class="btn btn-outline-danger btn-sm rounded-pill w-100 fw-bold py-2" style="font-size: 0.75rem;">Hapus</button>
              </template>
              <template v-else>
                <button class="btn btn-secondary btn-sm rounded-pill w-100 fw-bold py-2 opacity-50" style="font-size: 0.75rem;" disabled>Akun Anda Saat Ini</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const { data: authData } = await useFetch('/api/auth/me', { server: false })
const authUser = computed(() => authData.value?.user)

const activeTab = ref('fields')

// === LOGIKA DYNAMIC FIELDS ===
const { data: fields, pending: fieldsPending, refresh: refreshFields } = await useFetch('/api/fields', { server: false })

const isEditingField = ref(false)
const fieldForm = ref({ id: null, label: '', type: 'text', isRequired: false })

const saveField = async () => {
  try {
    const url = isEditingField.value ? `/api/fields/${fieldForm.value.id}` : '/api/fields'
    const method = isEditingField.value ? 'PUT' : 'POST'
    
    await $fetch(url, { method, body: fieldForm.value })
    resetFieldForm()
    refreshFields()
  } catch (error) {
    alert(error.data?.statusMessage || 'Terjadi kesalahan')
  }
}

const editField = (field) => {
  isEditingField.value = true
  fieldForm.value = { ...field }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const resetFieldForm = () => {
  isEditingField.value = false
  fieldForm.value = { id: null, label: '', type: 'text', isRequired: false }
}

const deleteField = async (id) => {
  if (!confirm('Hapus kolom ini? Data di member terkait akan kehilangan referensinya.')) return
  try {
    await $fetch(`/api/fields/${id}`, { method: 'DELETE' })
    refreshFields()
  } catch (error) {
    alert('Gagal menghapus kolom.')
  }
}

// === LOGIKA USERS / PETUGAS ===
const { data: users, pending: usersPending, refresh: refreshUsers } = await useFetch('/api/users', { server: false })

const userForm = ref({ name: '', email: '', password: '', role: 'PETUGAS' })

const saveUser = async () => {
  try {
    await $fetch('/api/users', { method: 'POST', body: userForm.value })
    alert('Petugas berhasil ditambahkan!')
    userForm.value = { name: '', email: '', password: '', role: 'PETUGAS' }
    refreshUsers()
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal menambahkan petugas')
  }
}

const deleteUser = async (id) => {
  if (!confirm('Anda yakin ingin menghapus petugas ini?')) return
  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    refreshUsers()
  } catch (error) {
    alert('Gagal menghapus petugas')
  }
}

const resetPassword = async (userId) => {
  const newPassword = prompt('Masukkan password baru untuk petugas ini (minimal 6 karakter):')
  if (!newPassword) return

  if (newPassword.length < 6) {
    alert('Password baru minimal harus 6 karakter.')
    return
  }

  try {
    await $fetch(`/api/users/${userId}/reset-password`, {
      method: 'PUT',
      body: { newPassword }
    })
    alert('Password petugas berhasil direset!')
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal mereset password.')
  }
}
</script>