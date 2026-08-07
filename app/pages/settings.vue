<template>
  <div class="container-fluid px-0 py-3 pb-5 mb-5" style="max-width: 600px;">
    
    
    <div class="px-3">
      <!-- TAB SELECTOR -->
      <div class="d-flex gap-2 mb-4 overflow-auto pb-1" style="scrollbar-width: none;">
        <button @click="activeTab = 'form'" class="btn rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'form' ? 'btn-primary text-dark px-4' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-4'">
          Form Dinamis
        </button>
        <!-- Tab ini HANYA dirender jika user adalah SUPER_ADMIN -->
        <button v-if="isSuperAdmin" @click="activeTab = 'akun'" class="btn rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'akun' ? 'btn-primary text-dark px-4' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-4'">
          Kelola Petugas
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: PENGATURAN FORM DINAMIS             -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'form'">
        <p class="text-secondary mb-4 small">Tambahkan kolom data baru yang wajib diisi oleh petugas saat mendaftarkan member.</p>

        <!-- Form Tambah Field -->
        <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 mb-4 shadow-sm">
          <div class="card-header bg-black bg-opacity-50 border-bottom border-secondary border-opacity-25 text-white fw-bold py-3" style="font-size: 0.85rem;">
            + Tambah Kolom Baru
          </div>
          <div class="card-body p-3">
            <form @submit.prevent="saveField">
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary small">Nama Label (Pertanyaan)</label>
                <input type="text" v-model="form.label" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3" placeholder="Contoh: Asal Kota" required>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary small">Tipe Data</label>
                <select v-model="form.type" class="form-select form-select-sm bg-black text-white border-secondary border-opacity-25 rounded-3">
                  <option value="text">Teks Pendek</option>
                  <option value="number">Angka</option>
                  <option value="date">Tanggal</option>
                </select>
              </div>

              <div class="mb-4 form-check mt-3 d-flex align-items-center gap-2">
                <input type="checkbox" v-model="form.isRequired" class="form-check-input border-secondary border-opacity-50 bg-black mt-0" id="checkRequired" style="transform: scale(1.2);">
                <label class="form-check-label fw-bold text-white small" for="checkRequired">Wajib Diisi (Required)</label>
              </div>

              <button type="submit" class="btn btn-primary w-100 fw-bold rounded-pill shadow-sm" :disabled="isLoadingField">
                {{ isLoadingField ? 'Menyimpan...' : 'Simpan Kolom' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Daftar Kolom -->
        <small class="text-secondary fw-bold mb-2 d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">Daftar Kolom Tambahan</small>
        <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 overflow-hidden shadow-sm">
          <div v-if="!fields || fields.length === 0" class="text-center py-4">
            <p class="text-secondary mb-0 small">Belum ada kolom tambahan.</p>
          </div>
          
          <div v-else>
            <div v-for="(field, index) in fields" :key="field.id" class="p-3 d-flex justify-content-between align-items-center" :class="{ 'border-bottom border-secondary border-opacity-25': index !== fields.length - 1 }">
              <div>
                <span class="fw-bold d-block text-white" style="font-size: 0.85rem;">{{ field.label }}</span>
                <div class="mt-1 d-flex gap-2">
                  <span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25" style="font-size: 0.65rem;">{{ field.type }}</span>
                  <span v-if="field.isRequired" class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25" style="font-size: 0.65rem;">Wajib</span>
                  <span v-else class="badge bg-dark text-secondary border border-secondary border-opacity-25" style="font-size: 0.65rem;">Opsional</span>
                </div>
              </div>
              <button @click="deleteField(field.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" style="font-size: 0.7rem;">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: MANAJEMEN PETUGAS (SUPER_ADMIN)     -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'akun' && isSuperAdmin">
        <p class="text-secondary mb-4 small">Kelola akun petugas yang memiliki akses untuk mencatat kehadiran dan mendaftarkan member.</p>

        <!-- Form Tambah Petugas -->
        <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 mb-4 shadow-sm">
          <div class="card-header bg-black bg-opacity-50 border-bottom border-secondary border-opacity-25 text-white fw-bold py-3" style="font-size: 0.85rem;">
            + Daftarkan Petugas Baru
          </div>
          <div class="card-body p-3">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary small">Nama Lengkap</label>
                <input type="text" v-model="userForm.name" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3" required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary small">Email Login</label>
                <input type="email" v-model="userForm.email" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3" required>
              </div>
              <div class="mb-4">
                <label class="form-label fw-bold text-secondary small">Password</label>
                <input type="password" v-model="userForm.password" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3" required>
              </div>
              <button type="submit" class="btn btn-primary w-100 fw-bold rounded-pill shadow-sm" :disabled="isLoadingUser">
                {{ isLoadingUser ? 'Menyimpan...' : 'Buat Akun' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Daftar Petugas -->
        <small class="text-secondary fw-bold mb-2 d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">Daftar Akun Petugas</small>
        <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 overflow-hidden shadow-sm">
          <div v-if="pendingUsers" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
          <div v-else-if="!users || users.length === 0" class="text-center py-4">
            <p class="text-secondary mb-0 small">Belum ada akun petugas.</p>
          </div>
          
          <div v-else>
            <div v-for="(user, index) in users" :key="user.id" class="p-3 d-flex justify-content-between align-items-center" :class="{ 'border-bottom border-secondary border-opacity-25': index !== users.length - 1 }">
              <div>
                <span class="fw-bold d-block text-white" style="font-size: 0.85rem;">{{ user.name }}</span>
                <span class="text-secondary d-block font-monospace" style="font-size: 0.7rem;">{{ user.email }}</span>
                <div class="mt-1">
                  <span class="badge" :class="user.role === 'SUPER_ADMIN' ? 'bg-primary text-dark' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'" style="font-size: 0.65rem;">
                    {{ user.role }}
                  </span>
                </div>
              </div>
              
              <!-- Tombol Aksi (Reset Sandi & Hapus) -->
              <div v-if="user.id !== authUser?.id" class="d-flex gap-2">
                <button @click="resetPassword(user.id)" class="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold" style="font-size: 0.7rem;">
                  Reset Sandi
                </button>
                <button @click="deleteUser(user.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" style="font-size: 0.7rem;">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('form')

// 1. CEK OTORISASI USER SAAT INI
const { data: authUser } = await useFetch('/api/auth/me', { server: false })
const isSuperAdmin = computed(() => authUser.value?.user?.role === 'SUPER_ADMIN')

// 2. LOGIKA PENGATURAN FORM DINAMIS (Tidak diubah, hanya styling yang diganti)
const { data: fields, refresh: refreshFields } = await useFetch('/api/fields', { server: false })
const isLoadingField = ref(false)
const form = ref({
  label: '',
  type: 'text',
  isRequired: false
})

const saveField = async () => {
  isLoadingField.value = true
  try {
    const generatedKey = form.value.label.toLowerCase().replace(/[^a-z0-9]/g, '_')
    await $fetch('/api/fields', {
      method: 'POST',
      body: { ...form.value, fieldKey: generatedKey }
    })
    form.value = { label: '', type: 'text', isRequired: false }
    await refreshFields()
  } catch (error) {
    alert(error.data?.statusMessage || 'Terjadi kesalahan saat menyimpan kolom.')
  } finally {
    isLoadingField.value = false
  }
}

const deleteField = async (id) => {
  if (!confirm('Hapus kolom ini? (Data member lama tidak akan hilang)')) return
  try {
    await $fetch(`/api/fields/${id}`, { method: 'DELETE' })
    await refreshFields()
  } catch (error) {
    alert('Gagal menghapus kolom.')
  }
}

// 3. LOGIKA MANAJEMEN PETUGAS
const { data: users, pending: pendingUsers, refresh: refreshUsers } = await useFetch('/api/users', { 
  server: false,
  // Hanya ambil data user jika dia adalah super admin
  immediate: isSuperAdmin.value 
})

const isLoadingUser = ref(false)
const userForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'PETUGAS' // Default selalu petugas
})

const saveUser = async () => {
  isLoadingUser.value = true
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: userForm.value
    })
    userForm.value = { name: '', email: '', password: '', role: 'PETUGAS' }
    await refreshUsers()
    alert('Akun petugas berhasil dibuat.')
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal membuat akun petugas.')
  } finally {
    isLoadingUser.value = false
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

const deleteUser = async (id) => {
  if (!confirm('Anda yakin ingin menghapus akun petugas ini?')) return
  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    await refreshUsers()
  } catch (error) {
    alert('Gagal menghapus akun.')
  }
}
</script>

<style scoped>
/* Hapus container padding berlebih jika menggunakan dark theme fullscreen */
</style>