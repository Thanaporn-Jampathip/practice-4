<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-format-list-bulleted</v-icon>
        จัดการหัวข้อการประเมิน
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
          @update:modelValue="loadTopics"
        ></v-select>
        <!-- ปุ่มเพิ่มหัวข้อใหม่ -->
        <v-btn color="primary" @click="openCreateDialog" :disabled="!selectedEvaluationId">
          <v-icon left>mdi-plus</v-icon>
          เพิ่มหัวข้อ
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ตารางแสดงหัวข้อ -->
    <v-card v-if="!loading && selectedEvaluationId">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="topics"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์จัดการ -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              size="small"
              color="primary"
              @click="openEditDialog(item)"
              class="mr-2"
            >
              <v-icon left>mdi-pencil</v-icon>
              แก้ไข
            </v-btn>
            <v-btn
              size="small"
              color="info"
              :to="`/admin/indicators?topicId=${item.id}`"
              class="mr-2"
            >
              <v-icon left>mdi-chart-line</v-icon>
              ตัวชี้วัด
            </v-btn>
            <v-btn
              size="small"
              color="error"
              @click="confirmDelete(item)"
            >
              <v-icon left>mdi-delete</v-icon>
              ลบ
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- แสดงข้อความเมื่อยังไม่เลือกรอบการประเมิน -->
    <v-card v-if="!loading && !selectedEvaluationId" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-information-outline</v-icon>
      <div class="text-h6 mt-4">กรุณาเลือกรอบการประเมินก่อน</div>
    </v-card>

    <!-- Dialog สำหรับสร้าง/แก้ไขหัวข้อ -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? 'แก้ไขหัวข้อ' : 'เพิ่มหัวข้อใหม่' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <!-- ชื่อหัวข้อ -->
            <v-text-field
              v-model="formData.title"
              label="ชื่อหัวข้อ *"
              :rules="[v => !!v || 'กรุณากรอกชื่อหัวข้อ']"
              required
              variant="outlined"
            ></v-text-field>

            <!-- คำอธิบาย -->
            <v-textarea
              v-model="formData.description"
              label="คำอธิบาย"
              rows="3"
              variant="outlined"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDialog" :disabled="saving">
            ยกเลิก
          </v-btn>
          <v-btn color="primary" @click="saveTopic" :loading="saving" :disabled="!valid">
            บันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog ยืนยันการลบ -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>ยืนยันการลบ</v-card-title>
        <v-card-text>
          คุณต้องการลบหัวข้อ "{{ itemToDelete?.title }}" ใช่หรือไม่?
          <br><span class="text-error">หมายเหตุ: การลบหัวข้อจะลบตัวชี้วัดทั้งหมดที่เกี่ยวข้องด้วย</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false" :disabled="deleting">
            ยกเลิก
          </v-btn>
          <v-btn color="error" @click="deleteTopic" :loading="deleting">
            ลบ
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
import { useRoute } from 'vue-router'

// กำหนด middleware
definePageMeta({
  middleware: 'admin'
})

// ใช้ composables
const api = useApi()
const route = useRoute()

const isEdit = ref(false)
const valid = ref(false)
const form = ref(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลรอบการประเมิน
const evaluations = ref([])
const selectedEvaluationId = ref(null)

// ข้อมูลหัวข้อ
const topics = ref([])
const itemToDelete = ref(null)

// ข้อมูลฟอร์ม
const formData = ref({
  id: null,
  title: '',
  description: '',
  evaluationId: null
})

// หัวตาราง
const headers = [
  { title: 'ชื่อหัวข้อ', key: 'title', sortable: true },
  { title: 'คำอธิบาย', key: 'description', sortable: false },
  { title: 'จัดการ', key: 'actions', sortable: false, width: '300' }
]

// ฟังก์ชันโหลดรอบการประเมิน
const loadEvaluations = async () => {
  try {
    const response = await api.getEvaluations()
    if (response.success && response.data) {
      evaluations.value = response.data
    }

    // ถ้ามี evaluationId จาก query string
    if (route.query.evaluationId) {
      selectedEvaluationId.value = parseInt(route.query.evaluationId)
      loadTopics()
    }
  } catch (error) {
    console.error('Error loading evaluations:', error)
  }
}

// ฟังก์ชันโหลดหัวข้อ
const loadTopics = async () => {
  if (!selectedEvaluationId.value) return

  loading.value = true
  try {
    const response = await api.getTopics(selectedEvaluationId.value)
    if (response.success && response.data) {
      topics.value = response.data
    }
  } catch (error) {
    console.error('Error loading topics:', error)
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
    title: '',
    description: '',
    evaluationId: selectedEvaluationId.value
  }
  dialog.value = true
}

// เปิด Dialog แก้ไข
const openEditDialog = (item) => {
  isEdit.value = true
  formData.value = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    evaluationId: item.evaluationId
  }
  dialog.value = true
}

// ปิด Dialog
const closeDialog = () => {
  dialog.value = false
  form.value?.reset()
}

// บันทึกข้อมูล
const saveTopic = async () => {
  // ตรวจสอบฟอร์ม
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  saving.value = true
  try {
    let response
    const payload = {
      evaluationId: formData.value.evaluationId,
      title: formData.value.title,
      description: formData.value.description
    }

    if (isEdit.value) {
      response = await api.updateTopic(formData.value.id, payload)
    } else {
      response = await api.createTopic(payload)
    }

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || (isEdit.value ? 'แก้ไขหัวข้อสำเร็จ' : 'เพิ่มหัวข้อสำเร็จ'),
        color: 'success'
      }
      closeDialog()
      await loadTopics()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving topic:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      color: 'error'
    }
  } finally {
    saving.value = false
  }
}

// ยืนยันการลบ
const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

// ลบหัวข้อ
const deleteTopic = async () => {
  deleting.value = true
  try {
    const response = await api.deleteTopic(itemToDelete.value.id)
    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || 'ลบหัวข้อสำเร็จ',
        color: 'success'
      }
      deleteDialog.value = false
      await loadTopics()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error deleting topic:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
      color: 'error'
    }
  } finally {
    deleting.value = false
  }
}

// เรียกใช้เมื่อโหลดหน้า
onMounted(() => {
  loadEvaluations()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
