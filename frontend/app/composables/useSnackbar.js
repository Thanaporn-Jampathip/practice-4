// Composable สำหรับจัดการ Snackbar (แจ้งเตือน)
import { ref } from 'vue'

export const useSnackbar = () => {
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  })

  const showSuccess = (message) => {
    snackbar.value = {
      show: true,
      message,
      color: 'success'
    }
  }

  const showError = (message) => {
    snackbar.value = {
      show: true,
      message,
      color: 'error'
    }
  }

  const showInfo = (message) => {
    snackbar.value = {
      show: true,
      message,
      color: 'info'
    }
  }

  const showWarning = (message) => {
    snackbar.value = {
      show: true,
      message,
      color: 'warning'
    }
  }

  const hide = () => {
    snackbar.value.show = false
  }

  return {
    snackbar,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hide
  }
}
