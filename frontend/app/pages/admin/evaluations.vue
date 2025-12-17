<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-clipboard-list</v-icon>
        จัดการรอบการประเมิน
        <v-spacer></v-spacer>
        <!-- ปุ่มเพิ่มรอบการประเมินใหม่ -->
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          สร้างรอบการประเมิน
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ตารางแสดงรอบการประเมิน -->
    <v-card v-if="!loading">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="evaluations"
          :items-per-page="10"
          class="elevation-1"
        >
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
              @click="openEditDialog(item)"
              class="mr-2"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              size="small"
              color="info"
              :to="`/admin/topics?evaluationId=${item.id}`"
            >
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog สำหรับสร้าง/แก้ไขรอบการประเมิน -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? 'แก้ไขรอบการประเมิน' : 'สร้างรอบการประเมินใหม่' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <!-- ช่วงเวลา -->
            <v-text-field
              v-model="formData.period"
              label="ช่วงเวลา (เช่น Q1-Q2, ครั้งที่ 1) *"
              :rules="[v => !!v || 'กรุณากรอกช่วงเวลา']"
              required
              variant="outlined"
            ></v-text-field>

            <!-- ปี พ.ศ. -->
            <v-text-field
              v-model.number="formData.evaluationYear"
              label="ปี พ.ศ. *"
              type="number"
              :rules="[v => !!v || 'กรุณากรอกปี พ.ศ.']"
              required
              variant="outlined"
            ></v-text-field>

            <!-- วันที่เริ่มต้น -->
            <v-text-field
              v-model="formData.startDate"
              label="วันที่เริ่มต้น *"
              type="date"
              :rules="[v => !!v || 'กรุณาเลือกวันที่เริ่มต้น']"
              required
              variant="outlined"
            ></v-text-field>

            <!-- วันที่สิ้นสุด -->
            <v-text-field
              v-model="formData.endDate"
              label="วันที่สิ้นสุด *"
              type="date"
              :rules="[v => !!v || 'กรุณาเลือกวันที่สิ้นสุด']"
              required
              variant="outlined"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog" :disabled="saving">
            ยกเลิก
          </v-btn>
          <v-btn color="primary" @click="saveEvaluation" :loading="saving" :disabled="!valid">
            บันทึก
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
const isEdit = ref(false)
const valid = ref(false)
const form = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลรอบการประเมิน
const evaluations = ref([])

// ข้อมูลฟอร์ม
const formData = ref({
  id: null,
  period: '',
  evaluationYear: new Date().getFullYear() + 543,
  startDate: '',
  endDate: ''
})

// หัวตาราง
const headers = [
  { title: 'ช่วงเวลา', key: 'period', sortable: true },
  { title: 'ปี พ.ศ.', key: 'evaluationYear', sortable: true },
  { title: 'วันที่เริ่มต้น', key: 'startDate', sortable: true },
  { title: 'วันที่สิ้นสุด', key: 'endDate', sortable: true },
  { title: 'จัดการ', key: 'actions', sortable: false, width: '250' }
]

// ฟังก์ชันโหลดข้อมูล
const loadEvaluations = async () => {
  loading.value = true
  try {
    const response = await api.getEvaluations()
    if (response.success && response.data) {
      evaluations.value = response.data
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

// เปิด Dialog สร้างใหม่
const openCreateDialog = () => {
  isEdit.value = false
  formData.value = {
    id: null,
    period: '',
    evaluationYear: new Date().getFullYear() + 543,
    startDate: '',
    endDate: ''
  }
  dialog.value = true
}

// เปิด Dialog แก้ไข
const openEditDialog = (item) => {
  isEdit.value = true
  formData.value = {
    id: item.id,
    period: item.period,
    evaluationYear: item.evaluationYear,
    startDate: item.startDate ? item.startDate.split('T')[0] : '',
    endDate: item.endDate ? item.endDate.split('T')[0] : ''
  }
  dialog.value = true
}

// ปิด Dialog
const closeDialog = () => {
  dialog.value = false
  form.value?.reset()
}

// บันทึกข้อมูล
const saveEvaluation = async () => {
  // ตรวจสอบฟอร์ม
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    let response
    const payload = {
      period: formData.value.period,
      evaluationYear: formData.value.evaluationYear,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate
    }

    if (isEdit.value) {
      response = await api.updateEvaluation(formData.value.id, payload)
    } else {
      response = await api.createEvaluation(payload)
    }

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || (isEdit.value ? 'แก้ไขสำเร็จ' : 'สร้างสำเร็จ'),
        color: 'success'
      }
      closeDialog()
      await loadEvaluations()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving evaluation:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาด',
      color: 'error'
    }
  } finally {
    saving.value = false
  }
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
  loadEvaluations()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
