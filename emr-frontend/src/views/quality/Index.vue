<template>
  <div class="quality-index">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>病历质控</span>
          <div class="header-actions">
            <template v-if="isTeacherOrAdmin">
              <el-button type="primary" @click="handleNavigateToControlEvaluation">质控评价</el-button>
              <el-button type="success" @click="handleNavigateToGroupControl">小组质控</el-button>
            </template>
            <el-button @click="handleViewAllRecords">查看全部病历</el-button>
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
        <el-form-item label="质控状态">
          <el-select v-model="searchParams.qualityStatus" placeholder="请选择质控状态" clearable>
            <el-option label="未质控" value="pending" />
            <el-option label="已通过" value="passed" />
            <el-option label="需整改" value="needs_revision" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 病历表格 -->
      <el-table :data="recordList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="patientNo" label="病历号" width="120" />
        <el-table-column prop="chiefComplaint" label="主诉" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="病历状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualityStatus" label="质控状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getQualityStatusType(row.qualityStatus)">
              {{ getQualityStatusText(row.qualityStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleQualityCheck(row)">质控</el-button>
            <el-button size="small" type="success" @click="handleExport(row)">导出</el-button>
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

    <!-- 质控对话框 -->
    <el-dialog v-model="qualityDialogVisible" title="病历质控" width="800px">
      <el-form :model="qualityForm" label-width="100px">
        <!-- ICD-10编码检查 -->
        <el-form-item label="编码检查">
          <el-button 
            type="primary" 
            @click="handleCheckICDCode"
            :loading="checkingCode"
            :disabled="!hasDiagnosis"
          >
            检查编码
          </el-button>
        </el-form-item>
        
        <!-- ICD-10编码检查结果 -->
        <el-form-item label="检查结果" v-if="checkResult">
          <div class="check-result">
            <el-alert
              :title="checkResult.isCorrect ? '编码正确' : '编码可能不正确'"
              :type="checkResult.isCorrect ? 'success' : 'warning'"
              :closable="false"
              show-icon
              style="margin-bottom: 10px"
            />
            
            <!-- 显示详细检查结果 -->
            <div v-if="checkResult.details && checkResult.details.length > 0" class="result-details">
              <h4>诊断编码检查详情：</h4>
              <el-table :data="checkResult.details" size="small" border>
                <el-table-column label="诊断名称" prop="diagnosisName" min-width="150" />
                <el-table-column label="填写编码" prop="filledCode" width="120" />
                <el-table-column label="检查结果" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.isCorrect ? 'success' : 'danger'" size="small">
                      {{ row.isCorrect ? '正确' : '错误' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="匹配置信度" width="120" v-if="hasConfidence">
                  <template #default="{ row }">
                    <el-progress 
                      :percentage="Math.round((row.confidence || 0) * 100)" 
                      :color="getConfidenceColor(row.confidence)"
                      :stroke-width="8"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="推荐编码" prop="recommendedCode" width="120" v-if="hasRecommendedCodes" />
                <el-table-column label="说明" prop="message" min-width="200" show-overflow-tooltip />
                <el-table-column label="改进建议" prop="suggestion" min-width="200" show-overflow-tooltip v-if="hasSuggestions" />
              </el-table>
            </div>
            
            <!-- 遗漏诊断提示 -->
            <div v-if="checkResult.missingDiagnoses && checkResult.missingDiagnoses.length > 0" class="missing-diagnoses">
              <h4>⚠️ 建议补充的诊断：</h4>
              <ul>
                <li v-for="(diag, index) in checkResult.missingDiagnoses" :key="index">
                  {{ diag }}
                </li>
              </ul>
            </div>
            
            <!-- 总体评价 -->
            <div v-if="checkResult.overallComment" class="overall-comment">
              <h4> 总体评价：</h4>
              <p>{{ checkResult.overallComment }}</p>
            </div>
          </div>
        </el-form-item>
        
        <el-divider content-position="left">质控意见</el-divider>
        <el-form-item label="质控结果" required>
          <el-radio-group v-model="qualityForm.result">
            <el-radio value="passed">通过</el-radio>
            <el-radio value="rejected">需整改</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="质控意见">
          <el-input
            v-model="qualityForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入质控意见，可一键带入编码检查结果"
          />
          <el-button 
            size="small" 
            @click="applyCheckResultToComment"
            :disabled="!checkResult"
            style="margin-top: 5px;"
          >
            一键带入检查结果
          </el-button>
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="qualityForm.score" :max="10" show-score />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qualityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitQualityCheck">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { getOutpatientRecords, reviewRecord } from '@/api/outpatient'
import { getPatient } from '@/api/patient'

const router = useRouter()

const loading = ref(false)
const recordList = ref<any[]>([])
const qualityDialogVisible = ref(false)
const currentRecord = ref<any>(null)

// 判断是否为教师或管理员
const isTeacherOrAdmin = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.roleType === 'teacher' || userInfo.roleType === 'admin'
    } catch (e) {
      return false
    }
  }
  return false
})

const searchParams = reactive({
  keyword: '',
  status: '',
  qualityStatus: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const qualityForm = reactive({
  result: 'passed' as 'passed' | 'rejected',
  comment: '',
  score: 8,
})

const checkingCode = ref(false) // 编码检查加载状态
const checkResult = ref<any>(null) // 编码检查结果

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
            qualityStatus: record.qualityStatus || 'pending', // 模拟质控状态
          }
        } catch (err) {
          return {
            ...record,
            patientName: '未知',
            patientNo: '-',
            qualityStatus: 'pending',
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
  searchParams.qualityStatus = ''
  handleSearch()
}

const handleViewAllRecords = () => {
  router.push('/outpatient/records')
}

const handleNavigateToControlEvaluation = () => {
  router.push('/quality/control-evaluation')
}

const handleNavigateToGroupControl = () => {
  router.push('/quality/group-control')
}

const handleView = (row: any) => {
  router.push(`/outpatient/record/view/${row.id}`)
}

const handleQualityCheck = (row: any) => {
  currentRecord.value = row
  qualityForm.result = 'passed'
  qualityForm.comment = ''
  qualityForm.score = 8
  qualityDialogVisible.value = true
}

const submitQualityCheck = async () => {
  if (!qualityForm.result) {
    ElMessage.warning('请选择质控结果')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要${qualityForm.result === 'passed' ? '通过' : '退回'}该病历吗？`,
      '确认质控',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 调用质控API更新状态
    await reviewRecord(currentRecord.value.id, {
      result: qualityForm.result,
      comment: qualityForm.comment,
    })
    
    ElMessage.success(qualityForm.result === 'passed' ? '质控通过' : '已退回修改')
    qualityDialogVisible.value = false
    fetchRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to submit quality check:', error)
      ElMessage.error(error.message || '质控提交失败')
    }
  }
}

// ICD-10编码检查
const handleCheckICDCode = async () => {
  if (!currentRecord.value) {
    ElMessage.warning('没有病历信息')
    return
  }
  
  // 获取诊断信息（支持 diagnosis 字段或 content 中的诊断）
  let diagnosisText = ''
  const record = currentRecord.value
  
  try {
    // 方式1：从 content.diagnosis 对象中获取（主要方式）
    if (record.content) {
      const content = typeof record.content === 'string' 
        ? JSON.parse(record.content) 
        : record.content
      
      const diagnosis = content.diagnosis || {}
      
      // 收集所有非空的诊断
      const diagnoses: Array<{name: string, code: string}> = []
      
      if (diagnosis.admission && diagnosis.admissionCode) {
        diagnoses.push({ name: diagnosis.admission, code: diagnosis.admissionCode })
      }
      if (diagnosis.discharge && diagnosis.dischargeCode) {
        diagnoses.push({ name: diagnosis.discharge, code: diagnosis.dischargeCode })
      }
      if (diagnosis.main && diagnosis.mainCode) {
        diagnoses.push({ name: diagnosis.main, code: diagnosis.mainCode })
      }
      if (diagnosis.other && diagnosis.otherCode) {
        diagnoses.push({ name: diagnosis.other, code: diagnosis.otherCode })
      }
      
      if (diagnoses.length > 0) {
        diagnosisText = diagnoses.map(d => `${d.name}(${d.code})`).join(', ')
      }
    }
    
    // 方式2：直接从 diagnosis 字段获取（门诊病历的旧格式）
    if (!diagnosisText && record.diagnosis) {
      try {
        const diagnosisList = typeof record.diagnosis === 'string' 
          ? JSON.parse(record.diagnosis) 
          : record.diagnosis
        
        if (Array.isArray(diagnosisList)) {
          diagnosisText = diagnosisList.map((d: any) => `${d.name}(${d.code})`).join(', ')
        } else {
          diagnosisText = record.diagnosis
        }
      } catch {
        diagnosisText = record.diagnosis
      }
    }
    
    // 方式3：从直接字段获取（备用方案）
    if (!diagnosisText) {
      const diagnoses: Array<{name: string, code: string}> = []
      
      if (record.admissionDiagnosis && record.admissionDiagnosisCode) {
        diagnoses.push({ name: record.admissionDiagnosis, code: record.admissionDiagnosisCode })
      }
      if (record.dischargeDiagnosis && record.dischargeDiagnosisCode) {
        diagnoses.push({ name: record.dischargeDiagnosis, code: record.dischargeDiagnosisCode })
      }
      if (record.mainDiagnosis && record.mainDiagnosisCode) {
        diagnoses.push({ name: record.mainDiagnosis, code: record.mainDiagnosisCode })
      }
      if (record.otherDiagnosis && record.otherDiagnosisCode) {
        diagnoses.push({ name: record.otherDiagnosis, code: record.otherDiagnosisCode })
      }
      
      if (diagnoses.length > 0) {
        diagnosisText = diagnoses.map(d => `${d.name}(${d.code})`).join(', ')
      }
    }
  } catch (error) {
    console.error('Failed to parse diagnosis:', error)
  }
  
  console.log('提取的诊断信息:', diagnosisText)
  console.log('原始记录数据:', currentRecord.value)
  
  if (!diagnosisText) {
    ElMessage.warning('没有诊断信息')
    return
  }
  
  checkingCode.value = true
  
  try {
    // 调用后端API进行编码检查，传递完整的病历信息
    const response = await fetch('/api/inpatient/check-icd-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        diagnosis: diagnosisText,
        chiefComplaint: record.chiefComplaint || record.presentIllness || '',
        presentIllness: record.presentIllness || '',
        pastHistory: record.pastHistory || record.allergyHistory || '',
        auxiliaryExam: record.auxiliaryExam || '',
      }),
    })
    
    const result = await response.json()
    console.log('编码检查结果:', result)
    
    if (result.code === 200) {
      checkResult.value = result.data
      ElMessage.success('编码检查完成')
    } else {
      ElMessage.error(result.message || '编码检查失败')
    }
  } catch (error: any) {
    console.error('Failed to check ICD code:', error)
    ElMessage.error('编码检查失败')
  } finally {
    checkingCode.value = false
  }
}

// 解析诊断JSON
const parseDiagnosis = (diagnosisStr: string) => {
  try {
    return JSON.parse(diagnosisStr)
  } catch {
    return []
  }
}

// 一键带入检查结果到质控意见
const applyCheckResultToComment = () => {
  if (!checkResult.value) return
  
  let comment = ''
  
  // 总体结果
  comment += `【ICD-10编码检查】\n`
  if (checkResult.value.isCorrect) {
    comment += `总体结果：全部正确\n\n`
  } else {
    comment += `总体结果：存在问题\n\n`
  }
  
  // 诊断编码检查详情
  if (checkResult.value.details && checkResult.value.details.length > 0) {
    comment += `诊断编码检查：\n`
    checkResult.value.details.forEach((detail: any, index: number) => {
      comment += `${index + 1}. ${detail.diagnosisName}\n`
      comment += `   填写编码：${detail.filledCode}\n`
      comment += `   检查结果：${detail.isCorrect ? '正确' : '错误'}\n`
      
      // 添加置信度
      if (detail.confidence !== undefined) {
        const confidencePercent = Math.round(detail.confidence * 100)
        comment += `   匹配置信度：${confidencePercent}%\n`
      }
      
      if (!detail.isCorrect && detail.recommendedCode) {
        comment += `   推荐编码：${detail.recommendedCode}\n`
      }
      comment += `   说明：${detail.message}\n`
      
      // 添加改进建议
      if (detail.suggestion) {
        comment += `   改进建议：${detail.suggestion}\n`
      }
      comment += '\n'
    })
  }
  
  // 遗漏诊断提示
  if (checkResult.value.missingDiagnoses && checkResult.value.missingDiagnoses.length > 0) {
    comment += `\n️ 建议补充的诊断：\n`
    checkResult.value.missingDiagnoses.forEach((diag: string, index: number) => {
      comment += `${index + 1}. ${diag}\n`
    })
    comment += '\n'
  }
  
  // 总体评价
  if (checkResult.value.overallComment) {
    comment += `\n 总体评价：${checkResult.value.overallComment}\n`
  }
  
  // 追加到现有意见
  if (qualityForm.comment) {
    qualityForm.comment += '\n\n' + comment
  } else {
    qualityForm.comment = comment
  }
  
  ElMessage.success('已将检查结果带入质控意见')
}

// 判断是否有推荐编码
const hasRecommendedCodes = computed(() => {
  return checkResult.value?.details?.some((d: any) => d.recommendedCode)
})

// 判断是否有置信度信息
const hasConfidence = computed(() => {
  return checkResult.value?.details?.some((d: any) => d.confidence !== undefined)
})

// 判断是否有改进建议
const hasSuggestions = computed(() => {
  return checkResult.value?.details?.some((d: any) => d.suggestion)
})

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return '#67c23a' // 绿色 - 高置信度
  if (confidence >= 0.7) return '#e6a23c' // 橙色 - 中等置信度
  return '#f56c6c' // 红色 - 低置信度
}

// 判断是否有诊断信息（从diagnosis或content中解析）
const hasDiagnosis = computed(() => {
  if (!currentRecord.value) return false
  
  // 门诊病历可能有 diagnosis 字段
  if (currentRecord.value.diagnosis) {
    return true
  }
  
  // 或者从 content 字段中获取
  if (currentRecord.value.content) {
    try {
      const content = typeof currentRecord.value.content === 'string' 
        ? JSON.parse(currentRecord.value.content) 
        : currentRecord.value.content
      
      return !!(content.diagnosis || content.diagnoses)
    } catch {
      return false
    }
  }
  
  return false
})

const handleExport = (row: any) => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能待实现')
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

const getQualityStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    passed: 'success',
    needs_revision: 'danger',
  }
  return types[status] || 'info'
}

const getQualityStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '未质控',
    passed: '已通过',
    needs_revision: '需整改',
  }
  return texts[status] || status
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped lang="scss">
.quality-index {
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
  
  .check-result {
    width: 100%;
    
    h4 {
      margin: 10px 0 5px 0;
      font-size: 14px;
      color: #606266;
      font-weight: 600;
    }
    
    .result-details {
      margin-top: 10px;
    }
    
    .missing-diagnoses {
      margin-top: 15px;
      padding: 10px;
      background-color: #fef0f0;
      border-left: 3px solid #f56c6c;
      border-radius: 4px;
      
      h4 {
        color: #f56c6c;
        margin-top: 0;
      }
      
      ul {
        margin: 5px 0;
        padding-left: 20px;
        
        li {
          color: #606266;
          line-height: 1.6;
        }
      }
    }
    
    .overall-comment {
      margin-top: 15px;
      padding: 10px;
      background-color: #f0f9ff;
      border-left: 3px solid #409eff;
      border-radius: 4px;
      
      h4 {
        color: #409eff;
        margin-top: 0;
      }
      
      p {
        margin: 5px 0 0 0;
        color: #606266;
        line-height: 1.6;
      }
    }
  }
}
</style>
