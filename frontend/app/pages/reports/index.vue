<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-chart-bar</v-icon>
        รายงานสรุปผลการประเมิน
        <v-spacer></v-spacer>
        <!-- เลือกรอบการประเมิน -->
        <v-select
          v-model="selectedEvaluationId"
          :items="evaluations"
          item-title="name"
          item-value="id"
          label="เลือกรอบการประเมิน"
          style="max-width: 300px"
          @update:modelValue="loadReports"
        ></v-select>
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ภาพรวม -->
    <v-card class="mb-4" v-if="!loading && selectedEvaluationId && overview">
      <v-card-title>ภาพรวมการประเมิน</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-card color="primary" dark>
              <v-card-text class="text-center">
                <div class="text-h4">{{ overview.totalAllocations || 0 }}</div>
                <div>รายการทั้งหมด</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="success" dark>
              <v-card-text class="text-center">
                <div class="text-h4">{{ overview.completed || 0 }}</div>
                <div>ประเมินเสร็จสิ้น</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" dark>
              <v-card-text class="text-center">
                <div class="text-h4">{{ overview.inProgress || 0 }}</div>
                <div>กำลังดำเนินการ</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" dark>
              <v-card-text class="text-center">
                <div class="text-h4">{{ overview.completionRate?.toFixed(1) || 0 }}%</div>
                <div>อัตราความสำเร็จ</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- คะแนนเฉลี่ย -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card>
              <v-card-text>
                <div class="text-h6 mb-2">คะแนนเฉลี่ยรวม</div>
                <div class="text-h3 text-primary">{{ overview.averageScore?.toFixed(2) || '0.00' }}</div>
                <v-progress-linear
                  :model-value="overview.averageScore || 0"
                  color="primary"
                  height="20"
                  class="mt-2"
                >
                  <strong>{{ overview.averageScore?.toFixed(1) || '0.0' }}%</strong>
                </v-progress-linear>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-text>
                <div class="text-h6 mb-2">การกระจายของคะแนน</div>
                <div class="text-body-2">
                  <div>ดีเยี่ยม (80-100): <strong>{{ getScoreDistribution('excellent') }}</strong> คน</div>
                  <div>ดี (70-79): <strong>{{ getScoreDistribution('good') }}</strong> คน</div>
                  <div>พอใช้ (60-69): <strong>{{ getScoreDistribution('fair') }}</strong> คน</div>
                  <div>ต้องปรับปรุง (< 60): <strong>{{ getScoreDistribution('poor') }}</strong> คน</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- สถิติตามแผนก -->
    <v-card class="mb-4" v-if="!loading && selectedEvaluationId && departmentStats.length > 0">
      <v-card-title>สถิติตามแผนก</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="deptHeaders"
          :items="departmentStats"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์คะแนนเฉลี่ย -->
          <template v-slot:item.averageScore="{ item }">
            <v-chip :color="getScoreColor(item.averageScore)">
              {{ item.averageScore?.toFixed(2) || '0.00' }}
            </v-chip>
          </template>

          <!-- คอลัมน์ความคืบหน้า -->
          <template v-slot:item.completionRate="{ item }">
            <v-progress-linear
              :model-value="item.completionRate || 0"
              :color="item.completionRate === 100 ? 'success' : 'primary'"
              height="20"
            >
              <strong>{{ item.completionRate?.toFixed(0) || 0 }}%</strong>
            </v-progress-linear>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- ความคืบหน้าการประเมิน -->
    <v-card class="mb-4" v-if="!loading && selectedEvaluationId && progressData.length > 0">
      <v-card-title>ความคืบหน้าการประเมินรายบุคคล</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="progressHeaders"
          :items="progressData"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์พนักงาน -->
          <template v-slot:item.employee="{ item }">
            {{ item.employee?.name || '-' }}
            <br>
            <small class="text-grey">{{ item.employee?.position || '' }}</small>
          </template>

          <!-- คอลัมน์แผนก -->
          <template v-slot:item.department="{ item }">
            {{ item.department?.name || '-' }}
          </template>

          <!-- คอลัมน์กรรมการ -->
          <template v-slot:item.evaluator="{ item }">
            {{ item.evaluator?.name || '-' }}
          </template>

          <!-- คอลัมน์สถานะ -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark small>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- คอลัมน์คะแนน -->
          <template v-slot:item.totalScore="{ item }">
            <v-chip v-if="item.status === 'completed'" :color="getScoreColor(item.totalScore)">
              {{ item.totalScore?.toFixed(2) || '-' }}
            </v-chip>
            <span v-else class="text-grey">-</span>
          </template>

          <!-- คอลัมน์จัดการ -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              v-if="item.status === 'completed'"
              size="small"
              color="primary"
              @click="viewDetail(item)"
            >
              <v-icon left>mdi-eye</v-icon>
              ดูรายละเอียด
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- แสดงข้อความเมื่อยังไม่เลือกรอบการประเมิน -->
    <v-card v-if="!loading && !selectedEvaluationId" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-information-outline</v-icon>
      <div class="text-h6 mt-4">กรุณาเลือกรอบการประเมินเพื่อดูรายงาน</div>
    </v-card>

    <!-- Dialog แสดงรายละเอียด -->
    <v-dialog v-model="detailDialog" max-width="800px">
      <v-card v-if="selectedDetail">
        <v-card-title>รายละเอียดการประเมิน - {{ selectedDetail.employee?.name }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">ตำแหน่ง</div>
              <div class="text-body-1 mb-3">{{ selectedDetail.employee?.position || '-' }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">แผนก</div>
              <div class="text-body-1 mb-3">{{ selectedDetail.department?.name || '-' }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">กรรมการประเมิน</div>
              <div class="text-body-1 mb-3">{{ selectedDetail.evaluator?.name || '-' }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-grey">คะแนนรวม</div>
              <v-chip :color="getScoreColor(selectedDetail.totalScore)" class="text-h6">
                {{ selectedDetail.totalScore?.toFixed(2) || '-' }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="detailDialog = false">
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
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

// กำหนด middleware (ใครก็เข้าได้ แต่ควรเป็น admin หรือ evaluator)
definePageMeta({
  middleware: 'admin'
})

// ตัวแปรต่างๆ
const api = useApi()
const loading = ref(false)
const detailDialog = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลรอบการประเมิน
const evaluations = ref([])
const selectedEvaluationId = ref(null)

// ข้อมูลรายงาน
const overview = ref(null)
const departmentStats = ref([])
const progressData = ref([])
const selectedDetail = ref(null)

// หัวตารางแผนก
const deptHeaders = [
  { title: 'แผนก', key: 'departmentName', sortable: true },
  { title: 'จำนวนพนักงาน', key: 'totalEmployees', sortable: true },
  { title: 'ประเมินเสร็จ', key: 'completed', sortable: true },
  { title: 'คะแนนเฉลี่ย', key: 'averageScore', sortable: true },
  { title: 'ความคืบหน้า', key: 'completionRate', sortable: true }
]

// หัวตารางความคืบหน้า
const progressHeaders = [
  { title: 'พนักงาน', key: 'employee', sortable: false },
  { title: 'แผนก', key: 'department', sortable: false },
  { title: 'กรรมการประเมิน', key: 'evaluator', sortable: false },
  { title: 'สถานะ', key: 'status', sortable: true },
  { title: 'คะแนน', key: 'totalScore', sortable: true },
  { title: 'จัดการ', key: 'actions', sortable: false }
]

// ฟังก์ชันโหลดรอบการประเมิน
const loadEvaluations = async () => {
  try {
    const response = await api.getEvaluations()
    if (response.success && response.data) {
      evaluations.value = response.data
    }
  } catch (error) {
    console.error('Error loading evaluations:', error)
  }
}

// ฟังก์ชันโหลดรายงาน
const loadReports = async () => {
  if (!selectedEvaluationId.value) return

  loading.value = true
  try {
    // โหลดภาพรวม
    const overviewResponse = await api.getReportOverview(selectedEvaluationId.value)
    if (overviewResponse.success && overviewResponse.data) {
      overview.value = overviewResponse.data
    }

    // โหลดสถิติตามแผนก
    const deptResponse = await api.getDepartmentStats(selectedEvaluationId.value)
    if (deptResponse.success && deptResponse.data) {
      departmentStats.value = deptResponse.data
    }

    // โหลดความคืบหน้า
    const progressResponse = await api.getReportProgress(selectedEvaluationId.value)
    if (progressResponse.success && progressResponse.data) {
      progressData.value = progressResponse.data
    }

  } catch (error) {
    console.error('Error loading reports:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// การกระจายของคะแนน
const getScoreDistribution = (grade) => {
  if (!overview.value || !progressData.value) return 0

  const completed = progressData.value.filter(p => p.status === 'completed')

  switch (grade) {
    case 'excellent':
      return completed.filter(p => p.totalScore >= 80).length
    case 'good':
      return completed.filter(p => p.totalScore >= 70 && p.totalScore < 80).length
    case 'fair':
      return completed.filter(p => p.totalScore >= 60 && p.totalScore < 70).length
    case 'poor':
      return completed.filter(p => p.totalScore < 60).length
    default:
      return 0
  }
}

// กำหนดสีตามคะแนน
const getScoreColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 70) return 'info'
  if (score >= 60) return 'warning'
  return 'error'
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
    pending: 'รอดำเนินการ',
    'self-evaluated': 'ประเมินตนเองแล้ว',
    'evaluator-scored': 'กรรมการให้คะแนนแล้ว',
    completed: 'เสร็จสมบูรณ์'
  }
  return texts[status] || status
}

// ดูรายละเอียด
const viewDetail = (item) => {
  selectedDetail.value = item
  detailDialog.value = true
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadEvaluations()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
