// Composable สำหรับจัดการ Dialog
import { ref } from 'vue'

export const useDialog = () => {
  const dialog = ref(false)
  const deleteDialog = ref(false)
  const confirmDialog = ref(false)

  const open = () => {
    dialog.value = true
  }

  const close = () => {
    dialog.value = false
  }

  const openDelete = () => {
    deleteDialog.value = true
  }

  const closeDelete = () => {
    deleteDialog.value = false
  }

  const openConfirm = () => {
    confirmDialog.value = true
  }

  const closeConfirm = () => {
    confirmDialog.value = false
  }

  const toggle = () => {
    dialog.value = !dialog.value
  }

  return {
    dialog,
    deleteDialog,
    confirmDialog,
    open,
    close,
    openDelete,
    closeDelete,
    openConfirm,
    closeConfirm,
    toggle
  }
}
