<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center bg-primary">
            <h2 class="text-white">เข้าสู่ระบบ</h2>
          </v-card-title>

          <v-card-text class="pt-6">
            <!-- ฟอร์ม Login -->
            <v-form @submit.prevent="handleLogin">
              <!-- ช่องกรอก Email -->
              <v-text-field
                v-model="email"
                label="อีเมล"
                type="email"
                prepend-icon="mdi-email"
                required
                variant="outlined"
              ></v-text-field>

              <!-- ช่องกรอกรหัสผ่าน -->
              <v-text-field
                v-model="password"
                label="รหัสผ่าน"
                type="password"
                prepend-icon="mdi-lock"
                required
                variant="outlined"
              ></v-text-field>

              <!-- แสดง Error Message -->
              <v-alert
                v-if="errorMessage"
                type="error"
                class="mb-4"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- แสดง Success Message -->
              <v-alert
                v-if="successMessage"
                type="success"
                class="mb-4"
              >
                {{ successMessage }}
              </v-alert>

              <!-- ปุ่ม Login -->
              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
              >
                เข้าสู่ระบบ
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center pb-4">
            <span class="mr-2">ยังไม่มีบัญชี?</span>
            <nuxt-link to="/register" class="text-primary text-decoration-none">
              ลงทะเบียน
            </nuxt-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// กำหนด layout
definePageMeta({
  layout: false // ไม่ใช้ layout หลัก เพราะเป็นหน้า login
})

// ตัวแปรสำหรับฟอร์ม
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ใช้ auth store และ router
const authStore = useAuthStore()
const router = useRouter()

// ฟังก์ชันสำหรับ Login
const handleLogin = async () => {
  // ล้าง message เดิม
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    // เรียกฟังก์ชัน login จาก store
    const result = await authStore.login(email.value, password.value)

    // ตรวจสอบว่ามี result และ success หรือไม่
    if (result && result.success) {
      // แสดงข้อความสำเร็จ
      successMessage.value = result.message || 'เข้าสู่ระบบสำเร็จ'

      // ดึง role ของผู้ใช้
      const role = authStore.getUserRole

      // รอ 500ms แล้ว redirect ตาม role
      setTimeout(() => {
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else if (role === 'evaluator') {
          router.push('/evaluator/dashboard')
        } else if (role === 'employee') {
          router.push('/employee/dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 500)
    } else {
      // แสดงข้อความ error
      errorMessage.value = result?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน'
    }
  } catch (error) {
    // แสดง error ที่เกิดขึ้น
    console.error('Login error:', error)

    // ตรวจสอบประเภท error
    if (error.message) {
      errorMessage.value = error.message
    } else if (error.error) {
      errorMessage.value = error.error
    } else if (typeof error === 'string') {
      errorMessage.value = error
    } else {
      errorMessage.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
