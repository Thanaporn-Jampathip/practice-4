<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard - การประเมินของฉัน
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ข้อมูลส่วนตัว -->
    <v-card class="mb-4" v-if="!loading">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-grey">ชื่อ-นามสกุล</div>
            <div class="text-h6">{{ authStore.getUserName }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 text-grey">ตำแหน่ง</div>
            <div class="text-h6">{{ authStore.getPosition || '-' }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- รายการประเมิน -->
    <v-card v-if="!loading">
      <v-card-title>รายการประเมินของฉัน</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="evaluations"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์รอบการประเมิน -->
          <template v-slot:item.evaluation="{ item }">
            {{ item.evaluation?.name || '-' }}
            <br>
            <small class="text-grey">ปีการศึกษา {{ item.evaluation?.year || '-' }}</small>
          </template>

          <!-- คอลัมน์กรรมการ -->
          <template v-slot:item.evaluator="{ item }">
            {{ item.evaluator?.name || '-' }}
            <br>
            <small class="text-grey">{{ item.evaluator?.position || '' }}</small>
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
              :model-value="item.progressPercent || 0"
              :color="item.progressPercent === 100 ? 'success' : 'primary'"
              height="20"
            >
              <strong>{{ Math.round(item.progressPercent || 0) }}%</strong>
            </v-progress-linear>
          </template>

          <!-- คอลัมน์จัดการ -->
          <template v-slot:item.actions="{ item }">
            <!-- ประเมินตนเอง -->
            <v-btn
              v-if="item.status === 'pending' || item.status === 'self-evaluated'"
              size="small"
              color="primary"
              :to="`/employee/evaluation/${item.id}`"
              class="mr-2"
            >
              <v-icon left>mdi-clipboard-edit</v-icon>
              ประเมินตนเอง
            </v-btn>

            <!-- ดูผลการประเมิน -->
            <v-btn
              v-if="item.status === 'completed'"
              size="small"
              color="success"
              :to="`/employee/results/${item.id}`"
            >
              <v-icon left>mdi-eye</v-icon>
              ดูผลการประเมิน
            </v-btn>

            <!-- รอกรรมการประเมิน -->
            <v-chip
              v-if="item.status === 'evaluator-scored'"
              color="info"
              small
            >
              <v-icon left>mdi-clock-outline</v-icon>
              รอผลการประเมิน
            </v-chip>
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
import { useAuthStore } from '~/stores/auth'

// กำหนด middleware
definePageMeta({
  middleware: 'employee'
})

// ตัวแปรต่างๆ
const api = useApi()
const authStore = useAuthStore()
const loading = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลการประเมิน
const evaluations = ref([])

// หัวตาราง
const headers = [
  { title: 'รอบการประเมิน', key: 'evaluation', sortable: false },
  { title: 'กรรมการประเมิน', key: 'evaluator', sortable: false },
  { title: 'สถานะ', key: 'status', sortable: true },
  { title: 'ความคืบหน้า', key: 'progress', sortable: false, width: '200' },
  { title: 'จัดการ', key: 'actions', sortable: false, width: '200' }
]

// ฟังก์ชันโหลดข้อมูล
const loadEvaluations = async () => {
  loading.value = true
  try {
    const response = await api.getMyEvaluations()
    if (response.success && response.data) {
      evaluations.value = response.data
    }

    // โหลดความคืบหน้าสำหรับแต่ละรอบ
    for (const allocation of evaluations.value) {
      try {
        const progressResponse = await api.getProgress(allocation.id)
        if (progressResponse.success && progressResponse.data) {
          allocation.progressPercent = progressResponse.data.progressPercent || 0
        }
      } catch (error) {
        console.error('Error loading progress:', error)
        allocation.progressPercent = 0
      }
    }
  } catch (error) {
    console.error('Error loading evaluations:', error)
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
    pending: 'warning',
    'self-evaluated': 'info',
    'evaluator-scored': 'primary',
    completed: 'success'
  }
  return colors[status] || 'grey'
}

// ฟังก์ชันแปลงสถานะเป็นข้อความ
const getStatusText = (status) => {
  const texts = {
    pending: 'รอประเมินตนเอง',
    'self-evaluated': 'ประเมินตนเองแล้ว',
    'evaluator-scored': 'กรรมการให้คะแนนแล้ว',
    completed: 'เสร็จสมบูรณ์'
  }
  return texts[status] || status
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadEvaluations()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
