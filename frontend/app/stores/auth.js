// Store สำหรับจัดการ Authentication
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  // ตัวแปรสถานะ
  state: () => ({
    user: null,        // ข้อมูลผู้ใช้ (id, email, name, role, departmentId, position, phoneNumber)
    token: null,       // Token สำหรับ authentication
    isLoggedIn: false  // สถานะการ login
  }),

  // Getters - ฟังก์ชันสำหรับดึงข้อมูล
  getters: {
    // ดึงชื่อผู้ใช้
    getUserName: (state) => {
      return state.user?.name || 'Guest'
    },

    // ดึง email ผู้ใช้
    getUserEmail: (state) => {
      return state.user?.email || ''
    },

    // ดึง role ผู้ใช้
    getUserRole: (state) => {
      return state.user?.role || ''
    },

    // ดึง ID ผู้ใช้
    getUserId: (state) => {
      return state.user?.id || null
    },

    // ดึงแผนก
    getDepartmentId: (state) => {
      return state.user?.departmentId || null
    },

    // ดึงตำแหน่ง
    getPosition: (state) => {
      return state.user?.position || ''
    },

    // ตรวจสอบว่า login หรือยัง
    isAuthenticated: (state) => {
      return state.isLoggedIn
    },

    // ตรวจสอบว่าเป็น Admin หรือไม่
    isAdmin: (state) => {
      return state.user?.role === 'admin'
    },

    // ตรวจสอบว่าเป็น Evaluator หรือไม่
    isEvaluator: (state) => {
      return state.user?.role === 'evaluator' || state.user?.role === 'admin'
    },
 
    // ตรวจสอบว่าเป็น Employee หรือไม่
    isEmployee: (state) => {
      return state.user?.role === 'employee'
    }
  },

  // Actions - ฟังก์ชันสำหรับทำงาน
  actions: {
    // ฟังก์ชัน Login
    async login(email, password) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const api = useApi()

        // เรียก API login
        const response = await api.login(email, password)

        // ตรวจสอบว่า response มี success หรือไม่
        if (response.success &&  response.data) {
          // ดึงข้อมูลจาก response.data
          const { token, user } = response.data

          // บันทึก token
          this.token = token
          this.isLoggedIn = true

          // บันทึกข้อมูลผู้ใช้
          this.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            departmentId: user.departmentId,
            position: user.position,
            phoneNumber: user.phoneNumber
          }

          // บันทึกลง localStorage
          if (process.client) {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(this.user))
          }

          // ตั้งค่า token ใน API
          api.setAuthToken(token)

          return { success: true, message: response.message || 'เข้าสู่ระบบสำเร็จ' }
        } else {
          // กรณี login ไม่สำเร็จ
          return { success: false, message: response.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
        }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: error.message || 'เข้าสู่ระบบไม่สำเร็จ' }
      }
    },

    // ฟังก์ชัน Register
    async register(userData) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const api = useApi()

        // เรียก API register
        const response = await api.register(userData)

        if (response.success) {
          return { success: true, message: 'ลงทะเบียนสำเร็จ' }
        }
      } catch (error) {
        console.error('Register error:', error)
        return { success: false, message: error.message || 'ลงทะเบียนไม่สำเร็จ' }
      }
    },

    
    async logout() {
      // ลบข้อมูล
      this.user = null
      this.token = null
      this.isLoggedIn = false

      // ลบจาก localStorage
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }

      // ลบ token จาก API
      const { useApi } = await import('~/composables/useApi')
      const api = useApi()
      api.setAuthToken(null)
    },

    // ฟังก์ชันโหลดข้อมูลจาก localStorage
    async loadFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
          this.isLoggedIn = true

          // ตั้งค่า token ใน API
          const { useApi } = await import('~/composables/useApi')
          const api = useApi()
          api.setAuthToken(token)
        }
      }
    },

    // ฟังก์ชันอัปเดตข้อมูลผู้ใช้
    updateUserData(userData) {
      this.user = { ...this.user, ...userData }

      // อัปเดต localStorage
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    }
  }
})
