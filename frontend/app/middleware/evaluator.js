// Middleware สำหรับตรวจสอบว่าเป็น Evaluator หรือไม่
// ใช้กับหน้าที่ต้องการสิทธิ์ Evaluator (รวมถึง Admin ด้วย)

export default defineNuxtRouteMiddleware((to, from) => {
  // ใช้ auth store
  const authStore = useAuthStore()

  // ตรวจสอบว่า login แล้วหรือยัง
  if (!authStore.isLoggedIn) {
    // ถ้ายังไม่ login ให้ไปหน้า login
    return navigateTo('/login')
  }

  // ตรวจสอบว่าเป็น evaluator หรือ admin หรือไม่
  if (!authStore.isEvaluator) {
    // ถ้าไม่ใช่ evaluator ให้แสดง error และกลับไป dashboard
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
    return navigateTo('/dashboard')
  }
})
