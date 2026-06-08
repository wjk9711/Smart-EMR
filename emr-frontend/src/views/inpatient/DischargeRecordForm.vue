<template>
  <el-dialog
    v-model="dialogVisible"
    title="出院记录"
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

      <!-- 出院记录特有字段 -->
      <el-divider content-position="left">入院情况</el-divider>
      
      <el-form-item label="入院情况">
        <el-input
          v-model="formData.admissionCondition"
          type="textarea"
          :rows="3"
          placeholder="患者入院时的主要症状和体征"
        />
      </el-form-item>

      <el-form-item label="入院诊断">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input v-model="formData.admissionDiagnosis" placeholder="入院诊断" />
          </el-col>
          <el-col :span="8">
            <el-input v-model="formData.admissionDiagnosisCode" placeholder="ICD-10编码" />
          </el-col>
        </el-row>
      </el-form-item>

      <el-divider content-position="left">诊疗经过</el-divider>
      
      <el-form-item label="诊疗经过">
        <el-input
          v-model="formData.treatmentCourse"
          type="textarea"
          :rows="5"
          placeholder="住院期间的诊疗过程和重要事件"
        />
      </el-form-item>

      <el-form-item label="检查结果">
        <el-input
          v-model="formData.examinationResults"
          type="textarea"
          :rows="3"
          placeholder="重要的辅助检查结果"
        />
      </el-form-item>

      <el-divider content-position="left">出院情况</el-divider>
      
      <el-form-item label="出院诊断" prop="dischargeDiagnosis">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input
              v-model="formData.dischargeDiagnosis"
              type="textarea"
              :rows="2"
              placeholder="出院诊断"
            />
          </el-col>
          <el-col :span="8">
            <el-input v-model="formData.dischargeDiagnosisCode" placeholder="ICD-10编码" />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="出院情况">
        <el-input
          v-model="formData.dischargeCondition"
          type="textarea"
          :rows="3"
          placeholder="出院时患者的病情状况"
        />
      </el-form-item>

      <el-form-item label="离院方式">
        <el-select v-model="formData.dischargeMethod" style="width: 100%">
          <el-option label="医嘱离院" value="医嘱离院" />
          <el-option label="医嘱转院" value="医嘱转院" />
          <el-option label="自动离院" value="自动离院" />
          <el-option label="死亡" value="死亡" />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">出院医嘱</el-divider>
      
      <el-form-item label="出院医嘱" prop="dischargeAdvice">
        <el-input
          v-model="formData.dischargeAdvice"
          type="textarea"
          :rows="4"
          placeholder="出院后的注意事项、用药指导、复诊计划等"
        />
      </el-form-item>

      <el-form-item label="带药情况">
        <el-input
          v-model="formData.medications"
          type="textarea"
          :rows="3"
          placeholder="出院带药的名称、剂量、用法"
        />
      </el-form-item>

      <el-form-item label="复诊计划">
        <el-input
          v-model="formData.followUpPlan"
          type="textarea"
          :rows="2"
          placeholder="复诊时间和注意事项"
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
const patientInfoLoaded = ref(false)

const formData = reactive({
  id: null as number | null,
  patientId: 0,
  caseNo: '',
  recordType: 'discharge',
  status: 'draft',
  dischargeDate: new Date().toISOString().split('T')[0],
  patientName: '',
  gender: '男',
  age: '',
  inpatientNo: '',
  department: '',
  bedNo: '',
  admissionDate: '',
  admissionCondition: '',
  admissionDiagnosis: '',
  admissionDiagnosisCode: '',
  treatmentCourse: '',
  examinationResults: '',
  dischargeDiagnosis: '',
  dischargeDiagnosisCode: '',
  dischargeCondition: '',
  dischargeMethod: '医嘱离院',
  dischargeAdvice: '',
  medications: '',
  followUpPlan: '',
  doctorSignature: '',
})

const rules: FormRules = {
  dischargeDiagnosis: [{ required: true, message: '请输入出院诊断', trigger: 'blur' }],
  dischargeAdvice: [{ required: true, message: '请输入出院医嘱', trigger: 'blur' }],
}

const dialogVisible = ref(false)

watch(() => props.visible, async (val) => {
  dialogVisible.value = val
  
  if (val && props.recordData) {
    isEdit.value = true
    Object.assign(formData, props.recordData)
    
    console.log('编辑模式 - 病案ID:', formData.id)
    
    if (props.recordData.content && typeof props.recordData.content === 'string') {
      try {
        const content = JSON.parse(props.recordData.content)
        if (content.dischargeRecord) {
          Object.assign(formData, content.dischargeRecord)
        }
      } catch (e) {
        console.error('Failed to parse record content:', e)
      }
    }
  } else if (val) {
    isEdit.value = false
    patientInfoLoaded.value = false
    resetForm()
    await nextTick()
    if (props.patientId) formData.patientId = props.patientId
  }
})

watch(dialogVisible, (val) => emit('update:visible', val))

const handleDialogOpened = async () => {
  if (!isEdit.value && props.patientId && !patientInfoLoaded.value) {
    await loadPatientInfo(props.patientId)
  }
}

const loadPatientInfo = async (patientId: number) => {
  try {
    const patient: any = await getInpatientPatient(patientId)
    if (patient) {
      Object.assign(formData, {
        patientName: patient.name || '',
        gender: patient.gender || '男',
        age: patient.age ? String(patient.age) : '',
        inpatientNo: patient.inpatientNo || '',
        department: patient.department || '',
        bedNo: patient.bedNo || '',
        admissionDate: patient.admissionDate || new Date().toISOString().split('T')[0],
        caseNo: patient.inpatientNo || '',
      })
      patientInfoLoaded.value = true
      await nextTick()
    }
  } catch (error: any) {
    ElMessage.warning('加载患者信息失败')
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    patientId: props.patientId || 0,
    caseNo: '',
    recordType: 'discharge',
    status: 'draft',
    dischargeDate: new Date().toISOString().split('T')[0],
    patientName: '',
    gender: '男',
    age: '',
    inpatientNo: '',
    department: '',
    bedNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    admissionCondition: '',
    admissionDiagnosis: '',
    admissionDiagnosisCode: '',
    treatmentCourse: '',
    examinationResults: '',
    dischargeDiagnosis: '',
    dischargeDiagnosisCode: '',
    dischargeCondition: '',
    dischargeMethod: '医嘱离院',
    dischargeAdvice: '',
    medications: '',
    followUpPlan: '',
    doctorSignature: '',
  })
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const recordContent = {
        dischargeRecord: {
          dischargeDate: formData.dischargeDate,
          admissionCondition: formData.admissionCondition,
          admissionDiagnosis: formData.admissionDiagnosis,
          admissionDiagnosisCode: formData.admissionDiagnosisCode,
          treatmentCourse: formData.treatmentCourse,
          examinationResults: formData.examinationResults,
          dischargeDiagnosis: formData.dischargeDiagnosis,
          dischargeDiagnosisCode: formData.dischargeDiagnosisCode,
          dischargeCondition: formData.dischargeCondition,
          dischargeMethod: formData.dischargeMethod,
          dischargeAdvice: formData.dischargeAdvice,
          medications: formData.medications,
          followUpPlan: formData.followUpPlan,
          doctorSignature: formData.doctorSignature,
        },
      }

      const submitData: any = {
        patientId: formData.patientId || props.patientId,
        recordType: 'discharge',
        content: JSON.stringify(recordContent),
        status: formData.status,
      }

      // 只在编辑时传递 caseNo，新建时由后端自动设置
      if (isEdit.value) {
        submitData.caseNo = formData.caseNo
      }

      console.log('=== 出院记录提交调试 ===')
      console.log('isEdit:', isEdit.value)
      console.log('submitData:', JSON.stringify(submitData, null, 2))
      console.log('=========================')

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
