<template>
  <div class="inpatient-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>住院病案首页</span>
          <div class="header-actions">
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handlePrint" :disabled="!recordData">
              <el-icon><Printer /></el-icon>
              打印/保存PDF
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="document-preview" ref="previewRef">
        <div v-if="!recordData && !loading" class="empty-state">
          <el-empty description="病案数据不存在" />
        </div>
        <div v-else class="inpatient-document" id="print-content">
          <!-- 第1页 -->
          <div class="page">
            <!-- 医院头部信息 -->
            <div class="hospital-header">
              <div class="header-row">
                <span class="label">医疗机构</span>
                <span class="value">{{ hospitalInfo.name }}</span>
                <span class="label">（组织机构代码：</span>
                <span class="value">{{ hospitalInfo.orgCode }}</span>
                <span class="label">）</span>
              </div>
              <h1 class="document-title">住院病案首页</h1>
              <div class="header-info-row">
                <span>医疗付费方式： 2-城镇居民基本医疗保险</span>
              </div>
              <div class="header-info-row">
                <span>健康卡号：{{ patientInfo.healthCardNo || '-' }}</span>
                <span class="page-info">第 {{ recordData?.hospitalTimes || 1 }} 次住院</span>
                <span>病案号：{{ recordData?.caseNo || '-' }}</span>
              </div>
            </div>

            <!-- 患者基本信息表格 -->
            <table class="patient-info-table">
              <tbody>
                <tr>
                  <td class="label-cell">姓名</td>
                  <td class="value-cell">{{ patientInfo.name || '-' }}</td>
                  <td class="label-cell">性别</td>
                  <td class="value-cell">{{ patientInfo.gender || '-' }}</td>
                  <td class="label-cell">出生日期</td>
                  <td class="value-cell">{{ patientInfo.birthDate || '-' }}</td>
                  <td class="label-cell">年龄</td>
                  <td class="value-cell">{{ patientAge }}</td>
                  <td class="label-cell">国籍</td>
                  <td class="value-cell">{{ patientInfo.nationality || '中国' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">（年龄不足1周岁的）年龄</td>
                  <td class="value-cell">- 月</td>
                  <td colspan="2" class="label-cell">新生儿出生体重</td>
                  <td class="value-cell">- 克</td>
                  <td colspan="2" class="label-cell">新生儿入院体重</td>
                  <td class="value-cell">- 克</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">出生地</td>
                  <td class="value-cell" colspan="3">{{ patientInfo.birthPlace || '-' }}</td>
                  <td colspan="2" class="label-cell">籍贯</td>
                  <td class="value-cell" colspan="3">{{ patientInfo.nativePlace || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">身份证件类别</td>
                  <td class="value-cell">{{ patientInfo.idCard || '-' }}</td>
                  <td colspan="2" class="label-cell">职业</td>
                  <td class="value-cell" colspan="5">{{ patientInfo.occupation || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">现住址</td>
                  <td class="value-cell" colspan="3">{{ patientInfo.address || '-' }}</td>
                  <td colspan="2" class="label-cell">电话</td>
                  <td class="value-cell">{{ patientInfo.phone || '-' }}</td>
                  <td class="label-cell">邮编</td>
                  <td class="value-cell">{{ patientInfo.postcode || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">户口地址</td>
                  <td class="value-cell" colspan="3"></td>
                  <td colspan="2" class="label-cell">邮编</td>
                  <td class="value-cell" colspan="3"></td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">工作单位及地址</td>
                  <td class="value-cell" colspan="3">— 单位电话</td>
                  <td colspan="2" class="label-cell">邮编</td>
                  <td class="value-cell" colspan="3"></td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">联系人姓名</td>
                  <td class="value-cell">{{ patientInfo.contactName || '-' }}</td>
                  <td class="label-cell">关系</td>
                  <td class="value-cell">{{ patientInfo.contactRelation || '-' }}</td>
                  <td colspan="2" class="label-cell">地址</td>
                  <td class="value-cell" colspan="2">{{ patientInfo.contactAddress || '-' }}</td>
                  <td class="label-cell">电话</td>
                  <td class="value-cell">{{ patientInfo.contactPhone || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">入院途径</td>
                  <td class="value-cell" colspan="8">{{ patientInfo.admissionRoute || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">入院时间</td>
                  <td class="value-cell" colspan="3">{{ patientInfo.admissionDate || '-' }}</td>
                  <td colspan="2" class="label-cell">入院科别</td>
                  <td class="value-cell">{{ patientInfo.department || '-' }}</td>
                  <td colspan="2" class="label-cell">转科科别</td>
                  <td class="value-cell">{{ patientInfo.transferDepartment || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">出院时间</td>
                  <td class="value-cell" colspan="3">{{ patientInfo.dischargeDate || '-' }}</td>
                  <td colspan="2" class="label-cell">出院科别</td>
                  <td class="value-cell">{{ patientInfo.dischargeDepartment || '-' }}</td>
                  <td colspan="2" class="label-cell">实际住院</td>
                  <td class="value-cell">{{ patientInfo.hospitalDays || '-' }} 天</td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">门（急）诊诊断</td>
                  <td class="value-cell" colspan="4">{{ diagnosisInfo.outpatientDiagnosis || '-' }}</td>
                  <td colspan="2" class="label-cell">疾病编码</td>
                  <td class="value-cell" colspan="4">{{ diagnosisInfo.outpatientCode || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 诊断表格 -->
            <table class="diagnosis-table">
              <thead>
                <tr>
                  <th colspan="2">出院诊断</th>
                  <th>疾病编码</th>
                  <th>入院病情</th>
                  <th colspan="2">出院诊断</th>
                  <th>疾病编码</th>
                  <th>入院病情</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2" class="label-cell">主要诊断：</td>
                  <td>{{ diagnosisInfo.mainCode || '-' }}</td>
                  <td>{{ diagnosisInfo.admissionCondition || '1-有' }}</td>
                  <td colspan="2" class="label-cell">其他诊断</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">{{ diagnosisInfo.mainDiagnosis || '未填写' }}</td>
                  <td></td>
                  <td></td>
                  <td colspan="2"></td>
                  <td></td>
                  <td></td>
                </tr>
                <!-- 其他诊断 -->
                <tr v-if="diagnosisInfo.otherDiagnoses && diagnosisInfo.otherDiagnoses.length > 0">
                  <td colspan="2" class="label-cell">其他诊断：</td>
                  <td>{{ diagnosisInfo.otherCodes?.[0] || '-' }}</td>
                  <td>1-有</td>
                  <td colspan="2">{{ diagnosisInfo.otherDiagnoses[0] }}</td>
                  <td>{{ diagnosisInfo.otherCodes?.[1] || '-' }}</td>
                  <td></td>
                </tr>
                <!-- 空行 -->
                <tr v-for="n in 7" :key="n">
                  <td colspan="2"></td>
                  <td></td>
                  <td></td>
                  <td colspan="2"></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="4" class="label-cell">入院病情：1.有，2.临床未确定，3.情况不明，4.无</td>
                  <td colspan="4"></td>
                </tr>
              </tbody>
            </table>

            <!-- 损伤中毒表格 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td class="label-cell">损伤、中毒的外部原因</td>
                  <td class="value-cell" colspan="2">{{ otherInfo.injuryCause || '-' }}</td>
                  <td class="label-cell">疾病编码</td>
                  <td class="value-cell">{{ otherInfo.injuryCode || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 病理诊断表格 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td class="label-cell">病理诊断：</td>
                  <td class="value-cell" colspan="2">{{ examInfo.pathology || '-' }}</td>
                  <td class="label-cell">疾病编码</td>
                  <td class="value-cell">{{ examInfo.pathologyCode || '-' }}</td>
                </tr>
                <tr>
                  <td class="label-cell">病理号</td>
                  <td class="value-cell" colspan="4">{{ examInfo.pathologyNo || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 诊断依据和血型 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td colspan="4" class="label-cell">
                    最高诊断依据 {{ otherInfo.diagnosisBasis || '-' }} 药物过敏 {{ otherInfo.allergy === '1' ? '有' : '无' }} 过敏药物：{{ otherInfo.allergyDrug || '-' }}
                  </td>
                  <td class="label-cell">死亡患者尸检</td>
                  <td class="value-cell">{{ otherInfo.autopsy === '1' ? '是' : '否' }}</td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    血型 {{ patientInfo.bloodType || '-' }} Rh {{ patientInfo.rh || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 人员信息表格 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td class="label-cell">科主任</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">医疗组长</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">主任（副主任）医师</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">主治医师</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">住院医师</td>
                  <td class="value-cell"></td>
                </tr>
                <tr>
                  <td class="label-cell">责任护士</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">进修医师</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">实习医师</td>
                  <td class="value-cell"></td>
                  <td class="label-cell">编码员</td>
                  <td class="value-cell"></td>
                  <td colspan="2" class="value-cell"></td>
                </tr>
              </tbody>
            </table>

            <!-- 页码 -->
            <div class="page-number">第 1 页</div>
          </div>

          <!-- 第2页 -->
          <div class="page page-break">
            <!-- 医院头部信息 -->
            <div class="hospital-header">
              <div class="header-row">
                <span class="label">医疗机构</span>
                <span class="value">{{ hospitalInfo.name }}</span>
                <span class="label">（组织机构代码：</span>
                <span class="value">{{ hospitalInfo.orgCode }}</span>
                <span class="label">）</span>
              </div>
              <h1 class="document-title">住院病案首页</h1>
            </div>

            <!-- 病案质量 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td colspan="8" class="label-cell">
                    病案质量 1-甲 1.甲 2.乙 3.丙 质控医师 质控护士 日期 {{ recordData?.updatedAt ? new Date(recordData.updatedAt).toLocaleDateString('zh-CN') : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 手术及操作表格 -->
            <table class="surgery-table">
              <thead>
                <tr>
                  <th>手术及操作编码</th>
                  <th>手术及操作日期</th>
                  <th>手术及操作名称</th>
                  <th>手术级别</th>
                  <th>择期/急症</th>
                  <th colspan="3">手术及操作医师</th>
                  <th>切口愈合等级</th>
                  <th>麻醉方式</th>
                  <th>麻醉医师</th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>术者</th>
                  <th>I助</th>
                  <th>II助</th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(surgery, index) in (treatmentInfo.surgeries || [])" :key="index">
                  <td>{{ surgery.code || '-' }}</td>
                  <td>{{ surgery.date || '-' }}</td>
                  <td>{{ surgery.name || '-' }}</td>
                  <td>{{ surgery.level || '-' }}</td>
                  <td>{{ surgery.urgency || '-' }}</td>
                  <td>{{ surgery.operator || '-' }}</td>
                  <td>{{ surgery.assistant1 || '-' }}</td>
                  <td>{{ surgery.assistant2 || '-' }}</td>
                  <td>{{ surgery.incision || '-' }}</td>
                  <td>{{ surgery.anesthesia || '-' }}</td>
                  <td>{{ surgery.anesthesiologist || '-' }}</td>
                </tr>
                <!-- 空行 -->
                <tr v-for="n in Math.max(0, 8 - (treatmentInfo.surgeries?.length || 0))" :key="'empty-' + n">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td v-if="n > 1">/</td>
                  <td v-else></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="11" class="label-cell">
                    临床路径：入径情况 {{ otherInfo.clinicalPathwayEntry || '-' }} 完成情况 {{ otherInfo.clinicalPathwayComplete || '-' }} 变异情况 {{ otherInfo.clinicalPathwayVariant || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 离院方式 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td colspan="6" class="label-cell">
                    离院方式 1-医嘱离院 {{ otherInfo.dischargeMethod === '1' ? '✓' : '' }} 1.医嘱离院 2.医嘱转院，拟接收机构名称：{{ otherInfo.transferHospital || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="4" class="label-cell">
                    3.医嘱转社区卫生服务机构/乡镇卫生院，拟接收机构名称：
                  </td>
                  <td colspan="2" class="label-cell">
                    4.非医嘱转院 5.死亡 9.其他
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    是否有出院31天内再住院计划 {{ otherInfo.readmitPlan === '1' ? '无' : otherInfo.readmitPlan === '2' ? '有' : '-' }} 目的：{{ otherInfo.readmitPurpose || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    颅脑损伤患者昏迷时间：入院前 {{ otherInfo.comaBeforeAdmission || '-' }} 入院后 {{ otherInfo.comaAfterAdmission || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="label-cell">入院诊断</td>
                  <td colspan="3" class="label-cell">
                    出院情况：{{ otherInfo.dischargeCondition || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" class="label-cell">诊断符合情况：门诊与出院 {{ diagnosisInfo.matchOutpatient || '-' }}</td>
                  <td class="value-cell">入院与出院 {{ diagnosisInfo.matchAdmission || '-' }}</td>
                  <td class="value-cell">术前与术后 {{ diagnosisInfo.matchSurgery || '-' }}</td>
                  <td colspan="2" class="label-cell">临床与病理 {{ diagnosisInfo.matchPathology || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 页码 -->
            <div class="page-number">第 2 页</div>
          </div>

          <!-- 第3页 -->
          <div class="page page-break">
            <!-- 医院头部信息 -->
            <div class="hospital-header">
              <div class="header-row">
                <span class="label">医疗机构</span>
                <span class="value">{{ hospitalInfo.name }}</span>
                <span class="label">（组织机构代码：</span>
                <span class="value">{{ hospitalInfo.orgCode }}</span>
                <span class="label">）</span>
              </div>
              <h1 class="document-title">住院病案首页</h1>
            </div>

            <!-- 放射与病理 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td class="label-cell">放射与病理</td>
                  <td class="value-cell" colspan="2">{{ otherInfo.radiologyPathology || '-' }}</td>
                  <td class="label-cell">医院感染</td>
                  <td class="value-cell" colspan="2">{{ otherInfo.hospitalInfection === '1' ? '有' : '无' }} 感染名称：{{ otherInfo.infectionName || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- 危重抢救 -->
            <table class="simple-table">
              <tbody>
                <tr>
                  <td class="label-cell">危重抢救：</td>
                  <td class="value-cell" colspan="2">{{ otherInfo.criticalCare === '1' ? '有' : '无' }} 抢救次数 {{ otherInfo.criticalCareCount || '-' }}</td>
                  <td class="label-cell">成功次数</td>
                  <td class="value-cell" colspan="2">{{ otherInfo.criticalCareSuccess || '-' }}</td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    术后非预期重返手术室再手术：{{ otherInfo.unexpectedReturnSurgery === '1' ? '是' : '否' }} 手术中异物遗留：{{ otherInfo.foreignBodyLeft === '1' ? '是' : '否' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    手术中死亡：{{ otherInfo.deathDuringSurgery === '1' ? '是' : '否' }} 手术后死亡 {{ otherInfo.deathAfterSurgery === '1' ? '是' : '否' }} 医源性气胸 {{ otherInfo.iatrogenicPneumothorax === '1' ? '有' : '无' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    医源性切、穿刺伤：{{ otherInfo.iatrogenicCut === '1' ? '有' : '无' }} 医源性撕裂伤：{{ otherInfo.iatrogenicTear === '1' ? '有' : '无' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    患者因同一疾病再住院：{{ otherInfo.readmitSameDisease || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    因用药错误导致患者死亡：{{ otherInfo.medicationErrorDeath === '1' ? '是' : '否' }} 由麻醉医师实施心肺复苏治疗成功 {{ otherInfo.anesthesiaCPR || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="label-cell">
                    输液反应：{{ otherInfo.infusionReaction || '-' }} 输血品种：{{ otherInfo.bloodTransfusionType || '-' }}
                  </td>
                  <td colspan="3" class="label-cell">
                    输血反应：{{ otherInfo.transfusionReaction || '-' }} 治疗量 {{ otherInfo.transfusionAmount || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="label-cell">
                    抗生素使用情况：{{ otherInfo.antibioticUse || '-' }}
                  </td>
                  <td colspan="3" class="label-cell">
                    细菌培养及药敏实验：{{ otherInfo.bacterialCulture || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="label-cell">
                    择期手术：{{ otherInfo.electiveSurgery === '1' ? '是' : '否' }} 择期手术后并发症：{{ otherInfo.electiveSurgeryComplications || '-' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="6" class="value-cell" style="padding: 10px;">
                    1、手术并发症（严重但可治疗）导致的死亡 2、手术后伤口裂开 3、手术后肺栓塞或深静脉血栓<br/>
                    4、手术后出血或血肿 5、手术后关节骨折 6、手术后生理与代谢紊乱<br/>
                    7、手术后呼吸衰竭 8、手术后败血症<br/>
                    产伤发生率： 1、产伤-新生儿 2、产伤-器械辅助阴道分娩 3、产伤-非器械辅助阴道分娩
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 说明 -->
            <div class="document-footer">
              <p>说明：（一）医疗付费方式 1.城镇职工基本医疗保险 2.城镇居民基本医疗保险 3.新型农村合作医疗 4.贫困求助 5.商业医疗保险 6.全公费 7.全自费 8.其他社区保险 9.其他</p>
              <p>（二）凡是由医院信息系统提供住院费用清单的，住院病案首页中不可以填写"住院费用"。</p>
            </div>

            <!-- 页码 -->
            <div class="page-number">第 3 页</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Printer } from '@element-plus/icons-vue'
import { getInpatientRecord } from '@/api/inpatient'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const recordData = ref<any>(null)
const patientData = ref<any>(null)

const hospitalInfo = ref({
  name: '烟台毓璜顶医院',
  orgCode: '12370600493502999Y',
})

// 解析病案内容
const recordContent = computed(() => {
  if (!recordData.value?.content) return null
  
  try {
    // 如果content是字符串，尝试解析JSON
    const content = typeof recordData.value.content === 'string' 
      ? JSON.parse(recordData.value.content)
      : recordData.value.content
    return content
  } catch (error) {
    console.error('Failed to parse record content:', error)
    return null
  }
})

// 患者信息 - 映射表单保存的数据结构
const patientInfo = computed(() => {
  const patient = recordContent.value?.patientInfo || {}
  
  return {
    // 基本信息
    name: patient.name || '-',
    gender: patient.gender || '-',
    age: patient.age || '-',
    inpatientNo: patient.inpatientNo || '-',
    department: patient.department || '-',
    bedNo: patient.bedNo || '-',
    admissionDate: patient.admissionDate || '-',
    dischargeDate: patient.dischargeDate || '-',
    
    // 预览需要的额外字段（如果表单中没有，使用默认值）
    birthDate: patient.birthDate || '-',
    nationality: patient.nationality || '中国',
    healthCardNo: patient.healthCardNo || '-',
    birthPlace: patient.birthPlace || '-',
    nativePlace: patient.nativePlace || '-',
    idCard: patient.idCard || '-',
    occupation: patient.occupation || '-',
    address: patient.address || '-',
    phone: patient.phone || '-',
    postcode: patient.postcode || '-',
    
    // 保留原始字段
    ...patient,
  }
})

// 计算年龄
const patientAge = computed(() => {
  // 如果有出生日期，根据出生日期计算
  if (patientInfo.value.birthDate && patientInfo.value.birthDate !== '-') {
    const birthDate = new Date(patientInfo.value.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return `${age}岁`
  }
  
  // 如果没有出生日期，直接使用年龄字段
  if (patientInfo.value.age && patientInfo.value.age !== '-') {
    return `${patientInfo.value.age}岁`
  }
  
  return '-'
})

// 诊断信息 - 映射表单保存的数据结构到预览需要的格式
const diagnosisInfo = computed(() => {
  const record = recordData.value
  if (!record) return {}
  
  // 方式1：从 content.diagnosis 对象中获取（主要方式）
  if (record.content) {
    try {
      const content = typeof record.content === 'string' 
        ? JSON.parse(record.content) 
        : record.content
      
      const diagnosis = content.diagnosis || {}
      
      if (diagnosis.admission || diagnosis.discharge || diagnosis.main) {
        return {
          // 入院诊断
          admission: diagnosis.admission || '-',
          admissionCode: diagnosis.admissionCode || '-',
          
          // 出院诊断
          discharge: diagnosis.discharge || '-',
          dischargeCode: diagnosis.dischargeCode || '-',
          
          // 主要诊断
          main: diagnosis.main || diagnosis.discharge || diagnosis.admission || '-',
          mainCode: diagnosis.mainCode || diagnosis.dischargeCode || diagnosis.admissionCode || '-',
          
          // 其他诊断
          other: diagnosis.other || '-',
          otherCode: diagnosis.otherCode || '-',
          
          // 其他诊断数组格式
          otherDiagnoses: diagnosis.other ? [diagnosis.other] : [],
          otherCodes: diagnosis.otherCode ? [diagnosis.otherCode] : [],
          
          // 门急诊诊断（使用入院诊断代替）
          outpatientDiagnosis: diagnosis.admission || '-',
          outpatientCode: diagnosis.admissionCode || '-',
          
          // 入院病情（默认值）
          admissionCondition: '1-有',
        }
      }
    } catch (error) {
      console.error('Failed to parse content:', error)
    }
  }
  
  // 方式2：从直接字段获取（备用方案）
  if (record.admissionDiagnosis || record.dischargeDiagnosis || record.mainDiagnosis) {
    return {
      // 入院诊断
      admission: record.admissionDiagnosis || '-',
      admissionCode: record.admissionDiagnosisCode || '-',
      
      // 出院诊断
      discharge: record.dischargeDiagnosis || '-',
      dischargeCode: record.dischargeDiagnosisCode || '-',
      
      // 主要诊断
      main: record.mainDiagnosis || record.dischargeDiagnosis || record.admissionDiagnosis || '-',
      mainCode: record.mainDiagnosisCode || record.dischargeDiagnosisCode || record.admissionDiagnosisCode || '-',
      
      // 其他诊断
      other: record.otherDiagnosis || '-',
      otherCode: record.otherDiagnosisCode || '-',
      
      // 其他诊断数组格式
      otherDiagnoses: record.otherDiagnosis ? [record.otherDiagnosis] : [],
      otherCodes: record.otherDiagnosisCode ? [record.otherDiagnosisCode] : [],
      
      // 门急诊诊断（使用入院诊断代替）
      outpatientDiagnosis: record.admissionDiagnosis || '-',
      outpatientCode: record.admissionDiagnosisCode || '-',
      
      // 入院病情（默认值）
      admissionCondition: '1-有',
    }
  }
  
  // 方式3：从旧格式的 content.diagnosis 获取
  const diagnosis = recordContent.value?.diagnosis || {}
  
  return {
    // 门急诊诊断（使用入院诊断代替）
    outpatientDiagnosis: diagnosis.admission || '-',
    outpatientCode: diagnosis.admissionCode || '-',
    
    // 主要诊断（优先级：main > discharge > admission）
    mainDiagnosis: diagnosis.main || diagnosis.discharge || diagnosis.admission || '-',
    mainCode: diagnosis.mainCode || diagnosis.dischargeCode || diagnosis.admissionCode || '-',
    
    // 出院诊断（单独保留）
    dischargeDiagnosis: diagnosis.discharge || '-',
    dischargeCode: diagnosis.dischargeCode || '-',
    
    // 入院病情（默认值）
    admissionCondition: '1-有',
    
    // 其他诊断（将字符串转换为数组）
    otherDiagnoses: diagnosis.other ? [diagnosis.other] : [],
    otherCodes: diagnosis.otherCode ? [diagnosis.otherCode] : [],
    
    // 保留原始字段供其他地方使用
    ...diagnosis,
  }
})

// 治疗信息 - 映射表单保存的数据结构
const treatmentInfo = computed(() => {
  const treatment = recordContent.value?.treatment || {}
  
  return {
    // 手术列表（如果表单中没有，返回空数组）
    surgeries: treatment.surgeries || [],
    
    // 保留原始字段
    ...treatment,
  }
})

// 检查结果 - 映射表单保存的数据结构
const examInfo = computed(() => {
  const examination = recordContent.value?.examination || {}
  
  return {
    // 病理诊断相关字段
    pathology: examination.pathology || '-',
    pathologyCode: examination.pathologyCode || '-',
    pathologyNo: examination.pathologyNo || '-',
    
    // 保留原始字段
    ...examination,
  }
})

// 其他信息 - 映射表单保存的数据结构
const otherInfo = computed(() => {
  const record = recordData.value
  if (!record) return {}
  
  // 方式1：直接从记录字段获取（住院病案的新结构）
  if (record.physicalExam || record.auxiliaryExam || record.allergyHistory) {
    return {
      // 体格检查
      physicalExam: record.physicalExam || '-',
      
      // 辅助检查
      auxiliaryExam: record.auxiliaryExam || '-',
      
      // 病理诊断
      pathology: record.pathologyDiagnosis || '-',
      pathologyCode: '-',
      pathologyNo: '-',
      
      // 损伤中毒
      injuryCause: '-',
      injuryCode: '-',
      
      // 最高诊断依据
      diagnosisBasis: '-',
      
      // 药物过敏
      allergy: record.allergyHistory ? '1' : '0',
      allergyDrug: record.allergyHistory || '-',
      
      // 尸检
      autopsy: '0',
      
      // 临床路径
      clinicalPathwayEntry: '-',
      clinicalPathwayComplete: '-',
      clinicalPathwayVariant: '-',
      
      // 离院方式
      dischargeMethod: record.dischargeMethod || '-',
      
      // 出院情况
      dischargeCondition: '-',
      
      // 昏迷时间
      comaBeforeAdmission: '-',
      comaAfterAdmission: '-',
      
      // 诊断符合情况
      matchOutpatient: '-',
      matchAdmission: '-',
      matchSurgery: '-',
      matchPathology: '-',
      
      // 放射与病理
      radiologyPathology: '-',
      
      // 医院感染
      hospitalInfection: '0',
      infectionName: '-',
      
      // 危重抢救
      criticalCare: '0',
      criticalCareCount: '-',
      criticalCareSuccess: '-',
      
      // 其他标志
      unexpectedReturnSurgery: '0',
      foreignBodyLeft: '0',
      deathDuringSurgery: '0',
      deathAfterSurgery: '0',
      iatrogenicPneumothorax: '0',
      
      // 并发症
      complications: record.complications || '-',
      
      // 备注
      remarks: record.remarks || '-',
    }
  }
  
  // 方式2：从 content 中获取（旧结构或其他格式）
  const other = recordContent.value?.other || {}
  
  return {
    // 损伤中毒相关
    injuryCause: other.injuryCause || '-',
    injuryCode: other.injuryCode || '-',
    
    // 最高诊断依据
    diagnosisBasis: other.diagnosisBasis || '-',
    
    // 药物过敏
    allergy: other.allergy || '0',
    allergyDrug: other.allergyDrug || '-',
    
    // 尸检
    autopsy: other.autopsy || '0',
    
    // 临床路径
    clinicalPathwayEntry: other.clinicalPathwayEntry || '-',
    clinicalPathwayComplete: other.clinicalPathwayComplete || '-',
    clinicalPathwayVariant: other.clinicalPathwayVariant || '-',
    
    // 离院方式
    dischargeMethod: other.dischargeMethod || '-',
    
    // 出院情况
    dischargeCondition: other.dischargeCondition || '-',
    
    // 昏迷时间
    comaBeforeAdmission: other.comaBeforeAdmission || '-',
    comaAfterAdmission: other.comaAfterAdmission || '-',
    
    // 诊断符合情况
    matchOutpatient: other.matchOutpatient || '-',
    matchAdmission: other.matchAdmission || '-',
    matchSurgery: other.matchSurgery || '-',
    matchPathology: other.matchPathology || '-',
    
    // 放射与病理
    radiologyPathology: other.radiologyPathology || '-',
    
    // 医院感染
    hospitalInfection: other.hospitalInfection || '0',
    infectionName: other.infectionName || '-',
    
    // 危重抢救
    criticalCare: other.criticalCare || '0',
    criticalCareCount: other.criticalCareCount || '-',
    criticalCareSuccess: other.criticalCareSuccess || '-',
    
    // 其他标志
    unexpectedReturnSurgery: other.unexpectedReturnSurgery || '0',
    foreignBodyLeft: other.foreignBodyLeft || '0',
    deathDuringSurgery: other.deathDuringSurgery || '0',
    deathAfterSurgery: other.deathAfterSurgery || '0',
    iatrogenicPneumothorax: other.iatrogenicPneumothorax || '0',
    
    // 保留原始字段
    ...other,
  }
})

// 加载病案数据
const loadRecord = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('病案ID不存在')
    return
  }
  
  loading.value = true
  try {
    const response = await getInpatientRecord(id as string)
    recordData.value = response
    
    // 如果有患者ID，可以加载患者详细信息（可选）
    // if (response.patientId) {
    //   const patientResponse = await getInpatientPatient(response.patientId)
    //   patientData.value = patientResponse
    // }
  } catch (error: any) {
    console.error('Failed to load record:', error)
    ElMessage.error(error.message || '加载病案失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecord()
})

const handleBack = () => {
  router.back()
}

const handlePrint = () => {
  ElMessage({
    message: '请在打印对话框中选择“另存为PDF”即可保存到本地',
    type: 'info',
    duration: 5000,
  })
  
  setTimeout(() => {
    window.print()
  }, 500)
}
</script>

<style scoped lang="scss">
.inpatient-record {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .document-preview {
    padding: 20px;
    background: #e8e8e8;
    min-height: calc(100vh - 200px);
    overflow-y: auto;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .inpatient-document {
      max-width: 210mm;
      margin: 0 auto;

      .page {
        background: white;
        padding: 10mm 18mm;  /* 上下边距1cm，左右边距1.8cm */
        margin-bottom: 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font-family: 'SimSun', '宋体', serif;
        font-size: 13px;  /* 从11px增加到13px */
        line-height: 1.6;  /* 从1.5增加到1.6 */
        color: #000;

        &.page-break {
          page-break-before: always;
        }

        // 医院头部
        .hospital-header {
          text-align: center;
          margin-bottom: 10px;

          .header-row {
            font-size: 13px;  /* 从11px增加到13px */
            margin-bottom: 8px;  /* 从5px增加到8px */

            .label {
              font-weight: normal;
            }

            .value {
              font-weight: normal;
            }
          }

          .document-title {
            font-size: 22px;  /* 从18px增加到22px */
            font-weight: bold;
            margin: 10px 0;  /* 从8px增加到10px */
            letter-spacing: 8px;  /* 从6px增加到8px */
            font-family: 'SimHei', '黑体', sans-serif;
          }

          .header-info-row {
            font-size: 12px;  /* 从10px增加到12px */
            display: flex;
            justify-content: space-between;
            margin: 5px 0;  /* 从3px增加到5px */

            .page-info {
              margin: 0 20px;
            }
          }
        }

        // 通用表格样式
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;  /* 从8px增加到10px */

          th,
          td {
            border: 1px solid #000;
            padding: 5px 6px;  /* 从3px 5px增加到5px 6px */
            font-size: 12px;  /* 从10px增加到12px */
            text-align: center;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            padding: 6px 6px;  /* 增加表头内边距 */
          }

          .label-cell {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            width: auto;
          }

          .value-cell {
            text-align: left;
          }
        }

        // 患者信息表格
        .patient-info-table {
          td {
            padding: 5px 6px;  /* 从3px 4px增加到5px 6px */
            font-size: 12px;  /* 从10px增加到12px */
          }
        }

        // 诊断表格
        .diagnosis-table {
          th,
          td {
            padding: 5px 6px;  /* 从3px 4px增加到5px 6px */
          }
        }

        // 手术表格
        .surgery-table {
          th,
          td {
            padding: 4px 5px;  /* 从3px 4px增加到4px 5px */
            font-size: 11px;  /* 从9px增加到11px */
          }
        }

        // 页码
        .page-number {
          text-align: center;
          font-size: 12px;  /* 从10px增加到12px */
          margin-top: 10px;  /* 从8px增加到10px */
          color: #333;
        }

        // 页脚说明
        .document-footer {
          margin-top: 18px;  /* 从15px增加到18px */
          padding-top: 12px;  /* 从10px增加到12px */
          font-size: 11px;  /* 从9px增加到11px */
          line-height: 1.7;  /* 从1.6增加到1.7 */
          color: #333;

          p {
            margin: 6px 0;  /* 从5px增加到6px */
            text-align: justify;
          }
        }
      }
    }
  }
}

// 打印样式
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 18mm;  /* 上下边距1cm，左右边距1.8cm */
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    background: white;
  }

  body * {
    visibility: hidden;
  }

  #print-content,
  #print-content * {
    visibility: visible;
  }

  #print-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    margin: 0;

    .page {
      box-shadow: none;
      padding: 0;
      margin: 0;
      page-break-after: always;
      font-size: 13px;  /* 确保打印时字体大小一致 */
      line-height: 1.6;

      &:last-child {
        page-break-after: auto;
      }

      &.page-break {
        page-break-before: always;
      }
      
      // 打印时表格字体大小
      table {
        th, td {
          font-size: 12px;
          padding: 5px 6px;
        }
      }
      
      .patient-info-table td {
        font-size: 12px;
        padding: 5px 6px;
      }
      
      .diagnosis-table th,
      .diagnosis-table td {
        padding: 5px 6px;
      }
      
      .surgery-table th,
      .surgery-table td {
        font-size: 11px;
        padding: 4px 5px;
      }
      
      .document-title {
        font-size: 22px;
      }
      
      .header-row {
        font-size: 13px;
      }
      
      .header-info-row {
        font-size: 12px;
      }
      
      .page-number {
        font-size: 12px;
      }
      
      .document-footer {
        font-size: 11px;
      }
    }
  }

  .card-header,
  .no-print,
  .el-card__header {
    display: none !important;
  }
}
</style>
