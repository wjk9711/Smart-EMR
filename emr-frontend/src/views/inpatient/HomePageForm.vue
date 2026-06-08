<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑病案首页' : '新增病案首页'"
    width="95%"
    top="2vh"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <!-- 标题 -->
      <div class="page-title">住 院 病 案 首 页</div>
      
      <!-- 第一行：医疗付费方式、健康卡号、住院次数、病案号、总页数 -->
      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="医疗付费方式">
            <el-select v-model="formData.medicalPaymentMethod" style="width: 100%">
              <el-option label="1.城镇职工基本医疗保险" value="1" />
              <el-option label="2.城镇居民基本医疗保险" value="2" />
              <el-option label="3.新型农村合作医疗" value="3" />
              <el-option label="4.贫困救助" value="4" />
              <el-option label="5.商业医疗保险" value="5" />
              <el-option label="6.全公费" value="6" />
              <el-option label="7.全自费" value="7" />
              <el-option label="8.其他社会保险" value="8" />
              <el-option label="9.其他" value="9" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="健康卡号">
            <el-input v-model="formData.healthCardNo" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label-width="0">
            <span class="inline-label">第</span>
            <el-input-number v-model="formData.visitCount" :min="1" style="width: 60px; margin: 0 5px" />
            <span class="inline-label">次住院</span>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="病案号">
            <el-input v-model="formData.caseNo" placeholder="自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label-width="0">
            <span class="inline-label">总页数</span>
            <el-input-number v-model="formData.totalPages" :min="1" style="width: 60px; margin: 0 5px" />
            <span class="inline-label">页</span>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 患者基本信息 -->
      <div class="section-title">患者基本信息</div>
      <el-row :gutter="10" class="form-row">
        <el-col :span="4">
          <el-form-item label="姓名" required>
            <el-input v-model="formData.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="性别" required>
            <el-radio-group v-model="formData.gender" disabled>
              <el-radio value="1">男</el-radio>
              <el-radio value="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="出生日期" required>
            <el-date-picker v-model="formData.birthDate" type="date" placeholder="选择日期" style="width: 100%" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="年龄" required>
            <el-input v-model="formData.age" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="国籍">
            <el-input v-model="formData.nationality" placeholder="中国" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="出生地">
            <el-input v-model="formData.birthPlace" placeholder="省(区、市)市(州)县(区)" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="籍贯">
            <el-input v-model="formData.ancestralHome" placeholder="省(区、市)市(州)县(区)" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="民族">
            <el-input v-model="formData.ethnicity" placeholder="汉族" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证号">
            <el-input v-model="formData.idCardNo" placeholder="请输入18位身份证号" maxlength="18" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="4">
          <el-form-item label="职业">
            <el-input v-model="formData.occupation" placeholder="自由职业" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="婚姻">
            <el-select v-model="formData.marriage" style="width: 100%">
              <el-option label="1.未婚" value="1" />
              <el-option label="2.已婚" value="2" />
              <el-option label="3.丧偶" value="3" />
              <el-option label="4.离婚" value="4" />
              <el-option label="5.其他" value="5" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="现住址">
            <el-input v-model="formData.presentAddress" placeholder="请输入现住址" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="8">
          <el-form-item label="电话">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="邮编">
            <el-input v-model="formData.postalCode" placeholder="请输入邮政编码" maxlength="6" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="12">
          <el-form-item label="户口地址">
            <el-input v-model="formData.householdAddress" placeholder="请输入户口地址" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="邮编">
            <el-input v-model="formData.householdPostalCode" placeholder="邮编" maxlength="6" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="12">
          <el-form-item label="工作单位及地址">
            <el-input v-model="formData.workUnit" placeholder="请输入工作单位及地址" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="单位电话">
            <el-input v-model="formData.workPhone" placeholder="单位电话" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="邮编">
            <el-input v-model="formData.workPostalCode" placeholder="邮编" maxlength="6" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="4">
          <el-form-item label="联系人姓名">
            <el-input v-model="formData.contactPerson" placeholder="联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="关系">
            <el-input v-model="formData.contactRelation" placeholder="关系" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="地址">
            <el-input v-model="formData.contactAddress" placeholder="联系人地址" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="电话">
            <el-input v-model="formData.contactPhone" placeholder="联系人电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 住院信息 -->
      <div class="section-title">住院信息</div>
      <el-row :gutter="10" class="form-row">
        <el-col :span="12">
          <el-form-item label="入院途径">
            <el-select v-model="formData.admissionRoute" style="width: 100%">
              <el-option label="1.急诊" value="1" />
              <el-option label="2.门诊" value="2" />
              <el-option label="3.其他医疗机构转入" value="3" />
              <el-option label="9.其他" value="9" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="入院时间">
            <el-date-picker v-model="formData.admissionDateTime" type="datetime" placeholder="选择日期时间" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="入院科别">
            <el-input v-model="formData.admissionDept" placeholder="科别" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="病房">
            <el-input v-model="formData.admissionWard" placeholder="病房" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="床号">
            <el-input v-model="formData.admissionBed" placeholder="床号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="转科科别">
            <el-input v-model="formData.transferDept" placeholder="如有转科填写" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="出院时间">
            <el-date-picker v-model="formData.dischargeDateTime" type="datetime" placeholder="选择日期时间" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="出院科别">
            <el-input v-model="formData.dischargeDept" placeholder="科别" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="病房">
            <el-input v-model="formData.dischargeWard" placeholder="病房" />
          </el-form-item>
        </el-col>
        <el-col :span="3">
          <el-form-item label="床号">
            <el-input v-model="formData.dischargeBed" placeholder="床号" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="实际住院">
            <el-input-number v-model="formData.actualDays" :min="1" style="width: 100%" />
            <span class="inline-label">天</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="10">
          <el-form-item label="门(急)诊诊断">
            <el-input v-model="formData.outpatientDiagnosis" placeholder="请输入门(急)诊诊断" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="疾病编码">
            <el-input v-model="formData.outpatientDiagnosisCode" placeholder="ICD-10编码" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 出院诊断 -->
      <div class="section-title">出院诊断</div>
      <el-table :data="dischargeDiagnoses" border style="margin-bottom: 10px">
        <el-table-column label="出院诊断" width="300">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="诊断名称" />
          </template>
        </el-table-column>
        <el-table-column label="疾病编码" width="150">
          <template #default="{ row }">
            <el-input v-model="row.code" placeholder="ICD-10编码" />
          </template>
        </el-table-column>
        <el-table-column label="入院病情" width="200">
          <template #default="{ row }">
            <el-select v-model="row.admissionCondition" style="width: 100%">
              <el-option label="1.有" value="1" />
              <el-option label="2.临床未确定" value="2" />
              <el-option label="3.情况不明" value="3" />
              <el-option label="4.无" value="4" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="质控" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button 
              type="warning" 
              size="small" 
              @click="qualityControlDiagnosis($index)"
            >
              质控
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeDiagnosis($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" size="small" @click="addDiagnosis">+ 添加诊断</el-button>

      <!-- 病理诊断 -->
      <div class="section-title">病理诊断</div>
      <el-row :gutter="10" class="form-row">
        <el-col :span="10">
          <el-form-item label="病理诊断">
            <el-input v-model="formData.pathologyDiagnosis" placeholder="请输入病理诊断" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="形态学编码">
            <el-input v-model="formData.pathologyMorphologyCode" placeholder="形态学编码" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="病理号">
            <el-input v-model="formData.pathologyNo" placeholder="病理号" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 损伤、中毒的外部原因 -->
      <div class="section-title">损伤、中毒的外部原因</div>
      <el-row :gutter="10" class="form-row">
        <el-col :span="14">
          <el-form-item label="外部原因">
            <el-input v-model="formData.externalCause" placeholder="损伤、中毒的外部原因" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="疾病编码">
            <el-input v-model="formData.externalCauseCode" placeholder="ICD-10编码" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 药物过敏、血型、尸体解剖 -->
      <div class="section-title">其他信息</div>
      <el-row :gutter="10" class="form-row">
        <el-col :span="8">
          <el-form-item label="药物过敏">
            <el-radio-group v-model="formData.drugAllergy">
              <el-radio value="1">无</el-radio>
              <el-radio value="2">有</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="血型">
            <el-select v-model="formData.bloodType" style="width: 100%">
              <el-option label="1.A" value="1" />
              <el-option label="2.B" value="2" />
              <el-option label="3.O" value="3" />
              <el-option label="4.AB" value="4" />
              <el-option label="5.不详" value="5" />
              <el-option label="6.未查" value="6" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Rh">
            <el-select v-model="formData.rhFactor" style="width: 100%">
              <el-option label="1.阳" value="1" />
              <el-option label="2.阴" value="2" />
              <el-option label="3.不详" value="3" />
              <el-option label="4.未查" value="4" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="8">
          <el-form-item label="尸体解剖">
            <el-radio-group v-model="formData.autopsy">
              <el-radio value="1">是</el-radio>
              <el-radio value="2">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 手术及操作 -->
      <div class="section-title">手术及操作</div>
      <el-table :data="operations" border style="margin-bottom: 10px">
        <el-table-column label="手术及操作名称" width="200">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="手术名称" />
          </template>
        </el-table-column>
        <el-table-column label="手术编码" width="150">
          <template #default="{ row }">
            <el-input v-model="row.code" placeholder="ICD-9-CM-3编码" />
          </template>
        </el-table-column>
        <el-table-column label="手术日期" width="130">
          <template #default="{ row }">
            <el-date-picker v-model="row.date" type="date" placeholder="选择日期" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="手术级别" width="100">
          <template #default="{ row }">
            <el-input v-model="row.level" placeholder="级别" />
          </template>
        </el-table-column>
        <el-table-column label="术者" width="100">
          <template #default="{ row }">
            <el-input v-model="row.surgeon" placeholder="术者" />
          </template>
        </el-table-column>
        <el-table-column label="I助" width="80">
          <template #default="{ row }">
            <el-input v-model="row.firstAssistant" placeholder="I助" />
          </template>
        </el-table-column>
        <el-table-column label="II助" width="80">
          <template #default="{ row }">
            <el-input v-model="row.secondAssistant" placeholder="II助" />
          </template>
        </el-table-column>
        <el-table-column label="切口愈合" width="100">
          <template #default="{ row }">
            <el-input v-model="row.incisionHealing" placeholder="I/甲" />
          </template>
        </el-table-column>
        <el-table-column label="麻醉方式" width="120">
          <template #default="{ row }">
            <el-input v-model="row.anesthesiaMethod" placeholder="麻醉方式" />
          </template>
        </el-table-column>
        <el-table-column label="质控" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button 
              type="warning" 
              size="small" 
              @click="qualityControlOperation($index)"
            >
              质控
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeOperation($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" size="small" @click="addOperation">+ 添加手术</el-button>

      <!-- 医师签名 -->
      <div class="section-title">医师签名</div>
      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="科主任">
            <el-input v-model="formData.chiefDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="主任(副主任)医师">
            <el-input v-model="formData.deputyChiefDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="主治医师">
            <el-input v-model="formData.attendingDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="住院医师">
            <el-input v-model="formData.residentDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="责任护士">
            <el-input v-model="formData.responsibleNurse" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="进修医师">
            <el-input v-model="formData.advancedDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="实习医师">
            <el-input v-model="formData.internDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="编码员">
            <el-input v-model="formData.coder" placeholder="编码员" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="10" class="form-row">
        <el-col :span="6">
          <el-form-item label="病案质量">
            <el-select v-model="formData.qualityLevel" style="width: 100%">
              <el-option label="甲" value="甲" />
              <el-option label="乙" value="乙" />
              <el-option label="丙" value="丙" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="质控医师">
            <el-input v-model="formData.qualityDoctor" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="质控护士">
            <el-input v-model="formData.qualityNurse" placeholder="签名" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="质控日期">
            <el-date-picker v-model="formData.qualityDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="info" @click="handleSaveDraft">保存草稿</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { createInpatientRecord, updateInpatientRecord, getInpatientPatient } from '@/api/inpatient'
import { qualityControlDiagnosis as qcDiagnosis, qualityControlOperation as qcOperation } from '@/utils/homePageQualityControl'

const props = defineProps<{
  visible: boolean
  recordData: any
  patientId: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const formRef = ref<FormInstance>()
const isEdit = computed(() => !!props.recordData?.id)

// 表单数据
const formData = reactive({
  // 患者基本信息（自动填充，不可修改）
  name: '',
  gender: '2',
  birthDate: '',
  age: '',
  
  // 病案信息
  caseNo: '',
  medicalPaymentMethod: '2',
  healthCardNo: '',
  visitCount: 1,
  totalPages: 2,
  currentPage: 1,
  nationality: '中国',
  infantAge: '',
  infantAgeUnit: '月',
  newbornWeight: '',
  newbornAdmissionWeight: '',
  birthPlace: '',
  ancestralHome: '',
  ethnicity: '汉族',
  idCardNo: '',
  occupation: '自由职业',
  marriage: '2',
  presentAddress: '',
  phone: '',
  postalCode: '',
  householdAddress: '',
  householdPostalCode: '',
  workUnit: '',
  workPhone: '',
  workPostalCode: '',
  contactPerson: '',
  contactRelation: '',
  contactAddress: '',
  contactPhone: '',
  
  // 住院信息
  admissionRoute: '2',
  admissionDateTime: '',
  admissionDept: '',
  admissionWard: '',
  admissionBed: '',
  transferDept: '',
  dischargeDateTime: '',
  dischargeDept: '',
  dischargeWard: '',
  dischargeBed: '',
  actualDays: 1,
  outpatientDiagnosis: '',
  outpatientDiagnosisCode: '',
  
  // 出院诊断
  dischargeDiagnoses: [] as Array<{
    type: string
    name: string
    code: string
    admissionCondition: string
  }>,
  
  // 病理诊断
  pathologyDiagnosis: '',
  pathologyMorphologyCode: '',
  pathologyNo: '',
  
  // 损伤中毒外部原因
  externalCause: '',
  externalCauseCode: '',
  
  // 其他信息
  drugAllergy: '1',
  bloodType: '3',
  rhFactor: '1',
  autopsy: '2',
  
  // 手术及操作
  operations: [] as Array<{
    code: string
    date: string
    level: string
    name: string
    surgeon: string
    firstAssistant: string
    secondAssistant: string
    incisionHealing: string
    anesthesiaMethod: string
    anesthesiologist: string
  }>,
  
  // 医师签名
  chiefDoctor: '',
  deputyChiefDoctor: '',
  attendingDoctor: '',
  residentDoctor: '',
  responsibleNurse: '',
  advancedDoctor: '',
  internDoctor: '',
  coder: '',
  qualityLevel: '甲',
  qualityDoctor: '',
  qualityNurse: '',
  qualityDate: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
}

// 出院诊断列表
const dischargeDiagnoses = ref(formData.dischargeDiagnoses)

// 手术操作列表
const operations = ref(formData.operations)

// 添加诊断
const addDiagnosis = () => {
  dischargeDiagnoses.value.push({
    type: 'other',
    name: '',
    code: '',
    admissionCondition: '',
  })
}

// 删除诊断
const removeDiagnosis = (index: number) => {
  dischargeDiagnoses.value.splice(index, 1)
}

// 添加手术
const addOperation = () => {
  operations.value.push({
    code: '',
    date: '',
    level: '',
    name: '',
    surgeon: '',
    firstAssistant: '',
    secondAssistant: '',
    incisionHealing: '',
    anesthesiaMethod: '',
    anesthesiologist: '',
  })
}

// 删除手术
const removeOperation = (index: number) => {
  operations.value.splice(index, 1)
}

// 质控诊断编码（异步调用AI，弹窗显示结果）
const qualityControlDiagnosis = async (index: number) => {
  const diagnosis = dischargeDiagnoses.value[index]
  if (!diagnosis) return
  
  // 显示加载提示
  const loadingMsg = ElMessage({
    message: 'AI正在分析中，请稍候...',
    type: 'info',
    duration: 0, // 不自动关闭
  })
  
  try {
    const result = await qcDiagnosis(diagnosis.name, diagnosis.code)
    
    // 关闭加载提示
    loadingMsg.close()
    
    // 构建弹窗内容
    let contentHtml = `
      <div style="text-align: left; line-height: 1.8;">
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">诊断名称：</strong>
          <span>${diagnosis.name || '未填写'}</span>
        </div>
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">当前编码：</strong>
          <span>${diagnosis.code || '未填写'}</span>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; background-color: ${result.isValid ? '#f0f9ff' : '#fef0f0'}; border-radius: 4px;">
          <strong style="color: #606266;">质控结果：</strong><br/>
          <span style="color: ${result.isValid ? '#67c23a' : '#f56c6c'}; font-weight: bold;">
            ${result.isValid ? '✅ 正确' : '❌ 不正确'}
          </span>
        </div>
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">详细说明：</strong><br/>
          <span style="color: #606266;">${result.message}</span>
        </div>
    `
    
    // 如果有置信度，显示
    if (result.confidence !== undefined) {
      contentHtml += `
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">匹配置信度：</strong>
          <span style="color: #409eff;">${(result.confidence * 100).toFixed(1)}%</span>
        </div>
      `
    }
    
    // 如果有建议编码，显示
    if (result.suggestedCode) {
      contentHtml += `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #fdf6ec; border-radius: 4px; border-left: 4px solid #e6a23c;">
          <strong style="color: #606266;">💡 建议编码：</strong><br/>
          <span style="color: #e6a23c; font-size: 16px; font-weight: bold;">${result.suggestedCode}</span>
        </div>
      `
    }
    
    // 如果有改进建议，显示
    if (result.suggestion) {
      contentHtml += `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f4f4f5; border-radius: 4px;">
          <strong style="color: #606266;">📝 改进建议：</strong><br/>
          <span style="color: #909399;">${result.suggestion}</span>
        </div>
      `
    }
    
    contentHtml += `</div>`
    
    // 显示弹窗
    await ElMessageBox.alert(
      contentHtml,
      result.isValid ? '✅ 质控结果 - 编码正确' : '⚠️ 质控结果 - 需要修正',
      {
        confirmButtonText: result.suggestedCode ? '应用建议编码' : '确定',
        cancelButtonText: '取消',
        showCancelButton: !!result.suggestedCode,
        dangerouslyUseHTMLString: true,
        customClass: 'quality-control-dialog',
        center: true,
      }
    ).then(() => {
      // 如果用户点击了“应用建议编码”
      if (result.suggestedCode) {
        diagnosis.code = result.suggestedCode
        ElMessage.success('已自动填充建议编码')
      }
    }).catch(() => {
      // 用户取消或关闭弹窗
    })
  } catch (error) {
    // 关闭加载提示
    loadingMsg.close()
    console.error('质控失败:', error)
    ElMessage.error('质控服务暂时不可用，请稍后重试')
  }
}

// 质控手术编码（异步调用AI，弹窗显示结果）
const qualityControlOperation = async (index: number) => {
  const operation = operations.value[index]
  if (!operation) return
  
  // 显示加载提示
  const loadingMsg = ElMessage({
    message: 'AI正在分析中，请稍候...',
    type: 'info',
    duration: 0, // 不自动关闭
  })
  
  try {
    const result = await qcOperation(operation.name, operation.code)
    
    // 关闭加载提示
    loadingMsg.close()
    
    // 构建弹窗内容
    let contentHtml = `
      <div style="text-align: left; line-height: 1.8;">
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">手术名称：</strong>
          <span>${operation.name || '未填写'}</span>
        </div>
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">当前编码：</strong>
          <span>${operation.code || '未填写'}</span>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; background-color: ${result.isValid ? '#f0f9ff' : '#fef0f0'}; border-radius: 4px;">
          <strong style="color: #606266;">质控结果：</strong><br/>
          <span style="color: ${result.isValid ? '#67c23a' : '#f56c6c'}; font-weight: bold;">
            ${result.isValid ? '✅ 正确' : '❌ 不正确'}
          </span>
        </div>
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">详细说明：</strong><br/>
          <span style="color: #606266;">${result.message}</span>
        </div>
    `
    
    // 如果有置信度，显示
    if (result.confidence !== undefined) {
      contentHtml += `
        <div style="margin-bottom: 15px;">
          <strong style="color: #606266;">匹配置信度：</strong>
          <span style="color: #409eff;">${(result.confidence * 100).toFixed(1)}%</span>
        </div>
      `
    }
    
    // 如果有建议编码，显示
    if (result.suggestedCode) {
      contentHtml += `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #fdf6ec; border-radius: 4px; border-left: 4px solid #e6a23c;">
          <strong style="color: #606266;">💡 建议编码：</strong><br/>
          <span style="color: #e6a23c; font-size: 16px; font-weight: bold;">${result.suggestedCode}</span>
        </div>
      `
    }
    
    // 如果有改进建议，显示
    if (result.suggestion) {
      contentHtml += `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f4f4f5; border-radius: 4px;">
          <strong style="color: #606266;">📝 改进建议：</strong><br/>
          <span style="color: #909399;">${result.suggestion}</span>
        </div>
      `
    }
    
    contentHtml += `</div>`
    
    // 显示弹窗
    await ElMessageBox.alert(
      contentHtml,
      result.isValid ? '✅ 质控结果 - 编码正确' : '⚠️ 质控结果 - 需要修正',
      {
        confirmButtonText: result.suggestedCode ? '应用建议编码' : '确定',
        cancelButtonText: '取消',
        showCancelButton: !!result.suggestedCode,
        dangerouslyUseHTMLString: true,
        customClass: 'quality-control-dialog',
        center: true,
      }
    ).then(() => {
      // 如果用户点击了“应用建议编码”
      if (result.suggestedCode) {
        operation.code = result.suggestedCode
        ElMessage.success('已自动填充建议编码')
      }
    }).catch(() => {
      // 用户取消或关闭弹窗
    })
  } catch (error) {
    // 关闭加载提示
    loadingMsg.close()
    console.error('质控失败:', error)
    ElMessage.error('质控服务暂时不可用，请稍后重试')
  }
}

// 加载患者信息
const loadPatientInfo = async (patientId: number) => {
  try {
    // 响应拦截器已经返回了 res.data，所以直接使用
    const patient: any = await getInpatientPatient(patientId)
    
    console.log('API返回的患者数据:', patient)
    
    // 性别转换：数据库存储的是中文，表单使用的是数字
    const genderMap: Record<string, string> = {
      '男': '1',
      '女': '2',
    }
    
    // 计算年龄（如果数据库中没存储）
    let age = patient.age ? String(patient.age) : ''
    if (!age && patient.birthDate) {
      const birthDate = new Date(patient.birthDate)
      const today = new Date()
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      age = String(calculatedAge)
    }
    
    // 填充所有患者基本信息
    Object.assign(formData, {
      // 患者基本信息
      name: patient.name || '',
      gender: genderMap[patient.gender] || '2', // 男->1, 女->2
      birthDate: patient.birthDate || '',
      age: age,
      idCardNo: patient.idCard || '', // 身份证号
      phone: patient.phone || '', // 电话
      presentAddress: patient.address || '', // 现住址（从家庭住址获取）
      
      // 病案信息
      inpatientNo: patient.inpatientNo || '',
      caseNo: patient.inpatientNo || '', // 病案号=住院号
      
      // 住院信息
      admissionDept: patient.department || '',
      admissionWard: '', // 患者表中没有病房信息，留空
      admissionBed: patient.bedNo || '',
      admissionDateTime: patient.admissionDate || '',
      
      // 其他默认值
      nationality: '中国',
      ethnicity: '汉族',
      occupation: '自由职业',
      marriage: '2',
    })
    
    console.log('患者信息已自动填充:', {
      name: formData.name,
      gender: formData.gender,
      birthDate: formData.birthDate,
      age: formData.age,
      idCardNo: formData.idCardNo,
      phone: formData.phone,
      presentAddress: formData.presentAddress,
      caseNo: formData.caseNo,
    })
  } catch (error: any) {
    console.error('加载患者信息失败:', error)
    console.error('错误详情:', error.message, error.response?.data)
    ElMessage.error(`加载患者信息失败: ${error.message || '未知错误'}`)
  }
}

// 加载已有病案数据
const loadRecordData = () => {
  if (props.recordData?.content) {
    try {
      const content = typeof props.recordData.content === 'string' 
        ? JSON.parse(props.recordData.content) 
        : props.recordData.content
      
      console.log('加载病案数据 - 原始content:', content)
      
      const homePage = content.homePage || {}
      
      console.log('加载病案数据 - homePage:', homePage)
      console.log('加载病案数据 - dischargeDiagnoses:', homePage.dischargeDiagnoses)
      console.log('加载病案数据 - operations:', homePage.operations)
      
      // 定义不应该被病案数据覆盖的患者基本信息字段
      const patientInfoFields = [
        'name', 'gender', 'birthDate', 'age', 'idCardNo', 'phone', 'presentAddress',
        'inpatientNo', 'caseNo'
      ]
      
      // 填充病案特有字段（排除患者基本信息）
      Object.keys(homePage).forEach(key => {
        // 跳过患者基本信息字段，保留从患者表加载的数据
        if (!patientInfoFields.includes(key) && homePage[key] !== undefined) {
          (formData as any)[key] = homePage[key]
        }
      })
      
      console.log('病案数据已加载，患者基本信息保持不变')
      
      // 同步诊断和手术列表（确保是数组）
      if (homePage.dischargeDiagnoses && Array.isArray(homePage.dischargeDiagnoses)) {
        dischargeDiagnoses.value = homePage.dischargeDiagnoses
        console.log('已加载出院诊断:', dischargeDiagnoses.value.length, '条')
      } else {
        dischargeDiagnoses.value = []
        console.log('未找到出院诊断数据，初始化为空数组')
      }
      
      if (homePage.operations && Array.isArray(homePage.operations)) {
        operations.value = homePage.operations
        console.log('已加载手术操作:', operations.value.length, '条')
      } else {
        operations.value = []
        console.log('未找到手术操作数据，初始化为空数组')
      }
    } catch (error) {
      console.error('Failed to parse record content:', error)
    }
  } else {
    console.log('没有找到recordData或content')
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  await handleSubmit('draft')
}

// 提交病案
const handleSubmit = async (status: string = 'completed') => {
  try {
    // 验证表单
    await formRef.value?.validate()
    
    // 构建提交数据
    const recordContent = {
      homePage: {
        ...formData,
        dischargeDiagnoses: dischargeDiagnoses.value,
        operations: operations.value,
      }
    }
    
    const submitData: any = {
      patientId: props.patientId,
      recordType: 'home_page',
      content: JSON.stringify(recordContent),
      status: status === 'draft' ? 'draft' : 'completed',
    }
    
    // 只在编辑时传递 caseNo，新建时由后端自动设置
    if (isEdit.value) {
      submitData.caseNo = formData.caseNo
    }
    
    if (isEdit.value && props.recordData?.id) {
      // 编辑模式：只更新必要字段，避免更新patientId和caseNo
      const updateData = {
        recordType: 'home_page',
        content: JSON.stringify(recordContent),
        status: status === 'draft' ? 'draft' : 'completed',
      }
      
      console.log('编辑模式 - 提交数据:', updateData)
      
      await updateInpatientRecord(props.recordData.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 新增模式
      console.log('新增模式 - 提交数据:', submitData)
      await createInpatientRecord(submitData)
      ElMessage.success('保存成功')
    }
    
    emit('success')
    emit('update:visible', false)
  } catch (error) {
    console.error('Failed to submit:', error)
    if (error !== false) { // 排除表单验证失败
      ElMessage.error('操作失败')
    }
  }
}

// 监听弹窗显示状态
watch(() => props.visible, async (val) => {
  if (val) {
    // 先加载患者基本信息
    if (props.patientId) {
      await loadPatientInfo(props.patientId)
    }
    
    // 再加载病案数据（会覆盖部分患者信息）
    if (props.recordData) {
      loadRecordData()
    } else {
      // 新增模式，初始化默认值
      dischargeDiagnoses.value = []
      operations.value = []
    }
  }
})
</script>

<style scoped lang="scss">
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

.form-row {
  margin-bottom: 10px;
}

.inline-label {
  margin: 0 5px;
  color: #606266;
  font-size: 14px;
}

:deep(.el-table) {
  margin-bottom: 10px;
}

// 质控弹窗样式
:deep(.quality-control-dialog) {
  .el-message-box__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .el-message-box__title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
  
  .el-message-box__content {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .el-message-box__btns {
    padding: 15px 20px 20px;
    border-top: 1px solid #ebeef5;
    
    .el-button--primary {
      background-color: #409eff;
      border-color: #409eff;
      
      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }
    }
  }
}
</style>
