<template>
  <div class="container-fluid px-1 px-md-3 py-2 py-md-3 pb-5 mb-5" style="max-width: 800px;">
    
    <div class="d-flex justify-content-between align-items-center mb-3 px-2">
      <h4 class="mb-0 fw-bold text-white">System Settings</h4>
    </div>

    <!-- TABS -->
    <div class="d-flex gap-2 mb-3 px-2 overflow-auto" style="scrollbar-width: none;">
      <button @click="activeTab = 'fields'" class="btn rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'fields' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'">
        Dynamic Fields
      </button>
      <button v-if="authUser?.role === 'SUPER_ADMIN'" @click="activeTab = 'users'" class="btn rounded-pill fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;" :class="activeTab === 'users' ? 'btn-primary text-dark px-3' : 'btn-dark border border-secondary border-opacity-25 text-secondary px-3'">
        Kelola Petugas
      </button>
    </div>

    <!-- TAB: DYNAMIC FIELDS -->
    <div v-if="activeTab === 'fields'" class="px-2">
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
              <button type="submit" class="btn btn-primary rounded-pill py-2 px-4 fw-bold text-dark" style="font-size: 0.8rem;">
                {{ isEditingField ? 'Simpan Perubahan' : '+ Tambah Kolom' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm">
        <div class="table-responsive">
          <table class="table table-dark table-borderless mb-0 align-middle">
            <thead class="border-bottom border-secondary border-opacity-25">
              <tr>
                <th class="text-secondary fw-bold py-3 px-3" style="font-size: 0.75rem;">LABEL / KEY</th>
                <th class="text-secondary fw-bold py-3 px-3" style="font-size: 0.75rem;">TIPE</th>
                <th class="text-secondary fw-bold py-3 px-3 text-end" style="font-size: 0.75rem;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="fieldsPending">
                <td colspan="3" class="text-center py-4 text-secondary small">Memuat data...</td>
              </tr>
              <tr v-else-if="!fields || fields.length === 0">
                <td colspan="3" class="text-center py-4 text-secondary small">Belum ada kolom tambahan.</td>
              </tr>
              <tr v-for="field in fields" :key="field.id" class="border-bottom border-secondary border-opacity-10">
                <td class="py-2 px-3">
                  <div class="fw-bold text-white" style="font-size: 0.85rem;">
                    {{ field.label }} 
                    <span v-if="field.isRequired" class="text-danger">*</span>
                  </div>
                  <div class="text-secondary font-monospace" style="font-size: 0.65rem;">{{ field.fieldKey }}</div>
                </td>
                <td class="py-2 px-3">
                  <span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25" style="font-size: 0.65rem;">{{ field.type.toUpperCase() }}</span>
                </td>
                <td class="py-2 px-3 text-end">
                  <button @click="editField(field)" class="btn btn-sm btn-outline-info rounded-pill px-3 fw-bold me-1 mb-1 mb-md-0" style="font-size: 0.7rem;">Edit</button>
                  <button @click="deleteField(field.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" style="font-size: 0.7rem;">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: USERS / PETUGAS (Hanya Super Admin) -->
    <div v-if="activeTab === 'users' && authUser?.role === 'SUPER_ADMIN'" class="px-2">
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

      <div class="card bg-dark border border-secondary border-opacity-25 rounded-4 shadow-sm">
        <div class="table-responsive">
          <table class="table table-dark table-borderless mb-0 align-middle">
            <thead class="border-bottom border-secondary border-opacity-25">
              <tr>
                <th class="text-secondary fw-bold py-3 px-3" style="font-size: 0.75rem;">PENGGUNA</th>
                <th class="text-secondary fw-bold py-3 px-3" style="font-size: 0.75rem;">ROLE</th>
                <th class="text-secondary fw-bold py-3 px-3 text-end" style="font-size: 0.75rem;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usersPending">
                <td colspan="3" class="text-center py-4 text-secondary small">Memuat data...</td>
              </tr>
              <tr v-for="user in users" :key="user.id" class="border-bottom border-secondary border-opacity-10">
                <td class="py-2 px-3">
                  <div class="fw-bold text-white" style="font-size: 0.85rem;">{{ user.name }}</div>
                  <div class="text-secondary" style="font-size: 0.65rem;">{{ user.email }}</div>
                </td>
                <td class="py-2 px-3">
                  <span class="badge" style="font-size: 0.65rem;" :class="user.role === 'SUPER_ADMIN' ? 'bg-primary text-dark' : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-2 px-3 text-end">
                  <div v-if="user.id !== authUser?.id" class="d-flex justify-content-end gap-1 flex-wrap">
                    <button @click="resetPassword(user.id)" class="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold" style="font-size: 0.7rem;">
                      Reset Sandi
                    </button>
                    <button @click="deleteUser(user.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" style="font-size: 0.7rem;">
                      Hapus
                    </button>
                  </div>
                  <span v-else class="badge bg-secondary text-white" style="font-size: 0.65rem;">Anda Sendiri</span>
                </td>
              </tr>
            </tbody>
          </table>
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