<template>
  <div></div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// โหลดข้อมูลจาก storage
const authStore = useAuthStore()

// โหลดข้อมูลจาก storage และ redirect
onMounted(async () => {
  await authStore.loadFromStorage()

  // ตรวจสอบว่า login แล้วหรือยัง และ redirect ตาม role
  if (authStore.isLoggedIn) {
    const role = authStore.getUserRole

    // Redirect ตาม role
    if (role === 'admin') { 
      navigateTo('/admin/dashboard')
    } else if (role === 'evaluator') {
      navigateTo('/evaluator/dashboard')
    } else if (role === 'employee') {
      navigateTo('/employee/dashboard')
    } else {
      navigateTo('/login')
    }
  } else {
    // ถ้ายังไม่ได้ login ไปหน้า login
    navigateTo('/login')
  }
})
</script>
