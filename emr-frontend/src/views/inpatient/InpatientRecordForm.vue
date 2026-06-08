<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑病案' : '新建病案'"
    width="900px"
    @close="handleClose"
    @opened="handleDialogOpened"
  >
    <el-form
      v-if="isEdit || patientInfoLoaded || !props.patientId"
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <!-- 基本信息 -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="病案号" prop="caseNo">
            <el-input v-model="formData.caseNo" placeholder="与住院号一致" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="病案类型" prop="recordType">
            <el-select v-model="formData.recordType" placeholder="请选择类型" style="width: 100%">
              <el-option label="入院记录" value="admission" />
              <el-option label="病程记录" value="progress" />
              <el-option label="出院记录" value="discharge" />
              <el-option label="手术记录" value="operation" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-select v-model="formData.status" style="width: 100%">
              <el-option label="草稿" value="draft" />
              <el-option label="完成" value="completed" />
              <el-option label="已签名" value="signed" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 患者信息 -->
      <el-divider content-position="left">患者信息</el-divider>
      
      <el-row :gutter="4">
        <el-col :span="6">
          <el-form-item label="姓名" prop="patientName">
            <el-input v-model="formData.patientName" placeholder="请输入姓名" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="性别">
            <el-radio-group v-model="formData.gender" style="display: flex; gap: 10px;" disabled>
              <el-radio value="男" style="margin-right: 0;">男</el-radio>
              <el-radio value="女" style="margin-right: 0;">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="年龄">
            <el-input 
              v-model="formData.age" 
              placeholder="请输入年龄"
              @input="handleAgeInput"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="住院号">
            <el-input v-model="formData.inpatientNo" placeholder="请输入住院号" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="科室">
            <el-select v-model="formData.department" placeholder="请选择科室" style="width: 100%">
              <el-option label="内科" value="内科" />
              <el-option label="外科" value="外科" />
              <el-option label="妇产科" value="妇产科" />
              <el-option label="儿科" value="儿科" />
              <el-option label="骨科" value="骨科" />
              <el-option label="神经科" value="神经科" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="床号">
            <el-input v-model="formData.bedNo" placeholder="请输入床号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="入院日期">
            <el-date-picker
              v-model="formData.admissionDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 诊断信息 -->
      <el-divider content-position="left">诊断信息</el-divider>
      
      <!-- 入院诊断 -->
      <el-form-item label="入院诊断" prop="admissionDiagnosis">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-input
              v-model="formData.admissionDiagnosis"
              type="textarea"
              :rows="2"
              placeholder="请输入入院诊断"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="formData.admissionDiagnosisCode"
              placeholder="ICD-10编码，如：J18.9"
            />
          </el-col>
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="handleCheckCode('admission')"
              :loading="checkingCode === 'admission'"
              style="width: 100%"
            >
              <el-icon><Check /></el-icon>
              检查编码
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 出院诊断 -->
      <el-form-item label="出院诊断">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-input
              v-model="formData.dischargeDiagnosis"
              type="textarea"
              :rows="2"
              placeholder="请输入出院诊断"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="formData.dischargeDiagnosisCode"
              placeholder="ICD-10编码，如：J18.9"
            />
          </el-col>
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="handleCheckCode('discharge')"
              :loading="checkingCode === 'discharge'"
              style="width: 100%"
            >
              <el-icon><Check /></el-icon>
              检查编码
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 主要诊断 -->
      <el-form-item label="主要诊断">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-input
              v-model="formData.mainDiagnosis"
              type="textarea"
              :rows="2"
              placeholder="请输入主要诊断"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="formData.mainDiagnosisCode"
              placeholder="ICD-10编码，如：J18.9"
            />
          </el-col>
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="handleCheckCode('main')"
              :loading="checkingCode === 'main'"
              style="width: 100%"
            >
              <el-icon><Check /></el-icon>
              检查编码
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 其他诊断 -->
      <el-form-item label="其他诊断">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-input
              v-model="formData.otherDiagnosis"
              type="textarea"
              :rows="2"
              placeholder="请输入其他诊断"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="formData.otherDiagnosisCode"
              placeholder="ICD-10编码，多个用逗号分隔"
            />
          </el-col>
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="handleCheckCode('other')"
              :loading="checkingCode === 'other'"
              style="width: 100%"
            >
              <el-icon><Check /></el-icon>
              检查编码
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 治疗信息 -->
      <el-divider content-position="left">治疗信息</el-divider>
      <el-form-item label="治疗方案">
        <el-input
          v-model="formData.treatmentPlan"
          type="textarea"
          :rows="4"
          placeholder="请输入治疗方案"
        />
      </el-form-item>

      <el-form-item label="手术及操作">
        <el-input
          v-model="formData.operations"
          type="textarea"
          :rows="3"
          placeholder="请输入手术及操作内容"
        />
      </el-form-item>

      <el-form-item label="用药情况">
        <el-input
          v-model="formData.medications"
          type="textarea"
          :rows="3"
          placeholder="请输入用药情况"
        />
      </el-form-item>

      <!-- 检查结果 -->
      <el-divider content-position="left">检查结果</el-divider>
      <el-form-item label="体格检查">
        <el-input
          v-model="formData.physicalExam"
          type="textarea"
          :rows="3"
          placeholder="请输入体格检查结果"
        />
      </el-form-item>

      <el-form-item label="辅助检查">
        <el-input
          v-model="formData.auxiliaryExam"
          type="textarea"
          :rows="3"
          placeholder="请输入辅助检查结果"
        />
      </el-form-item>

      <el-form-item label="病理诊断">
        <el-input
          v-model="formData.pathologyDiagnosis"
          type="textarea"
          :rows="2"
          placeholder="请输入病理诊断"
        />
      </el-form-item>

      <!-- 其他信息 -->
      <el-divider content-position="left">其他信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="离院方式">
            <el-select v-model="formData.dischargeMethod" placeholder="请选择" style="width: 100%">
              <el-option label="医嘱离院" value="医嘱离院" />
              <el-option label="医嘱转院" value="医嘱转院" />
              <el-option label="自动离院" value="自动离院" />
              <el-option label="死亡" value="死亡" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出院日期">
            <el-date-picker
              v-model="formData.dischargeDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="过敏史">
        <el-input
          v-model="formData.allergyHistory"
          type="textarea"
          :rows="2"
          placeholder="请输入过敏史"
        />
      </el-form-item>

      <el-form-item label="并发症">
        <el-input
          v-model="formData.complications"
          type="textarea"
          :rows="2"
          placeholder="请输入并发症情况"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, FormInstance, FormRules, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { createInpatientRecord, updateInpatientRecord, getInpatientPatient } from '@/api/inpatient'

interface Props {
  visible: boolean
  recordData?: any
  patientId?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  recordData: null,
  patientId: undefined,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = ref(false)
const checkingCode = ref<string | null>(null) // 当前正在检查的编码类型
const patientInfoLoaded = ref(false) // 标记是否已加载患者信息

const formData = reactive({
  id: null as number | null,
  patientId: 0,
  caseNo: '',
  recordType: 'admission',
  status: 'draft',
  // 患者信息
  patientName: '',
  gender: '男',
  age: '',
  inpatientNo: '',
  department: '',
  bedNo: '',
  admissionDate: '',
  dischargeDate: '',
  // 诊断信息
  admissionDiagnosis: '',
  admissionDiagnosisCode: '',
  dischargeDiagnosis: '',
  dischargeDiagnosisCode: '',
  mainDiagnosis: '',
  mainDiagnosisCode: '',
  otherDiagnosis: '',
  otherDiagnosisCode: '',
  // 治疗信息
  treatmentPlan: '',
  operations: '',
  medications: '',
  // 检查结果
  physicalExam: '',
  auxiliaryExam: '',
  pathologyDiagnosis: '',
  // 其他信息
  dischargeMethod: '',
  allergyHistory: '',
  complications: '',
  remarks: '',
})

const rules: FormRules = {
  caseNo: [{ required: true, message: '病案号不能为空', trigger: 'blur' }],
  recordType: [{ required: true, message: '请选择病案类型', trigger: 'change' }],
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  admissionDiagnosis: [{ required: true, message: '请输入入院诊断', trigger: 'blur' }],
  admissionDiagnosisCode: [
    { 
      pattern: /^[A-Z]\d{2}(\.\d{1,2})?$/, 
      message: '请输入正确的ICD-10编码格式（如：J18.9）', 
      trigger: 'blur' 
    },
  ],
}

const dialogVisible = ref(false)

watch(
  () => props.visible,
  async (val) => {
    dialogVisible.value = val
    console.log('对话框状态变化, visible:', val)
    console.log('当前props:', { recordData: props.recordData, patientId: props.patientId })
    
    if (val && props.recordData) {
      // 编辑模式
      isEdit.value = true
      Object.assign(formData, props.recordData)
      
      // 如果content是JSON字符串，解析并填充到表单字段
      if (props.recordData.content && typeof props.recordData.content === 'string') {
        try {
          const content = JSON.parse(props.recordData.content)
          if (content.patientInfo) {
            formData.patientName = content.patientInfo.name || ''
            formData.gender = content.patientInfo.gender || '男'
            formData.age = content.patientInfo.age ? String(content.patientInfo.age) : ''
            formData.inpatientNo = content.patientInfo.inpatientNo || ''
            formData.department = content.patientInfo.department || ''
            formData.bedNo = content.patientInfo.bedNo || ''
            formData.admissionDate = content.patientInfo.admissionDate || ''
            formData.dischargeDate = content.patientInfo.dischargeDate || ''
            // 确保病案号与住院号一致
            if (!formData.caseNo && formData.inpatientNo) {
              formData.caseNo = formData.inpatientNo
            }
          }
          if (content.diagnosis) {
            formData.admissionDiagnosis = content.diagnosis.admission || ''
            formData.admissionDiagnosisCode = content.diagnosis.admissionCode || ''
            formData.dischargeDiagnosis = content.diagnosis.discharge || ''
            formData.dischargeDiagnosisCode = content.diagnosis.dischargeCode || ''
            formData.mainDiagnosis = content.diagnosis.main || ''
            formData.mainDiagnosisCode = content.diagnosis.mainCode || ''
            formData.otherDiagnosis = content.diagnosis.other || ''
            formData.otherDiagnosisCode = content.diagnosis.otherCode || ''
          }
          if (content.treatment) {
            formData.treatmentPlan = content.treatment.plan || ''
            formData.operations = content.treatment.operations || ''
            formData.medications = content.treatment.medications || ''
          }
          if (content.examination) {
            formData.physicalExam = content.examination.physical || ''
            formData.auxiliaryExam = content.examination.auxiliary || ''
            formData.pathologyDiagnosis = content.examination.pathology || ''
          }
          if (content.other) {
            formData.dischargeMethod = content.other.dischargeMethod || ''
            formData.allergyHistory = content.other.allergyHistory || ''
            formData.complications = content.other.complications || ''
            formData.remarks = content.other.remarks || ''
          }
        } catch (e) {
          console.error('Failed to parse record content:', e)
        }
      }
    } else if (val) {
      // 新增模式
      isEdit.value = false
      patientInfoLoaded.value = false
      resetForm()
      console.log('新增模式 - props.patientId:', props.patientId)
      
      // 等待下一个tick，确保resetForm的更新完成
      await nextTick()
      
      if (props.patientId) {
        formData.patientId = props.patientId
        console.log('设置formData.patientId:', props.patientId)
        console.log('⏳ 等待对话框完全打开后再加载患者信息...')
        // 不在这里加载，而是在@opened事件中加载
      } else {
        console.warn('没有传入patientId，无法加载患者信息')
      }
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 对话框完全打开后的回调
const handleDialogOpened = async () => {
  console.log('📬 对话框已完全打开')
  
  // 如果是新增模式且还没有加载患者信息，则加载
  if (!isEdit.value && props.patientId && !patientInfoLoaded.value) {
    console.log('开始加载患者信息（在对话框打开后）, patientId:', props.patientId)
    await loadPatientInfo(props.patientId)
  }
}

// 加载患者信息
const loadPatientInfo = async (patientId: number) => {
  console.log('loadPatientInfo 被调用, patientId:', patientId)
  try {
    console.log('即将调用 getInpatientPatient API...')
    const patient: any = await getInpatientPatient(patientId)
    console.log('API返回的患者数据:', patient)
    console.log('患者数据类型:', typeof patient)
    console.log('患者数据键名:', Object.keys(patient || {}))
    
    if (patient) {
      // 自动填充患者基本信息 - 使用 Object.assign 确保响应式更新
      console.log('开始填充表单字段...')
      
      // 构建要更新的数据对象
      const updates = {
        patientName: patient.name || '',
        gender: patient.gender || '男',
        age: patient.age ? String(patient.age) : '',
        inpatientNo: patient.inpatientNo || '',
        department: patient.department || '',
        bedNo: patient.bedNo || '',
        admissionDate: patient.admissionDate || new Date().toISOString().split('T')[0],
        // 病案号与住院号一致
        caseNo: patient.inpatientNo || '',
      }
      
      console.log('准备更新的数据:', updates)
      
      // 使用 Object.assign 批量更新，确保Vue能追踪到变化
      Object.assign(formData, updates)
      
      console.log('更新后的formData:', {
        patientName: formData.patientName,
        gender: formData.gender,
        age: formData.age,
        inpatientNo: formData.inpatientNo,
        department: formData.department,
        bedNo: formData.bedNo,
        admissionDate: formData.admissionDate,
      })
      
      patientInfoLoaded.value = true
      console.log('✅ 患者信息加载成功！patientInfoLoaded =', patientInfoLoaded.value)
      
      // 等待下一个tick，确保DOM更新
      await nextTick()
      console.log('✅ DOM已更新完成')
    } else {
      console.warn('⚠️ 患者数据为空')
      ElMessage.warning('未找到患者信息')
    }
  } catch (error: any) {
    console.error('❌ Failed to load patient info:', error)
    console.error('错误详情:', error.message)
    console.error('错误响应:', error.response)
    ElMessage.warning('加载患者信息失败：' + (error.message || '未知错误'))
  }
}

const resetForm = () => {
  formData.id = null
  formData.patientId = props.patientId || 0
  // 病案号将在加载患者信息后设置为住院号
  formData.caseNo = ''
  formData.recordType = 'admission'
  formData.status = 'draft'
  // 患者信息
  formData.patientName = ''
  formData.gender = '男'
  formData.age = ''
  formData.inpatientNo = ''
  formData.department = ''
  formData.bedNo = ''
  formData.admissionDate = new Date().toISOString().split('T')[0]
  formData.dischargeDate = ''
  // 诊断信息
  formData.admissionDiagnosis = ''
  formData.admissionDiagnosisCode = ''
  formData.dischargeDiagnosis = ''
  formData.dischargeDiagnosisCode = ''
  formData.mainDiagnosis = ''
  formData.mainDiagnosisCode = ''
  formData.otherDiagnosis = ''
  formData.otherDiagnosisCode = ''
  // 治疗信息
  formData.treatmentPlan = ''
  formData.operations = ''
  formData.medications = ''
  // 检查结果
  formData.physicalExam = ''
  formData.auxiliaryExam = ''
  formData.pathologyDiagnosis = ''
  // 其他信息
  formData.dischargeMethod = ''
  formData.allergyHistory = ''
  formData.complications = ''
  formData.remarks = ''
}

const generateCaseNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `BA${year}${month}${day}${random}`
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  checkingCode.value = null
}

// 处理年龄输入，确保只允许数字
const handleAgeInput = (value: string) => {
  // 移除非数字字符
  const numericValue = value.replace(/[^0-9]/g, '')
  
  // 转换为数字并限制范围，但保持为字符串
  if (numericValue === '') {
    formData.age = ''
  } else {
    let age = parseInt(numericValue, 10)
    if (age < 0) age = 0
    if (age > 150) age = 150
    formData.age = String(age)
  }
}

// 调用通义千问API检查ICD-10编码
const handleCheckCode = async (type: 'admission' | 'discharge' | 'main' | 'other') => {
  const diagnosisMap: Record<string, string> = {
    admission: formData.admissionDiagnosis,
    discharge: formData.dischargeDiagnosis,
    main: formData.mainDiagnosis,
    other: formData.otherDiagnosis,
  }
  
  const codeMap: Record<string, string> = {
    admission: formData.admissionDiagnosisCode,
    discharge: formData.dischargeDiagnosisCode,
    main: formData.mainDiagnosisCode,
    other: formData.otherDiagnosisCode,
  }
  
  const diagnosis = diagnosisMap[type]
  const currentCode = codeMap[type]
  
  if (!diagnosis) {
    ElMessage.warning('请先输入诊断名称')
    return
  }
  
  checkingCode.value = type
  
  try {
    // 调用后端API，由后端转发到通义千问
    const response = await fetch('/api/inpatient/check-icd-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        diagnosis,
        currentCode,
      }),
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      const data = result.data
      
      if (data.isCorrect) {
        ElMessage.success(`编码正确！${currentCode} 对应 ${diagnosis}`)
      } else {
        // 显示推荐的编码
        const recommendedCodes = data.recommendedCodes || []
        const message = `编码可能不正确\n\n当前编码：${currentCode || '未填写'}\n诊断：${diagnosis}\n\n推荐编码：\n${recommendedCodes.map((item: any) => `${item.code} - ${item.description}`).join('\n')}`
        
        await ElMessageBox.alert(message, '编码检查结果', {
          confirmButtonText: '使用推荐编码',
          cancelButtonText: '取消',
          showCancelButton: recommendedCodes.length > 0,
        })
        
        // 如果用户选择使用推荐编码，使用第一个推荐
        if (recommendedCodes.length > 0) {
          codeMap[type] = recommendedCodes[0].code
          ElMessage.success('已自动填充推荐编码')
        }
      }
    } else {
      ElMessage.error(result.message || '检查失败')
    }
  } catch (error: any) {
    console.error('Check ICD code error:', error)
    ElMessage.error(error.message || '检查编码失败')
  } finally {
    checkingCode.value = null
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 将表单数据转换为JSON格式存储到content字段
      const recordContent = {
        patientInfo: {
          name: formData.patientName,
          gender: formData.gender,
          age: formData.age,
          inpatientNo: formData.inpatientNo,
          department: formData.department,
          bedNo: formData.bedNo,
          admissionDate: formData.admissionDate,
          dischargeDate: formData.dischargeDate,
        },
        diagnosis: {
          admission: formData.admissionDiagnosis,
          admissionCode: formData.admissionDiagnosisCode,
          discharge: formData.dischargeDiagnosis,
          dischargeCode: formData.dischargeDiagnosisCode,
          main: formData.mainDiagnosis,
          mainCode: formData.mainDiagnosisCode,
          other: formData.otherDiagnosis,
          otherCode: formData.otherDiagnosisCode,
        },
        treatment: {
          plan: formData.treatmentPlan,
          operations: formData.operations,
          medications: formData.medications,
        },
        examination: {
          physical: formData.physicalExam,
          auxiliary: formData.auxiliaryExam,
          pathology: formData.pathologyDiagnosis,
        },
        other: {
          dischargeMethod: formData.dischargeMethod,
          allergyHistory: formData.allergyHistory,
          complications: formData.complications,
          remarks: formData.remarks,
        },
      }

      const submitData = {
        patientId: formData.patientId || props.patientId,
        caseNo: formData.caseNo,
        recordType: formData.recordType,
        content: JSON.stringify(recordContent),
        status: formData.status,
      }

      if (isEdit.value) {
        await updateInpatientRecord(formData.id!, submitData)
        ElMessage.success('更新成功')
      } else {
        await createInpatientRecord(submitData)
        ElMessage.success('创建成功')
      }
      handleClose()
      emit('success')
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.el-form {
  padding: 20px 0;
}
</style>
