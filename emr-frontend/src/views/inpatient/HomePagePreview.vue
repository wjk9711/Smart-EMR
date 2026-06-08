<template>
  <!-- 内嵌模式：直接显示内容，不带对话框 -->
  <div v-if="mode === 'embedded'" class="home-page-preview">
    <div v-if="data && Object.keys(data).length > 0">
      <!-- 标题 -->
      <div class="page-title">住 院 病 案 首 页</div>
      
      <!-- 第一行 -->
      <div class="info-row">
        <div class="info-item">
          <span class="label">医疗付费方式：</span>
          <span class="value">{{ getPaymentMethodName(data.medicalPaymentMethod) }}</span>
        </div>
        <div class="info-item">
          <span class="label">健康卡号：</span>
          <span class="value">{{ data.healthCardNo || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">第 {{ data.visitCount || 1 }} 次住院</span>
        </div>
        <div class="info-item">
          <span class="label">病案号：</span>
          <span class="value">{{ data.caseNo || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">总页数 {{ data.totalPages || 2 }} 页</span>
        </div>
      </div>

      <!-- 患者基本信息 -->
      <div class="section-title">患者基本信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">姓名：</span>
          <span class="value">{{ data.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别：</span>
          <span class="value">{{ data.gender || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">出生日期：</span>
          <span class="value">{{ formatDate(data.birthDate) }}</span>
        </div>
        <div class="info-item">
          <span class="label">年龄：</span>
          <span class="value">{{ data.age ? data.age + '岁' : '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">国籍：</span>
          <span class="value">{{ data.nationality || '中国' }}</span>
        </div>
        <div class="info-item">
          <span class="label">民族：</span>
          <span class="value">{{ data.ethnicity || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">身份证号：</span>
          <span class="value">{{ data.idCard || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">职业：</span>
          <span class="value">{{ data.occupation || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">婚姻状况：</span>
          <span class="value">{{ getMarriageName(data.marriage) }}</span>
        </div>
        <div class="info-item">
          <span class="label">出生地址：</span>
          <span class="value">{{ data.birthAddress || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">现住址：</span>
          <span class="value">{{ data.currentAddress || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">户口地址：</span>
          <span class="value">{{ data.householdAddress || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">工作单位：</span>
          <span class="value">{{ data.workUnit || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系人姓名：</span>
          <span class="value">{{ data.contactName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系人关系：</span>
          <span class="value">{{ data.contactRelation || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系人电话：</span>
          <span class="value">{{ data.contactPhone || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系人地址：</span>
          <span class="value">{{ data.contactAddress || '-' }}</span>
        </div>
      </div>

      <!-- 入院信息 -->
      <div class="section-title">入院信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">入院途径：</span>
          <span class="value">{{ getAdmissionRouteName(data.admissionRoute) }}</span>
        </div>
        <div class="info-item">
          <span class="label">入院时间：</span>
          <span class="value">{{ formatDateTime(data.admissionTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">入院科别：</span>
          <span class="value">{{ data.admissionDepartment || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">入院病房：</span>
          <span class="value">{{ data.admissionWard || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">转科科别：</span>
          <span class="value">{{ data.transferDepartment || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">实际住院天数：</span>
          <span class="value">{{ data.actualHospitalDays || 0 }} 天</span>
        </div>
      </div>

      <!-- 出院信息 -->
      <div class="section-title">出院信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">出院时间：</span>
          <span class="value">{{ formatDateTime(data.dischargeTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">出院科别：</span>
          <span class="value">{{ data.dischargeDepartment || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">出院病房：</span>
          <span class="value">{{ data.dischargeWard || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">实际住院天数：</span>
          <span class="value">{{ data.actualHospitalDays || 0 }} 天</span>
        </div>
        <div class="info-item">
          <span class="label">离院方式：</span>
          <span class="value">{{ data.dischargeMethod || '-' }}</span>
        </div>
      </div>

      <!-- 诊断信息 -->
      <div class="section-title">出院诊断</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>出院诊断</th>
            <th>疾病编码</th>
            <th>入院病情</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(diag, index) in (data.dischargeDiagnoses || [])" :key="index">
            <td>{{ diag.diagnosis || diag.name || '-' }}</td>
            <td>{{ diag.code || '-' }}</td>
            <td>{{ getAdmissionConditionName(diag.condition || diag.admissionCondition) }}</td>
          </tr>
          <tr v-if="!data.dischargeDiagnoses || data.dischargeDiagnoses.length === 0">
            <td colspan="3" style="text-align: center; color: #999;">暂无诊断信息</td>
          </tr>
        </tbody>
      </table>

      <!-- 手术及操作 -->
      <div class="section-title">手术及操作</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>手术及操作名称</th>
            <th>手术日期</th>
            <th>手术级别</th>
            <th>术者</th>
            <th>I助</th>
            <th>II助</th>
            <th>切口愈合</th>
            <th>麻醉方式</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(op, index) in (data.operations || [])" :key="index">
            <td>{{ op.operationName || op.name || '-' }}</td>
            <td>{{ formatDate(op.operationDate || op.date) }}</td>
            <td>{{ op.level || '-' }}</td>
            <td>{{ op.surgeon || op.operator || '-' }}</td>
            <td>{{ op.firstAssistant || '-' }}</td>
            <td>{{ op.secondAssistant || '-' }}</td>
            <td>{{ op.incisionHealing || '-' }}</td>
            <td>{{ op.anesthesiaMethod || '-' }}</td>
          </tr>
          <tr v-if="!data.operations || data.operations.length === 0">
            <td colspan="8" style="text-align: center; color: #999;">暂无手术信息</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else style="text-align: center; padding: 40px; color: #999;">
      暂无病案首页数据
    </div>
  </div>
  
  <!-- 对话框模式：使用 el-dialog -->
  <el-dialog
    v-else
    :model-value="visible"
    title="病案首页预览"
    width="1000px"
    top="2vh"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="home-page-preview" ref="printArea">
      <div v-if="data && Object.keys(data).length > 0">
        <!-- 标题 -->
        <div class="page-title">住 院 病 案 首 页</div>
        
        <!-- 第一行 -->
        <div class="info-row">
          <div class="info-item">
            <span class="label">医疗付费方式：</span>
            <span class="value">{{ getPaymentMethodName(data.medicalPaymentMethod) }}</span>
          </div>
          <div class="info-item">
            <span class="label">健康卡号：</span>
            <span class="value">{{ data.healthCardNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">第 {{ data.visitCount || 1 }} 次住院</span>
          </div>
          <div class="info-item">
            <span class="label">病案号：</span>
            <span class="value">{{ data.caseNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">总页数 {{ data.totalPages || 2 }} 页</span>
          </div>
        </div>

        <!-- 患者基本信息 -->
        <div class="section-title">患者基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ data.name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ data.gender || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">出生日期：</span>
            <span class="value">{{ formatDate(data.birthDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄：</span>
            <span class="value">{{ data.age ? data.age + '岁' : '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">国籍：</span>
            <span class="value">{{ data.nationality || '中国' }}</span>
          </div>
          <div class="info-item">
            <span class="label">民族：</span>
            <span class="value">{{ data.ethnicity || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">身份证号：</span>
            <span class="value">{{ data.idCard || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">职业：</span>
            <span class="value">{{ data.occupation || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">婚姻状况：</span>
            <span class="value">{{ getMarriageName(data.marriage) }}</span>
          </div>
          <div class="info-item">
            <span class="label">出生地址：</span>
            <span class="value">{{ data.birthAddress || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">现住址：</span>
            <span class="value">{{ data.currentAddress || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">户口地址：</span>
            <span class="value">{{ data.householdAddress || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">工作单位：</span>
            <span class="value">{{ data.workUnit || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系人姓名：</span>
            <span class="value">{{ data.contactName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系人关系：</span>
            <span class="value">{{ data.contactRelation || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系人电话：</span>
            <span class="value">{{ data.contactPhone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系人地址：</span>
            <span class="value">{{ data.contactAddress || '-' }}</span>
          </div>
        </div>

        <!-- 入院信息 -->
        <div class="section-title">入院信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">入院途径：</span>
            <span class="value">{{ getAdmissionRouteName(data.admissionRoute) }}</span>
          </div>
          <div class="info-item">
            <span class="label">入院时间：</span>
            <span class="value">{{ formatDateTime(data.admissionTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">入院科别：</span>
            <span class="value">{{ data.admissionDepartment || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">入院病房：</span>
            <span class="value">{{ data.admissionWard || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">转科科别：</span>
            <span class="value">{{ data.transferDepartment || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际住院天数：</span>
            <span class="value">{{ data.actualHospitalDays || 0 }} 天</span>
          </div>
        </div>

        <!-- 出院信息 -->
        <div class="section-title">出院信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">出院时间：</span>
            <span class="value">{{ formatDateTime(data.dischargeTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">出院科别：</span>
            <span class="value">{{ data.dischargeDepartment || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">出院病房：</span>
            <span class="value">{{ data.dischargeWard || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际住院天数：</span>
            <span class="value">{{ data.actualHospitalDays || 0 }} 天</span>
          </div>
          <div class="info-item">
            <span class="label">离院方式：</span>
            <span class="value">{{ data.dischargeMethod || '-' }}</span>
          </div>
        </div>

        <!-- 诊断信息 -->
        <div class="section-title">出院诊断</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>出院诊断</th>
              <th>疾病编码</th>
              <th>入院病情</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(diag, index) in (data.dischargeDiagnoses || [])" :key="index">
              <td>{{ diag.diagnosis || diag.name || '-' }}</td>
              <td>{{ diag.code || '-' }}</td>
              <td>{{ getAdmissionConditionName(diag.condition || diag.admissionCondition) }}</td>
            </tr>
            <tr v-if="!data.dischargeDiagnoses || data.dischargeDiagnoses.length === 0">
              <td colspan="3" style="text-align: center; color: #999;">暂无诊断信息</td>
            </tr>
          </tbody>
        </table>

        <!-- 手术及操作 -->
        <div class="section-title">手术及操作</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>手术及操作名称</th>
              <th>手术日期</th>
              <th>手术级别</th>
              <th>术者</th>
              <th>I助</th>
              <th>II助</th>
              <th>切口愈合</th>
              <th>麻醉方式</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(op, index) in (data.operations || [])" :key="index">
              <td>{{ op.operationName || op.name || '-' }}</td>
              <td>{{ formatDate(op.operationDate || op.date) }}</td>
              <td>{{ op.level || '-' }}</td>
              <td>{{ op.surgeon || op.operator || '-' }}</td>
              <td>{{ op.firstAssistant || '-' }}</td>
              <td>{{ op.secondAssistant || '-' }}</td>
              <td>{{ op.incisionHealing || '-' }}</td>
              <td>{{ op.anesthesiaMethod || '-' }}</td>
            </tr>
            <tr v-if="!data.operations || data.operations.length === 0">
              <td colspan="8" style="text-align: center; color: #999;">暂无手术信息</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align: center; padding: 40px; color: #999;">
        暂无病案首页数据
      </div>
    </div>
    
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
      <el-button type="primary" @click="handlePrint">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

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

// 提取病案首页数据
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
  
  return content.homePage || content || {}
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

// 获取付费方式名称
const getPaymentMethodName = (method: string) => {
  const methodMap: Record<string, string> = {
    '1': '城镇职工基本医疗保险',
    '2': '城镇居民基本医疗保险',
    '3': '新型农村合作医疗',
    '4': '贫困救助',
    '5': '商业医疗保险',
    '6': '全公费',
    '7': '全自费',
    '8': '其他社会保险',
    '9': '其他',
  }
  return methodMap[method] || '-'
}

// 获取婚姻状况名称
const getMarriageName = (marriage: string) => {
  const marriageMap: Record<string, string> = {
    '1': '未婚',
    '2': '已婚',
    '3': '丧偶',
    '4': '离婚',
    '5': '其他',
  }
  return marriageMap[marriage] || '-'
}

// 获取入院途径名称
const getAdmissionRouteName = (route: string) => {
  const routeMap: Record<string, string> = {
    '1': '急诊',
    '2': '门诊',
    '3': '其他医疗机构转入',
    '4': '其他',
  }
  return routeMap[route] || '-'
}

// 获取入院病情名称
const getAdmissionConditionName = (condition: string) => {
  const conditionMap: Record<string, string> = {
    '1': '有',
    '2': '临床未确定',
    '3': '情况不明',
    '4': '无',
  }
  return conditionMap[condition] || '-'
}

// 获取血型名称
const getBloodTypeName = (code: string) => {
  const map: Record<string, string> = {
    '1': 'A',
    '2': 'B',
    '3': 'O',
    '4': 'AB',
    '5': '不详',
    '6': '未查',
  }
  return map[code] || '-'
}

// 获取Rh名称
const getRhName = (code: string) => {
  const map: Record<string, string> = {
    '1': '阳',
    '2': '阴',
    '3': '不详',
    '4': '未查',
  }
  return map[code] || '-'
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
          <title>病案首页打印</title>
          <style>
            body { font-family: 'Microsoft YaHei', sans-serif; padding: 20px; }
            .page-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 8px; }
            .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; padding-left: 10px; border-left: 4px solid #409eff; }
            .info-row { display: flex; flex-wrap: wrap; margin-bottom: 10px; }
            .info-item { margin: 5px 10px; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
            .label { font-weight: bold; color: #606266; }
            .value { color: #303133; }
            .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .data-table th, .data-table td { border: 1px solid #dcdfe6; padding: 8px; text-align: left; }
            .data-table th { background-color: #f5f7fa; font-weight: bold; }
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

// 监听数据变化（仅在对话框模式下）
watch(() => [props.visible, props.recordData], () => {
  if (props.mode === 'dialog' && props.visible && props.recordData) {
    console.log('预览组件 - 数据加载')
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.home-page-preview {
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
  
  .info-row {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .info-item {
    .label {
      font-weight: bold;
      color: #606266;
      margin-right: 5px;
    }
    .value {
      color: #303133;
    }
    &.full-width {
      grid-column: 1 / -1;
    }
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    
    th, td {
      border: 1px solid #dcdfe6;
      padding: 8px;
      text-align: left;
      font-size: 14px;
    }
    
    th {
      background-color: #f5f7fa;
      font-weight: bold;
      color: #303133;
    }
    
    td {
      color: #606266;
    }
  }
}
</style>
