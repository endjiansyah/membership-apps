<template>
  <Transition name="toast">
    <div v-if="toastState.show" class="position-fixed top-0 start-50 translate-middle-x mt-4" style="z-index: 9999;">
      <div class="badge px-4 py-3 fs-6 shadow-lg border d-flex align-items-center gap-2" :class="themeClass">
        <Icon v-if="toastState.type === 'success'" name="bi:check-circle-fill" />
        <Icon v-else-if="toastState.type === 'error'" name="bi:x-circle-fill" />
        <Icon v-else name="bi:exclamation-triangle-fill" />
        {{ toastState.message }}
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

// Mengambil state dari composable yang kita buat di Langkah 1
const { toastState } = useToast()

const themeClass = computed(() => {
  if (toastState.value.type === 'success') return 'bg-success text-white border-success'
  if (toastState.value.type === 'error') return 'bg-danger text-white border-danger'
  return 'bg-warning text-dark border-warning'
})
</script>

<style scoped>
/* Animasi meluncur dari atas */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>