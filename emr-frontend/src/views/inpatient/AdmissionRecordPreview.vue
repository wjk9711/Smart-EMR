<template>
  <!-- 内嵌模式：直接显示内容，不带对话框 -->
  <div v-if="mode === 'embedded'" class="admission-record-preview">
    <div v-if="data && Object.keys(data).length > 0">
      <!-- 标题 -->
      <div class="page-title">入 院 记 录</div>
      
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
          <span class="label">记录日期：</span>
          <span class="value">{{ formatDate(data.recordDate) }}</span>
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

      <!-- 入院情况 -->
      <div class="section-title">入院情况</div>
      <div class="content-section">
        <div class="content-item">
          <div class="content-label">主诉：</div>
          <div class="content-value">{{ data.chiefComplaint || '-' }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">现病史：</div>
          <div class="content-value">{{ formatMultilineText(data.presentIllness) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">既往史：</div>
          <div class="content-value">{{ formatMultilineText(data.pastHistory) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">个人史：</div>
          <div class="content-value">{{ formatMultilineText(data.personalHistory) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">婚育史：</div>
          <div class="content-value">{{ formatMultilineText(data.marriageHistory) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">家族史：</div>
          <div class="content-value">{{ formatMultilineText(data.familyHistory) }}</div>
        </div>
      </div>

      <!-- 体格检查 -->
      <div class="section-title">体格检查</div>
      <div class="vital-signs">
        <div class="vital-item">
          <span class="label">体温：</span>
          <span class="value">{{ data.temperature ? data.temperature + '℃' : '-' }}</span>
        </div>
        <div class="vital-item">
          <span class="label">脉搏：</span>
          <span class="value">{{ data.pulse ? data.pulse + '次/分' : '-' }}</span>
        </div>
        <div class="vital-item">
          <span class="label">呼吸：</span>
          <span class="value">{{ data.respiration ? data.respiration + '次/分' : '-' }}</span>
        </div>
        <div class="vital-item">
          <span class="label">血压：</span>
          <span class="value">{{ data.bloodPressure ? data.bloodPressure + 'mmHg' : '-' }}</span>
        </div>
      </div>
      <div class="content-section">
        <div class="content-item">
          <div class="content-label">一般情况：</div>
          <div class="content-value">{{ formatMultilineText(data.generalExam) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">专科检查：</div>
          <div class="content-value">{{ formatMultilineText(data.specialistExam) }}</div>
        </div>
      </div>

      <!-- 辅助检查 -->
      <div class="section-title">辅助检查</div>
      <div class="content-section">
        <div class="content-item">
          <div class="content-label">实验室检查：</div>
          <div class="content-value">{{ formatMultilineText(data.labExam) }}</div>
        </div>
        <div class="content-item">
          <div class="content-label">影像学检查：</div>
          <div class="content-value">{{ formatMultilineText(data.imagingExam) }}</div>
        </div>
      </div>

      <!-- 初步诊断 -->
      <div class="section-title">初步诊断</div>
      <div class="diagnosis-section">
        <div class="diagnosis-row">
          <span class="label">入院诊断：</span>
          <span class="value diagnosis-text">{{ data.admissionDiagnosis || '-' }}</span>
        </div>
        <div class="diagnosis-row">
          <span class="label">疾病编码：</span>
          <span class="value code-text">{{ data.admissionDiagnosisCode || '-' }}</span>
        </div>
      </div>

      <!-- 诊疗计划 -->
      <div class="section-title">诊疗计划</div>
      <div class="content-section">
        <div class="content-item">
          <div class="content-value">{{ formatMultilineText(data.treatmentPlan) }}</div>
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
      暂无入院记录数据
    </div>
  </div>
  
  <!-- 对话框模式：使用 el-dialog -->
  <el-dialog
    v-else
    :model-value="visible"
    title="入院记录预览"
    width="900px"
    top="2vh"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="admission-record-preview" ref="printArea">
      <div v-if="data && Object.keys(data).length > 0">
        <!-- 标题 -->
        <div class="page-title">入 院 记 录</div>
        
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
            <span class="label">记录日期：</span>
            <span class="value">{{ formatDate(data.recordDate) }}</span>
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

        <!-- 入院情况 -->
        <div class="section-title">入院情况</div>
        <div class="content-section">
          <div class="content-item">
            <div class="content-label">主诉：</div>
            <div class="content-value">{{ data.chiefComplaint || '-' }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">现病史：</div>
            <div class="content-value">{{ formatMultilineText(data.presentIllness) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">既往史：</div>
            <div class="content-value">{{ formatMultilineText(data.pastHistory) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">个人史：</div>
            <div class="content-value">{{ formatMultilineText(data.personalHistory) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">婚育史：</div>
            <div class="content-value">{{ formatMultilineText(data.marriageHistory) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">家族史：</div>
            <div class="content-value">{{ formatMultilineText(data.familyHistory) }}</div>
          </div>
        </div>

        <!-- 体格检查 -->
        <div class="section-title">体格检查</div>
        <div class="vital-signs">
          <div class="vital-item">
            <span class="label">体温：</span>
            <span class="value">{{ data.temperature ? data.temperature + '℃' : '-' }}</span>
          </div>
          <div class="vital-item">
            <span class="label">脉搏：</span>
            <span class="value">{{ data.pulse ? data.pulse + '次/分' : '-' }}</span>
          </div>
          <div class="vital-item">
            <span class="label">呼吸：</span>
            <span class="value">{{ data.respiration ? data.respiration + '次/分' : '-' }}</span>
          </div>
          <div class="vital-item">
            <span class="label">血压：</span>
            <span class="value">{{ data.bloodPressure ? data.bloodPressure + 'mmHg' : '-' }}</span>
          </div>
        </div>
        <div class="content-section">
          <div class="content-item">
            <div class="content-label">一般情况：</div>
            <div class="content-value">{{ formatMultilineText(data.generalExam) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">专科检查：</div>
            <div class="content-value">{{ formatMultilineText(data.specialistExam) }}</div>
          </div>
        </div>

        <!-- 辅助检查 -->
        <div class="section-title">辅助检查</div>
        <div class="content-section">
          <div class="content-item">
            <div class="content-label">实验室检查：</div>
            <div class="content-value">{{ formatMultilineText(data.labExam) }}</div>
          </div>
          <div class="content-item">
            <div class="content-label">影像学检查：</div>
            <div class="content-value">{{ formatMultilineText(data.imagingExam) }}</div>
          </div>
        </div>

        <!-- 初步诊断 -->
        <div class="section-title">初步诊断</div>
        <div class="diagnosis-section">
          <div class="diagnosis-row">
            <span class="label">入院诊断：</span>
            <span class="value diagnosis-text">{{ data.admissionDiagnosis || '-' }}</span>
          </div>
          <div class="diagnosis-row">
            <span class="label">疾病编码：</span>
            <span class="value code-text">{{ data.admissionDiagnosisCode || '-' }}</span>
          </div>
        </div>

        <!-- 诊疗计划 -->
        <div class="section-title">诊疗计划</div>
        <div class="content-section">
          <div class="content-item">
            <div class="content-value">{{ formatMultilineText(data.treatmentPlan) }}</div>
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
        暂无入院记录数据
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

// 提取入院记录数据
const data = computed(() => {
  console.log('=== AdmissionRecordPreview - 数据调试 ===')
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
  
  const admissionRecord = content.admissionRecord || content || {}
  console.log('admissionRecord:', admissionRecord)
  
  // 合并患者基本信息（从 recordData 顶层获取）
  const result = {
    ...admissionRecord,
    // 患者基本信息优先从 recordData 顶层获取
    patientName: props.recordData.patientName || admissionRecord.patientName || '-',
    gender: (props.recordData.gender !== undefined && props.recordData.gender !== null && props.recordData.gender !== '') 
      ? props.recordData.gender 
      : (admissionRecord.gender || '-'),
    age: (props.recordData.age !== undefined && props.recordData.age !== null) 
      ? props.recordData.age 
      : (admissionRecord.age !== undefined && admissionRecord.age !== null ? admissionRecord.age : ''),
    inpatientNo: props.recordData.inpatientNo || admissionRecord.inpatientNo || '-',
    department: props.recordData.department || admissionRecord.department || '-',
    bedNo: (props.recordData.bedNo !== undefined && props.recordData.bedNo !== null && props.recordData.bedNo !== '') 
      ? props.recordData.bedNo 
      : (admissionRecord.bedNo || '-'),
    admissionDate: props.recordData.admissionDate || admissionRecord.admissionDate || '',
    caseNo: props.recordData.inpatientNo || props.recordData.caseNo || admissionRecord.caseNo || '-',  // 病案号统一使用住院号
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
  const printContent = printArea.value?.innerHTML
  if (printContent) {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>入院记录打印</title>
          <style>
            body { font-family: 'Microsoft YaHei', sans-serif; padding: 20px; }
            .page-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; padding-left: 10px; border-left: 4px solid #409eff; background-color: #f5f7fa; padding: 8px 10px; }
            .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .info-item { display: flex; align-items: center; padding: 8px; background-color: #fafafa; border-radius: 4px; }
            .label { font-weight: 600; color: #606266; min-width: 80px; }
            .value { color: #303133; flex: 1; }
            .content-section { margin-bottom: 20px; }
            .content-item { margin-bottom: 15px; padding: 10px; background-color: #fafafa; border-radius: 4px; }
            .content-label { font-weight: 600; color: #606266; margin-bottom: 8px; }
            .content-value { color: #303133; white-space: pre-wrap; word-wrap: break-word; line-height: 1.8; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }
}
</script>

<style scoped lang="scss">
.admission-record-preview {
  padding: 20px;
  background-color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.6;

  .page-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 3px solid #409eff;
    color: #303133;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #409eff;
    margin: 25px 0 15px 0;
    padding-left: 10px;
    border-left: 4px solid #409eff;
    background-color: #f5f7fa;
    padding: 8px 10px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;

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
    margin-bottom: 20px;

    .content-item {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #fafafa;
      border-radius: 4px;

      .content-label {
        font-weight: 600;
        color: #606266;
        margin-bottom: 8px;
      }

      .content-value {
        color: #303133;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.8;
      }
    }
  }

  .vital-signs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 20px;

    .vital-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: #ecf5ff;
      border: 1px solid #d9ecff;

      .label {
        font-weight: 600;
        color: #409eff;
        min-width: 60px;
      }

      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }

  .diagnosis-section {
    padding: 15px;
    background-color: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: 4px;
    margin-bottom: 20px;

    .diagnosis-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 600;
        color: #606266;
        min-width: 100px;
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        
        &.diagnosis-text {
          color: #f56c6c;
          font-weight: 500;
        }

        &.code-text {
          color: #409eff;
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }
      }
    }
  }

  .signature-section {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px dashed #dcdfe6;

    .signature-item {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .label {
        font-weight: 600;
        color: #606266;
        margin-right: 10px;
      }

      .value {
        color: #303133;
        font-size: 16px;
        font-weight: 500;
        min-width: 100px;
        text-align: right;
      }
    }
  }
}

@media print {
  .admission-record-preview {
    padding: 10px;
    
    .section-title {
      page-break-after: avoid;
    }
    
    .content-item {
      page-break-inside: avoid;
    }
  }
}
</style>
