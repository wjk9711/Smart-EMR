<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑住院患者' : '新增住院患者'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="患者姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="formData.birthDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="formData.age" :min="0" :max="150" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="家庭住址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入地址" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="住院号" prop="inpatientNo">
            <el-input v-model="formData.inpatientNo" placeholder="请输入住院号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="科室" prop="department">
            <el-select v-model="formData.department" placeholder="请选择科室" style="width: 100%">
              <el-option label="内科" value="内科" />
              <el-option label="外科" value="外科" />
              <el-option label="妇产科" value="妇产科" />
              <el-option label="儿科" value="儿科" />
              <el-option label="骨科" value="骨科" />
              <el-option label="神经科" value="神经科" />
              <el-option label="心血管科" value="心血管科" />
              <el-option label="呼吸科" value="呼吸科" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="床号" prop="bedNo">
            <el-input v-model="formData.bedNo" placeholder="请输入床号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入院日期" prop="admissionDate">
            <el-date-picker
              v-model="formData.admissionDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="入院诊断" prop="diagnosis">
        <el-input
          v-model="formData.diagnosis"
          type="textarea"
          :rows="3"
          placeholder="请输入入院诊断"
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
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { createInpatientPatient, updateInpatientPatient } from '@/api/inpatient'

interface Props {
  visible: boolean
  patientData?: any
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  patientData: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = ref(false)

const formData = reactive({
  name: '',
  gender: '男',
  birthDate: '',
  age: 0,
  idCard: '',
  phone: '',
  address: '',
  inpatientNo: '',
  department: '',
  bedNo: '',
  admissionDate: '',
  diagnosis: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  inpatientNo: [{ required: true, message: '请输入住院号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择科室', trigger: 'change' }],
  admissionDate: [{ required: true, message: '请选择入院日期', trigger: 'change' }],
}

const dialogVisible = ref(false)

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val && props.patientData) {
      // 编辑模式
      isEdit.value = true
      Object.assign(formData, props.patientData)
    } else if (val) {
      // 新增模式
      isEdit.value = false
      resetForm()
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const resetForm = () => {
  formData.name = ''
  formData.gender = '男'
  formData.birthDate = ''
  formData.age = 0
  formData.idCard = ''
  formData.phone = ''
  formData.address = ''
  formData.inpatientNo = generateInpatientNo()
  formData.department = ''
  formData.bedNo = ''
  formData.admissionDate = new Date().toISOString().split('T')[0]
  formData.diagnosis = ''
}

const generateInpatientNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `ZY${year}${month}${day}${random}`
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
      if (isEdit.value) {
        await updateInpatientPatient(props.patientData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createInpatientPatient(formData)
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
