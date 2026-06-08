<template>
  <!-- 内嵌模式：直接显示内容，不带对话框 -->
  <div v-if="mode === 'embedded'" class="discharge-record-preview">
    <div v-if="data && Object.keys(data).length > 0">
      <!-- 标题 -->
      <div class="page-title">出 院 记 录</div>
      
      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">病案号：</span>
          <span class="value">{{ data.caseNo || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">状态：</span>
          <span class="value">{{ getStatusName(data.status) }}</span>
        </div>
        <div class="info-item">
          <span class="label">出院日期：</span>
          <span class="value">{{ formatDate(data.dischargeDate) }}</span>
        </div>
      </div>

      <!-- 患者信息 -->
      <div class="section-title">患者信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">姓名：</span>
          <span class="value">{{ data.patientName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别：</span>
          <span class="value">{{ data.gender || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">年龄：</span>
          <span class="value">{{ data.age ? data.age + '岁' : '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">住院号：</span>
          <span class="value">{{ data.inpatientNo || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">科室：</span>
          <span class="value">{{ data.department || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">床号：</span>
          <span class="value">{{ data.bedNo || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">入院日期：</span>
          <span class="value">{{ formatDate(data.admissionDate) }}</span>
        </div>
      </div>

      <!-- 入院情况 -->
      <div class="section-title">入院情况</div>
      <div class="content-section">
        <div class="content-row">
          <span class="label">入院情况：</span>
          <div class="text-content">{{ formatMultilineText(data.admissionCondition) }}</div>
        </div>
        <div class="content-row">
          <span class="label">入院诊断：</span>
          <span class="value">{{ data.admissionDiagnosis || '-' }}</span>
        </div>
        <div class="content-row">
          <span class="label">疾病编码：</span>
          <span class="value code-text">{{ data.admissionDiagnosisCode || '-' }}</span>
        </div>
      </div>

      <!-- 诊疗经过 -->
      <div class="section-title">诊疗经过</div>
      <div class="content-section">
        <div class="content-row">
          <span class="label">诊疗经过：</span>
          <div class="text-content">{{ formatMultilineText(data.treatmentCourse) }}</div>
        </div>
        <div class="content-row">
          <span class="label">检查结果：</span>
          <div class="text-content">{{ formatMultilineText(data.examinationResults) }}</div>
        </div>
      </div>

      <!-- 出院情况 -->
      <div class="section-title">出院情况</div>
      <div class="content-section">
        <div class="content-row">
          <span class="label">出院诊断：</span>
          <div class="text-content diagnosis-text">{{ formatMultilineText(data.dischargeDiagnosis) }}</div>
        </div>
        <div class="content-row">
          <span class="label">疾病编码：</span>
          <span class="value code-text">{{ data.dischargeDiagnosisCode || '-' }}</span>
        </div>
        <div class="content-row">
          <span class="label">出院情况：</span>
          <div class="text-content">{{ formatMultilineText(data.dischargeCondition) }}</div>
        </div>
        <div class="content-row">
          <span class="label">离院方式：</span>
          <span class="value">{{ data.dischargeMethod || '-' }}</span>
        </div>
      </div>

      <!-- 出院医嘱 -->
      <div class="section-title">出院医嘱</div>
      <div class="content-section">
        <div class="content-row">
          <span class="label">出院医嘱：</span>
          <div class="text-content">{{ formatMultilineText(data.dischargeAdvice) }}</div>
        </div>
        <div class="content-row">
          <span class="label">带药情况：</span>
          <div class="text-content">{{ formatMultilineText(data.medications) }}</div>
        </div>
        <div class="content-row">
          <span class="label">复诊计划：</span>
          <div class="text-content">{{ formatMultilineText(data.followUpPlan) }}</div>
        </div>
        <div class="content-row">
          <span class="label">医师签名：</span>
          <span class="value signature">{{ data.doctorSignature || '-' }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <el-empty description="暂无数据" />
    </div>
  </div>
  
  <!-- 对话框模式：使用 el-dialog -->
  <el-dialog
    v-else
    :model-value="visible"
    title="出院记录预览"
    width="1000px"
    top="2vh"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="discharge-record-preview" ref="printArea">
      <div v-if="data && Object.keys(data).length > 0">
        <!-- 标题 -->
        <div class="page-title">出 院 记 录</div>
        
        <!-- 基本信息 -->
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">病案号：</span>
            <span class="value">{{ data.caseNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态：</span>
            <span class="value">{{ getStatusName(data.status) }}</span>
          </div>
          <div class="info-item">
            <span class="label">出院日期：</span>
            <span class="value">{{ formatDate(data.dischargeDate) }}</span>
          </div>
        </div>

        <!-- 患者信息 -->
        <div class="section-title">患者信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ data.patientName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ data.gender || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄：</span>
            <span class="value">{{ data.age ? data.age + '岁' : '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">住院号：</span>
            <span class="value">{{ data.inpatientNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">科室：</span>
            <span class="value">{{ data.department || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">床号：</span>
            <span class="value">{{ data.bedNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">入院日期：</span>
            <span class="value">{{ formatDate(data.admissionDate) }}</span>
          </div>
        </div>

        <!-- 入院情况 -->
        <div class="section-title">入院情况</div>
        <div class="content-section">
          <div class="content-row">
            <span class="label">入院情况：</span>
            <div class="text-content">{{ formatMultilineText(data.admissionCondition) }}</div>
          </div>
          <div class="content-row">
            <span class="label">入院诊断：</span>
            <span class="value">{{ data.admissionDiagnosis || '-' }}</span>
          </div>
          <div class="content-row">
            <span class="label">疾病编码：</span>
            <span class="value code-text">{{ data.admissionDiagnosisCode || '-' }}</span>
          </div>
        </div>

        <!-- 诊疗经过 -->
        <div class="section-title">诊疗经过</div>
        <div class="content-section">
          <div class="content-row">
            <span class="label">诊疗经过：</span>
            <div class="text-content">{{ formatMultilineText(data.treatmentCourse) }}</div>
          </div>
          <div class="content-row">
            <span class="label">检查结果：</span>
            <div class="text-content">{{ formatMultilineText(data.examinationResults) }}</div>
          </div>
        </div>

        <!-- 出院情况 -->
        <div class="section-title">出院情况</div>
        <div class="content-section">
          <div class="content-row">
            <span class="label">出院诊断：</span>
            <div class="text-content diagnosis-text">{{ formatMultilineText(data.dischargeDiagnosis) }}</div>
          </div>
          <div class="content-row">
            <span class="label">疾病编码：</span>
            <span class="value code-text">{{ data.dischargeDiagnosisCode || '-' }}</span>
          </div>
          <div class="content-row">
            <span class="label">出院情况：</span>
            <div class="text-content">{{ formatMultilineText(data.dischargeCondition) }}</div>
          </div>
          <div class="content-row">
            <span class="label">离院方式：</span>
            <span class="value">{{ data.dischargeMethod || '-' }}</span>
          </div>
        </div>

        <!-- 出院医嘱 -->
        <div class="section-title">出院医嘱</div>
        <div class="content-section">
          <div class="content-row">
            <span class="label">出院医嘱：</span>
            <div class="text-content">{{ formatMultilineText(data.dischargeAdvice) }}</div>
          </div>
          <div class="content-row">
            <span class="label">带药情况：</span>
            <div class="text-content">{{ formatMultilineText(data.medications) }}</div>
          </div>
          <div class="content-row">
            <span class="label">复诊计划：</span>
            <div class="text-content">{{ formatMultilineText(data.followUpPlan) }}</div>
          </div>
          <div class="content-row">
            <span class="label">医师签名：</span>
            <span class="value signature">{{ data.doctorSignature || '-' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-empty description="暂无数据" />
      </div>
    </div>
    
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
      <el-button type="primary" @click="handlePrint">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  visible: boolean
  recordData?: any
  mode?: 'dialog' | 'embedded'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  recordData: null,
  mode: 'dialog',
})

defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const printArea = ref<HTMLElement | null>(null)

// 提取出院记录数据
const data = computed(() => {
  console.log('=== DischargeRecordPreview - 数据调试 ===')
  console.log('props.recordData:', props.recordData)
  
  if (!props.recordData) {
    console.warn('recordData 为空')
    return {}
  }
  
  let content = props.recordData.content
  console.log('原始 content:', content)
  
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content)
      console.log('解析后的 content:', content)
    } catch (e) {
      console.error('Failed to parse content:', e)
      return {}
    }
  }
  
  const dischargeRecord = content.dischargeRecord || content || {}
  console.log('dischargeRecord:', dischargeRecord)
  
  // 合并患者基本信息（从 recordData 顶层获取）
  const result = {
    ...dischargeRecord,
    // 患者基本信息优先从 recordData 顶层获取
    patientName: props.recordData.patientName || dischargeRecord.patientName || '-',
    gender: (props.recordData.gender !== undefined && props.recordData.gender !== null && props.recordData.gender !== '') 
      ? props.recordData.gender 
      : (dischargeRecord.gender || '-'),
    age: (props.recordData.age !== undefined && props.recordData.age !== null) 
      ? props.recordData.age 
      : (dischargeRecord.age !== undefined && dischargeRecord.age !== null ? dischargeRecord.age : ''),
    inpatientNo: props.recordData.inpatientNo || dischargeRecord.inpatientNo || '-',
    department: props.recordData.department || dischargeRecord.department || '-',
    bedNo: (props.recordData.bedNo !== undefined && props.recordData.bedNo !== null && props.recordData.bedNo !== '') 
      ? props.recordData.bedNo 
      : (dischargeRecord.bedNo || '-'),
    admissionDate: props.recordData.admissionDate || dischargeRecord.admissionDate || '',
    caseNo: props.recordData.inpatientNo || props.recordData.caseNo || dischargeRecord.caseNo || '-',  // 病案号统一使用住院号
  }
  
  console.log('最终合并的 data:', result)
  console.log('=====================================')
  
  return result
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}

// 获取状态名称
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    completed: '完成',
    signed: '已签名',
  }
  return statusMap[status] || status || '-'
}

// 格式化多行文本
const formatMultilineText = (text: string) => {
  if (!text) return '-'
  return text
}

// 打印功能
const handlePrint = () => {
  if (!printArea.value) return
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('请允许弹窗以进行打印')
    return
  }
  
  const content = printArea.value.innerHTML
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>出院记录打印</title>
      <style>
        body {
          font-family: "Microsoft YaHei", Arial, sans-serif;
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        .page-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          letter-spacing: 8px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0 10px;
          padding-left: 10px;
          border-left: 4px solid #409eff;
          color: #303133;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }
        .info-item {
          display: flex;
          align-items: center;
          padding: 8px;
          background-color: #fafafa;
          border-radius: 4px;
        }
        .info-item .label {
          font-weight: 600;
          color: #606266;
          min-width: 80px;
          flex-shrink: 0;
        }
        .info-item .value {
          color: #303133;
          flex: 1;
        }
        .content-section {
          margin-bottom: 15px;
        }
        .content-row {
          margin-bottom: 10px;
          line-height: 1.8;
        }
        .content-row .label {
          font-weight: 600;
          color: #606266;
          display: inline-block;
          min-width: 100px;
        }
        .content-row .text-content {
          display: inline;
          color: #303133;
          white-space: pre-wrap;
        }
        .content-row .value {
          color: #303133;
        }
        .diagnosis-text {
          color: #f56c6c;
          font-weight: 500;
        }
        .code-text {
          color: #409eff;
          font-family: 'Courier New', monospace;
        }
        .signature {
          font-style: italic;
          color: #606266;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}
</script>

<style scoped lang="scss">
.discharge-record-preview {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  
  .page-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin: 20px 0;
    letter-spacing: 8px;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 10px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
    color: #303133;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 15px;
    
    .info-item {
      display: flex;
      align-items: center;
      padding: 8px;
      background-color: #fafafa;
      border-radius: 4px;
      
      .label {
        font-weight: 600;
        color: #606266;
        min-width: 80px;
        flex-shrink: 0;
      }
      
      .value {
        color: #303133;
        flex: 1;
      }
    }
  }
  
  .content-section {
    margin-bottom: 15px;
    
    .content-row {
      margin-bottom: 10px;
      line-height: 1.8;
      
      .label {
        font-weight: 600;
        color: #606266;
        display: inline-block;
        min-width: 100px;
      }
      
      .text-content {
        display: inline;
        color: #303133;
        white-space: pre-wrap;
      }
      
      .value {
        color: #303133;
      }
      
      &.diagnosis-text {
        color: #f56c6c;
        font-weight: 500;
      }
      
      &.code-text {
        color: #409eff;
        font-family: 'Courier New', monospace;
      }
      
      &.signature {
        font-style: italic;
        color: #606266;
      }
    }
  }
  
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
}
</style>
