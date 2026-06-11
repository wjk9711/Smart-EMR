<template>
  <div class="inpatient-record-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <span class="title">病案列表 - {{ patientName }}</span>
          </div>
          <div class="header-actions" v-if="patientId">
            <el-button type="warning" @click="handleOpenDRG">
              <el-icon><Link /></el-icon>
              DRG入组
            </el-button>
            <el-button type="success" @click="handlePreviewAll" :disabled="recordList.length === 0">
              <el-icon><View /></el-icon>
              预览全部病案
            </el-button>
            <el-dropdown @command="handleCreateByType">
              <el-button type="primary">
                <el-icon><Plus /></el-icon>
                新增病案<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="home_page">病案首页</el-dropdown-item>
                  <el-dropdown-item command="admission">入院记录</el-dropdown-item>
                  <el-dropdown-item command="progress">首次病程记录</el-dropdown-item>
                  <el-dropdown-item command="discharge">出院记录</el-dropdown-item>
                  <el-dropdown-item command="operation">手术记录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="病案号">
          <el-input v-model="searchParams.caseNo" placeholder="请输入病案号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="请选择状态" clearable>
            <el-option label="在院" value="admitted" />
            <el-option label="出院" value="discharged" />
            <el-option label="归档" value="archived" />
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

      <!-- 病案表格 -->
      <el-table 
        :data="recordList" 
        v-loading="loading" 
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="病案号" width="120">
          <template #default="{ row }">
            {{ getCaseNo(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="patientName" label="患者姓名" width="100" />
        <el-table-column prop="recordType" label="病案类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRecordTypeColor(row.recordType)">
              {{ getRecordTypeName(row.recordType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inpatientNo" label="住院号" width="120" />
        <el-table-column prop="department" label="科室" width="100">
          <template #default="{ row }">
            {{ getDepartmentName(row.department) }}
          </template>
        </el-table-column>
        <el-table-column prop="admissionDate" label="入院日期" width="120" />
        <el-table-column prop="dischargeDate" label="出院日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitStatus" label="提交状态" width="140" v-if="userStore.userInfo?.roleType === 'student'">
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
              <el-tooltip 
                v-if="row.submitStatus === 'rejected'" 
                content="可以修改后重新提交" 
                placement="top"
              >
                <el-icon style="margin-left: 5px; color: #67c23a;"><Check /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" :width="userStore.userInfo?.roleType === 'student' ? 400 : 320">
          <template #default="{ row }">
            <!-- <el-button size="small" @click="handleView(row)">查看</el-button> -->
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handlePrint(row)">打印</el-button>
            <el-button 
              v-if="userStore.userInfo?.roleType === 'student' && canSubmit(row)"
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

    <!-- 通用病案表单对话框（保留兼容） -->
    <InpatientRecordForm
      v-model:visible="dialogVisible"
      :record-data="currentRecord"
      :patient-id="patientId"
      @success="fetchRecords"
    />

    <!-- 病案首页表单 -->
    <HomePageForm
      v-if="patientId"
      v-model:visible="showHomePageForm"
      :record-data="currentRecord"
      :patient-id="patientId"
      @success="fetchRecords"
    />

    <!-- 病案首页预览 -->
    <HomePagePreview
      v-model:visible="previewVisible"
      :record-data="currentRecord"
    />

    <!-- 入院记录表单 -->
    <AdmissionRecordForm
      v-model:visible="showAdmissionForm"
      :record-data="currentRecord"
      :patient-id="patientId"
      @success="fetchRecords"
    />

    <!-- 首次病程记录表单 -->
    <ProgressRecordForm
      v-model:visible="showProgressForm"
      :record-data="currentRecord"
      :patient-id="patientId"
      @success="fetchRecords"
    />

    <!-- 出院记录表单 -->
    <DischargeRecordForm
      v-model:visible="showDischargeForm"
      :record-data="currentRecord"
      :patient-id="patientId"
      @success="fetchRecords"
    />

    <!-- 手术记录表单 -->
    <OperationRecordForm
      v-model:visible="showOperationForm"
      :record-data="currentRecord"
      :patient-id="patientId"
      @success="fetchRecords"
    />

    <!-- 提交病历对话框 -->
    <el-dialog 
      v-model="submitDialogVisible" 
      title="提交病历给教师" 
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="病案号">
          <span>{{ currentRecord?.caseNo }}</span>
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
              :label="teacher.realName || teacher.username" 
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
              ? '病案已被退回，请根据教师质控意见修改后重新提交。' 
              : '提交后，病历将进入待检查状态，教师审核后将显示审核结果和质控意见。'
          }}
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="submitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 全部病案预览对话框 -->
    <el-dialog
      v-model="previewAllVisible"
      title="病案预览"
      width="90%"
      top="2vh"
      @close="handleClosePreview"
    >
      <div class="preview-all-container" ref="previewAllContent">
        <div v-if="previewRecords.length > 0">
          <!-- 遍历所有病案，依次显示 -->
          <div 
            v-for="(record, index) in previewRecords" 
            :key="record.id"
            class="preview-record-section"
          >
            <!-- 病案类型标题 -->
            <div class="record-type-header">
              <el-tag :type="getRecordTypeColor(record.recordType)" size="large">
                {{ getRecordTypeName(record.recordType) }}
              </el-tag>
              <span class="record-index">{{ index + 1 }} / {{ previewRecords.length }}</span>
            </div>

            <!-- 病案首页预览 -->
            <div v-if="record.recordType === 'home_page'" class="record-content">
              <HomePagePreview 
                :visible="true"
                :record-data="record"
                mode="embedded"
              />
            </div>
            
            <!-- 入院记录预览 -->
            <div v-else-if="record.recordType === 'admission'" class="record-content">
              <AdmissionRecordPreview 
                :visible="true"
                :record-data="record"
                mode="embedded"
              />
            </div>
            
            <!-- 首次病程记录预览 -->
            <div v-else-if="record.recordType === 'progress'" class="record-content">
              <ProgressRecordPreview 
                :visible="true"
                :record-data="record"
                mode="embedded"
              />
            </div>
            
            <!-- 出院记录预览 -->
            <div v-else-if="record.recordType === 'discharge'" class="record-content">
              <DischargeRecordPreview 
                :visible="true"
                :record-data="record"
                mode="embedded"
              />
            </div>
            
            <!-- 其他类型病案使用 iframe -->
            <div v-else class="record-content other-record">
              <iframe 
                :src="`/inpatient/record/${record.id}?preview=true`"
                frameborder="0"
                style="width: 100%; min-height: 800px;"
              ></iframe>
            </div>

            <!-- 分隔线（最后一个病案不显示） -->
            <el-divider v-if="index < previewRecords.length - 1" />
          </div>
        </div>
        <div v-else class="empty-preview">
          <el-empty description="暂无可预览的病案" />
        </div>
      </div>
      <template #footer>
        <el-button @click="previewAllVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrintAll">
          <el-icon><Printer /></el-icon>
          打印全部
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Delete, Check, ArrowDown, View, Printer, Link } from '@element-plus/icons-vue'
import { getInpatientRecords, deleteInpatientRecord, submitRecord, getTeacherList } from '@/api/inpatient'
import InpatientRecordForm from './InpatientRecordForm.vue'
import HomePageForm from './HomePageForm.vue'
import HomePagePreview from './HomePagePreview.vue'
import AdmissionRecordForm from './AdmissionRecordForm.vue'
import AdmissionRecordPreview from './AdmissionRecordPreview.vue'
import ProgressRecordForm from './ProgressRecordForm.vue'
import ProgressRecordPreview from './ProgressRecordPreview.vue'
import DischargeRecordForm from './DischargeRecordForm.vue'
import DischargeRecordPreview from './DischargeRecordPreview.vue'
import OperationRecordForm from './OperationRecordForm.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const recordList = ref<any[]>([])
const dialogVisible = ref(false)
const currentRecord = ref<any>(null)
const selectedRecords = ref<any[]>([]) // 选中的病案
const submitDialogVisible = ref(false) // 提交对话框
const submitting = ref(false) // 提交中
const teacherList = ref<any[]>([]) // 教师列表
const selectedTeacherId = ref<number | null>(null) // 选中的教师ID

// 模块化表单状态
const showHomePageForm = ref(false)
const previewVisible = ref(false)
const showAdmissionForm = ref(false)
const showProgressForm = ref(false)
const showDischargeForm = ref(false)
const showOperationForm = ref(false)

// 全部病案预览相关
const previewAllVisible = ref(false)
const previewRecords = ref<any[]>([])
const currentPreviewIndex = ref(0)
const currentPreviewUrl = ref('')
const previewAllContent = ref<HTMLElement | null>(null)

const patientName = computed(() => (route.query.patientName as string) || '全部病案')
const patientId = computed(() => {
  const id = Number(route.query.patientId)
  return isNaN(id) ? undefined : id
})

// 当前预览的病案记录
const currentPreviewRecord = computed(() => {
  if (previewRecords.value.length > 0 && currentPreviewIndex.value >= 0) {
    return previewRecords.value[currentPreviewIndex.value]
  }
  return null
})

const searchParams = reactive({
  caseNo: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// Mock数据
const mockRecords = [
  {
    id: 1,
    caseNo: 'BA20240001',
    patientId: 1,
    patientName: '张三',
    inpatientNo: 'ZY20240001',
    department: 'internal',
    admissionDate: '2024-01-15',
    dischargeDate: '2024-01-25',
    status: 'discharged',
  },
  {
    id: 2,
    caseNo: 'BA20240002',
    patientId: 2,
    patientName: '李四',
    inpatientNo: 'ZY20240002',
    department: 'surgery',
    admissionDate: '2024-01-18',
    dischargeDate: '',
    status: 'admitted',
  },
]

const fetchRecords = async () => {
  loading.value = true
  try {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchParams,
    }
    
    // 只有当patientId存在时才传递
    if (patientId.value) {
      params.patientId = patientId.value
    }
    
    const response: any = await getInpatientRecords(params)
    
    // 响应拦截器已提取 res.data，直接访问 list 和 total
    recordList.value = response.list || []
    pagination.total = response.total || 0
  } catch (error: any) {
    console.error('Failed to fetch records:', error)
    ElMessage.error(error.message || '加载病案列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
}

const handleReset = () => {
  searchParams.caseNo = ''
  searchParams.status = ''
  handleSearch()
}

const handleBack = () => {
  router.back()
}

// 根据病案类型打开对应表单
const handleCreateByType = (type: string) => {
  console.log('点击新增病案 - 类型:', type)
  console.log('当前 patientId:', patientId.value)
  console.log('当前 route.query:', route.query)
  
  if (!patientId.value) {
    console.warn('patientId 为空，无法创建病案')
    ElMessage.warning('请先选择患者')
    return
  }
  
  currentRecord.value = null
  
  console.log('准备打开表单 - showProgressForm:', showProgressForm.value)
  
  switch (type) {
    case 'home_page':
      showHomePageForm.value = true
      console.log('已设置 showHomePageForm = true')
      break
    case 'admission':
      showAdmissionForm.value = true
      console.log('已设置 showAdmissionForm = true')
      break
    case 'progress':
      showProgressForm.value = true
      console.log('已设置 showProgressForm = true')
      break
    case 'discharge':
      showDischargeForm.value = true
      console.log('已设置 showDischargeForm = true')
      break
    case 'operation':
      showOperationForm.value = true
      console.log('已设置 showOperationForm = true')
      break
    default:
      // 默认使用通用表单
      dialogVisible.value = true
      console.log('已设置 dialogVisible = true')
  }
}

// 保留原有的handleCreate用于兼容
const handleCreate = () => {
  if (!patientId.value) {
    ElMessage.warning('请先选择患者')
    return
  }
  currentRecord.value = null
  dialogVisible.value = true
}

// 预览全部病案
// 打开DRG入组系统
const handleOpenDRG = () => {
  window.open('https://chs-drg.fivesoft.com.cn/2.0/', '_blank')
}

// 预览全部病案
const handlePreviewAll = () => {
  // 按顺序筛选病案：病案首页、入院记录、首次病程记录、手术记录、出院记录
  const typeOrder = ['home_page', 'admission', 'progress', 'operation', 'discharge']
  
  // 按类型分组
  const recordsByType: Record<string, any[]> = {}
  recordList.value.forEach(record => {
    if (!recordsByType[record.recordType]) {
      recordsByType[record.recordType] = []
    }
    recordsByType[record.recordType].push(record)
  })
  
  // 按顺序合并
  previewRecords.value = []
  typeOrder.forEach(type => {
    if (recordsByType[type] && recordsByType[type].length > 0) {
      previewRecords.value.push(...recordsByType[type])
    }
  })
  
  if (previewRecords.value.length === 0) {
    ElMessage.warning('暂无可预览的病案')
    return
  }
  
  currentPreviewIndex.value = 0
  previewAllVisible.value = true
}

// 关闭预览
const handleClosePreview = () => {
  previewRecords.value = []
  currentPreviewIndex.value = 0
  currentPreviewUrl.value = ''
}

// 上一个病案
const handlePrevRecord = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--
  }
}

// 下一个病案
const handleNextRecord = () => {
  if (currentPreviewIndex.value < previewRecords.value.length - 1) {
    currentPreviewIndex.value++
  }
}

// 打印全部病案
const handlePrintAll = () => {
  const printContent = previewAllContent.value?.innerHTML
  if (printContent) {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>病案预览打印</title>
          <style>
            body { 
              font-family: 'Microsoft YaHei', sans-serif; 
              padding: 20px;
              margin: 0;
            }
            .preview-record-section {
              margin-bottom: 40px;
              page-break-after: always;
            }
            .record-type-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #409eff;
            }
            .record-index {
              font-size: 14px;
              color: #909399;
            }
            @media print {
              .preview-record-section {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  } else {
    ElMessage.warning('没有可打印的内容')
  }
}

const handleView = (row: any) => {
  // 病案首页使用弹窗预览，其他类型跳转路由
  if (row.recordType === 'home_page') {
    currentRecord.value = row
    previewVisible.value = true
  } else {
    router.push(`/inpatient/record/${row.id}`)
  }
}

const handleEdit = (row: any) => {
  currentRecord.value = row
  
  // 根据病案类型打开对应的表单
  switch (row.recordType) {
    case 'home_page':
      showHomePageForm.value = true
      break
    case 'admission':
      showAdmissionForm.value = true
      break
    case 'progress':
      showProgressForm.value = true
      break
    case 'discharge':
      showDischargeForm.value = true
      break
    case 'operation':
      showOperationForm.value = true
      break
    default:
      // 未知类型或其他类型，使用通用表单
      dialogVisible.value = true
  }
}

const handlePrint = (row: any) => {
  // 查看并打印病案首页
  router.push(`/inpatient/record/${row.id}`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除病案“${row.caseNo}”吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteInpatientRecord(row.id)
    
    ElMessage.success('删除成功')
    fetchRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete record:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRecords.value = selection
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请选择要删除的病案')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRecords.value.length} 个病案吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 批量删除
    const deletePromises = selectedRecords.value.map(record => 
      deleteInpatientRecord(record.id)
    )
    
    await Promise.all(deletePromises)
    
    ElMessage.success(`成功删除 ${selectedRecords.value.length} 个病案`)
    selectedRecords.value = [] // 清空选中项
    fetchRecords() // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete records:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

const getDepartmentName = (dept: string) => {
  const names: Record<string, string> = {
    internal: '内科',
    surgery: '外科',
    pediatrics: '儿科',
    obstetrics: '妇产科',
  }
  return names[dept] || dept
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    admitted: 'success',
    discharged: 'info',
    archived: 'warning',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    admitted: '在院',
    discharged: '出院',
    archived: '归档',
  }
  return texts[status] || status
}

// 获取病案号（病案首页类型优先使用住院号）
const getCaseNo = (row: any) => {
  // 如果是病案首页类型，且 caseNo 为空，则显示住院号
  if (row.recordType === 'home_page' && (!row.caseNo || row.caseNo === '')) {
    return row.inpatientNo || '-'
  }
  return row.caseNo || '-'
}

// 获取病案类型名称
const getRecordTypeName = (type: string) => {
  const names: Record<string, string> = {
    home_page: '病案首页',
    admission: '入院记录',
    progress: '病程记录',
    discharge: '出院记录',
    operation: '手术记录',
    other: '其他',
  }
  return names[type] || type
}

// 获取病案类型标签颜色
const getRecordTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    home_page: 'info',
    admission: 'primary',
    progress: 'success',
    discharge: 'warning',
    operation: 'danger',
    other: 'info',
  }
  return colors[type] || 'info'
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
  if (row.qualityComment) {
    ElMessageBox.alert(row.qualityComment, '质控意见', {
      confirmButtonText: '确定',
    })
  }
}

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
  try {
    // 获取教师列表
    const teachers = await getTeacherList()
    teacherList.value = Array.isArray(teachers) ? teachers : []
    
    if (teacherList.value.length === 0) {
      ElMessage.warning('暂无可用教师')
      return
    }
    
    selectedTeacherId.value = null
    currentRecord.value = row
    submitDialogVisible.value = true
  } catch (error: any) {
    console.error('Failed to get teacher list:', error)
    ElMessage.error(error.message || '获取教师列表失败')
  }
}

// 确认提交
const confirmSubmit = async () => {
  if (!selectedTeacherId.value) {
    ElMessage.warning('请选择教师')
    return
  }
  
  submitting.value = true
  try {
    await submitRecord(currentRecord.value.id, { teacherId: selectedTeacherId.value })
    ElMessage.success('提交成功，等待教师审核')
    submitDialogVisible.value = false
    fetchRecords()
  } catch (error: any) {
    console.error('Failed to submit record:', error)
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped lang="scss">
.inpatient-record-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

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
  }

  // 全部病案预览对话框样式
  .preview-all-container {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px;

    .preview-record-section {
      margin-bottom: 30px;

      .record-type-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #409eff;

        .record-index {
          font-size: 14px;
          color: #909399;
          margin-left: auto;
        }
      }

      .record-content {
        background-color: #fff;
        max-width: 900px;  // 与病案首页宽度一致
        margin: 0 auto;  // 居中显示
        
        &.other-record {
          min-height: 800px;
        }
      }
    }

    .empty-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }
  }
}
</style>
