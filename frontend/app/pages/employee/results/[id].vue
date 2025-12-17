<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-chart-box</v-icon>
        ผลการประเมิน - {{ resultsData.evaluation?.name || '' }}
      </v-card-title>
      <v-card-subtitle v-if="resultsData.evaluation">
        ปีการศึกษา {{ resultsData.evaluation.year }} |
        กรรมการประเมิน: {{ resultsData.evaluator?.name || '-' }}
      </v-card-subtitle>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- สรุปคะแนนรวม -->
    <v-card class="mb-4" v-if="!loading && summary">
      <v-card-title>สรุปผลการประเมิน</v-card-title>
      <v-card-text>
        <v-row>
          <!-- คะแนนรวมจากการประเมินตนเอง -->
          <v-col cols="12" md="4">
            <v-card color="info" dark>
              <v-card-text class="text-center">
                <div class="text-h3">{{ summary.totalSelfScore?.toFixed(2) || '0.00' }}</div>
                <div class="text-subtitle-1">คะแนนประเมินตนเอง</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- คะแนนรวมจากกรรมการ -->
          <v-col cols="12" md="4">
            <v-card color="primary" dark>
              <v-card-text class="text-center">
                <div class="text-h3">{{ summary.totalEvaluatorScore?.toFixed(2) || '0.00' }}</div>
                <div class="text-subtitle-1">คะแนนจากกรรมการ</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- คะแนนเต็ม -->
          <v-col cols="12" md="4">
            <v-card color="success" dark>
              <v-card-text class="text-center">
                <div class="text-h3">{{ summary.maxScore?.toFixed(2) || '100.00' }}</div>
                <div class="text-subtitle-1">คะแนนเต็ม</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- เปอร์เซ็นต์ -->
        <v-row class="mt-4">
          <v-col cols="12">
            <div class="text-h6 mb-2">เปอร์เซ็นต์ความสำเร็จ</div>
            <v-progress-linear
              :model-value="summary.percentage || 0"
              :color="getGradeColor(summary.percentage)"
              height="40"
            >
              <strong class="text-h6">{{ summary.percentage?.toFixed(2) || '0.00' }}%</strong>
            </v-progress-linear>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ความคิดเห็นจากกรรมการ -->
    <v-card class="mb-4" v-if="!loading && resultsData.evaluatorComment">
      <v-card-title>
        <v-icon left>mdi-comment-text</v-icon>
        ความคิดเห็นจากกรรมการ
      </v-card-title>
      <v-card-text>
        <p>{{ resultsData.evaluatorComment }}</p>
      </v-card-text>
    </v-card>

    <!-- รายละเอียดคะแนนแต่ละหัวข้อ -->
    <v-expansion-panels v-if="!loading" v-model="openPanels" multiple>
      <!-- วนลูปแสดงหัวข้อ -->
      <v-expansion-panel
        v-for="topic in topics"
        :key="topic.id"
      >
        <v-expansion-panel-title>
          <div>
            <strong>{{ topic.name }}</strong> (น้ำหนัก {{ topic.weight }}%)
            <br>
            <small class="text-grey">คะแนนรวม: {{ getTopicScore(topic) }}</small>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <!-- ตารางแสดงตัวชี้วัด -->
          <v-table>
            <thead>
              <tr>
                <th>ตัวชี้วัด</th>
                <th class="text-center">น้ำหนัก (%)</th>
                <th class="text-center">ประเมินตนเอง</th>
                <th class="text-center">คะแนนกรรมการ</th>
                <th class="text-center">คะแนนเต็ม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="indicator in topic.indicators" :key="indicator.id">
                <td>
                  <div>{{ indicator.name }}</div>
                  <div class="text-caption text-grey">{{ indicator.description }}</div>

                  <!-- แสดงความคิดเห็นตนเอง -->
                  <v-alert v-if="indicator.selfComment" type="info" variant="tonal" class="mt-2">
                    <div class="text-subtitle-2">ความคิดเห็นของคุณ:</div>
                    <div>{{ indicator.selfComment }}</div>
                  </v-alert>

                  <!-- แสดงความคิดเห็นกรรมการ -->
                  <v-alert v-if="indicator.evaluatorComment" type="primary" variant="tonal" class="mt-2">
                    <div class="text-subtitle-2">ความคิดเห็นจากกรรมการ:</div>
                    <div>{{ indicator.evaluatorComment }}</div>
                  </v-alert>

                  <!-- แสดงหลักฐาน -->
                  <div v-if="indicator.evidencePath" class="mt-2">
                    <v-chip color="info" size="small">
                      <v-icon left>mdi-file</v-icon>
                      หลักฐานแนบ
                    </v-chip>
                  </div>
                </td>
                <td class="text-center">{{ indicator.weight }}%</td>
                <td class="text-center">
                  <v-chip color="info">{{ indicator.selfScore || '-' }}</v-chip>
                </td>
                <td class="text-center">
                  <v-chip color="primary">{{ indicator.evaluatorScore || '-' }}</v-chip>
                </td>
                <td class="text-center">{{ indicator.maxScore }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- ลายเซ็นกรรมการ -->
    <v-card class="mt-4" v-if="!loading && resultsData.evaluatorSignature">
      <v-card-title>
        <v-icon left>mdi-draw</v-icon>
        ลายเซ็นกรรมการ
      </v-card-title>
      <v-card-text class="text-center">
        <img :src="resultsData.evaluatorSignature" alt="ลายเซ็นกรรมการ" style="max-width: 400px; border: 1px solid #ccc;">
        <div class="mt-2">
          {{ resultsData.evaluator?.name || '' }}
        </div>
        <div class="text-caption text-grey">
          วันที่ลงนาม: {{ formatDate(resultsData.evaluatorSignedAt) }}
        </div>
      </v-card-text>
    </v-card>

    <!-- ปุ่มกลับ -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-actions>
        <v-btn color="grey" to="/employee/dashboard">
          <v-icon left>mdi-arrow-left</v-icon>
          กลับหน้าหลัก
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="printResults">
          <v-icon left>mdi-printer</v-icon>
          พิมพ์ผลการประเมิน
        </v-btn>
      </v-card-actions>
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
import { useRoute } from 'vue-router'

// กำหนด middleware
definePageMeta({
  middleware: 'employee'
})

// ตัวแปรต่างๆ
const api = useApi()
const route = useRoute()
const loading = ref(false)
const openPanels = ref([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลผลการประเมิน
const allocationId = ref(parseInt(route.params.id))
const resultsData = ref({})
const topics = ref([])

// คำนวณสรุปคะแนน
const summary = computed(() => {
  let totalSelfScore = 0
  let totalEvaluatorScore = 0
  let maxScore = 0

  topics.value.forEach(topic => {
    topic.indicators?.forEach(indicator => {
      // คำนวณตามน้ำหนัก
      const weight = indicator.weight / 100
      const topicWeight = topic.weight / 100

      if (indicator.selfScore) {
        totalSelfScore += (indicator.selfScore / indicator.maxScore) * 100 * weight * topicWeight
      }

      if (indicator.evaluatorScore) {
        totalEvaluatorScore += (indicator.evaluatorScore / indicator.maxScore) * 100 * weight * topicWeight
      }

      maxScore += 100 * weight * topicWeight
    })
  })

  return {
    totalSelfScore,
    totalEvaluatorScore,
    maxScore,
    percentage: (totalEvaluatorScore / maxScore) * 100
  }
})

// ฟังก์ชันโหลดข้อมูล
const loadResults = async () => {
  loading.value = true
  try {
    const response = await api.getEvaluationResults(allocationId.value)
    if (response.success && response.data) {
      resultsData.value = response.data
      topics.value = response.data.topics || []

      // เปิด panels ทั้งหมด
      openPanels.value = topics.value.map((_, index) => index)
    }

  } catch (error) {
    console.error('Error loading results:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// คำนวณคะแนนรวมของหัวข้อ
const getTopicScore = (topic) => {
  let score = 0
  let maxScore = 0

  topic.indicators?.forEach(indicator => {
    if (indicator.evaluatorScore) {
      score += indicator.evaluatorScore
    }
    maxScore += indicator.maxScore
  })

  return `${score.toFixed(2)} / ${maxScore.toFixed(2)}`
}

// กำหนดสีตามเปอร์เซ็นต์
const getGradeColor = (percentage) => {
  if (percentage >= 80) return 'success'
  if (percentage >= 70) return 'info'
  if (percentage >= 60) return 'warning'
  return 'error'
}

// ฟังก์ชันแปลงวันที่
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// พิมพ์ผลการประเมิน
const printResults = () => {
  window.print()
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadResults()
})
</script>

<style scoped>
/* สไตล์สำหรับการพิมพ์ */
@media print {
  .v-btn,
  .v-app-bar,
  .v-navigation-drawer {
    display: none !important;
  }
}
</style>
