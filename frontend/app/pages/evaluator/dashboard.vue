<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-account-check</v-icon>
        Dashboard - รายการประเมิน
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- สถิติ -->
    <v-row class="mb-4" v-if="!loading">
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.total }}</div>
            <div>รายการทั้งหมด</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.pending }}</div>
            <div>รอประเมิน</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.inProgress }}</div>
            <div>กำลังประเมิน</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h4">{{ stats.completed }}</div>
            <div>เสร็จสมบูรณ์</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ตารางรายการประเมิน -->
    <v-card v-if="!loading">
      <v-card-title>รายการผู้ที่ต้องประเมิน</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="assignments"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์ผู้รับการประเมิน -->
          <template v-slot:item.employee="{ item }">
            {{ item.employee?.name || '-' }}
            <br>
            <small class="text-grey">{{ item.employee?.position || '' }}</small>
          </template>

          <!-- คอลัมน์รอบการประเมิน -->
          <template v-slot:item.evaluation="{ item }">
            {{ item.evaluation?.name || '-' }}
            <br>
            <small class="text-grey">ปีการศึกษา {{ item.evaluation?.year || '-' }}</small>
          </template>

          <!-- คอลัมน์สถานะ -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark small>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- คอลัมน์ความคืบหน้า -->
          <template v-slot:item.progress="{ item }">
            <v-progress-linear
              :model-value="item.evaluatorProgress || 0"
              :color="item.evaluatorProgress === 100 ? 'success' : 'primary'"
              height="20"
            >
              <strong>{{ Math.round(item.evaluatorProgress || 0) }}%</strong>
            </v-progress-linear>
          </template>

          <!-- คอลัมน์จัดการ -->
          <template v-slot:item.actions="{ item }">
            <!-- รอพนักงานประเมินตนเอง -->
            <v-chip
              v-if="item.status === 'pending'"
              color="grey"
              small
            >
              <v-icon left>mdi-clock-outline</v-icon>
              รอพนักงานประเมิน
            </v-chip>

            <!-- ประเมิน -->
            <v-btn
              v-else-if="item.status === 'self-evaluated' || item.status === 'evaluator-scored'"
              size="small"
              color="primary"
              :to="`/evaluator/evaluate/${item.id}`"
            >
              <v-icon left>mdi-clipboard-check</v-icon>
              {{ item.status === 'self-evaluated' ? 'เริ่มประเมิน' : 'ประเมินต่อ' }}
            </v-btn>

            <!-- ดูสรุป -->
            <v-btn
              v-else-if="item.status === 'completed'"
              size="small"
              color="success"
              :to="`/evaluator/evaluate/${item.id}`"
            >
              <v-icon left>mdi-eye</v-icon>
              ดูสรุป
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
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

// กำหนด middleware
definePageMeta({
  middleware: 'evaluator'
})

// ตัวแปรต่างๆ
const api = useApi()
const loading = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลรายการประเมิน
const assignments = ref([])

// หัวตาราง
const headers = [
  { title: 'ผู้รับการประเมิน', key: 'employee', sortable: false },
  { title: 'รอบการประเมิน', key: 'evaluation', sortable: false },
  { title: 'สถานะ', key: 'status', sortable: true },
  { title: 'ความคืบหน้า', key: 'progress', sortable: false, width: '200' },
  { title: 'จัดการ', key: 'actions', sortable: false, width: '180' }
]

// คำนวณสถิติ
const stats = computed(() => {
  const total = assignments.value.length
  const pending = assignments.value.filter(a => a.status === 'pending').length
  const inProgress = assignments.value.filter(a => a.status === 'self-evaluated' || a.status === 'evaluator-scored').length
  const completed = assignments.value.filter(a => a.status === 'completed').length

  return { total, pending, inProgress, completed }
})

// ฟังก์ชันโหลดข้อมูล
const loadAssignments = async () => {
  loading.value = true
  try {
    const response = await api.getAssignedEvaluations()
    if (response.success && response.data) {
      assignments.value = response.data
    }

    // โหลดความคืบหน้าสำหรับแต่ละรายการ
    for (const assignment of assignments.value) {
      try {
        const summaryResponse = await api.getEvaluationSummary(assignment.id)
        if (summaryResponse.success && summaryResponse.data) {
          assignment.evaluatorProgress = summaryResponse.data.evaluatorProgress || 0
        }
      } catch (error) {
        console.error('Error loading progress:', error)
        assignment.evaluatorProgress = 0
      }
    }
  } catch (error) {
    console.error('Error loading assignments:', error)
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
    pending: 'grey',
    'self-evaluated': 'warning',
    'evaluator-scored': 'info',
    completed: 'success'
  }
  return colors[status] || 'grey'
}

// ฟังก์ชันแปลงสถานะเป็นข้อความ
const getStatusText = (status) => {
  const texts = {
    pending: 'รอพนักงานประเมิน',
    'self-evaluated': 'รอกรรมการประเมิน',
    'evaluator-scored': 'กำลังประเมิน',
    completed: 'เสร็จสมบูรณ์'
  }
  return texts[status] || status
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadAssignments()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
