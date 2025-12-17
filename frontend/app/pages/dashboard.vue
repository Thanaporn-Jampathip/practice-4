<template>
  <div>
    <!-- หัวข้อหน้า Dashboard -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4">Dashboard</h1>
        <p class="text-subtitle-1">ยินดีต้อนรับสู่ระบบประเมิน</p>
      </v-col>
    </v-row>

    <!-- สถิติแบบ Cards -->
    <v-row>
      <!-- การ์ดผู้ใช้ทั้งหมด -->
      <v-col cols="12" md="4">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="mr-4">mdi-account-group</v-icon>
              <div>
                <p class="text-subtitle-2 mb-0">ผู้ใช้ทั้งหมด</p>
                <h2 class="text-h4">{{ stats.totalUsers }}</h2>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- การ์ดแบบประเมินทั้งหมด -->
      <v-col cols="12" md="4">
        <v-card color="success" dark>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="mr-4">mdi-clipboard-text</v-icon>
              <div>
                <p class="text-subtitle-2 mb-0">แบบประเมินทั้งหมด</p>
                <h2 class="text-h4">{{ stats.totalEvaluations }}</h2>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- การ์ดการประเมินที่เสร็จแล้ว -->
      <v-col cols="12" md="4">
        <v-card color="info" dark>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="mr-4">mdi-check-circle</v-icon>
              <div>
                <p class="text-subtitle-2 mb-0">การประเมินที่เสร็จแล้ว</p>
                <h2 class="text-h4">{{ stats.completedEvaluations }}</h2>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ตารางข้อมูลล่าสุด -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-clock-outline</v-icon>
            กิจกรรมล่าสุด
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(activity, index) in recentActivities"
                :key="index"
              >
                <template v-slot:prepend>
                  <v-icon :color="activity.color">{{ activity.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ activity.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ activity.time }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- กราฟหรือแผนภูมิ (ตัวอย่าง) -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-bar</v-icon>
            สรุปผลการประเมิน
          </v-card-title>
          <v-card-text>
            <p class="text-center text-h6 py-8">
              กราฟแสดงผลการประเมินจะแสดงที่นี่
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            สัดส่วนผู้ใช้งาน
          </v-card-title>
          <v-card-text>
            <p class="text-center text-h6 py-8">
              กราฟแสดงสัดส่วนผู้ใช้งานจะแสดงที่นี่
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// กำหนดให้ใช้ middleware auth
definePageMeta({
  middleware: 'auth'
})

// ใช้ auth store
const authStore = useAuthStore()

// ข้อมูลสถิติ (ตัวอย่าง)
const stats = ref({
  totalUsers: 0,
  totalEvaluations: 0,
  completedEvaluations: 0
})

// กิจกรรมล่าสุด (ตัวอย่าง)
const recentActivities = ref([
  {
    icon: 'mdi-account-plus',
    color: 'success',
    title: 'มีผู้ใช้ใหม่ลงทะเบียน',
    time: '5 นาทีที่แล้ว'
  },
  {
    icon: 'mdi-clipboard-check',
    color: 'info',
    title: 'มีการทำแบบประเมินเสร็จสิ้น',
    time: '15 นาทีที่แล้ว'
  },
  {
    icon: 'mdi-file-document',
    color: 'warning',
    title: 'มีแบบประเมินใหม่ถูกสร้าง',
    time: '1 ชั่วโมงที่แล้ว'
  },
  {
    icon: 'mdi-account-edit',
    color: 'primary',
    title: 'มีการแก้ไขข้อมูลผู้ใช้',
    time: '2 ชั่วโมงที่แล้ว'
  }
])

// ฟังก์ชันโหลดข้อมูลสถิติ
const loadStats = async () => {
  try {
    // ในอนาคตจะเรียก API เพื่อดึงข้อมูลจริง
    // ตอนนี้ใช้ข้อมูลตัวอย่าง
    stats.value = {
      totalUsers: 150,
      totalEvaluations: 45,
      completedEvaluations: 32
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// เมื่อ component ถูก mount
onMounted(() => {
  loadStats()
})
</script>
