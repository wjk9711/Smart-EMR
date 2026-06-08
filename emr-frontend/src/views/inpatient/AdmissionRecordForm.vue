<template>
  <el-dialog
    v-model="dialogVisible"
    title="入院记录"
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
          <el-form-item label="病案号">
            <el-input v-model="formData.caseNo" placeholder="与住院号一致" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-select v-model="formData.status" style="width: 100%">
              <el-option label="草稿" value="draft" />
              <el-option label="完成" value="completed" />
              <el-option label="已签名" value="signed" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="记录日期">
            <el-date-picker
              v-model="formData.recordDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 患者信息（自动填充，不可修改） -->
      <el-divider content-position="left">患者信息</el-divider>
      <el-row :gutter="4">
        <el-col :span="6">
          <el-form-item label="姓名">
            <el-input v-model="formData.patientName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="性别">
            <el-radio-group v-model="formData.gender" disabled>
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="年龄">
            <el-input v-model="formData.age" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="住院号">
            <el-input v-model="formData.inpatientNo" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="科室">
            <el-input v-model="formData.department" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="床号">
            <el-input v-model="formData.bedNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="入院日期">
            <el-date-picker
              v-model="formData.admissionDate"
              type="date"
              style="width: 100%"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 入院记录特有字段 -->
      <el-divider content-position="left">入院情况</el-divider>
      
      <el-form-item label="主诉" prop="chiefComplaint">
        <el-input
          v-model="formData.chiefComplaint"
          type="textarea"
          :rows="3"
          placeholder="请输入患者主要症状及持续时间"
        />
      </el-form-item>

      <el-form-item label="现病史" prop="presentIllness">
        <el-input
          v-model="formData.presentIllness"
          type="textarea"
          :rows="5"
          placeholder="请详细描述疾病的发生、发展及诊疗经过"
        />
      </el-form-item>

      <el-form-item label="既往史">
        <el-input
          v-model="formData.pastHistory"
          type="textarea"
          :rows="3"
          placeholder="既往健康状况、疾病史、手术史、输血史等"
        />
      </el-form-item>

      <el-form-item label="个人史">
        <el-input
          v-model="formData.personalHistory"
          type="textarea"
          :rows="2"
          placeholder="出生地、居住地、生活习惯、职业等"
        />
      </el-form-item>

      <el-form-item label="婚育史">
        <el-input
          v-model="formData.marriageHistory"
          type="textarea"
          :rows="2"
          placeholder="婚姻状况、生育情况等"
        />
      </el-form-item>

      <el-form-item label="家族史">
        <el-input
          v-model="formData.familyHistory"
          type="textarea"
          :rows="2"
          placeholder="家族遗传病史、类似疾病史等"
        />
      </el-form-item>

      <!-- 体格检查 -->
      <el-divider content-position="left">体格检查</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="体温">
            <el-input v-model="formData.temperature" placeholder="℃" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="脉搏">
            <el-input v-model="formData.pulse" placeholder="次/分" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="呼吸">
            <el-input v-model="formData.respiration" placeholder="次/分" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="血压">
            <el-input v-model="formData.bloodPressure" placeholder="mmHg" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="一般情况">
        <el-input
          v-model="formData.generalExam"
          type="textarea"
          :rows="2"
          placeholder="发育、营养、神志、体位等"
        />
      </el-form-item>

      <el-form-item label="专科检查">
        <el-input
          v-model="formData.specialistExam"
          type="textarea"
          :rows="4"
          placeholder="请输入专科检查结果"
        />
      </el-form-item>

      <!-- 辅助检查 -->
      <el-divider content-position="left">辅助检查</el-divider>
      
      <el-form-item label="实验室检查">
        <el-input
          v-model="formData.labExam"
          type="textarea"
          :rows="3"
          placeholder="血常规、尿常规、生化等检查结果"
        />
      </el-form-item>

      <el-form-item label="影像学检查">
        <el-input
          v-model="formData.imagingExam"
          type="textarea"
          :rows="3"
          placeholder="X线、CT、MRI、超声等检查结果"
        />
      </el-form-item>

      <!-- 初步诊断 -->
      <el-divider content-position="left">初步诊断</el-divider>
      
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

      <!-- 诊疗计划 -->
      <el-divider content-position="left">诊疗计划</el-divider>
      
      <el-form-item label="诊疗计划">
        <el-input
          v-model="formData.treatmentPlan"
          type="textarea"
          :rows="4"
          placeholder="请输入诊疗计划"
        />
      </el-form-item>

      <el-form-item label="医师签名">
        <el-input v-model="formData.doctorSignature" placeholder="请输入医师姓名" />
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
import { ElMessage, FormInstance, FormRules } from 'element-plus'
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
const checkingCode = ref<string | null>(null)
const patientInfoLoaded = ref(false)

const formData = reactive({
  id: null as number | null,
  patientId: 0,
  caseNo: '',
  recordType: 'admission',
  status: 'draft',
  recordDate: new Date().toISOString().split('T')[0],
  // 患者信息
  patientName: '',
  gender: '男',
  age: '',
  inpatientNo: '',
  department: '',
  bedNo: '',
  admissionDate: '',
  // 入院记录特有字段
  chiefComplaint: '',
  presentIllness: '',
  pastHistory: '',
  personalHistory: '',
  marriageHistory: '',
  familyHistory: '',
  // 体格检查
  temperature: '',
  pulse: '',
  respiration: '',
  bloodPressure: '',
  generalExam: '',
  specialistExam: '',
  // 辅助检查
  labExam: '',
  imagingExam: '',
  // 诊断
  admissionDiagnosis: '',
  admissionDiagnosisCode: '',
  // 诊疗计划
  treatmentPlan: '',
  doctorSignature: '',
})

const rules: FormRules = {
  chiefComplaint: [{ required: true, message: '请输入主诉', trigger: 'blur' }],
  presentIllness: [{ required: true, message: '请输入现病史', trigger: 'blur' }],
  admissionDiagnosis: [{ required: true, message: '请输入入院诊断', trigger: 'blur' }],
}

const dialogVisible = ref(false)

watch(() => props.visible, async (val) => {
  dialogVisible.value = val
  
  if (val && props.recordData) {
    // 编辑模式
    isEdit.value = true
    patientInfoLoaded.value = false
    
    // 设置病案ID
    formData.id = props.recordData.id
    console.log('编辑模式 - 病案ID:', formData.id)
    
    // 先加载患者信息
    if (props.patientId) {
      await loadPatientInfo(props.patientId)
    }
    
    // 再加载病案数据（不会覆盖患者信息）
    loadRecordData()
  } else if (val) {
    // 新增模式
    isEdit.value = false
    patientInfoLoaded.value = false
    resetForm()
    
    await nextTick()
    
    if (props.patientId) {
      formData.patientId = props.patientId
      await loadPatientInfo(props.patientId)
    }
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleDialogOpened = () => {
  // 不需要在这里加载，已经在 watch 中处理
}

const loadPatientInfo = async (patientId: number) => {
  try {
    console.log('开始加载患者信息，patientId:', patientId)
    const patient: any = await getInpatientPatient(patientId)
    
    console.log('患者信息响应:', patient)
    
    if (patient) {
      // 只更新患者基本信息字段
      const patientFields = [
        'patientName', 'gender', 'age', 'inpatientNo', 
        'department', 'bedNo', 'admissionDate', 'caseNo'
      ]
      
      patientFields.forEach(field => {
        let value: any
        switch (field) {
          case 'patientName':
            value = patient.name || ''
            break
          case 'gender':
            value = patient.gender || '男'
            break
          case 'age':
            value = patient.age ? String(patient.age) : ''
            break
          case 'inpatientNo':
            value = patient.inpatientNo || ''
            break
          case 'department':
            value = patient.department || ''
            break
          case 'bedNo':
            value = patient.bedNo || ''
            break
          case 'admissionDate':
            value = patient.admissionDate || new Date().toISOString().split('T')[0]
            break
          case 'caseNo':
            value = patient.inpatientNo || ''
            break
          default:
            value = ''
        }
        ;(formData as any)[field] = value
      })
      
      patientInfoLoaded.value = true
      console.log('患者信息加载完成')
      await nextTick()
    } else {
      ElMessage.warning('未找到患者信息')
    }
  } catch (error: any) {
    console.error('Failed to load patient info:', error)
    ElMessage.warning('加载患者信息失败')
  }
}

const resetForm = () => {
  formData.id = null
  formData.patientId = props.patientId || 0
  formData.caseNo = ''
  formData.recordType = 'admission'
  formData.status = 'draft'
  formData.recordDate = new Date().toISOString().split('T')[0]
  formData.patientName = ''
  formData.gender = '男'
  formData.age = ''
  formData.inpatientNo = ''
  formData.department = ''
  formData.bedNo = ''
  formData.admissionDate = new Date().toISOString().split('T')[0]
  formData.chiefComplaint = ''
  formData.presentIllness = ''
  formData.pastHistory = ''
  formData.personalHistory = ''
  formData.marriageHistory = ''
  formData.familyHistory = ''
  formData.temperature = ''
  formData.pulse = ''
  formData.respiration = ''
  formData.bloodPressure = ''
  formData.generalExam = ''
  formData.specialistExam = ''
  formData.labExam = ''
  formData.imagingExam = ''
  formData.admissionDiagnosis = ''
  formData.admissionDiagnosisCode = ''
  formData.treatmentPlan = ''
  formData.doctorSignature = ''
}

// 加载已有病案数据
const loadRecordData = () => {
  if (props.recordData?.content) {
    try {
      const content = typeof props.recordData.content === 'string' 
        ? JSON.parse(props.recordData.content) 
        : props.recordData.content
      
      const admissionRecord = content.admissionRecord || {}
      
      // 定义不应该被病案数据覆盖的患者基本信息字段
      const patientInfoFields = [
        'patientName', 'gender', 'age', 'inpatientNo', 
        'department', 'bedNo', 'admissionDate', 'caseNo'
      ]
      
      // 填充病案特有字段（排除患者基本信息）
      Object.keys(admissionRecord).forEach(key => {
        if (!patientInfoFields.includes(key) && admissionRecord[key] !== undefined) {
          (formData as any)[key] = admissionRecord[key]
        }
      })
      
      // 同时更新顶层字段（recordDate, status等）
      if (props.recordData.recordDate) {
        formData.recordDate = props.recordData.recordDate
      }
      if (props.recordData.status) {
        formData.status = props.recordData.status
      }
      
      console.log('病案数据加载完成')
    } catch (error) {
      console.error('Failed to parse record content:', error)
    }
  }
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  checkingCode.value = null
}

const handleCheckCode = async (type: string) => {
  const diagnosis = formData.admissionDiagnosis
  const currentCode = formData.admissionDiagnosisCode
  
  if (!diagnosis) {
    ElMessage.warning('请先输入诊断名称')
    return
  }
  
  checkingCode.value = type
  
  try {
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
        const recommendedCodes = data.recommendedCodes || []
        if (recommendedCodes.length > 0) {
          formData.admissionDiagnosisCode = recommendedCodes[0].code
          ElMessage.success('已自动填充推荐编码')
        }
      }
    } else {
      ElMessage.error(result.message || '检查失败')
    }
  } catch (error: any) {
    console.error('Check ICD code error:', error)
    ElMessage.error('检查编码失败')
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
      // 构建content JSON
      const recordContent = {
        admissionRecord: {
          recordDate: formData.recordDate,
          chiefComplaint: formData.chiefComplaint,
          presentIllness: formData.presentIllness,
          pastHistory: formData.pastHistory,
          personalHistory: formData.personalHistory,
          marriageHistory: formData.marriageHistory,
          familyHistory: formData.familyHistory,
          temperature: formData.temperature,
          pulse: formData.pulse,
          respiration: formData.respiration,
          bloodPressure: formData.bloodPressure,
          generalExam: formData.generalExam,
          specialistExam: formData.specialistExam,
          labExam: formData.labExam,
          imagingExam: formData.imagingExam,
          admissionDiagnosis: formData.admissionDiagnosis,
          admissionDiagnosisCode: formData.admissionDiagnosisCode,
          treatmentPlan: formData.treatmentPlan,
          doctorSignature: formData.doctorSignature,
        },
      }

      const submitData: any = {
        patientId: formData.patientId || props.patientId,
        recordType: 'admission',
        content: JSON.stringify(recordContent),
        status: formData.status,
      }

      // 只在编辑时传递 caseNo，新建时由后端自动设置
      if (isEdit.value) {
        submitData.caseNo = formData.caseNo
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
  max-height: 70vh;
  overflow-y: auto;
}
</style>
