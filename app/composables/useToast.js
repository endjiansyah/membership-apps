export const useToast = () => {
  // Membuat state global yang bisa dibaca semua halaman
  const toastState = useState('global-toast', () => ({
    show: false,
    message: '',
    type: 'success' // bisa 'success', 'error', atau 'warning'
  }))

  const showToast = (message, type = 'success') => {
    toastState.value = { show: true, message, type }
    
    // Otomatis hilang setelah 3 detik
    setTimeout(() => {
      toastState.value.show = false
    }, 3000)
  }

  return { toastState, showToast }
}