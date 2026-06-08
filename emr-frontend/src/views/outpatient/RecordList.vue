<template>
  <div class="record-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>病历列表</span>
          <div class="header-actions">
            <el-button @click="handleGoToPatients">患者列表</el-button>
            <el-button type="primary" @click="handleCreate">新建病历</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchParams.keyword" placeholder="请输入患者姓名或病历号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已完成" value="completed" />
            <el-option label="已审核" value="reviewed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button 
            type="danger" 
            @click="handleBatchDelete"
            :disabled="selectedRecords.length === 0"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedRecords.length }})
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 病历表格 -->
      <el-table 
        :data="recordList" 
        v-loading="loading" 
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="patientNo" label="病历号" width="120" />
        <el-table-column prop="chiefComplaint" label="主诉" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitStatus" label="提交状态" width="120" v-if="userStore.userInfo?.roleType === 'student'">
          <template #default="{ row }">
            <div 
              class="submit-status-cell"
              :class="getSubmitStatusClass(row.submitStatus)"
              @click="row.qualityComment ? showQualityComment(row) : null"
              :style="{ cursor: row.qualityComment ? 'pointer' : 'default' }"
            >
              <el-tag :type="getSubmitStatusType(row.submitStatus)">
                {{ getSubmitStatusText(row.submitStatus) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" :width="userStore.userInfo?.roleType === 'student' ? 280 : 200">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.status !== 'draft'"
              size="small" 
              type="primary" 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="userStore.userInfo?.roleType === 'student' && row.status === 'completed' && canSubmit(row)"
              size="small" 
              type="success" 
              @click="handleSubmit(row)"
            >
              提交
            </el-button>
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
        @size-change="fetchRecords"
        @current-change="fetchRecords"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 提交病历对话框 -->
    <el-dialog 
      v-model="submitDialogVisible" 
      title="提交病历给教师" 
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="患者姓名">
          <span>{{ currentRecord?.patientName }}</span>
        </el-form-item>
        <el-form-item label="主诉">
          <span>{{ currentRecord?.chiefComplaint }}</span>
        </el-form-item>
        <el-form-item label="选择教师" required>
          <el-select 
            v-model="selectedTeacherId" 
            placeholder="请选择教师" 
            style="width: 100%"
          >
            <el-option 
              v-for="teacher in teacherList" 
              :key="teacher.id" 
              :label="`${teacher.realName} (${teacher.username})`" 
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-alert
          :title="currentRecord?.submitStatus === 'rejected' ? '重新提交提示' : '提交提示'"
          type="info"
          :closable="false"
        >
          {{ 
            currentRecord?.submitStatus === 'rejected' 
              ? '病历已被退回，请根据教师质控意见修改后重新提交。' 
              : '提交后，病历将进入待检查状态，教师审核后将显示审核结果和质控意见。'
          }}
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="submitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getOutpatientRecords, deleteOutpatientRecord, submitRecord, getTeacherList } from '@/api/outpatient'
import { getPatient } from '@/api/patient'
import type { OutpatientRecord } from '@/types/record'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const recordList = ref<any[]>([])
const selectedRecords = ref<any[]>([]) // 选中的病历

const searchParams = reactive({
  keyword: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const fetchRecords = async () => {
  loading.value = true
  try {
    const response = await getOutpatientRecords({
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    
    // 为每条记录加载患者信息
    const recordsWithPatient = await Promise.all(
      response.list.map(async (record) => {
        try {
          const patient = await getPatient(record.patientId)
          return {
            ...record,
            patientName: patient.name,
            patientNo: patient.patientNo,
          }
        } catch (err) {
          return {
            ...record,
            patientName: '未知',
            patientNo: '-',
          }
        }
      })
    )
    
    recordList.value = recordsWithPatient
    pagination.total = response.total
  } catch (error) {
    console.error('Failed to fetch records:', error)
    ElMessage.error('加载病历列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
}

const handleReset = () => {
  searchParams.keyword = ''
  searchParams.status = ''
  handleSearch()
}

const handleCreate = () => {
  router.push('/outpatient/patients')
}

const handleGoToPatients = () => {
  router.push('/outpatient/patients')
}

const handleView = (row: any) => {
  router.push(`/outpatient/record/view/${row.id}`)
}

const handleEdit = (row: any) => {
  router.push(`/outpatient/record/edit/${row.id}`)
}

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRecords.value = selection
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请选择要删除的病历')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRecords.value.length} 个病历吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 批量删除
    const deletePromises = selectedRecords.value.map(record => 
      deleteOutpatientRecord(record.id)
    )
    
    await Promise.all(deletePromises)
    
    ElMessage.success(`成功删除 ${selectedRecords.value.length} 个病历`)
    selectedRecords.value = [] // 清空选中项
    fetchRecords() // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete records:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条病历吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteOutpatientRecord(row.id)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete record:', error)
      ElMessage.error('删除失败')
    }
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    draft: 'info',
    completed: 'success',
    reviewed: 'warning',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    completed: '已完成',
    reviewed: '已审核',
  }
  return texts[status] || status
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// ==================== 提交流程相关函数 ====================

// 获取提交状态类型
const getSubmitStatusType = (status: string) => {
  const types: Record<string, any> = {
    not_submitted: 'info',
    pending_review: 'warning',
    passed: 'success',
    rejected: 'danger',
  }
  return types[status] || 'info'
}

// 获取提交状态文本
const getSubmitStatusText = (status: string) => {
  const texts: Record<string, string> = {
    not_submitted: '未提交',
    pending_review: '待检查',
    passed: '通过',
    rejected: '不通过',
  }
  return texts[status] || status
}

// 获取提交状态样式类
const getSubmitStatusClass = (status: string) => {
  return `submit-status-${status}`
}

// 显示质控意见
const showQualityComment = (row: any) => {
  ElMessageBox.alert(row.qualityComment || '无质控意见', '质控意见', {
    confirmButtonText: '确定',
  })
}

// 提交相关变量
const submitDialogVisible = ref(false)
const selectedTeacherId = ref<number>()
const teacherList = ref<any[]>([])
const currentRecord = ref<any>(null)

// 判断是否可以提交（学生用户）
const canSubmit = (row: any) => {
  // 只有学生可以提交
  if (userStore.userInfo?.roleType !== 'student') {
    return false
  }
  
  // 以下状态可以提交：
  // 1. not_submitted - 未提交
  // 2. rejected - 被退回，需要修改后重新提交
  return row.submitStatus === 'not_submitted' || row.submitStatus === 'rejected'
}

// 提交病历
const handleSubmit = async (row: any) => {
  currentRecord.value = row
  try {
    // 获取教师列表
    const teachers = await getTeacherList()
    teacherList.value = Array.isArray(teachers) ? teachers : []
    
    if (teacherList.value.length === 0) {
      ElMessage.warning('暂无可用教师')
      return
    }
    
    submitDialogVisible.value = true
  } catch (error: any) {
    console.error('Failed to fetch teachers:', error)
    ElMessage.error('加载教师列表失败')
  }
}

// 确认提交
const handleConfirmSubmit = async () => {
  if (!selectedTeacherId.value) {
    ElMessage.warning('请选择教师')
    return
  }
  
  try {
    await submitRecord(currentRecord.value.id, { teacherId: selectedTeacherId.value })
    ElMessage.success('提交成功')
    submitDialogVisible.value = false
    selectedTeacherId.value = undefined
    fetchRecords()
  } catch (error: any) {
    console.error('Failed to submit record:', error)
    ElMessage.error(error.message || '提交失败')
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped lang="scss">
.record-list {
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

  // 提交状态单元格样式
  .submit-status-cell {
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.3s;

    &.submit-status-rejected {
      background-color: #fef0f0;
      
      &:hover {
        background-color: #fde2e2;
      }
    }

    &.submit-status-passed {
      background-color: #f0f9ff;
      
      &:hover {
        background-color: #e1f3ff;
      }
    }

    &.submit-status-pending_review {
      background-color: #fdf6ec;
      
      &:hover {
        background-color: #faecd8;
      }
    }

    &.submit-status-not_submitted {
      background-color: #f5f7fa;
      
      &:hover {
        background-color: #e4e7ed;
      }
    }
  }
}
</style>