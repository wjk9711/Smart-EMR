<template>
  <el-dialog
    v-model="dialogVisible"
    title="首次病程记录"
    width="900px"
    @close="handleClose"
    @opened="handleDialogOpened"
  >
    <div v-loading="!isEdit && props.patientId && !patientInfoLoaded" element-loading-text="正在加载患者信息...">
      <el-form
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
          <el-form-item label="记录时间">
            <el-date-picker
              v-model="formData.recordDateTime"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm"
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

      <!-- 首次病程记录特有字段 -->
      <el-divider content-position="left">病例特点</el-divider>
      
      <el-form-item label="病例特点" prop="caseFeatures">
        <el-input
          v-model="formData.caseFeatures"
          type="textarea"
          :rows="4"
          placeholder="请总结患者的主要临床特征"
        />
      </el-form-item>

      <el-divider content-position="left">拟诊讨论</el-divider>
      
      <el-form-item label="初步诊断" prop="preliminaryDiagnosis">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-input
              v-model="formData.preliminaryDiagnosis"
              type="textarea"
              :rows="2"
              placeholder="请输入初步诊断"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="formData.preliminaryDiagnosisCode"
              placeholder="ICD-10编码"
            />
          </el-col>
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="handleCheckCode('preliminary')"
              :loading="checkingCode === 'preliminary'"
              style="width: 100%"
            >
              <el-icon><Check /></el-icon>
              检查编码
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="诊断依据">
        <el-input
          v-model="formData.diagnosisBasis"
          type="textarea"
          :rows="4"
          placeholder="请阐述诊断的依据"
        />
      </el-form-item>

      <el-form-item label="鉴别诊断">
        <el-input
          v-model="formData.differentialDiagnosis"
          type="textarea"
          :rows="4"
          placeholder="需要鉴别的疾病及理由"
        />
      </el-form-item>

      <el-divider content-position="left">诊疗计划</el-divider>
      
      <el-form-item label="诊疗计划" prop="treatmentPlan">
        <el-input
          v-model="formData.treatmentPlan"
          type="textarea"
          :rows="5"
          placeholder="请详细列出诊疗计划"
        />
      </el-form-item>

      <el-form-item label="注意事项">
        <el-input
          v-model="formData.precautions"
          type="textarea"
          :rows="3"
          placeholder="需要特别注意的事项"
        />
      </el-form-item>

      <el-form-item label="医师签名">
        <el-input v-model="formData.doctorSignature" placeholder="请输入医师姓名" />
      </el-form-item>
    </el-form>
    </div>

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
  recordType: 'progress',
  status: 'draft',
  recordDateTime: new Date().toISOString(),
  // 患者信息
  patientName: '',
  gender: '男',
  age: '',
  inpatientNo: '',
  department: '',
  bedNo: '',
  admissionDate: '',
  // 首次病程记录特有字段
  caseFeatures: '',
  preliminaryDiagnosis: '',
  preliminaryDiagnosisCode: '',
  diagnosisBasis: '',
  differentialDiagnosis: '',
  treatmentPlan: '',
  precautions: '',
  doctorSignature: '',
})

const rules: FormRules = {
  caseFeatures: [{ required: true, message: '请输入病例特点', trigger: 'blur' }],
  preliminaryDiagnosis: [{ required: true, message: '请输入初步诊断', trigger: 'blur' }],
  treatmentPlan: [{ required: true, message: '请输入诊疗计划', trigger: 'blur' }],
}

const dialogVisible = ref(false)

watch(() => props.visible, async (val) => {
  console.log('=== ProgressRecordForm - visible 变化 ===')
  console.log('visible:', val)
  console.log('recordData:', props.recordData)
  console.log('patientId:', props.patientId)
  console.log('isEdit:', isEdit.value)
  console.log('patientInfoLoaded:', patientInfoLoaded.value)
  
  dialogVisible.value = val
  
  if (val && props.recordData) {
    // 编辑模式
    console.log('>>> 进入编辑模式')
    isEdit.value = true
    patientInfoLoaded.value = false
    
    // 设置病案ID
    formData.id = props.recordData.id
    console.log('编辑模式 - 病案ID:', formData.id)
    
    // 先加载患者信息
    if (props.patientId) {
      console.log('开始加载患者信息 (编辑模式), patientId:', props.patientId)
      await loadPatientInfo(props.patientId)
    } else {
      console.warn('编辑模式但 patientId 为空！')
      patientInfoLoaded.value = true  // 避免一直loading
    }
    
    // 再加载病案数据（不会覆盖患者信息）
    loadRecordData()
    console.log('<<< 编辑模式初始化完成')
  } else if (val) {
    // 新增模式
    console.log('>>> 进入新增模式')
    isEdit.value = false
    patientInfoLoaded.value = false
    resetForm()
    
    await nextTick()
    
    if (props.patientId) {
      formData.patientId = props.patientId
      console.log('开始加载患者信息 (新增模式), patientId:', props.patientId)
      await loadPatientInfo(props.patientId)
      console.log('患者信息加载完成，patientInfoLoaded:', patientInfoLoaded.value)
    } else {
      console.warn('新增模式但 patientId 为空，无法加载患者信息')
      patientInfoLoaded.value = true  // 避免一直loading
    }
    console.log('<<< 新增模式初始化完成')
  } else {
    console.log('对话框关闭')
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
    console.log('[loadPatientInfo] 开始加载患者信息，patientId:', patientId)
    const patient: any = await getInpatientPatient(patientId)
    
    console.log('[loadPatientInfo] 患者信息响应:', patient)
    
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
          // caseNo 不应该从患者信息中获取，由后端自动生成
          case 'caseNo':
            value = ''  // 新增模式保持为空，让后端生成
            break
          default:
            value = ''
        }
        ;(formData as any)[field] = value
      })
      
      patientInfoLoaded.value = true
      console.log('[loadPatientInfo] 患者信息加载完成，patientInfoLoaded:', patientInfoLoaded.value)
      await nextTick()
    } else {
      console.warn('[loadPatientInfo] 未找到患者信息')
      ElMessage.warning('未找到患者信息')
      patientInfoLoaded.value = true  // 避免一直loading
    }
  } catch (error: any) {
    console.error('[loadPatientInfo] 加载患者信息失败:', error)
    ElMessage.warning('加载患者信息失败')
    patientInfoLoaded.value = true  // 避免一直loading
  }
}

const resetForm = () => {
  formData.id = null
  formData.patientId = props.patientId || 0
  formData.caseNo = ''
  formData.recordType = 'progress'
  formData.status = 'draft'
  formData.recordDateTime = new Date().toISOString()
  formData.patientName = ''
  formData.gender = '男'
  formData.age = ''
  formData.inpatientNo = ''
  formData.department = ''
  formData.bedNo = ''
  formData.admissionDate = new Date().toISOString().split('T')[0]
  formData.caseFeatures = ''
  formData.preliminaryDiagnosis = ''
  formData.preliminaryDiagnosisCode = ''
  formData.diagnosisBasis = ''
  formData.differentialDiagnosis = ''
  formData.treatmentPlan = ''
  formData.precautions = ''
  formData.doctorSignature = ''
}

// 加载已有病案数据
const loadRecordData = () => {
  if (props.recordData?.content) {
    try {
      const content = typeof props.recordData.content === 'string' 
        ? JSON.parse(props.recordData.content) 
        : props.recordData.content
      
      const progressRecord = content.progressRecord || {}
      
      // 定义不应该被病案数据覆盖的患者基本信息字段
      const patientInfoFields = [
        'patientName', 'gender', 'age', 'inpatientNo', 
        'department', 'bedNo', 'admissionDate', 'caseNo'
      ]
      
      // 填充病案特有字段（排除患者基本信息）
      Object.keys(progressRecord).forEach(key => {
        if (!patientInfoFields.includes(key) && progressRecord[key] !== undefined) {
          (formData as any)[key] = progressRecord[key]
        }
      })
      
      // 同时更新顶层字段（recordDateTime, status等）
      if (props.recordData.recordDateTime) {
        formData.recordDateTime = props.recordData.recordDateTime
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
  const diagnosis = formData.preliminaryDiagnosis
  const currentCode = formData.preliminaryDiagnosisCode
  
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
      body: JSON.stringify({ diagnosis, currentCode }),
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      const data = result.data
      if (!data.isCorrect) {
        const recommendedCodes = data.recommendedCodes || []
        if (recommendedCodes.length > 0) {
          formData.preliminaryDiagnosisCode = recommendedCodes[0].code
          ElMessage.success('已自动填充推荐编码')
        }
      } else {
        ElMessage.success('编码正确')
      }
    }
  } catch (error: any) {
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
      const recordContent = {
        progressRecord: {
          recordDateTime: formData.recordDateTime,
          caseFeatures: formData.caseFeatures,
          preliminaryDiagnosis: formData.preliminaryDiagnosis,
          preliminaryDiagnosisCode: formData.preliminaryDiagnosisCode,
          diagnosisBasis: formData.diagnosisBasis,
          differentialDiagnosis: formData.differentialDiagnosis,
          treatmentPlan: formData.treatmentPlan,
          precautions: formData.precautions,
          doctorSignature: formData.doctorSignature,
        },
      }

      // 编辑模式：只更新必要字段，避免触发唯一约束
      const submitData: any = isEdit.value 
        ? {
            recordType: 'progress',
            content: JSON.stringify(recordContent),
            status: formData.status,
          }
        : {
            patientId: formData.patientId || props.patientId,
            recordType: 'progress',
            content: JSON.stringify(recordContent),
            status: formData.status,
          }

      console.log('提交数据:', submitData)

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
      console.error('提交失败:', error)
      console.error('错误详情:', error.response?.data)
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
