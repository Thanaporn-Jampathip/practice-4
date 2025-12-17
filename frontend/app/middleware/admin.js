// Middleware สำหรับตรวจสอบว่าเป็น Admin หรือไม่
// ใช้กับหน้าที่ต้องการสิทธิ์ Admin เท่านั้น

export default defineNuxtRouteMiddleware((to, from) => {
  // ใช้ auth store
  const authStore = useAuthStore()

  // ตรวจสอบว่า login แล้วหรือยัง
  if (!authStore.isLoggedIn) {
    // ถ้ายังไม่ login ให้ไปหน้า login
    return navigateTo('/login')
  }

  // ตรวจสอบว่าเป็น admin หรือไม่
  if (!authStore.isAdmin) {
    // ถ้าไม่ใช่ admin ให้แสดง error และกลับไป dashboard
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
    return navigateTo('/dashboard')
  }
})
