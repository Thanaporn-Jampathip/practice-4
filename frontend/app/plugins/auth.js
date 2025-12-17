// Plugin สำหรับโหลด token และ user จาก localStorage เมื่อเริ่มต้นแอพ
export default defineNuxtPlugin(async (nuxtApp) => {
  // ตรวจสอบว่าอยู่ฝั่ง client หรือไม่
  if (process.client) {
    const authStore = useAuthStore()

    // โหลดข้อมูลจาก localStorage
    await authStore.loadFromStorage()
  }
})
