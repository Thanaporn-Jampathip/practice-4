<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-account</v-icon>
        ข้อมูลส่วนตัว
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ฟอร์มข้อมูลส่วนตัว -->
    <v-card v-if="!loading">
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <!-- ชื่อ-นามสกุล -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="ชื่อ-นามสกุล *"
                :rules="[v => !!v || 'กรุณากรอกชื่อ-นามสกุล']"
                required
              ></v-text-field>
            </v-col>

            <!-- อีเมล (แสดงอย่างเดียว ไม่ให้แก้ไข) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
                label="อีเมล"
                readonly
                disabled
              ></v-text-field>
            </v-col>

            <!-- แผนก -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.departmentId"
                :items="departments"
                item-title="name"
                item-value="id"
                label="แผนก *"
                :rules="[v => !!v || 'กรุณาเลือกแผนก']"
                required
              ></v-select>
            </v-col>

            <!-- ตำแหน่ง -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.position"
                label="ตำแหน่ง *"
                :rules="[v => !!v || 'กรุณากรอกตำแหน่ง']"
                required
              ></v-text-field>
            </v-col>

            <!-- เบอร์โทรศัพท์ -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.phoneNumber"
                label="เบอร์โทรศัพท์"
                type="tel"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- ปุ่มบันทึก -->
          <v-row>
            <v-col cols="12" class="text-right">
              <v-btn
                color="primary"
                @click="saveProfile"
                :loading="saving"
                :disabled="!valid"
              >
                <v-icon left>mdi-content-save</v-icon>
                บันทึกข้อมูล
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- การเปลี่ยนรหัสผ่าน -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-title>เปลี่ยนรหัสผ่าน</v-card-title>
      <v-card-text>
        <v-form ref="passwordForm" v-model="passwordValid">
          <v-row>
            <!-- รหัสผ่านปัจจุบัน -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="passwordData.currentPassword"
                label="รหัสผ่านปัจจุบัน *"
                type="password"
                :rules="[v => !!v || 'กรุณากรอกรหัสผ่านปัจจุบัน']"
                required
              ></v-text-field>
            </v-col>

            <!-- รหัสผ่านใหม่ -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="passwordData.newPassword"
                label="รหัสผ่านใหม่ *"
                type="password"
                :rules="[
                  v => !!v || 'กรุณากรอกรหัสผ่านใหม่',
                  v => v.length >= 6 || 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
                ]"
                required
              ></v-text-field>
            </v-col>

            <!-- ยืนยันรหัสผ่านใหม่ -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="passwordData.confirmPassword"
                label="ยืนยันรหัสผ่านใหม่ *"
                type="password"
                :rules="[
                  v => !!v || 'กรุณายืนยันรหัสผ่านใหม่',
                  v => v === passwordData.newPassword || 'รหัสผ่านไม่ตรงกัน'
                ]"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- ปุ่มเปลี่ยนรหัสผ่าน -->
          <v-row>
            <v-col cols="12" class="text-right">
              <v-btn
                color="warning"
                @click="changePassword"
                :loading="changingPassword"
                :disabled="!passwordValid"
              >
                <v-icon left>mdi-lock-reset</v-icon>
                เปลี่ยนรหัสผ่าน
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- แสดง Snackbar สำหรับแจ้งเตือน -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

// กำหนด middleware
definePageMeta({
  middleware: 'employee'
})

// ตัวแปรต่างๆ
const api = useApi()
const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const valid = ref(false)
const passwordValid = ref(false)
const form = ref(null)
const passwordForm = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลแผนก
const departments = ref([])

// ข้อมูลฟอร์ม
const formData = ref({
  name: '',
  email: '',
  departmentId: null,
  position: '',
  phoneNumber: ''
})

// ข้อมูลการเปลี่ยนรหัสผ่าน
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// ฟังก์ชันโหลดข้อมูล
const loadProfile = async () => {
  loading.value = true
  try {
    // โหลดข้อมูลส่วนตัว
    const response = await api.getEmployeeProfile()
    if (response.success && response.data) {
      formData.value = {
        name: response.data.name,
        email: response.data.email,
        departmentId: response.data.departmentId,
        position: response.data.position || '',
        phoneNumber: response.data.phoneNumber || ''
      }
    }

    // โหลดแผนก
    const deptResponse = await api.getDepartments()
    if (deptResponse.success && deptResponse.data) {
      departments.value = deptResponse.data
    }

  } catch (error) {
    console.error('Error loading profile:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// บันทึกข้อมูลส่วนตัว
const saveProfile = async () => {
  // ตรวจสอบฟอร์ม
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const response = await api.updateEmployeeProfile(formData.value)

    // ตรวจสอบ response.success
    if (response.success) {
      // อัปเดต auth store
      authStore.updateUserData({
        name: formData.value.name,
        departmentId: formData.value.departmentId,
        position: formData.value.position,
        phoneNumber: formData.value.phoneNumber
      })

      snackbar.value = {
        show: true,
        message: response.message || 'บันทึกข้อมูลสำเร็จ',
        color: 'success'
      }
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      color: 'error'
    }
  } finally {
    saving.value = false
  }
}

// เปลี่ยนรหัสผ่าน
const changePassword = async () => {
  // ตรวจสอบฟอร์ม
  const { valid } = await passwordForm.value.validate()
  if (!valid) return

  changingPassword.value = true
  try {
    // เรียก API เปลี่ยนรหัสผ่าน (ต้องเพิ่มใน backend)
    const response = await api.changePassword(passwordData.value)

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || 'เปลี่ยนรหัสผ่านสำเร็จ',
        color: 'success'
      }

      // รีเซ็ตฟอร์ม
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      passwordForm.value?.reset()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error changing password:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      color: 'error'
    }
  } finally {
    changingPassword.value = false
  }
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
