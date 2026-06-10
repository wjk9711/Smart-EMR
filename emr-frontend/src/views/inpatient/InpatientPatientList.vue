<template>
  <div class="inpatient-patient-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>住院患者列表</span>
          <div class="header-actions">
            <el-button v-if="userStore.userInfo?.roleType === 'admin'" type="warning" @click="handleAssignPatients" :disabled="selectedPatients.length === 0">
              <el-icon><Share /></el-icon>
              下发患者 ({{ selectedPatients.length }})
            </el-button>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增患者
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchParams.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="住院号">
          <el-input v-model="searchParams.inpatientNo" placeholder="请输入住院号" clearable />
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="searchParams.department" placeholder="请选择科室" clearable style="width: 150px">
            <el-option label="内科" value="内科" />
            <el-option label="外科" value="外科" />
            <el-option label="儿科" value="儿科" />
            <el-option label="妇产科" value="妇产科" />
            <el-option label="骨科" value="骨科" />
            <el-option label="神经科" value="神经科" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="在院" value="admitted" />
            <el-option label="出院" value="discharged" />
            <el-option label="转科" value="transferred" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 患者表格 -->
      <el-table 
        :data="patientList" 
        v-loading="loading" 
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="userStore.userInfo?.roleType === 'admin'" type="selection" width="55" />
        <el-table-column v-if="userStore.userInfo?.roleType !== 'admin'" prop="isTemplate" label="模板" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isTemplate" type="success" size="small">模板</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="inpatientNo" label="住院号" width="140" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="bedNo" label="床号" width="100" />
        <el-table-column prop="admissionDate" label="入院日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="320">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="handleViewRecords(row)">病案</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 患者表单对话框 -->
    <InpatientPatientForm
      v-model:visible="dialogVisible"
      :patient-data="currentPatient"
      @success="fetchPatients"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Share } from '@element-plus/icons-vue'
import InpatientPatientForm from './InpatientPatientForm.vue'
import { getInpatientPatients, deleteInpatientPatient, assignPatientsToAllUsers } from '@/api/inpatient'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const patientList = ref<any[]>([])
const dialogVisible = ref(false)
const currentPatient = ref<any>(null)
const selectedPatients = ref<any[]>([])

const searchParams = reactive({
  name: '',
  inpatientNo: '',
  department: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const fetchPatients = async () => {
  loading.value = true
  try {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    const response: any = await getInpatientPatients({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchParams,
    })
    
    // 响应拦截器已经提取了res.data，所以直接访问response.list
    patientList.value = response.list || []
    pagination.total = response.total || 0
  } catch (error: any) {
    console.error('Failed to fetch patients:', error)
    ElMessage.error(error.message || '加载患者列表失败')
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
  searchParams.inpatientNo = ''
  searchParams.department = ''
  searchParams.status = ''
  handleSearch()
}

const handleCreate = () => {
  currentPatient.value = null
  dialogVisible.value = true
}

const handleView = (row: any) => {
  // TODO: 查看患者详情
  ElMessage.info('查看患者详情功能开发中')
}

const handleEdit = (row: any) => {
  currentPatient.value = row
  dialogVisible.value = true
}

const handleViewRecords = (row: any) => {
  // 跳转到该患者的病案列表
  router.push({
    path: '/inpatient/records',
    query: { patientId: row.id, patientName: row.name }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除患者"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteInpatientPatient(row.id)
    
    ElMessage.success('删除成功')
    fetchPatients()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete patient:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    admitted: 'success',
    discharged: 'info',
    transferred: 'warning',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    admitted: '在院',
    discharged: '出院',
    transferred: '转科',
  }
  return texts[status] || status
}

const handleSelectionChange = (selection: any[]) => {
  selectedPatients.value = selection
}

const handleAssignPatients = async () => {
  if (selectedPatients.value.length === 0) {
    ElMessage.warning('请选择要下发的患者')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedPatients.value.length} 个患者下发给所有非管理员用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const patientIds = selectedPatients.value.map(p => p.id)
    await assignPatientsToAllUsers({ patientIds })
    
    ElMessage.success('下发成功')
    selectedPatients.value = []
    fetchPatients()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to assign patients:', error)
      ElMessage.error(error.message || '下发失败')
    }
  }
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped lang="scss">
.inpatient-patient-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
