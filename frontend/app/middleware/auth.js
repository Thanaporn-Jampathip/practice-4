// Middleware สำหรับตรวจสอบการ login
export default defineNuxtRouteMiddleware((to, from) => {
  // ตรวจสอบว่าทำงานฝั่ง client หรือไม่
  if (process.client) {
    // ดึง token จาก localStorage
    const token = localStorage.getItem('token')

    // ถ้าไม่มี token (ยังไม่ได้ login)
    if (!token) {
      // ส่งไปหน้า login
      return navigateTo('/login')
    }
  }
})
