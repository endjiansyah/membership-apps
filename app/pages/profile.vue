<template>
  <div class="container-fluid px-0 py-3 pb-5 mb-5" style="max-width: 600px;">


    <!-- LOADING STATE -->
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- KONTEN PROFIL -->
    <div v-else-if="user" class="px-3">
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-4">
        <div class="card-body p-4">
          
          <!-- Info Singkat -->
          <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
            <div class="d-inline-flex justify-content-center align-items-center bg-secondary bg-opacity-25 text-white fw-bold fs-3 rounded-circle" style="width: 60px; height: 60px;">
              {{ user.name.substring(0, 1).toUpperCase() }}
            </div>
            <div>
              <h5 class="fw-bold text-white mb-0">{{ user.name }}</h5>
              <span class="badge mt-1" :class="user.role === 'SUPER_ADMIN' ? 'bg-primary text-dark' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'">
                {{ user.role }}
              </span>
            </div>
          </div>

          <!-- Form Edit -->
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary small">Nama Lengkap</label>
              <input type="text" v-model="form.name" class="form-control bg-black text-white border-secondary border-opacity-25 rounded-3" required>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-secondary small">Email Login</label>
              <!-- Sengaja di-disabled agar tidak bisa ubah email sembarangan -->
              <input type="email" :value="user.email" class="form-control bg-black text-secondary border-secondary border-opacity-25 rounded-3" disabled>
              <small class="text-secondary d-block mt-1" style="font-size: 0.65rem;">Email tidak dapat diubah.</small>
            </div>

            <!-- Bagian Ubah Password -->
            <div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
              <h6 class="fw-bold text-white mb-3" style="font-size: 0.85rem;">Ubah Password (Opsional)</h6>
              
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary small">Password Lama</label>
                <input type="password" v-model="form.oldPassword" class="form-control bg-black text-white border-secondary border-opacity-25 rounded-3" placeholder="Masukkan jika ingin ubah sandi">
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold text-secondary small">Password Baru</label>
                <input type="password" v-model="form.newPassword" class="form-control bg-black text-white border-secondary border-opacity-25 rounded-3" placeholder="Password baru">
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold text-secondary small">Konfirmasi Password Baru</label>
                <input type="password" v-model="form.confirmPassword" class="form-control bg-black text-white border-secondary border-opacity-25 rounded-3" placeholder="Ketik ulang password baru">
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 fw-bold rounded-pill py-3 shadow-sm" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </form>
          
        </div>
      </div>
      
      <!-- Tombol Logout -->
      <button @click="handleLogout" class="btn btn-outline-danger w-100 fw-bold rounded-pill py-2 border-danger border-opacity-50">
        Logout
      </button>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Ingat: kita menggunakan authData.value?.user untuk mengambil data dari /api/auth/me
const { data: authData, pending, refresh } = await useFetch('/api/auth/me', { server: false })
const user = computed(() => authData.value?.user)

const isSaving = ref(false)

const form = ref({
  name: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Isi otomatis nama di form saat data user berhasil dimuat
watch(user, (newVal) => {
  if (newVal) {
    form.value.name = newVal.name
  }
}, { immediate: true })

const updateProfile = async () => {
  // Validasi lokal jika ada niat ubah password
  if (form.value.newPassword) {
    if (!form.value.oldPassword) return alert('Password lama wajib diisi!')
    if (form.value.newPassword !== form.value.confirmPassword) return alert('Konfirmasi password tidak cocok!')
    if (form.value.newPassword.length < 6) return alert('Password baru minimal 6 karakter.')
  }

  isSaving.value = true
  try {
    await $fetch('/api/users/profile', {
      method: 'PUT',
      body: {
        userId: user.value.id,
        name: form.value.name,
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword
      }
    })
    
    alert('Profil berhasil diperbarui!')
    
    // Bersihkan kolom password agar aman
    form.value.oldPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'Gagal memperbarui profil.')
  } finally {
    isSaving.value = false
  }
}

const handleLogout = async () => {
  if (!confirm('Anda yakin ingin keluar?')) return
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    const sessionCookie = useCookie('user_session')
    sessionCookie.value = null // Hapus cookie
    navigateTo('/login')
  } catch (err) {
    alert('Gagal logout.')
  }
}
</script>