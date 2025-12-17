<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-clipboard-check</v-icon>
        ประเมินพนักงาน - {{ employeeData.employee?.name || '' }}
      </v-card-title>
      <v-card-subtitle v-if="employeeData.evaluation">
        รอบการประเมิน: {{ employeeData.evaluation.period }} ({{ employeeData.evaluation.evaluationYear }}) |
        ตำแหน่ง: {{ employeeData.employee?.position || '-' }}
      </v-card-subtitle>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- แสดงความคืบหน้า -->
    <v-card class="mb-4" v-if="!loading && summary">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-subtitle-1 mb-2">ความคืบหน้าการประเมินของคุณ</div>
            <v-progress-linear
              :model-value="summary.evaluatorProgress || 0"
              :color="summary.evaluatorProgress === 100 ? 'success' : 'primary'"
              height="30"
            >
              <strong>{{ Math.round(summary.evaluatorProgress || 0) }}%</strong>
            </v-progress-linear>
            <div class="text-caption mt-2">
              ประเมินแล้ว {{ summary.evaluatorCompleted || 0 }} / {{ summary.total || 0 }} ตัวชี้วัด
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-1 mb-2">คะแนนรวม (ตามที่ประเมินแล้ว)</div>
            <div class="text-h4">{{ summary.totalScore?.toFixed(2) || '0.00' }} / {{ summary.maxScore?.toFixed(2) || '0.00' }}</div>
          </v-col>
        </v-row>
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
              :color="getEvaluatorScore(indicator.id) ? 'primary lighten-5' : ''"
            >
              <v-card-text>
                <div class="text-h6 mb-2">
                  {{ indicator.name }}
                  <v-chip v-if="getEvaluatorScore(indicator.id)" color="success" size="small" class="ml-2">
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

                <!-- แสดงคะแนนและความคิดเห็นจากพนักงาน -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-alert type="info" variant="tonal">
                      <div class="text-subtitle-2">คะแนนประเมินตนเอง:</div>
                      <div class="text-h5">{{ indicator.selfScore || '-' }} / {{ indicator.maxScore }}</div>
                    </v-alert>
                  </v-col>
                  <v-col cols="12" md="6" v-if="indicator.evidencePath">
                    <v-alert type="success" variant="tonal">
                      <div class="text-subtitle-2">หลักฐาน:</div>
                      <v-chip color="success" size="small">
                        <v-icon left>mdi-file</v-icon>
                        มีหลักฐานแนบ
                      </v-chip>
                    </v-alert>
                  </v-col>
                </v-row>

                <v-row v-if="indicator.selfComment">
                  <v-col cols="12">
                    <v-alert type="info" variant="tonal">
                      <div class="text-subtitle-2">ความคิดเห็นจากพนักงาน:</div>
                      <div>{{ indicator.selfComment }}</div>
                    </v-alert>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <!-- ฟอร์มให้คะแนนจากกรรมการ -->
                <div class="text-h6 mb-3">การประเมินของคุณ</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="indicator.evaluatorScore"
                      label="คะแนนที่ให้ *"
                      type="number"
                      :min="0"
                      :max="indicator.maxScore"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="indicator.evaluatorComment"
                      label="ความคิดเห็น / คำแนะนำ"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                </v-row>

                <!-- ปุ่มบันทึก -->
                <v-btn
                  color="primary"
                  @click="saveScore(indicator)"
                  :loading="saving[indicator.id]"
                  :disabled="!indicator.evaluatorScore && indicator.evaluatorScore !== 0"
                >
                  <v-icon left>mdi-content-save</v-icon>
                  บันทึกคะแนนตัวชี้วัดนี้
                </v-btn>
              </v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- ส่วนความคิดเห็นรวมและลายเซ็น -->
    <v-card class="mt-4" v-if="!loading && summary && summary.evaluatorProgress === 100">
      <v-card-title>
        <v-icon left>mdi-comment-text</v-icon>
        ความคิดเห็นรวมและลายเซ็น
      </v-card-title>
      <v-card-text>
        <!-- ความคิดเห็นรวม -->
        <v-textarea
          v-model="overallComment"
          label="ความคิดเห็นรวมต่อผู้รับการประเมิน"
          rows="4"
          class="mb-4"
        ></v-textarea>

        <!-- Signature Pad -->
        <div class="mb-4">
          <div class="text-subtitle-1 mb-2">ลายเซ็น</div>
          <div class="signature-container">
            <canvas
              ref="signatureCanvas"
              width="600"
              height="200"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart="startDrawing"
              @touchmove="draw"
              @touchend="stopDrawing"
            ></canvas>
          </div>
          <v-btn color="grey" size="small" @click="clearSignature" class="mt-2">
            <v-icon left>mdi-eraser</v-icon>
            ล้างลายเซ็น
          </v-btn>
        </div>

        <!-- ปุ่มส่งการประเมิน -->
        <v-btn
          color="success"
          size="large"
          @click="submitEvaluation"
          :loading="submitting"
          :disabled="!hasSignature || !overallComment"
        >
          <v-icon left>mdi-send</v-icon>
          ส่งการประเมิน
        </v-btn>
        <div class="text-caption text-grey mt-2">
          * กรุณาให้คะแนนครบทุกตัวชี้วัด กรอกความคิดเห็นรวม และลงนามก่อนส่ง
        </div>
      </v-card-text>
    </v-card>

    <!-- ปุ่มกลับ -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-actions>
        <v-btn color="grey" to="/evaluator/dashboard">
          <v-icon left>mdi-arrow-left</v-icon>
          กลับหน้าหลัก
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
  middleware: 'evaluator'
})

// ตัวแปรต่างๆ
const api = useApi()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref({})
const submitting = ref(false)
const openPanels = ref([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลการประเมิน
const allocationId = ref(parseInt(route.params.id))
const employeeData = ref({})
const topics = ref([])
const summary = ref(null)
const evaluatorScores = ref({})
const overallComment = ref('')
const hasSignature = ref(false)

// Signature pad
const signatureCanvas = ref(null)
let ctx = null
let isDrawing = false
let lastX = 0
let lastY = 0

// ฟังก์ชันโหลดข้อมูล
const loadEmployeeData = async () => {
  loading.value = true
  try {
    // โหลดข้อมูลพนักงาน
    const response = await api.getEmployeeDetail(allocationId.value)
    if (response.success && response.data) {
      employeeData.value = response.data
      topics.value = response.data.topics || []

      // โหลดคะแนนที่บันทึกไว้แล้ว
      topics.value.forEach(topic => {
        topic.indicators?.forEach(indicator => {
          indicator.evaluatorScore = indicator.evaluatorScore || null
          indicator.evaluatorComment = indicator.evaluatorComment || ''

          // เก็บไว้ใน evaluatorScores
          if (indicator.evaluatorScore !== null) {
            evaluatorScores.value[indicator.id] = {
              score: indicator.evaluatorScore,
              comment: indicator.evaluatorComment
            }
          }
        })
      })
    }

    // โหลดสรุป
    await loadSummary()

    // เปิด panels ทั้งหมด
    openPanels.value = topics.value.map((_, index) => index)

  } catch (error) {
    console.error('Error loading employee data:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// ฟังก์ชันโหลดสรุป
const loadSummary = async () => {
  try {
    const response = await api.getEvaluationSummary(allocationId.value)
    if (response.success && response.data) {
      summary.value = response.data
      overallComment.value = response.data.evaluatorComment || ''
    }
  } catch (error) {
    console.error('Error loading summary:', error)
  }
}

// ดึงคะแนนที่บันทึกแล้ว
const getEvaluatorScore = (indicatorId) => {
  return evaluatorScores.value[indicatorId]
}

// บันทึกคะแนน
const saveScore = async (indicator) => {
  saving.value[indicator.id] = true

  try {
    const response = await api.scoreIndicator({
      allocationId: allocationId.value,
      indicatorId: indicator.id,
      score: indicator.evaluatorScore,
      comment: indicator.evaluatorComment
    })

    // ตรวจสอบ response.success
    if (response.success) {
      // บันทึกสำเร็จ
      evaluatorScores.value[indicator.id] = {
        score: indicator.evaluatorScore,
        comment: indicator.evaluatorComment
      }

      snackbar.value = {
        show: true,
        message: response.message || 'บันทึกคะแนนสำเร็จ',
        color: 'success'
      }

      // โหลดสรุปใหม่
      await loadSummary()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving score:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกคะแนน',
      color: 'error'
    }
  } finally {
    saving.value[indicator.id] = false
  }
}

// Signature Pad Functions
onMounted(() => {
  if (signatureCanvas.value) {
    ctx = signatureCanvas.value.getContext('2d')
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }
  loadEmployeeData()
})

const startDrawing = (e) => {
  isDrawing = true
  const rect = signatureCanvas.value.getBoundingClientRect()

  if (e.touches) {
    lastX = e.touches[0].clientX - rect.left
    lastY = e.touches[0].clientY - rect.top
  } else {
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top
  }

  hasSignature.value = true
}

const draw = (e) => {
  if (!isDrawing) return

  e.preventDefault()

  const rect = signatureCanvas.value.getBoundingClientRect()
  let currentX, currentY

  if (e.touches) {
    currentX = e.touches[0].clientX - rect.left
    currentY = e.touches[0].clientY - rect.top
  } else {
    currentX = e.clientX - rect.left
    currentY = e.clientY - rect.top
  }

  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()

  lastX = currentX
  lastY = currentY
}

const stopDrawing = () => {
  isDrawing = false
}

const clearSignature = () => {
  ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
  hasSignature.value = false
}

// ส่งการประเมิน
const submitEvaluation = async () => {
  if (!hasSignature.value) {
    snackbar.value = {
      show: true,
      message: 'กรุณาลงนามก่อนส่งการประเมิน',
      color: 'error'
    }
    return
  }

  if (!overallComment.value) {
    snackbar.value = {
      show: true,
      message: 'กรุณากรอกความคิดเห็นรวมก่อนส่งการประเมิน',
      color: 'error'
    }
    return
  }

  submitting.value = true

  try {
    // แปลง signature เป็น base64
    const signatureData = signatureCanvas.value.toDataURL('image/png')

    // บันทึกความคิดเห็นรวม
    const commentResponse = await api.addComment({
      allocationId: allocationId.value,
      comment: overallComment.value
    })

    if (!commentResponse.success) {
      throw new Error(commentResponse.message || 'เกิดข้อผิดพลาดในการบันทึกความคิดเห็น')
    }

    // บันทึกลายเซ็น
    const signatureResponse = await api.saveSignature({
      allocationId: allocationId.value,
      signature: signatureData
    })

    if (!signatureResponse.success) {
      throw new Error(signatureResponse.message || 'เกิดข้อผิดพลาดในการบันทึกลายเซ็น')
    }

    // ส่งการประเมิน
    const submitResponse = await api.submitEvaluation({
      allocationId: allocationId.value
    })

    if (submitResponse.success) {
      snackbar.value = {
        show: true,
        message: submitResponse.message || 'ส่งการประเมินสำเร็จ',
        color: 'success'
      }

      // กลับไปหน้าหลัก
      setTimeout(() => {
        router.push('/evaluator/dashboard')
      }, 2000)
    } else {
      throw new Error(submitResponse.message || 'เกิดข้อผิดพลาดในการส่งการประเมิน')
    }
  } catch (error) {
    console.error('Error submitting evaluation:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการส่งการประเมิน',
      color: 'error'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.signature-container {
  border: 2px solid #ccc;
  display: inline-block;
  cursor: crosshair;
  background-color: white;
}

canvas {
  display: block;
}
</style>
