<template>
  <div class="teacher-review">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>病历质控 - 待审核列表</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="提交状态">
          <el-select v-model="searchParams.status" placeholder="请选择" clearable @change="handleSearch">
            <el-option label="待检查" value="pending_review" />
            <el-option label="已通过" value="passed" />
            <el-option label="不通过" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
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
        <el-table-column prop="caseNo" label="病案号" width="120" />
        <el-table-column prop="patientName" label="患者姓名" width="100" />
        <el-table-column prop="inpatientNo" label="住院号" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.submittedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="submitStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSubmitStatusType(row.submitStatus)">
              {{ getSubmitStatusText(row.submitStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.submitStatus === 'pending_review'"
              size="small" 
              type="primary" 
              @click="handleReview(row)"
            >
              质控
            </el-button>
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

    <!-- 批量质控按钮 -->
    <div class="batch-actions" v-if="selectedRecords.length > 0">
      <el-button type="primary" @click="handleBatchReview">
        批量质控 ({{ selectedRecords.length }})
      </el-button>
    </div>

    <!-- 质控对话框 -->
    <el-dialog 
      v-model="reviewDialogVisible" 
      title="病历质控" 
      width="800px"
    >
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="病案号">
          <span>{{ currentRecord?.caseNo }}</span>
        </el-form-item>
        <el-form-item label="患者姓名">
          <span>{{ currentRecord?.patientName }}</span>
        </el-form-item>
        <el-form-item label="学生姓名">
          <span>{{ currentRecord?.studentName }}</span>
        </el-form-item>
        
        <el-divider />
        
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

        <el-divider />

        <el-form-item label="质控结果" required>
          <el-radio-group v-model="reviewForm.result">
            <el-radio label="passed">通过</el-radio>
            <el-radio label="rejected">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="质控意见">
          <el-input 
            v-model="reviewForm.comment" 
            type="textarea" 
            :rows="6"
            placeholder="请输入质控意见"
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
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReview" :loading="reviewing">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPendingReviewRecords, reviewRecord } from '@/api/inpatient'

const router = useRouter()

const loading = ref(false)
const recordList = ref<any[]>([])
const selectedRecords = ref<any[]>([])
const reviewDialogVisible = ref(false)
const reviewing = ref(false)
const checkingCode = ref(false)
const checkResult = ref<any>(null)
const currentRecord = ref<any>(null)

const searchParams = reactive({
  status: 'pending_review', // 默认只显示待审核的
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const reviewForm = reactive({
  result: 'passed' as 'passed' | 'rejected',
  comment: '',
})

// 获取待质控病历列表
const fetchRecords = async () => {
  loading.value = true
  try {
    const response: any = await getPendingReviewRecords({
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    
    recordList.value = response.list || []
    pagination.total = response.total || 0
  } catch (error: any) {
    console.error('Failed to fetch pending review records:', error)
    ElMessage.error(error.message || '加载待质控病历失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
}

// 重置
const handleReset = () => {
  searchParams.status = 'pending_review'
  handleSearch()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRecords.value = selection
}

// 查看病历
const handleView = (row: any) => {
  router.push(`/inpatient/record/${row.id}`)
}

// 质控单个病历
const handleReview = (row: any) => {
  currentRecord.value = row
  resetReviewForm()
  reviewDialogVisible.value = true
}

// 批量质控
const handleBatchReview = () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请选择要质控的病历')
    return
  }
  
  // TODO: 实现批量质控功能（可以打开第一个病历进行质控）
  handleReview(selectedRecords.value[0])
}

// 确认质控
const confirmReview = async () => {
  if (!reviewForm.result) {
    ElMessage.warning('请选择质控结果')
    return
  }
  
  reviewing.value = true
  try {
    await reviewRecord(currentRecord.value.id, {
      result: reviewForm.result,
      comment: reviewForm.comment,
    })
    
    ElMessage.success(reviewForm.result === 'passed' ? '审核通过' : '已返回修改')
    reviewDialogVisible.value = false
    fetchRecords()
  } catch (error: any) {
    console.error('Failed to review record:', error)
    ElMessage.error(error.message || '质控失败')
  } finally {
    reviewing.value = false
  }
}

// ICD-10编码检查
const handleCheckICDCode = async () => {
  if (!currentRecord.value) {
    ElMessage.warning('没有病历信息')
    return
  }
  
  // 从记录中获取诊断信息（支持多种数据结构）
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
      
      // 入院诊断
      if (diagnosis.admission && diagnosis.admissionCode) {
        diagnoses.push({ name: diagnosis.admission, code: diagnosis.admissionCode })
      }
      
      // 出院诊断
      if (diagnosis.discharge && diagnosis.dischargeCode) {
        diagnoses.push({ name: diagnosis.discharge, code: diagnosis.dischargeCode })
      }
      
      // 主要诊断
      if (diagnosis.main && diagnosis.mainCode) {
        diagnoses.push({ name: diagnosis.main, code: diagnosis.mainCode })
      }
      
      // 其他诊断
      if (diagnosis.other && diagnosis.otherCode) {
        diagnoses.push({ name: diagnosis.other, code: diagnosis.otherCode })
      }
      
      // 如果找到了诊断，格式化
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
  if (reviewForm.comment) {
    reviewForm.comment += '\n\n' + comment
  } else {
    reviewForm.comment = comment
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

// 判断是否有诊断信息（从content中解析）
const hasDiagnosis = computed(() => {
  if (!currentRecord.value) return false
  
  // 尝试从 content 字段中获取诊断信息
  if (currentRecord.value.content) {
    try {
      const content = typeof currentRecord.value.content === 'string' 
        ? JSON.parse(currentRecord.value.content) 
        : currentRecord.value.content
      
      // 检查多种可能的诊断字段
      // 1. 直接 diagnosis/diagnoses 字段
      if (content.diagnosis || content.diagnoses) return true
      
      // 2. 病案首页的出院诊断
      if (content.homePage?.dischargeDiagnoses && content.homePage.dischargeDiagnoses.length > 0) return true
      
      // 3. 入院记录的入院诊断
      if (content.admissionRecord?.admissionDiagnosis) return true
      
      // 4. 出院记录的出院诊断
      if (content.dischargeRecord?.dischargeDiagnosis) return true
      
      // 5. 首次病程记录的初步诊断
      if (content.progressRecord?.preliminaryDiagnosis) return true
      
      return false
    } catch {
      return false
    }
  }
  
  return false
})

// 重置质控表单
const resetReviewForm = () => {
  reviewForm.result = 'passed'
  reviewForm.comment = ''
  checkResult.value = null
}

// 获取提交状态类型
const getSubmitStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending_review: 'warning',
    passed: 'success',
    rejected: 'danger',
  }
  return types[status] || 'info'
}

// 获取提交状态文本
const getSubmitStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending_review: '待检查',
    passed: '通过',
    rejected: '不通过',
  }
  return texts[status] || status
}

// 格式化时间
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped lang="scss">
.teacher-review {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }

  .batch-actions {
    margin-top: 20px;
    text-align: right;
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
