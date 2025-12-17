<template>
  <div>
    <!-- หัวข้อหน้า -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon left>mdi-chart-line</v-icon>
        จัดการตัวชี้วัด
        <v-spacer></v-spacer>
        <!-- เลือกหัวข้อ -->
        <v-select
          v-model="selectedTopicId"
          :items="topics"
          item-title="title"
          item-value="id"
          label="เลือกหัวข้อ"
          style="max-width: 300px"
          class="mr-4"
          @update:modelValue="loadIndicators"
        ></v-select>
        <!-- ปุ่มเพิ่มตัวชี้วัดใหม่ -->
        <v-btn color="primary" @click="openCreateDialog" :disabled="!selectedTopicId">
          <v-icon left>mdi-plus</v-icon>
          เพิ่มตัวชี้วัด
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- แสดง Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- ตารางแสดงตัวชี้วัด -->
    <v-card v-if="!loading && selectedTopicId">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="indicators"
          :items-per-page="10"
          class="elevation-1"
        >
          <!-- คอลัมน์ประเภท -->
          <template v-slot:item.indicatorType="{ item }">
            <v-chip size="small" :color="item.indicatorType === 'quantitative' ? 'primary' : 'secondary'">
              {{ item.indicatorType === 'quantitative' ? 'เชิงปริมาณ' : 'เชิงคุณภาพ' }}
            </v-chip>
          </template>

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
              @click="openLevelsDialog(item)"
              class="mr-2"
            >
              <v-icon left>mdi-format-list-numbered</v-icon>
              ระดับคะแนน
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

    <!-- แสดงข้อความเมื่อยังไม่เลือกหัวข้อ -->
    <v-card v-if="!loading && !selectedTopicId" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-information-outline</v-icon>
      <div class="text-h6 mt-4">กรุณาเลือกหัวข้อก่อน</div>
    </v-card>

    <!-- Dialog สำหรับสร้าง/แก้ไขตัวชี้วัด -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? 'แก้ไขตัวชี้วัด' : 'เพิ่มตัวชี้วัดใหม่' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <!-- ชื่อตัวชี้วัด -->
            <v-text-field
              v-model="formData.title"
              label="ชื่อตัวชี้วัด *"
              :rules="[v => !!v || 'กรุณากรอกชื่อตัวชี้วัด']"
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

            <!-- ประเภทตัวชี้วัด -->
            <v-select
              v-model="formData.indicatorType"
              :items="[
                { title: 'เชิงปริมาณ', value: 'quantitative' },
                { title: 'เชิงคุณภาพ', value: 'qualitative' }
              ]"
              label="ประเภทตัวชี้วัด *"
              :rules="[v => !!v || 'กรุณาเลือกประเภท']"
              required
              variant="outlined"
            ></v-select>

            <!-- คำอธิบายหลักฐาน -->
            <v-textarea
              v-model="formData.evidenceDescription"
              label="คำอธิบายหลักฐาน"
              rows="2"
              variant="outlined"
            ></v-textarea>

            <!-- น้ำหนัก -->
            <v-text-field
              v-model.number="formData.weight"
              label="น้ำหนัก *"
              type="number"
              step="0.01"
              :rules="[
                v => v !== null && v !== '' || 'กรุณากรอกน้ำหนัก',
                v => v > 0 || 'น้ำหนักต้องมากกว่า 0'
              ]"
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
          <v-btn color="primary" @click="saveIndicator" :loading="saving" :disabled="!valid">
            บันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog สำหรับจัดการระดับคะแนน -->
    <v-dialog v-model="levelsDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">จัดการระดับคะแนน - {{ selectedIndicator?.title }}</span>
        </v-card-title>

        <v-card-text>
          <!-- แสดงระดับคะแนนที่มีอยู่ -->
          <v-list v-if="selectedIndicator?.levels && selectedIndicator.levels.length > 0">
            <v-list-item v-for="level in selectedIndicator.levels" :key="level.id">
              <v-list-item-title>
                ระดับ {{ level.level }}: {{ level.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>

          <!-- ฟอร์มเพิ่มระดับคะแนนใหม่ -->
          <div class="text-h6 mb-3">เพิ่มระดับคะแนนใหม่</div>
          <v-form ref="levelForm" v-model="levelValid">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="levelFormData.level"
                  label="ระดับ *"
                  type="number"
                  :rules="[v => v !== null && v !== '' || 'กรุณากรอกระดับ']"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="levelFormData.title"
                  label="คำอธิบายระดับ *"
                  :rules="[v => !!v || 'กรุณากรอกคำอธิบาย']"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn color="primary" @click="addLevel" :loading="addingLevel" :disabled="!levelValid">
                  <v-icon left>mdi-plus</v-icon>
                  เพิ่มระดับคะแนน
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeLevelsDialog">
            ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog ยืนยันการลบ -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>ยืนยันการลบ</v-card-title>
        <v-card-text>
          คุณต้องการลบตัวชี้วัด "{{ itemToDelete?.name }}" ใช่หรือไม่?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false" :disabled="deleting">
            ยกเลิก
          </v-btn>
          <v-btn color="error" @click="deleteIndicator" :loading="deleting">
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

// ตัวแปรต่างๆ
const api = useApi()
const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const addingLevel = ref(false)
const dialog = ref(false)
const levelsDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const valid = ref(false)
const levelValid = ref(false)
const form = ref(null)
const levelForm = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// ข้อมูลหัวข้อ
const topics = ref([])
const selectedTopicId = ref(null)

// ข้อมูลตัวชี้วัด
const indicators = ref([])
const selectedIndicator = ref(null)
const itemToDelete = ref(null)

// ข้อมูลฟอร์ม
const formData = ref({
  id: null,
  title: '',
  description: '',
  indicatorType: 'quantitative',
  evidenceDescription: '',
  weight: 1.00,
  topicId: null
})

// ข้อมูลฟอร์มระดับคะแนน
const levelFormData = ref({
  level: 1,
  title: ''
})

// หัวตาราง
const headers = [
  { title: 'ชื่อตัวชี้วัด', key: 'title', sortable: true },
  { title: 'ประเภท', key: 'indicatorType', sortable: true },
  { title: 'น้ำหนัก', key: 'weight', sortable: true },
  { title: 'จัดการ', key: 'actions', sortable: false, width: '320' }
]

// ฟังก์ชันโหลดหัวข้อ
const loadTopics = async () => {
  try {
    // ต้องโหลดทุก evaluation แล้วเอา topic ทั้งหมด
    const evalResponse = await api.getEvaluations()
    const evaluations = (evalResponse.success && evalResponse.data) ? evalResponse.data : []

    // โหลด topic จากทุก evaluation
    let allTopics = []
    for (const evaluation of evaluations) {
      const topicResponse = await api.getTopics(evaluation.id)
      if (topicResponse.success && topicResponse.data) {
        allTopics = [...allTopics, ...topicResponse.data]
      }
    }

    topics.value = allTopics

    // ถ้ามี topicId จาก query string
    if (route.query.topicId) {
      selectedTopicId.value = parseInt(route.query.topicId)
      loadIndicators()
    }
  } catch (error) {
    console.error('Error loading topics:', error)
  }
}

// ฟังก์ชันโหลดตัวชี้วัด
const loadIndicators = async () => {
  if (!selectedTopicId.value) return

  loading.value = true
  try {
    const response = await api.getIndicators(selectedTopicId.value)
    if (response.success && response.data) {
      indicators.value = response.data
    }
  } catch (error) {
    console.error('Error loading indicators:', error)
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
    indicatorType: 'quantitative',
    evidenceDescription: '',
    weight: 1.00,
    topicId: selectedTopicId.value
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
    indicatorType: item.indicatorType || 'quantitative',
    evidenceDescription: item.evidenceDescription || '',
    weight: item.weight,
    topicId: item.topicId
  }
  dialog.value = true
}

// ปิด Dialog
const closeDialog = () => {
  dialog.value = false
  form.value?.reset()
}

// บันทึกข้อมูล
const saveIndicator = async () => {
  // ตรวจสอบฟอร์ม
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    let response
    const payload = {
      topicId: formData.value.topicId,
      title: formData.value.title,
      description: formData.value.description,
      indicatorType: formData.value.indicatorType,
      evidenceDescription: formData.value.evidenceDescription,
      weight: formData.value.weight
    }

    if (isEdit.value) {
      response = await api.updateIndicator(formData.value.id, payload)
    } else {
      response = await api.createIndicator(payload)
    }

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || (isEdit.value ? 'แก้ไขตัวชี้วัดสำเร็จ' : 'เพิ่มตัวชี้วัดสำเร็จ'),
        color: 'success'
      }
      closeDialog()
      await loadIndicators()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error saving indicator:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      color: 'error'
    }
  } finally {
    saving.value = false
  }
}

// เปิด Dialog ระดับคะแนน
const openLevelsDialog = (item) => {
  selectedIndicator.value = item
  levelFormData.value = {
    level: 1,
    title: ''
  }
  levelsDialog.value = true
}

// ปิด Dialog ระดับคะแนน
const closeLevelsDialog = () => {
  levelsDialog.value = false
  selectedIndicator.value = null
  levelForm.value?.reset()
  loadIndicators() // โหลดข้อมูลใหม่เพื่ออัปเดต levels
}

// เพิ่มระดับคะแนน
const addLevel = async () => {
  // ตรวจสอบฟอร์ม
  const { valid } = await levelForm.value.validate()
  if (!valid) return

  addingLevel.value = true
  try {
    const response = await api.createIndicatorLevel(selectedIndicator.value.id, levelFormData.value)

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || 'เพิ่มระดับคะแนนสำเร็จ',
        color: 'success'
      }

      // โหลดข้อมูลใหม่
      await loadIndicators()

      // อัปเดต selectedIndicator
      selectedIndicator.value = indicators.value.find(i => i.id === selectedIndicator.value.id)

      // รีเซ็ตฟอร์ม
      levelFormData.value = {
        level: levelFormData.value.level + 1,
        title: ''
      }
      levelForm.value?.reset()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error adding level:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มระดับคะแนน',
      color: 'error'
    }
  } finally {
    addingLevel.value = false
  }
}

// ยืนยันการลบ
const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

// ลบตัวชี้วัด
const deleteIndicator = async () => {
  deleting.value = true
  try {
    const response = await api.deleteIndicator(itemToDelete.value.id)

    // ตรวจสอบ response.success
    if (response.success) {
      snackbar.value = {
        show: true,
        message: response.message || 'ลบตัวชี้วัดสำเร็จ',
        color: 'success'
      }
      deleteDialog.value = false
      loadIndicators()
    } else {
      snackbar.value = {
        show: true,
        message: response.message || 'เกิดข้อผิดพลาด',
        color: 'error'
      }
    }
  } catch (error) {
    console.error('Error deleting indicator:', error)
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
  loadTopics()
})
</script>

<style scoped>
/* สไตล์เพิ่มเติมถ้าต้องการ */
</style>
