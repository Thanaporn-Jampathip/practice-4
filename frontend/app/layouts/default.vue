<template>
  <v-app>
    <!-- App Bar (แถบด้านบน) -->
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>ระบบประเมินบุคลากร</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- แสดงเมื่อ login แล้ว -->
      <div v-if="authStore.isLoggedIn">
        <v-chip color="white" variant="outlined" class="mr-4">
          <v-icon left>mdi-account-circle</v-icon>
          {{ authStore.getUserName }} ({{ getRoleText(authStore.getUserRole) }})
        </v-chip>
        <v-btn @click="handleLogout" color="white" variant="text">
          <v-icon left>mdi-logout</v-icon>
          ออกจากระบบ
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Navigation Drawer (เมนูด้านข้าง) -->
    <v-navigation-drawer v-model="drawer" v-if="authStore.isLoggedIn">
      <!-- ข้อมูลผู้ใช้ -->
      <v-list>
        <v-list-item
          :prepend-avatar="`https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.getUserName)}&background=1976D2&color=fff`"
          :title="authStore.getUserName"
          :subtitle="getRoleText(authStore.getUserRole)"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- เมนูสำหรับ Admin -->
      <v-list v-if="authStore.isAdmin" nav>
        <v-list-subheader>เมนู Admin</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/admin/dashboard"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-clipboard-list"
          title="รอบการประเมิน"
          to="/admin/evaluations"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-format-list-bulleted"
          title="หัวข้อการประเมิน"
          to="/admin/topics"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-chart-line"
          title="ตัวชี้วัด"
          to="/admin/indicators"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account-multiple-check"
          title="มอบหมายกรรมการ"
          to="/admin/allocations"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account-group"
          title="พนักงานทั้งหมด"
          to="/admin/employees"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="รายงาน"
          to="/reports"
          active-color="primary"
        ></v-list-item>
      </v-list>

      <!-- เมนูสำหรับ Evaluator (ไม่ใช่ Admin) -->
      <v-list v-else-if="authStore.isEvaluator && !authStore.isAdmin" nav>
        <v-list-subheader>เมนู Evaluator</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/evaluator/dashboard"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-clipboard-check"
          title="รายการประเมิน"
          to="/evaluator/dashboard"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="รายงาน"
          to="/reports"
          active-color="primary"
        ></v-list-item>
      </v-list>

      <!-- เมนูสำหรับ Employee -->
      <v-list v-else-if="authStore.isEmployee" nav>
        <v-list-subheader>เมนู Employee</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/employee/dashboard"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account"
          title="ข้อมูลส่วนตัว"
          to="/employee/profile"
          active-color="primary"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-clipboard-text"
          title="การประเมินของฉัน"
          to="/employee/dashboard"
          active-color="primary"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- เมนูทั่วไป -->
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-help-circle"
          title="คู่มือการใช้งาน"
          @click="showHelp"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content (เนื้อหาหลัก) -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app color="grey-lighten-3" class="text-center">
      <v-col class="text-center" cols="12">
        <div class="text-caption">
          ระบบประเมินบุคลากร © {{ new Date().getFullYear() }}
        </div>
      </v-col>
    </v-footer>

    <!-- Dialog คู่มือการใช้งาน -->
    <v-dialog v-model="helpDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-help-circle</v-icon>
          คู่มือการใช้งาน
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-h6 mb-2">สำหรับ Admin:</div>
            <ul>
              <li>สร้างและจัดการรอบการประเมิน</li>
              <li>กำหนดหัวข้อและตัวชี้วัดการประเมิน</li>
              <li>มอบหมายกรรมการให้ผู้รับการประเมิน</li>
              <li>ดูรายงานสรุปผลการประเมิน</li>
            </ul>
          </div>

          <div class="mb-4">
            <div class="text-h6 mb-2">สำหรับ Evaluator (กรรมการ):</div>
            <ul>
              <li>ดูรายการผู้ที่ได้รับมอบหมายให้ประเมิน</li>
              <li>ให้คะแนนและความคิดเห็นแก่ผู้รับการประเมิน</li>
              <li>ลงนามยืนยันการประเมิน</li>
            </ul>
          </div>

          <div class="mb-4">
            <div class="text-h6 mb-2">สำหรับ Employee (พนักงาน):</div>
            <ul>
              <li>ประเมินตนเองตามตัวชี้วัดที่กำหนด</li>
              <li>อัปโหลดหลักฐานประกอบการประเมิน</li>
              <li>ดูผลการประเมินจากกรรมการ</li>
            </ul>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="helpDialog = false">
            ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// ใช้ auth store
const authStore = useAuthStore()
const router = useRouter()

// ตัวแปร
const drawer = ref(true)
const helpDialog = ref(false)

// โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
onMounted(async () => {
  await authStore.loadFromStorage()
})

// ฟังก์ชัน logout
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// แปลง role เป็นข้อความ
const getRoleText = (role) => {
  const texts = {
    admin: 'บุคลากร',
    evaluator: 'กรรมการผู้ประเมิน',
    employee: 'ผู้รับการประเมิน'
  }
  return texts[role] || role
}

// แสดงคู่มือ
const showHelp = () => {
  helpDialog.value = true
}
</script>

<style scoped>
/* แก้ไข hover effect ของ v-list-item */
:deep(.v-list-item) {
  transition: background-color 0.2s ease;
}

:deep(.v-list-item:hover) {
  background-color: rgba(25, 118, 210, 0.08);
}

:deep(.v-list-item--active) {
  background-color: rgba(25, 118, 210, 0.12);
  color: rgb(25, 118, 210);
}

:deep(.v-list-item--active .v-icon) {
  color: rgb(25, 118, 210);
}
</style>
