<template>
  <!-- 内嵌模式：直接显示内容，不带对话框 -->
  <div v-if="mode === 'embedded'" class="progress-record-preview">
    <div v-if="data && Object.keys(data).length > 0">
      <!-- 标题 -->
      <div class="page-title">首 次 病 程 记 录</div>
      
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
          <span class="label">记录时间：</span>
          <span class="value">{{ formatDateTime(data.recordDateTime) }}</span>
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
        <div class="info-item full-width">
          <span class="label">入院日期：</span>
          <span class="value">{{ formatDate(data.admissionDate) }}</span>
        </div>
      </div>

      <!-- 病例特点 -->
      <div class="section-title">病例特点</div>
      <div class="content-section">
        <div class="content-value">{{ formatMultilineText(data.caseFeatures) }}</div>
      </div>

      <!-- 拟诊讨论 -->
      <div class="section-title">拟诊讨论</div>
      <div class="content-section">
        <div class="content-item">
          <div class="content-label">初步诊断：</div>
          <div class="content-value diagnosis-text">{{ data.preliminaryDiagnosis || '-' }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">疾病编码：</div>
          <div class="content-value code-text">{{ data.preliminaryDiagnosisCode || '-' }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">诊断依据：</div>
          <div class="content-value">{{ formatMultilineText(data.diagnosisBasis) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">鉴别诊断：</div>
          <div class="content-value">{{ formatMultilineText(data.differentialDiagnosis) }}</div>
        </div>
      </div>

      <!-- 诊疗计划 -->
      <div class="section-title">诊疗计划</div>
      <div class="content-section">
        <div class="content-item">
          <div class="content-label">诊疗计划：</div>
          <div class="content-value">{{ formatMultilineText(data.treatmentPlan) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">注意事项：</div>
          <div class="content-value">{{ formatMultilineText(data.precautions) }}</div>
        </div>
      </div>

      <!-- 医师签名 -->
      <div class="signature-section">
        <div class="signature-item">
          <span class="label">医师签名：</span>
          <span class="value">{{ data.doctorSignature || '-' }}</span>
        </div>
      </div>
    </div>
    <div v-else style="text-align: center; padding: 40px; color: #999;">
      暂无首次病程记录数据
    </div>
  </div>
  
  <!-- 对话框模式：使用 el-dialog -->
  <el-dialog
    v-else
    :model-value="visible"
    title="首次病程记录预览"
    width="900px"
    top="2vh"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="progress-record-preview" ref="printArea">
      <div v-if="data && Object.keys(data).length > 0">
        <!-- 标题 -->
        <div class="page-title">首 次 病 程 记 录</div>
        
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
            <span class="label">记录时间：</span>
            <span class="value">{{ formatDateTime(data.recordDateTime) }}</span>
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
          <div class="info-item full-width">
            <span class="label">入院日期：</span>
            <span class="value">{{ formatDate(data.admissionDate) }}</span>
          </div>
        </div>

        <!-- 病例特点 -->
        <div class="section-title">病例特点</div>
        <div class="content-section">
          <div class="content-value">{{ formatMultilineText(data.caseFeatures) }}</div>
        </div>

        <!-- 拟诊讨论 -->
        <div class="section-title">拟诊讨论</div>
        <div class="content-section">
          <div class="content-item">
            <div class="content-label">初步诊断：</div>
            <div class="content-value diagnosis-text">{{ data.preliminaryDiagnosis || '-' }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">疾病编码：</div>
            <div class="content-value code-text">{{ data.preliminaryDiagnosisCode || '-' }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">诊断依据：</div>
            <div class="content-value">{{ formatMultilineText(data.diagnosisBasis) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">鉴别诊断：</div>
            <div class="content-value">{{ formatMultilineText(data.differentialDiagnosis) }}</div>
          </div>
        </div>

        <!-- 诊疗计划 -->
        <div class="section-title">诊疗计划</div>
        <div class="content-section">
          <div class="content-item">
            <div class="content-label">诊疗计划：</div>
            <div class="content-value">{{ formatMultilineText(data.treatmentPlan) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">注意事项：</div>
            <div class="content-value">{{ formatMultilineText(data.precautions) }}</div>
          </div>
        </div>

        <!-- 医师签名 -->
        <div class="signature-section">
          <div class="signature-item">
            <span class="label">医师签名：</span>
            <span class="value">{{ data.doctorSignature || '-' }}</span>
          </div>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 40px; color: #999;">
        暂无首次病程记录数据
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

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const printArea = ref<HTMLElement>()

// 提取首次病程记录数据
const data = computed(() => {
  if (!props.recordData) return {}
  
  let content = props.recordData.content
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse content:', e)
      return {}
    }
  }
  
  const progressRecord = content.progressRecord || content || {}
  
  // 合并患者基本信息（从 recordData 顶层获取）
  return {
    ...progressRecord,
    // 患者基本信息优先从 recordData 顶层获取
    patientName: props.recordData.patientName || progressRecord.patientName || '-',
    gender: (props.recordData.gender !== undefined && props.recordData.gender !== null && props.recordData.gender !== '') 
      ? props.recordData.gender 
      : (progressRecord.gender || '-'),
    age: (props.recordData.age !== undefined && props.recordData.age !== null) 
      ? props.recordData.age 
      : (progressRecord.age !== undefined && progressRecord.age !== null ? progressRecord.age : ''),
    inpatientNo: props.recordData.inpatientNo || progressRecord.inpatientNo || '-',
    department: props.recordData.department || progressRecord.department || '-',
    bedNo: (props.recordData.bedNo !== undefined && props.recordData.bedNo !== null && props.recordData.bedNo !== '') 
      ? props.recordData.bedNo 
      : (progressRecord.bedNo || '-'),
    admissionDate: props.recordData.admissionDate || progressRecord.admissionDate || '',
    caseNo: props.recordData.inpatientNo || props.recordData.caseNo || progressRecord.caseNo || '-',  // 病案号统一使用住院号
  }
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

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态名称
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'completed': '完成',
    'signed': '已签名',
    'archived': '已归档',
  }
  return statusMap[status] || status || '-'
}

// 格式化多行文本
const formatMultilineText = (text: string) => {
  if (!text) return '-'
  return text.replace(/\n/g, '<br>')
}

// 打印功能
const handlePrint = () => {
  if (!printArea.value) return
  
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>首次病程记录</title>
        <style>
          body { font-family: "Microsoft YaHei", Arial, sans-serif; padding: 20px; }
          .page-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 8px; }
          .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; padding-left: 10px; border-left: 4px solid #409eff; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
          .info-item { display: flex; padding: 8px; border-bottom: 1px solid #eee; }
          .info-item.full-width { grid-column: 1 / -1; }
          .label { font-weight: 600; color: #606266; min-width: 80px; }
          .value { color: #303133; flex: 1; }
          .content-section { padding: 15px; background-color: #f5f7fa; border-radius: 4px; margin-bottom: 15px; }
          .content-item { margin-bottom: 10px; }
          .content-label { font-weight: 600; color: #606266; margin-bottom: 5px; }
          .content-value { color: #303133; line-height: 1.8; white-space: pre-wrap; }
          .diagnosis-text { color: #f56c6c; font-weight: 500; }
          .code-text { color: #409eff; font-family: 'Courier New', monospace; }
          .signature-section { margin-top: 30px; text-align: right; }
          .signature-item { display: inline-block; margin-right: 50px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${printArea.value.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 100)
  }
}
</script>

<style scoped lang="scss">
.progress-record-preview {
  padding: 20px;
  background-color: #fff;
  max-width: 900px;
  margin: 0 auto;
  
  .page-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin: 20px 0;
    letter-spacing: 8px;
    color: #303133;
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
      
      &.full-width {
        grid-column: 1 / -1;
      }
      
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
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 15px;
    
    .content-item {
      margin-bottom: 15px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .content-label {
        font-weight: 600;
        color: #606266;
        margin-bottom: 5px;
      }
      
      .content-value {
        color: #303133;
        line-height: 1.8;
        white-space: pre-wrap;
        word-break: break-word;
        
        &.diagnosis-text {
          color: #f56c6c;
          font-weight: 500;
        }
        
        &.code-text {
          color: #409eff;
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
  
  .signature-section {
    margin-top: 30px;
    text-align: right;
    
    .signature-item {
      display: inline-block;
      margin-right: 50px;
      
      .label {
        font-weight: 600;
        color: #606266;
        margin-right: 10px;
      }
      
      .value {
        color: #303133;
        font-size: 16px;
      }
    }
  }
}
</style>
