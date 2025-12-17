<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-account-multiple-check</v-icon>
        มอบหมายกรรมการประเมิน
        <v-spacer></v-spacer>
        <!-- เลือกรอบการประเมิน -->
        <v-select
          v-model="selectedEvaluationId"
          :items="evaluations"
          item-title="period"
          item-value="id"
          label="เลือกรอบการประเมิน"
          style="max-width: 300px"
          class="mr-4"
          @update:modelValue="loadAllocations"
        ></v-select>
        <!-- ปุ่มมอบหมายใหม่ -->
        <v-btn color="primary" @click="openCreateDialog" :disabled="!selectedEvaluationId">
          <v-icon left>mdi-plus</v-icon>
          มอบหมายกรรมการ
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ตารางแสดงการมอบหมาย -->
    <v-card v-if="!loading && selectedEvaluationId">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="allocations"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์ผู้รับการประเมิน -->
          <template v-slot:item.evaluateeName="{ item }">
            {{ item.evaluateeName || '-' }}
          </template>

          <!-- คอลัมน์กรรมการประเมิน -->
          <template v-slot:item.evaluatorName="{ item }">
            {{ item.evaluatorName || '-' }}
            <br>
            <small class="text-grey" v-if="item.evaluatorRole">{{ item.evaluatorRole }}</small>
          </template>

          <!-- คอลัมน์สถานะ -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark small>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- คอลัมน์วันที่มอบหมาย -->
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- แสดงข้อความเมื่อยังไม่เลือกรอบการประเมิน -->
    <v-card v-if="!loading && !selectedEvaluationId" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-information-outline</v-icon>
      <div class="text-h6 mt-4">กรุณาเลือกรอบการประเมินก่อน</div>
    </v-card>

    <!-- Dialog สำหรับมอบหมายกรรมการ -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">มอบหมายกรรมการประเมิน</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <!-- เลือกผู้รับการประเมิน (พนักงาน) -->
            <v-select
              v-model="formData.evaluateeId"
              :items="employees"
              item-title="name"
              item-value="id"
              label="เลือกผู้รับการประเมิน *"
              :rules="[v => !!v || 'กรุณาเลือกผู้รับการประเมิน']"
              required
              variant="outlined"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:subtitle>
                    {{ item.raw.email }} - {{ item.raw.position }}
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <!-- เลือกกรรมการประเมิน -->
            <v-select
              v-model="formData.evaluatorId"
              :items="evaluators"
              item-title="name"
              item-value="id"
              label="เลือกกรรมการประเมิน *"
              :rules="[v => !!v || 'กรุณาเลือกกรรมการประเมิน']"
              required
              variant="outlined"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:subtitle>
                    {{ item.raw.email }} - {{ item.raw.position }}
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <!-- บทบาทของกรรมการ (ถ้ามี) -->
            <v-text-field
              v-model="formData.evaluatorRole"
              label="บทบาทของกรรมการ (เช่น หัวหน้างาน, ผู้จัดการ)"
              variant="outlined"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog" :disabled="saving">
            ยกเลิก
          </v-btn>
          <v-btn color="primary" @click="saveAllocation" :loading="saving" :disabled="!valid">
            มอบหมาย
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

// กำหนด middleware
definePageMeta({
  middleware: 'admin'
})

// ตัวแปรต่างๆ
const api = useApi()
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const valid = ref(false)
const form = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลรอบการประเมิน
const evaluations = ref([])
const selectedEvaluationId = ref(null)

// ข้อมูลการมอบหมาย
const allocations = ref([])

// ข้อมูลพนักงานและกรรมการ
const employees = ref([])
const evaluators = ref([])

// ข้อมูลฟอร์ม
const formData = ref({
  evaluationId: null,
  evaluateeId: null,
  evaluatorId: null,
  evaluatorRole: null
})

// หัวตาราง
const headers = [
  { title: 'ผู้รับการประเมิน', key: 'evaluateeName', sortable: false },
  { title: 'กรรมการประเมิน', key: 'evaluatorName', sortable: false },
  { title: 'สถานะ', key: 'status', sortable: true },
  { title: 'วันที่มอบหมาย', key: 'createdAt', sortable: true }
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

// ฟังก์ชันโหลดพนักงานและกรรมการ
const loadEmployeesAndEvaluators = async () => {
  try {
    const response = await api.getEmployees()
    if (response.success && response.data) {
      const allEmployees = response.data

      // แยกพนักงานและกรรมการ
      employees.value = allEmployees.filter(e => e.role === 'employee')
      evaluators.value = allEmployees.filter(e => e.role === 'evaluator' || e.role === 'admin')
    }
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

// ฟังก์ชันโหลดการมอบหมาย
const loadAllocations = async () => {
  if (!selectedEvaluationId.value) return

  loading.value = true
  try {
    const response = await api.getAllocations(selectedEvaluationId.value)
    if (response.success && response.data) {
      allocations.value = response.data
    }
  } catch (error) {
    console.error('Error loading allocations:', error)
    snackbar.value = {
      show: true,
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

// เปิด Dialog สร้างใหม่
const openCreateDialog = () => {
  formData.value = {
    evaluationId: selectedEvaluationId.value,
    evaluateeId: null,
    evaluatorId: null,
    evaluatorRole: null
  }
  dialog.value = true
}

// ปิด Dialog
const closeDialog = () => {
  dialog.value = false
  form.value?.reset()
}

// บันทึกข้อมูล
const saveAllocation = async () => {
  // ตรวจสอบฟอร์ม
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const response = await api.createAllocation(formData.value)

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || 'มอบหมายกรรมการสำเร็จ',
        color: 'success'
      }
      closeDialog()
      loadAllocations()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving allocation:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการมอบหมาย',
      color: 'error'
    }
  } finally {
    saving.value = false
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
    pending: 'รอดำเนินการ',
    'self-evaluated': 'ประเมินตนเองแล้ว',
    'evaluator-scored': 'กรรมการให้คะแนนแล้ว',
    completed: 'เสร็จสมบูรณ์'
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadEvaluations()
  loadEmployeesAndEvaluators()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
