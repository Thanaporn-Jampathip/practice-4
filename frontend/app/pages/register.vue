<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5">
        <v-card class="elevation-12">
          <v-card-title class="text-center bg-primary">
            <h2 class="text-white">ลงทะเบียน</h2>
          </v-card-title>

          <v-card-text class="pt-6">
            <!-- ฟอร์ม Register -->
            <v-form @submit.prevent="handleRegister">
              <!-- ช่องกรอกชื่อ -->
              <v-text-field
                v-model="name"
                label="ชื่อ-นามสกุล"
                prepend-icon="mdi-account"
                required
                variant="outlined"
              ></v-text-field>

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

              <!-- ช่องยืนยันรหัสผ่าน -->
              <v-text-field
                v-model="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                type="password"
                prepend-icon="mdi-lock-check"
                required
                variant="outlined"
              ></v-text-field>

              <!-- เลือก Role -->
              <v-select
                v-model="role"
                :items="roles"
                label="บทบาท"
                prepend-icon="mdi-account-badge"
                required
                variant="outlined"
              ></v-select>

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

              <!-- ปุ่ม Register -->
              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
              >
                ลงทะเบียน
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center pb-4">
            <span class="mr-2">มีบัญชีแล้ว?</span>
            <nuxt-link to="/login" class="text-primary text-decoration-none">
              เข้าสู่ระบบ
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
  layout: false // ไม่ใช้ layout หลัก เพราะเป็นหน้า register
})

// ตัวแปรสำหรับฟอร์ม
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('employee')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ตัวเลือก Role
const roles = [
  { title: 'ผู้รับการประเมิน', value: 'employee' },
  { title: 'กรรมการผู้ประเมิน', value: 'evaluator' },
  { title: 'บุคลากร', value: 'admin' }
]

// ใช้ auth store และ router
const authStore = useAuthStore()
const router = useRouter()

// ฟังก์ชันสำหรับ Register
const handleRegister = async () => {
  // ล้าง message เดิม
  errorMessage.value = ''
  successMessage.value = ''

  // ตรวจสอบรหัสผ่าน
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  // ตรวจสอบความยาวรหัสผ่าน
  if (password.value.length < 6) {
    errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  loading.value = true

  try {
    // สร้างข้อมูลผู้ใช้
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    }

    // เรียกฟังก์ชัน register จาก store
    const result = await authStore.register(userData)

    if (result.success) {
      // แสดงข้อความสำเร็จ
      successMessage.value = result.message

      // รอ 2 วินาที แล้วไปหน้า login
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      // แสดงข้อความ error
      errorMessage.value = result.message
    }
  } catch (error) {
    // แสดง error ที่เกิดขึ้น
    errorMessage.value = 'เกิดข้อผิดพลาดในการลงทะเบียน'
    console.error('Register error:', error)
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
