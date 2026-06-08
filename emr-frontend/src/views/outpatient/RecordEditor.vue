<template>
  <div class="record-editor">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑病历' : '新建病历' }}</span>
          <div class="header-actions">
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">完成</el-button>
            <el-button 
              v-if="isEdit && recordForm.status === 'completed'"
              type="success" 
              @click="handleSubmit"
              :loading="submitting"
            >
              提交
            </el-button>
            <el-dropdown @command="handleExport">
              <el-button>导出<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pdf">导出PDF</el-dropdown-item>
                  <el-dropdown-item command="html">导出HTML</el-dropdown-item>
                  <el-dropdown-item command="json">导出JSON</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="handlePrint">打印</el-button>
          </div>
        </div>
      </template>

      <!-- 模式切换 -->
      <div class="mode-toolbar no-print">
        <el-radio-group v-model="editorMode" size="small">
          <el-radio-button value="form">表单模式</el-radio-button>
          <el-radio-button value="readonly">只读模式</el-radio-button>
          <el-radio-button value="preview">预览模式</el-radio-button>
          <el-radio-button value="design">设计模式</el-radio-button>
        </el-radio-group>
        <el-divider direction="vertical" />
        <el-switch
          v-model="autoSaveEnabled"
          active-text="自动保存"
          inactive-text="手动保存"
        />
      </div>

      <!-- 患者基本信息 -->
      <el-descriptions :column="3" border class="patient-info">
        <el-descriptions-item label="患者姓名">{{ patientInfo?.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ patientInfo?.gender === 'male' ? '男' : patientInfo?.gender === 'female' ? '女' : '其他' }}
        </el-descriptions-item>
        <el-descriptions-item label="年龄">{{ patientAge }}</el-descriptions-item>
        <el-descriptions-item label="病历号">{{ patientInfo?.patientNo }}</el-descriptions-item>
        <el-descriptions-item label="就诊时间">{{ visitDate }}</el-descriptions-item>
        <el-descriptions-item label="科室">{{ departmentName }}</el-descriptions-item>
      </el-descriptions>

      <!-- 病历编辑器 -->
      <div class="editor-container" ref="editorContainerRef">
        <el-form
          v-if="editorMode === 'form' || editorMode === 'design'"
          :model="recordForm"
          label-width="100px"
          class="emr-form"
        >
          <el-form-item label="主诉" required>
            <el-input
              v-model="recordForm.chiefComplaint"
              type="textarea"
              :rows="2"
              placeholder="请输入主诉"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="现病史">
            <el-input
              v-model="recordForm.presentIllness"
              type="textarea"
              :rows="4"
              placeholder="请输入现病史"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="既往史">
            <el-input
              v-model="recordForm.pastHistory"
              type="textarea"
              :rows="3"
              placeholder="请输入既往史"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="过敏史">
            <el-input
              v-model="recordForm.allergyHistory"
              type="textarea"
              :rows="2"
              placeholder="请输入过敏史"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="体格检查">
            <el-input
              v-model="recordForm.physicalExam"
              type="textarea"
              :rows="4"
              placeholder="请输入体格检查结果"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="辅助检查">
            <el-input
              v-model="recordForm.auxiliaryExam"
              type="textarea"
              :rows="3"
              placeholder="请输入辅助检查结果"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="初步诊断">
            <div class="diagnosis-section">
              <el-button size="small" @click="addDiagnosis">添加诊断</el-button>
              <el-table :data="recordForm.diagnosis" style="margin-top: 10px">
                <el-table-column label="类型" width="100">
                  <template #default="{ row }">
                    <el-select v-model="row.type" size="small">
                      <el-option label="主要诊断" value="primary" />
                      <el-option label="次要诊断" value="secondary" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="诊断名称">
                  <template #default="{ row }">
                    <el-input v-model="row.name" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="ICD编码" width="120">
                  <template #default="{ row }">
                    <el-input v-model="row.code" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="{ $index }">
                    <el-button size="small" type="danger" link @click="removeDiagnosis($index)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>

          <el-form-item label="治疗方案">
            <el-input
              v-model="recordForm.treatmentPlan"
              type="textarea"
              :rows="3"
              placeholder="请输入治疗方案"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="处方">
            <div class="prescription-section">
              <el-button size="small" @click="addPrescription">添加药品</el-button>
              <el-table :data="recordForm.prescription" style="margin-top: 10px">
                <el-table-column label="药品名称" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.drugName" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="规格" width="100">
                  <template #default="{ row }">
                    <el-input v-model="row.specification" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="用法用量" width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.dosage" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="频次" width="100">
                  <template #default="{ row }">
                    <el-input v-model="row.frequency" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="天数" width="80">
                  <template #default="{ row }">
                    <el-input-number v-model="row.duration" :min="1" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="{ $index }">
                    <el-button size="small" type="danger" link @click="removePrescription($index)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>

          <el-form-item label="医嘱建议">
            <el-input
              v-model="recordForm.advice"
              type="textarea"
              :rows="3"
              placeholder="请输入医嘱建议"
              :readonly="editorMode === 'design'"
            />
          </el-form-item>

          <el-form-item label="医生签名">
            <div class="signature-section">
              <SignaturePad v-model="recordForm.doctorSignature" />
            </div>
          </el-form-item>
        </el-form>

        <!-- 只读/预览模式 -->
        <div v-else class="document-preview">
          <div class="emr-document">
            <h2 style="text-align: center; margin-bottom: 20px">门诊病历</h2>
            <div class="document-content">
              <p><strong>主诉：</strong>{{ recordForm.chiefComplaint || '-' }}</p>
              <p><strong>现病史：</strong>{{ recordForm.presentIllness || '-' }}</p>
              <p><strong>既往史：</strong>{{ recordForm.pastHistory || '-' }}</p>
              <p><strong>过敏史：</strong>{{ recordForm.allergyHistory || '-' }}</p>
              <p><strong>体格检查：</strong>{{ recordForm.physicalExam || '-' }}</p>
              <p><strong>辅助检查：</strong>{{ recordForm.auxiliaryExam || '-' }}</p>
              <p><strong>诊断：</strong></p>
              <ul v-if="recordForm.diagnosis?.length">
                <li v-for="(item, index) in recordForm.diagnosis" :key="index">
                  {{ item.type === 'primary' ? '[主要]' : '[次要]' }} {{ item.name }} ({{ item.code }})
                </li>
              </ul>
              <p v-else>-</p>
              <p><strong>治疗方案：</strong>{{ recordForm.treatmentPlan || '-' }}</p>
              <p><strong>处方：</strong></p>
              <ul v-if="recordForm.prescription?.length">
                <li v-for="(item, index) in recordForm.prescription" :key="index">
                  {{ item.drugName }} {{ item.specification }} - {{ item.dosage }} {{ item.frequency }} × {{ item.duration }}天
                </li>
              </ul>
              <p v-else>-</p>
              <p><strong>医嘱建议：</strong>{{ recordForm.advice || '-' }}</p>
              <div v-if="recordForm.doctorSignature" class="signature-display">
                <p><strong>医生签名：</strong></p>
                <img :src="recordForm.doctorSignature" alt="签名" style="max-width: 200px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getOutpatientRecord, createOutpatientRecord, updateOutpatientRecord } from '@/api/outpatient'
import { getPatient, createVisit } from '@/api/patient'
import SignaturePad from '@/components/SignaturePad.vue'
import type { OutpatientRecord, EditorMode } from '@/types/record'

const route = useRoute()
const router = useRouter()

// 判断是编辑模式还是新建模式
// 编辑模式: /outpatient/record/edit/:id
// 新建模式: /outpatient/record/create/:visitId?
const isEdit = computed(() => {
  return route.path.includes('/edit/')
})

const recordId = computed(() => {
  // 编辑模式下获取病历ID
  if (isEdit.value) {
    return Number(route.params.id)
  }
  return null
})

const saving = ref(false)
const submitting = ref(false)
const editorContainerRef = ref<HTMLElement>()

const editorMode = ref<EditorMode>('form')
const autoSaveEnabled = ref(false) // 禁用自动保存

const patientInfo = ref<any>(null)
const visitDate = ref(new Date().toLocaleDateString('zh-CN'))
const departmentName = ref('内科')

// 从路由查询参数中获取patientId
const patientIdFromQuery = computed(() => Number(route.query.patientId))

const recordForm = reactive<Partial<OutpatientRecord>>({
  chiefComplaint: '',
  presentIllness: '',
  pastHistory: '',
  allergyHistory: '',
  physicalExam: '',
  auxiliaryExam: '',
  diagnosis: [],
  treatmentPlan: '',
  prescription: [],
  advice: '',
  doctorSignature: '',
})

const patientAge = computed(() => {
  if (!patientInfo.value?.birthDate) return '-'
  const birth = new Date(patientInfo.value.birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age + '岁'
})

const addDiagnosis = () => {
  if (!recordForm.diagnosis) {
    recordForm.diagnosis = []
  }
  recordForm.diagnosis.push({
    code: '',
    name: '',
    type: 'primary',
  })
}

const removeDiagnosis = (index: number) => {
  recordForm.diagnosis?.splice(index, 1)
}

const addPrescription = () => {
  if (!recordForm.prescription) {
    recordForm.prescription = []
  }
  recordForm.prescription.push({
    drugName: '',
    specification: '',
    dosage: '',
    frequency: '',
    duration: 7,
    usage: '',
    quantity: 1,
  })
}

const removePrescription = (index: number) => {
  recordForm.prescription?.splice(index, 1)
}

const fetchRecord = async () => {
  if (!isEdit.value || !recordId.value) return

  try {
    const record = await getOutpatientRecord(recordId.value)
    console.log('原始病历数据:', record)
    
    // 解析JSON字符串字段
    const parsedRecord: any = { ...record }
    
    // 如果diagnosis是字符串，解析为数组
    if (typeof parsedRecord.diagnosis === 'string') {
      try {
        parsedRecord.diagnosis = JSON.parse(parsedRecord.diagnosis)
        console.log('解析后的diagnosis:', parsedRecord.diagnosis)
      } catch (e) {
        console.error('Failed to parse diagnosis:', e)
        parsedRecord.diagnosis = []
      }
    }
    
    // 如果prescription是字符串，解析为数组
    if (typeof parsedRecord.prescription === 'string') {
      try {
        parsedRecord.prescription = JSON.parse(parsedRecord.prescription)
        console.log('解析后的prescription:', parsedRecord.prescription)
      } catch (e) {
        console.error('Failed to parse prescription:', e)
        parsedRecord.prescription = []
      }
    }
    
    // 使用响应式赋值 - 逐个字段赋值以确保Vue能追踪变化
    Object.keys(recordForm).forEach(key => {
      if (key in parsedRecord) {
        const value = parsedRecord[key]
        console.log(`赋值 ${key}:`, value, '类型:', typeof value)
        ;(recordForm as any)[key] = value
      }
    })
    
    console.log('赋值完成后的recordForm:', {
      diagnosis: recordForm.diagnosis,
      prescription: recordForm.prescription,
      diagnosisType: typeof recordForm.diagnosis,
      prescriptionType: typeof recordForm.prescription,
    })

    // 加载患者信息
    if (record.patientId) {
      patientInfo.value = await getPatient(record.patientId)
    }
  } catch (error) {
    console.error('Failed to fetch record:', error)
    ElMessage.error('加载病历失败')
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    let saveData = { ...recordForm }
    
    // 如果是新建病历，需要先确保有visitId和patientId
    if (!isEdit.value) {
      // 从 URL获取patientId
      const patientId = patientIdFromQuery.value || saveData.patientId
      
      if (!patientId) {
        ElMessage.error('缺少患者ID，请从患者列表进入')
        saving.value = false
        return
      }
      
      // 如果没有visitId，先创建就诊记录
      if (!saveData.visitId) {
        try {
          ElMessage.info('正在创建就诊记录...')
          
          // 确保传递正确的数据格式
          const visitData = {
            patientId: patientId,
            visitType: 'outpatient',
            visitDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 格式
            status: 'pending',
          }
          
          console.log('Creating visit with data:', visitData)
          
          const visit = await createVisit(visitData)
          saveData.visitId = visit.id
          saveData.patientId = patientId
          
          console.log('Visit created:', visit)
          ElMessage.success('就诊记录创建成功')
        } catch (visitError) {
          console.error('Failed to create visit:', visitError)
          ElMessage.error('创建就诊记录失败')
          saving.value = false
          return
        }
      } else {
        // 如果有visitId但没有patientId，尝试从visit获取
        if (!saveData.patientId) {
          saveData.patientId = patientId
        }
      }
    }
    
    // 设置状态为已完成
    saveData.status = 'completed'
    
    console.log('Saving record with data:', saveData)
    
    if (isEdit.value && recordId.value) {
      await updateOutpatientRecord(recordId.value, saveData)
      ElMessage.success('保存成功')
      // 编辑模式：返回上一页或跳转到列表
      router.back()
    } else {
      const newRecord = await createOutpatientRecord(saveData)
      ElMessage.success('创建成功')
      // 新建模式：跳转到病历列表页
      router.push('/outpatient/records')
    }
  } catch (error: any) {
    console.error('Failed to save record:', error)
    // 显示更详细的错误信息
    const errorMsg = error.response?.data?.message || error.message || '保存失败'
    ElMessage.error(errorMsg)
  } finally {
    saving.value = false
  }
}

// 提交病历给教师审核
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      '提交后将无法修改，确定要提交吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    submitting.value = true
    
    // TODO: 调用提交API
    // await submitRecord(recordId.value, { teacherId: xxx })
    
    // 暂时直接更新状态
    if (recordId.value) {
      await updateOutpatientRecord(recordId.value, {
        submitStatus: 'pending_review',
      } as any)
    }
    
    ElMessage.success('提交成功，等待教师审核')
    // 刷新当前病历数据
    await fetchRecord()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to submit record:', error)
      ElMessage.error(error.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleExport = (command: string) => {
  // TODO: 实现导出功能
  ElMessage.info(`导出${command.toUpperCase()}功能待实现`)
}

const handlePrint = () => {
  window.print()
}

// 检查表单是否有内容
const hasContent = () => {
  return (
    recordForm.chiefComplaint ||
    recordForm.presentIllness ||
    recordForm.pastHistory ||
    recordForm.allergyHistory ||
    recordForm.physicalExam ||
    recordForm.auxiliaryExam ||
    (recordForm.diagnosis && recordForm.diagnosis.length > 0) ||
    recordForm.treatmentPlan ||
    (recordForm.prescription && recordForm.prescription.length > 0) ||
    recordForm.advice
  )
}

const handleBack = async () => {
  // 如果是新建模式且有内容，提示是否保存为草稿
  if (!isEdit.value && hasContent()) {
    try {
      await ElMessageBox.confirm(
        '当前病历有未保存的内容，是否保存为草稿？',
        '提示',
        {
          confirmButtonText: '保存为草稿',
          cancelButtonText: '不保存',
          distinguishCancelAndClose: true,
          type: 'warning',
        }
      )
      
      // 用户选择保存为草稿
      saving.value = true
      try {
        let saveData = { ...recordForm }
        const patientId = patientIdFromQuery.value || saveData.patientId
        
        if (!patientId) {
          ElMessage.error('缺少患者ID')
          saving.value = false
          return
        }
        
        // 如果没有visitId，先创建就诊记录
        if (!saveData.visitId) {
          const visitData = {
            patientId: patientId,
            visitType: 'outpatient' as const,
            visitDate: new Date().toISOString().split('T')[0],
            status: 'pending' as const,
          }
          
          const visit = await createVisit(visitData)
          saveData.visitId = visit.id
          saveData.patientId = patientId
        }
        
        // 设置状态为草稿
        saveData.status = 'draft'
        
        await createOutpatientRecord(saveData)
        ElMessage.success('已保存为草稿')
        router.push('/outpatient/records')
      } catch (error: any) {
        console.error('Failed to save draft:', error)
        ElMessage.error(error.message || '保存失败')
      } finally {
        saving.value = false
      }
    } catch (error) {
      // 用户选择不保存，直接返回
      if (error === 'cancel' || error === 'close') {
        router.back()
      }
    }
  } else {
    // 编辑模式或没有内容，直接返回
    router.back()
  }
}

onMounted(() => {
  // 如果是新建模式且有patientId，加载患者信息
  if (!isEdit.value && patientIdFromQuery.value) {
    getPatient(patientIdFromQuery.value)
      .then(patient => {
        patientInfo.value = patient
        recordForm.patientId = patient.id
      })
      .catch(err => {
        console.error('Failed to load patient:', err)
      })
  }
  
  fetchRecord()
})
</script>

<style scoped lang="scss">
.record-editor {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .mode-toolbar {
    margin-bottom: 20px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .patient-info {
    margin-bottom: 20px;
  }

  .editor-container {
    min-height: 500px;
  }

  .emr-form {
    :deep(.el-form-item__label) {
      font-weight: 600;
    }
  }

  .diagnosis-section,
  .prescription-section {
    width: 100%;
  }

  .document-preview {
    display: flex;
    justify-content: center;
    background: #f5f5f5;
    padding: 20px;

    .emr-document {
      max-width: 210mm;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .document-content {
        p {
          margin: 10px 0;
          line-height: 1.8;
        }

        ul {
          margin: 10px 0;
          padding-left: 20px;

          li {
            margin: 5px 0;
          }
        }
      }

      .signature-display {
        margin-top: 30px;
      }
    }
  }
}
</style>
