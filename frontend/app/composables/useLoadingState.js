// Composable สำหรับจัดการ Loading State
import { ref } from 'vue'

export const useLoadingState = () => {
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const submitting = ref(false)

  const setLoading = (value) => {
    loading.value = value
  }

  const setSaving = (value) => {
    saving.value = value
  }

  const setDeleting = (value) => {
    deleting.value = value
  }

  const setSubmitting = (value) => {
    submitting.value = value
  }

  // สำหรับทำงานแบบ async พร้อม loading
  const withLoading = async (fn) => {
    loading.value = true
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }

  const withSaving = async (fn) => {
    saving.value = true
    try {
      return await fn()
    } finally {
      saving.value = false
    }
  }

  const withDeleting = async (fn) => {
    deleting.value = true
    try {
      return await fn()
    } finally {
      deleting.value = false
    }
  }

  const withSubmitting = async (fn) => {
    submitting.value = true
    try {
      return await fn()
    } finally {
      submitting.value = false
    }
  }

  return {
    loading,
    saving,
    deleting,
    submitting,
    setLoading,
    setSaving,
    setDeleting,
    setSubmitting,
    withLoading,
    withSaving,
    withDeleting,
    withSubmitting
  }
}
