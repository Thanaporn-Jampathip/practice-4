<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-clipboard-edit</v-icon>
        ประเมินตนเอง - {{ evaluationData.evaluation?.period || '' }}
      </v-card-title>
      <v-card-subtitle v-if="evaluationData.evaluation">
        ปี พ.ศ. {{ evaluationData.evaluation.evaluationYear }} |
        กรรมการประเมิน: {{ evaluationData.evaluator?.name || '-' }}
      </v-card-subtitle>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- แสดงความคืบหน้า -->
    <v-card class="mb-4" v-if="!loading && progressData">
      <v-card-text>
        <div class="text-subtitle-1 mb-2">ความคืบหน้าการประเมิน</div>
        <v-progress-linear
          :model-value="progressData.progressPercent || 0"
          :color="progressData.progressPercent === 100 ? 'success' : 'primary'"
          height="30"
        >
          <strong>{{ Math.round(progressData.progressPercent || 0) }}%</strong>
        </v-progress-linear>
        <div class="text-caption mt-2">
          ประเมินแล้ว {{ progressData.completed || 0 }} / {{ progressData.total || 0 }} ตัวชี้วัด
        </div>
      </v-card-text>
    </v-card>

    <!-- แสดงหัวข้อและตัวชี้วัด -->
    <div v-if="!loading">
      <v-expansion-panels v-model="openPanels" multiple>
        <!-- วนลูปแสดงหัวข้อ -->
        <v-expansion-panel
          v-for="topic in topics"
          :key="topic.id"
        >
          <v-expansion-panel-title>
            <div>
              <strong>{{ topic.title }}</strong>
              <br>
              <small class="text-grey">{{ topic.description }}</small>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <!-- วนลูปแสดงตัวชี้วัด -->
            <v-card
              v-for="indicator in topic.indicators"
              :key="indicator.id"
              class="mb-4"
              :color="getSelfScore(indicator.id) ? 'success lighten-5' : ''"
            >
              <v-card-text>
                <div class="text-h6 mb-2">
                  {{ indicator.name }}
                  <v-chip v-if="getSelfScore(indicator.id)" color="success" size="small" class="ml-2">
                    <v-icon left>mdi-check</v-icon>
                    ประเมินแล้ว
                  </v-chip>
                </div>
                <div class="text-body-2 text-grey mb-3">{{ indicator.description }}</div>
                <div class="text-body-2 mb-3">น้ำหนัก: {{ indicator.weight }}% | คะแนนสูงสุด: {{ indicator.maxScore }}</div>

                <!-- แสดงระดับคะแนน -->
                <v-alert v-if="indicator.levels && indicator.levels.length > 0" type="info" variant="tonal" class="mb-3">
                  <div class="text-subtitle-2 mb-2">ระดับคะแนน:</div>
                  <div v-for="level in indicator.levels" :key="level.id" class="mb-1">
                    <strong>ระดับ {{ level.levelValue }}:</strong> {{ level.minScore }}-{{ level.maxScore }} คะแนน
                    <span v-if="level.description"> - {{ level.description }}</span>
                  </div>
                </v-alert>

                <!-- ฟอร์มให้คะแนนตนเอง -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="indicator.selfScore"
                      label="คะแนนที่ประเมินตนเอง *"
                      type="number"
                      :min="0"
                      :max="indicator.maxScore"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="indicator.selfComment"
                      label="ความคิดเห็น / เหตุผลประกอบ"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                </v-row>

                <!-- อัปโหลดหลักฐาน -->
                <div class="mb-3">
                  <v-file-input
                    v-model="indicator.evidenceFile"
                    label="อัปโหลดหลักฐาน (PDF, JPG, PNG)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    prepend-icon="mdi-paperclip"
                    @change="handleFileChange(indicator)"
                  ></v-file-input>
                </div>

                <!-- แสดงหลักฐานที่มีอยู่ -->
                <div v-if="indicator.evidencePath" class="mb-3">
                  <v-chip color="info" size="small">
                    <v-icon left>mdi-file</v-icon>
                    มีหลักฐานแนบแล้ว
                  </v-chip>
                </div>

                <!-- ปุ่มบันทึก -->
                <v-btn
                  color="primary"
                  @click="saveSelfScore(indicator)"
                  :loading="saving[indicator.id]"
                  :disabled="!indicator.selfScore"
                >
                  <v-icon left>mdi-content-save</v-icon>
                  บันทึกการประเมินตัวชี้วัดนี้
                </v-btn>
              </v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- ปุ่มกลับ -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-actions>
        <v-btn color="grey" to="/employee/dashboard">
          <v-icon left>mdi-arrow-left</v-icon>
          กลับหน้าหลัก
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          @click="finishEvaluation"
          :disabled="progressData && progressData.progressPercent < 100"
        >
          <v-icon left>mdi-check-circle</v-icon>
          เสร็จสิ้นการประเมิน
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
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useRoute, useRouter } from 'vue-router'

// กำหนด middleware
definePageMeta({
  middleware: 'employee'
})

// ตัวแปรต่างๆ
const api = useApi()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref({}) // เก็บสถานะ loading ของแต่ละตัวชี้วัด
const openPanels = ref([]) // เปิด panels ทั้งหมด

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลการประเมิน
const allocationId = ref(parseInt(route.params.id))
const evaluationData = ref({})
const topics = ref([])
const progressData = ref(null)
const selfScores = ref({}) // เก็บคะแนนที่บันทึกแล้ว

// ฟังก์ชันโหลดข้อมูล
const loadEvaluationData = async () => {
  loading.value = true
  try {
    // โหลดข้อมูลรอบการประเมิน
    const response = await api.getEvaluationDetail(allocationId.value)
    if (response.success && response.data) {
      evaluationData.value = response.data
      topics.value = response.data.topics || []

      // โหลดคะแนนที่บันทึกไว้แล้ว
      topics.value.forEach(topic => {
        topic.indicators?.forEach(indicator => {
          // ถ้ามีการบันทึกไว้แล้ว ให้ใส่ค่าเริ่มต้น
          indicator.selfScore = indicator.selfScore || null
          indicator.selfComment = indicator.selfComment || ''
          indicator.evidenceFile = null

          // เก็บไว้ใน selfScores
          if (indicator.selfScore) {
            selfScores.value[indicator.id] = {
              score: indicator.selfScore,
              comment: indicator.selfComment,
              evidencePath: indicator.evidencePath
            }
          }
        })
      })
    }

    // โหลดความคืบหน้า
    await loadProgress()

    // เปิด panels ทั้งหมด
    openPanels.value = topics.value.map((_, index) => index)

  } catch (error) {
    console.error('Error loading evaluation data:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// ฟังก์ชันโหลดความคืบหน้า
const loadProgress = async () => {
  try {
    const response = await api.getProgress(allocationId.value)
    if (response.success && response.data) {
      progressData.value = response.data
    }
  } catch (error) {
    console.error('Error loading progress:', error)
  }
}

// ดึงคะแนนที่บันทึกแล้ว
const getSelfScore = (indicatorId) => {
  return selfScores.value[indicatorId]
}

// จัดการเมื่อเลือกไฟล์
const handleFileChange = (indicator) => {
  // ไฟล์จะอยู่ใน indicator.evidenceFile แล้ว
}

// บันทึกคะแนนตนเอง
const saveSelfScore = async (indicator) => {
  // ตั้ง loading สำหรับตัวชี้วัดนี้
  saving.value[indicator.id] = true

  try {
    // ถ้ามีไฟล์ ให้อัปโหลดก่อน
    let evidencePath = indicator.evidencePath
    if (indicator.evidenceFile) {
      const formData = new FormData()
      formData.append('file', indicator.evidenceFile)
      formData.append('allocationId', allocationId.value)
      formData.append('indicatorId', indicator.id)

      const uploadResponse = await api.uploadEvidence(formData)

      // ตรวจสอบ response.success
      if (uploadResponse.success && uploadResponse.data) {
        evidencePath = uploadResponse.data.filePath || uploadResponse.data.path
      } else {
        throw new Error(uploadResponse.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์')
      }
    }

    // บันทึกคะแนน
    const response = await api.saveSelfEvaluation({
      allocationId: allocationId.value,
      indicatorId: indicator.id,
      selfScore: indicator.selfScore,
      selfComment: indicator.selfComment,
      evidencePath: evidencePath
    })

    // ตรวจสอบ response.success
    if (response.success) {
      // บันทึกสำเร็จ
      selfScores.value[indicator.id] = {
        score: indicator.selfScore,
        comment: indicator.selfComment,
        evidencePath: evidencePath
      }

      snackbar.value = {
        show: true,
        message: response.message || 'บันทึกการประเมินสำเร็จ',
        color: 'success'
      }

      // โหลดความคืบหน้าใหม่
      await loadProgress()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving self score:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      color: 'error'
    }
  } finally {
    saving.value[indicator.id] = false
  }
}

// เสร็จสิ้นการประเมิน
const finishEvaluation = () => {
  if (progressData.value && progressData.value.progressPercent === 100) {
    snackbar.value = {
      show: true,
      message: 'ประเมินตนเองเสร็จสมบูรณ์แล้ว รอกรรมการประเมิน',
      color: 'success'
    }
    setTimeout(() => {
      router.push('/employee/dashboard')
    }, 2000)
  }
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadEvaluationData()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
