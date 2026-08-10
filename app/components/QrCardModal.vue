<template>
  <!-- Modal hanya muncul jika ada data member yang dikirim (props.member tidak null) -->
  <div v-if="member" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center px-3" style="z-index: 1060; backdrop-filter: blur(4px);" @click.self="closeModal">
    <div class="card bg-dark border border-secondary border-opacity-50 rounded-4 p-3 text-center shadow-lg w-100" style="max-width: 320px;">
      
      <h6 class="fw-bold text-white mb-3" style="font-size: 1rem;">{{ member.name }}</h6>
      
      <div class="bg-white p-2 rounded-4 mb-3 d-inline-block mx-auto shadow-sm">
        <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code Member" class="rounded-3" style="width: 180px; height: 180px; display: block;" />
        <div v-else class="spinner-border text-primary my-4" role="status"></div>
      </div>

      <p class="small mb-3 font-monospace text-secondary bg-black p-2 rounded-3" style="font-size: 0.7rem; word-break: break-all;">
        ID: {{ member.uuid }}
      </p>

      <button v-if="qrImageUrl" @click="downloadCard" class="btn btn-primary w-100 rounded-pill fw-bold mb-2 shadow py-2 text-dark" style="font-size: 0.8rem;" :disabled="isDownloading">
        {{ isDownloading ? 'Memproses...' : 'Download Kartu' }}
      </button>
      
      <button class="btn btn-outline-secondary w-100 rounded-pill fw-bold py-2 mt-1 text-white" style="font-size: 0.8rem;" @click="closeModal">
        Tutup
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

// Menerima data member dari halaman utama
const props = defineProps({
  member: Object
})

// Mengirim sinyal ke halaman utama saat tombol tutup diklik
const emit = defineEmits(['close'])

const qrImageUrl = ref('')
const isDownloading = ref(false)

// Pantau perubahan: Setiap kali modal dibuka dengan data member baru, otomatis buatkan QR
watch(() => props.member, async (newMember) => {
  if (newMember && newMember.uuid) {
    qrImageUrl.value = ''
    try {
      qrImageUrl.value = await QRCode.toDataURL(newMember.uuid, { width: 500, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
    } catch (err) {
      console.error('Gagal membuat QR:', err)
    }
  }
}, { immediate: true })

const closeModal = () => {
  emit('close') // Beri tahu parent untuk mengosongkan data member terpilih
}

const downloadCard = async () => {
  if (!props.member || !qrImageUrl.value) return
  isDownloading.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1050
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 56px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.member.name, canvas.width / 2, 120)
    ctx.fillStyle = '#64748b'
    ctx.font = '26px sans-serif'
    ctx.fillText('Tunjukkan QR Code ini untuk scan Membership', canvas.width / 2, 180)

    await new Promise((resolve, reject) => {
      const qrImage = new Image()
      qrImage.crossOrigin = 'anonymous'
      qrImage.onload = () => { ctx.drawImage(qrImage, 90, 240, 620, 620); resolve() }
      qrImage.onerror = reject
      qrImage.src = qrImageUrl.value
    })

    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(90, 900)
    ctx.lineTo(710, 900)
    ctx.stroke()
    ctx.fillStyle = '#475569'
    ctx.font = '22px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`ID: ${props.member.uuid}`, canvas.width / 2, 960)

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `Member_Card_${props.member.name.replace(/\s+/g, '_')}.png`
    link.click()
  } catch (error) {
    alert('Terjadi kesalahan saat mengunduh kartu.')
  } finally {
    isDownloading.value = false
  }
}
</script>