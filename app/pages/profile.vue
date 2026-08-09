<template>
  <div class="container-fluid px-1 px-md-3 py-2 py-md-3 pb-5 mb-5" style="max-width: 600px;">

    <!-- LOADING STATE -->
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- KONTEN PROFIL -->
    <div v-else-if="user" class="px-2">
      <!-- PERBAIKAN: Padding card dikurangi jadi p-3 -->
      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm mb-3">
        <div class="card-body p-3">
          
          <!-- Info Singkat -->
          <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
            <div class="d-inline-flex justify-content-center align-items-center bg-secondary bg-opacity-25 text-white fw-bold fs-3 rounded-circle" style="width: 50px; height: 50px;">
              {{ user.name.substring(0, 1).toUpperCase() }}
            </div>
            <div>
              <h6 class="fw-bold text-white mb-0" style="font-size: 1rem;">{{ user.name }}</h6>
              <span class="badge mt-1" style="font-size: 0.65rem;" :class="user.role === 'SUPER_ADMIN' ? 'bg-primary text-dark' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'">
                {{ user.role }}
              </span>
            </div>
          </div>

          <!-- Form Edit -->
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.75rem;">Nama Lengkap</label>
              <input type="text" v-model="form.name" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" required>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.75rem;">Email Login</label>
              <input type="email" :value="user.email" class="form-control form-control-sm bg-black text-secondary border-secondary border-opacity-25 rounded-3 py-2" disabled>
              <small class="text-secondary d-block mt-1" style="font-size: 0.65rem;">Email tidak dapat diubah.</small>
            </div>

            <!-- Bagian Ubah Password -->
            <div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
              <h6 class="fw-bold text-white mb-3" style="font-size: 0.85rem;">Ubah Password (Opsional)</h6>
              
              <div class="mb-3">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.75rem;">Password Lama</label>
                <input type="password" v-model="form.oldPassword" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" placeholder="Masukkan jika ingin ubah sandi">
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.75rem;">Password Baru</label>
                <input type="password" v-model="form.newPassword" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" placeholder="Password baru">
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.75rem;">Konfirmasi Password Baru</label>
                <input type="password" v-model="form.confirmPassword" class="form-control form-control-sm bg-black text-white border-secondary border-opacity-25 rounded-3 py-2" placeholder="Ketik ulang password baru">
              </div>
            </div>

            <!-- PERBAIKAN: Tombol py-2 dan font 0.85rem -->
            <button type="submit" class="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm text-dark" style="font-size: 0.85rem;" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </form>
          
        </div>
      </div>
      
      <!-- PERBAIKAN: Tombol py-2 dan font 0.85rem -->
      <button @click="handleLogout" class="btn btn-outline-danger w-100 fw-bold rounded-pill py-2 border-danger border-opacity-50" style="font-size: 0.85rem;">
        Keluar dari Sistem
      </button>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const { data: authData, pending, refresh } = await useFetch('/api/auth/me', { server: false })
const user = computed(() => authData.value?.user)

const isSaving = ref(false)

const form = ref({
  name: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

watch(user, (newVal) => {
  if (newVal) {
    form.value.name = newVal.name
  }
}, { immediate: true })

const updateProfile = async () => {
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
    sessionCookie.value = null
    navigateTo('/login')
  } catch (err) {
    alert('Gagal logout.')
  }
}
</script>