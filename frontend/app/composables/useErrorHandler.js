// Composable สำหรับจัดการ Error แบบรวมศูนย์
import { useSnackbar } from './useSnackbar'

export const useErrorHandler = () => {
  const { showError } = useSnackbar()

  // จัดการ error จาก API
  const handleApiError = (error, customMessage = null) => {
    console.error('API Error:', error)

    const message = customMessage ||
                    error?.message ||
                    error?.data?.message ||
                    'เกิดข้อผิดพลาดในการเชื่อมต่อ'

    showError(message)
  }

  // จัดการ error แบบทั่วไป
  const handleError = (error, customMessage = null) => {
    console.error('Error:', error)

    const message = customMessage ||
                    (error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')

    showError(message)
  }

  // จัดการ validation error
  const handleValidationError = (errors) => {
    if (Array.isArray(errors)) {
      errors.forEach(err => showError(err))
    } else if (typeof errors === 'object') {
      Object.values(errors).forEach(err => showError(err))
    } else {
      showError(errors || 'ข้อมูลไม่ถูกต้อง')
    }
  }

  // Wrapper สำหรับ async function พร้อมจัดการ error
  const withErrorHandling = async (fn, errorMessage = null) => {
    try {
      return await fn()
    } catch (error) {
      handleApiError(error, errorMessage)
      throw error // ส่งต่อ error เพื่อให้ caller จัดการเพิ่มเติมได้
    }
  }

  return {
    handleApiError,
    handleError,
    handleValidationError,
    withErrorHandling
  }
}
