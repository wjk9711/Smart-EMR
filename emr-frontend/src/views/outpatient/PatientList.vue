<template>
  <div class="patient-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>患者列表</span>
          <div class="header-actions">
            <el-button @click="handleGoToRecords">病历列表</el-button>
            <el-button type="primary" @click="handleCreate">新建患者</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchParams.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="病历号">
          <el-input v-model="searchParams.patientNo" placeholder="请输入病历号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 患者表格 -->
      <el-table :data="patientList" v-loading="loading" stripe>
        <el-table-column prop="patientNo" label="病历号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="birthDate" label="出生日期" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleVisit(row)">就诊</el-button>
            <el-button size="small" type="warning" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchPatients"
        @current-change="fetchPatients"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新建/编辑患者对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="patientFormRef" :model="patientForm" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="patientForm.name" />
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="patientForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" required>
          <el-date-picker v-model="patientForm.birthDate" type="date" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="patientForm.idCard" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="patientForm.phone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="patientForm.address" type="textarea" />
        </el-form-item>
        <el-form-item label="医保号">
          <el-input v-model="patientForm.insuranceNo" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { getPatients, createPatient, updatePatient } from '@/api/patient'
import type { Patient } from '@/types/patient'

const router = useRouter()

const loading = ref(false)
const patientList = ref<Patient[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建患者')
const patientFormRef = ref<FormInstance>()

const searchParams = reactive({
  name: '',
  patientNo: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const patientForm = reactive<Partial<Patient>>({
  name: '',
  gender: 'male',
  birthDate: '',
  idCard: '',
  phone: '',
  address: '',
  insuranceNo: '',
})

const fetchPatients = async () => {
  loading.value = true
  try {
    const response = await getPatients({
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    patientList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('Failed to fetch patients:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchPatients()
}

const handleReset = () => {
  searchParams.name = ''
  searchParams.patientNo = ''
  handleSearch()
}

const handleGoToRecords = () => {
  router.push('/outpatient/records')
}

const handleCreate = () => {
  dialogTitle.value = '新建患者'
  dialogVisible.value = true
}

const handleView = (row: Patient) => {
  // TODO: 查看患者详情
  console.log('View patient:', row)
}

const handleVisit = (row: Patient) => {
  // 跳转到新建病历页面，并传递patientId
  router.push({
    path: '/outpatient/record/create',
    query: { patientId: row.id }
  })
}

const handleEdit = (row: Patient) => {
  dialogTitle.value = '编辑患者'
  Object.assign(patientForm, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  // TODO: 表单验证和提交
  try {
    if (patientForm.id) {
      await updatePatient(patientForm.id, patientForm)
      ElMessage.success('更新成功')
    } else {
      await createPatient(patientForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchPatients()
  } catch (error) {
    console.error('Failed to save patient:', error)
  }
}

const handleDialogClose = () => {
  Object.assign(patientForm, {
    name: '',
    gender: 'male',
    birthDate: '',
    idCard: '',
    phone: '',
    address: '',
    insuranceNo: '',
  })
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped lang="scss">
.patient-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
