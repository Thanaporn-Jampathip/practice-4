<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard - ภาพรวมระบบ
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- สถิติภาพรวม -->
    <v-row v-if="!loading">
      <!-- จำนวนรอบการประเมิน -->
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalEvaluations }}</div>
            <div>รอบการประเมินทั้งหมด</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- จำนวนพนักงาน -->
      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalEmployees }}</div>
            <div>พนักงานทั้งหมด</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- จำนวนกรรมการ -->
      <v-col cols="12" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalEvaluators }}</div>
            <div>กรรมการประเมินทั้งหมด</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- จำนวนแผนก -->
      <v-col cols="12" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.totalDepartments }}</div>
            <div>แผนกทั้งหมด</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- รอบการประเมินล่าสุด -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-title>รอบการประเมินล่าสุด</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="evaluations"
          :items-per-page="5"
          class="elevation-1"
        >
          <!-- คอลัมน์สถานะ -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark small>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- คอลัมน์วันที่ -->
          <template v-slot:item.startDate="{ item }">
            {{ formatDate(item.startDate) }}
          </template>
          <template v-slot:item.endDate="{ item }">
            {{ formatDate(item.endDate) }}
          </template>

          <!-- คอลัมน์จัดการ -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              size="small"
              color="primary"
              :to="`/admin/evaluations`"
            >
              จัดการ
            </v-btn>
          </template>
        </v-data-table>
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

// กำหนด middleware
definePageMeta({
  middleware: 'admin'
})

// ตัวแปรต่างๆ
const api = useApi()
const loading = ref(false)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลสถิติ
const stats = ref({
  totalEvaluations: 0,
  totalEmployees: 0,
  totalEvaluators: 0,
  totalDepartments: 0
})

// ข้อมูลรอบการประเมิน
const evaluations = ref([])

// หัวตาราง
const headers = [
  { title: 'ชื่อรอบการประเมิน', key: 'name', sortable: true },
  { title: 'ปีการศึกษา', key: 'year', sortable: true },
  { title: 'วันที่เริ่มต้น', key: 'startDate', sortable: true },
  { title: 'วันที่สิ้นสุด', key: 'endDate', sortable: true },
  { title: 'สถานะ', key: 'status', sortable: true },
  { title: 'จัดการ', key: 'actions', sortable: false }
]

// ฟังก์ชันโหลดข้อมูล
const loadData = async () => {
  loading.value = true
  try {
    // โหลดข้อมูลรอบการประเมิน
    const evalResponse = await api.getEvaluations()
    if (evalResponse.success && evalResponse.data) {
      evaluations.value = evalResponse.data
      stats.value.totalEvaluations = evaluations.value.length
    }

    // โหลดข้อมูลพนักงาน
    const empResponse = await api.getEmployees()
    if (empResponse.success && empResponse.data) {
      const employees = empResponse.data
      stats.value.totalEmployees = employees.filter(e => e.role === 'employee').length
      stats.value.totalEvaluators = employees.filter(e => e.role === 'evaluator' || e.role === 'admin').length
    }

    // โหลดข้อมูลแผนก
    const deptResponse = await api.getDepartments()
    if (deptResponse.success && deptResponse.data) {
      stats.value.totalDepartments = deptResponse.data.length
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

// ฟังก์ชันแปลงสถานะเป็นสี
const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    active: 'success',
    closed: 'error'
  }
  return colors[status] || 'grey'
}

// ฟังก์ชันแปลงสถานะเป็นข้อความ
const getStatusText = (status) => {
  const texts = {
    draft: 'แบบร่าง',
    active: 'เปิดใช้งาน',
    closed: 'ปิดแล้ว'
  }
  return texts[status] || status
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
