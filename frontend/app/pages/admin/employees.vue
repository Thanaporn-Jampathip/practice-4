<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-account-group</v-icon>
        รายชื่อพนักงานทั้งหมด
        <v-spacer></v-spacer>
        <!-- ค้นหา -->
        <v-text-field
          v-model="search"
          label="ค้นหา"
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          style="max-width: 300px"
        ></v-text-field>
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- สถิติ -->
    <v-row class="mb-4" v-if="!loading">
      <v-col cols="12" md="4">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalEmployees }}</div>
            <div>พนักงานทั้งหมด</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalEvaluators }}</div>
            <div>กรรมการประเมิน</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalDepartments }}</div>
            <div>จำนวนแผนก</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ตารางแสดงพนักงาน -->
    <v-card v-if="!loading">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredEmployees"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์ชื่อ-อีเมล -->
          <template v-slot:item.name="{ item }">
            {{ item.name }}
            <br>
            <small class="text-grey">{{ item.email }}</small>
          </template>

          <!-- คอลัมน์แผนก -->
          <template v-slot:item.department="{ item }">
            {{ getDepartmentName(item.departmentId) }}
          </template>

          <!-- คอลัมน์บทบาท -->
          <template v-slot:item.role="{ item }">
            <v-chip :color="getRoleColor(item.role)" dark small>
              {{ getRoleText(item.role) }}
            </v-chip>
          </template>

          <!-- คอลัมน์วันที่สร้าง -->
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <!-- คอลัมน์จัดการ -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              size="small"
              color="primary"
              @click="viewEmployee(item)"
            >
              <v-icon left>mdi-eye</v-icon>
              ดูข้อมูล
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog ดูข้อมูลพนักงาน -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedEmployee">
        <v-card-title>
          <span class="text-h5">ข้อมูลพนักงาน</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">ชื่อ-นามสกุล</div>
              <div class="text-body-1 mb-3">{{ selectedEmployee.name }}</div>
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">อีเมล</div>
              <div class="text-body-1 mb-3">{{ selectedEmployee.email }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">แผนก</div>
              <div class="text-body-1 mb-3">{{ getDepartmentName(selectedEmployee.departmentId) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">ตำแหน่ง</div>
              <div class="text-body-1 mb-3">{{ selectedEmployee.position || '-' }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">เบอร์โทรศัพท์</div>
              <div class="text-body-1 mb-3">{{ selectedEmployee.phoneNumber || '-' }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">บทบาท</div>
              <v-chip :color="getRoleColor(selectedEmployee.role)" dark small>
                {{ getRoleText(selectedEmployee.role) }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <div class="text-subtitle-2 text-grey">วันที่สร้างบัญชี</div>
              <div class="text-body-1">{{ formatDate(selectedEmployee.createdAt) }}</div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="viewDialog = false">
            ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- แสดง Snackbar สำหรับแจ้งเตือน -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

// กำหนด middleware
definePageMeta({
  middleware: 'admin'
})

// ตัวแปรต่างๆ
const api = useApi()
const loading = ref(false)
const search = ref('')
const viewDialog = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลพนักงาน
const employees = ref([])
const departments = ref([])
const selectedEmployee = ref(null)

// สถิติ
const stats = ref({
  totalEmployees: 0,
  totalEvaluators: 0,
  totalDepartments: 0
})

// หัวตาราง
const headers = [
  { title: 'ชื่อ-นามสกุล / อีเมล', key: 'name', sortable: true },
  { title: 'แผนก', key: 'department', sortable: false },
  { title: 'ตำแหน่ง', key: 'position', sortable: true },
  { title: 'บทบาท', key: 'role', sortable: true },
  { title: 'วันที่สร้าง', key: 'createdAt', sortable: true },
  { title: 'จัดการ', key: 'actions', sortable: false }
]

// กรองพนักงานตามคำค้นหา
const filteredEmployees = computed(() => {
  if (!search.value) return employees.value

  const searchLower = search.value.toLowerCase()
  return employees.value.filter(emp =>
    emp.name?.toLowerCase().includes(searchLower) ||
    emp.email?.toLowerCase().includes(searchLower) ||
    emp.position?.toLowerCase().includes(searchLower)
  )
})

// ฟังก์ชันโหลดข้อมูล
const loadData = async () => {
  loading.value = true
  try {
    // โหลดพนักงาน
    const empResponse = await api.getEmployees()
    if (empResponse.success && empResponse.data) {
      employees.value = empResponse.data
    }

    // คำนวณสถิติ
    stats.value.totalEmployees = employees.value.filter(e => e.role === 'employee').length
    stats.value.totalEvaluators = employees.value.filter(e => e.role === 'evaluator' || e.role === 'admin').length

    // โหลดแผนก
    const deptResponse = await api.getDepartments()
    if (deptResponse.success && deptResponse.data) {
      departments.value = deptResponse.data
      stats.value.totalDepartments = departments.value.length
    }

  } catch (error) {
    console.error('Error loading data:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// ดูข้อมูลพนักงาน
const viewEmployee = (item) => {
  selectedEmployee.value = item
  viewDialog.value = true
}

// ดึงชื่อแผนก
const getDepartmentName = (departmentId) => {
  const dept = departments.value.find(d => d.id === departmentId)
  return dept?.name || '-'
}

// ฟังก์ชันแปลง role เป็นสี
const getRoleColor = (role) => {
  const colors = {
    admin: 'error',
    evaluator: 'primary',
    employee: 'success'
  }
  return colors[role] || 'grey'
}

// ฟังก์ชันแปลง role เป็นข้อความ
const getRoleText = (role) => {
  const texts = {
    admin: 'บุคลากร',
    evaluator: 'กรรมการผู้ประเมิน',
    employee: 'ผู้รับการประเมิน'
  }
  return texts[role] || role
}

// ฟังก์ชันแปลงวันที่
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
