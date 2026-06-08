<template>
  <el-dialog
    v-model="dialogVisible"
    title="手术记录"
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
          <el-form-item label="手术日期">
            <el-date-picker
              v-model="formData.operationDate"
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

      <!-- 手术记录特有字段 -->
      <el-divider content-position="left">手术信息</el-divider>
      
      <el-form-item label="手术名称" prop="operationName">
        <el-input
          v-model="formData.operationName"
          placeholder="请输入手术名称"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="手术者">
            <el-input v-model="formData.operator" placeholder="主刀医师" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="助手">
            <el-input v-model="formData.assistants" placeholder="助手姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="麻醉方式">
            <el-select v-model="formData.anesthesiaMethod" style="width: 100%">
              <el-option label="全身麻醉" value="全身麻醉" />
              <el-option label="椎管内麻醉" value="椎管内麻醉" />
              <el-option label="神经阻滞" value="神经阻滞" />
              <el-option label="局部麻醉" value="局部麻醉" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="麻醉医师">
            <el-input v-model="formData.anesthesiologist" placeholder="麻醉医师姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="手术开始时间">
            <el-time-picker
              v-model="formData.startTime"
              placeholder="选择时间"
              style="width: 100%"
              format="HH:mm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="手术结束时间">
            <el-time-picker
              v-model="formData.endTime"
              placeholder="选择时间"
              style="width: 100%"
              format="HH:mm"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="术前诊断">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input v-model="formData.preoperativeDiagnosis" placeholder="术前诊断" />
          </el-col>
          <el-col :span="8">
            <el-input v-model="formData.preoperativeDiagnosisCode" placeholder="ICD-10编码" />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="术后诊断">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input v-model="formData.postoperativeDiagnosis" placeholder="术后诊断" />
          </el-col>
          <el-col :span="8">
            <el-input v-model="formData.postoperativeDiagnosisCode" placeholder="ICD-10编码" />
          </el-col>
        </el-row>
      </el-form-item>

      <el-divider content-position="left">手术经过</el-divider>
      
      <el-form-item label="手术指征">
        <el-input
          v-model="formData.operationIndication"
          type="textarea"
          :rows="2"
          placeholder="手术适应症和指征"
        />
      </el-form-item>

      <el-form-item label="手术经过" prop="operationProcedure">
        <el-input
          v-model="formData.operationProcedure"
          type="textarea"
          :rows="6"
          placeholder="详细记录手术过程"
        />
      </el-form-item>

      <el-form-item label="术中发现">
        <el-input
          v-model="formData.intraoperativeFindings"
          type="textarea"
          :rows="3"
          placeholder="手术中发现的异常情况"
        />
      </el-form-item>

      <el-form-item label="出血量">
        <el-input v-model="formData.bloodLoss" placeholder="ml" />
      </el-form-item>

      <el-form-item label="输血情况">
        <el-input
          v-model="formData.bloodTransfusion"
          type="textarea"
          :rows="2"
          placeholder="输血量及类型"
        />
      </el-form-item>

      <el-form-item label="标本送检">
        <el-input
          v-model="formData.specimenExam"
          type="textarea"
          :rows="2"
          placeholder="切除标本的病理检查情况"
        />
      </el-form-item>

      <el-form-item label="术后处理">
        <el-input
          v-model="formData.postoperativeCare"
          type="textarea"
          :rows="3"
          placeholder="术后注意事项和处理措施"
        />
      </el-form-item>

      <el-form-item label="手术医师签名">
        <el-input v-model="formData.operatorSignature" placeholder="请输入手术医师姓名" />
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
  recordType: 'operation',
  status: 'draft',
  operationDate: new Date().toISOString().split('T')[0],
  patientName: '',
  gender: '男',
  age: '',
  inpatientNo: '',
  department: '',
  bedNo: '',
  admissionDate: '',
  operationName: '',
  operator: '',
  assistants: '',
  anesthesiaMethod: '',
  anesthesiologist: '',
  startTime: '',
  endTime: '',
  preoperativeDiagnosis: '',
  preoperativeDiagnosisCode: '',
  postoperativeDiagnosis: '',
  postoperativeDiagnosisCode: '',
  operationIndication: '',
  operationProcedure: '',
  intraoperativeFindings: '',
  bloodLoss: '',
  bloodTransfusion: '',
  specimenExam: '',
  postoperativeCare: '',
  operatorSignature: '',
})

const rules: FormRules = {
  operationName: [{ required: true, message: '请输入手术名称', trigger: 'blur' }],
  operationProcedure: [{ required: true, message: '请输入手术经过', trigger: 'blur' }],
}

const dialogVisible = ref(false)

watch(() => props.visible, async (val) => {
  dialogVisible.value = val
  
  if (val && props.recordData) {
    isEdit.value = true
    Object.assign(formData, props.recordData)
    
    if (props.recordData.content && typeof props.recordData.content === 'string') {
      try {
        const content = JSON.parse(props.recordData.content)
        if (content.operationRecord) {
          Object.assign(formData, content.operationRecord)
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
    recordType: 'operation',
    status: 'draft',
    operationDate: new Date().toISOString().split('T')[0],
    patientName: '',
    gender: '男',
    age: '',
    inpatientNo: '',
    department: '',
    bedNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    operationName: '',
    operator: '',
    assistants: '',
    anesthesiaMethod: '',
    anesthesiologist: '',
    startTime: '',
    endTime: '',
    preoperativeDiagnosis: '',
    preoperativeDiagnosisCode: '',
    postoperativeDiagnosis: '',
    postoperativeDiagnosisCode: '',
    operationIndication: '',
    operationProcedure: '',
    intraoperativeFindings: '',
    bloodLoss: '',
    bloodTransfusion: '',
    specimenExam: '',
    postoperativeCare: '',
    operatorSignature: '',
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
        operationRecord: {
          operationDate: formData.operationDate,
          operationName: formData.operationName,
          operator: formData.operator,
          assistants: formData.assistants,
          anesthesiaMethod: formData.anesthesiaMethod,
          anesthesiologist: formData.anesthesiologist,
          startTime: formData.startTime,
          endTime: formData.endTime,
          preoperativeDiagnosis: formData.preoperativeDiagnosis,
          preoperativeDiagnosisCode: formData.preoperativeDiagnosisCode,
          postoperativeDiagnosis: formData.postoperativeDiagnosis,
          postoperativeDiagnosisCode: formData.postoperativeDiagnosisCode,
          operationIndication: formData.operationIndication,
          operationProcedure: formData.operationProcedure,
          intraoperativeFindings: formData.intraoperativeFindings,
          bloodLoss: formData.bloodLoss,
          bloodTransfusion: formData.bloodTransfusion,
          specimenExam: formData.specimenExam,
          postoperativeCare: formData.postoperativeCare,
          operatorSignature: formData.operatorSignature,
        },
      }

      const submitData = {
        patientId: formData.patientId || props.patientId,
        caseNo: formData.caseNo,
        recordType: 'operation',
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
  max-height: 70vh;
  overflow-y: auto;
}
</style>
