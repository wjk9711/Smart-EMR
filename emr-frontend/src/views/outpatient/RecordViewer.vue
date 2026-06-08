<template>
  <div class="record-viewer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>门诊病历查看</span>
          <div class="header-actions">
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handlePrint">
              <el-icon><Printer /></el-icon>
              打印/保存PDF
            </el-button>
            <el-button type="success" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="document-preview" ref="previewRef">
        <div v-if="!recordData.id && !loading" class="empty-state">
          <el-empty description="病历数据不存在" />
        </div>
        <div v-else class="emr-document" id="print-content">
          <!-- 医院头部信息 -->
          <div class="hospital-header">
            <div class="header-row">
              <span class="label">医疗机构</span>
              <span class="value">{{ hospitalInfo.name }}</span>
              <span class="label">（组织机构代码：</span>
              <span class="value">{{ hospitalInfo.orgCode }}</span>
              <span class="label">）</span>
            </div>
            <h1 class="document-title">门 诊 病 历</h1>
            <div class="header-info-row">
              <span>就诊日期：{{ visitDate }}</span>
              <span>科室：{{ departmentName }}</span>
              <span>病历号：{{ patientInfo?.patientNo || '-' }}</span>
            </div>
          </div>

          <!-- 患者基本信息表格 -->
          <table class="patient-info-table">
            <tbody>
              <tr>
                <td class="label-cell">姓名</td>
                <td class="value-cell">{{ patientInfo?.name || '-' }}</td>
                <td class="label-cell">性别</td>
                <td class="value-cell">
                  {{ patientInfo?.gender === 'male' ? '男' : patientInfo?.gender === 'female' ? '女' : '其他' }}
                </td>
                <td class="label-cell">年龄</td>
                <td class="value-cell">{{ patientAge }}</td>
                <td class="label-cell">病历号</td>
                <td class="value-cell">{{ patientInfo?.patientNo || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">就诊日期</td>
                <td class="value-cell" colspan="3">{{ visitDate }}</td>
                <td class="label-cell">科室</td>
                <td class="value-cell" colspan="3">{{ departmentName }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 病历内容表格 -->
          <table class="content-table">
            <tbody>
              <tr>
                <td class="label-cell">主诉</td>
                <td class="value-cell">{{ recordData.chiefComplaint || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">现病史</td>
                <td class="value-cell">{{ recordData.presentIllness || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">既往史</td>
                <td class="value-cell">{{ recordData.pastHistory || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">过敏史</td>
                <td class="value-cell">{{ recordData.allergyHistory || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">体格检查</td>
                <td class="value-cell">{{ recordData.physicalExam || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">辅助检查</td>
                <td class="value-cell">{{ recordData.auxiliaryExam || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">初步诊断</td>
                <td class="value-cell">
                  <div v-if="recordData.diagnosis && recordData.diagnosis.length > 0">
                    <div v-for="(item, index) in recordData.diagnosis" :key="index" class="diagnosis-item">
                      <span class="diagnosis-type">
                        {{ item.type === 'primary' ? '[主要诊断]' : '[次要诊断]' }}
                      </span>
                      <span class="diagnosis-name">{{ item.name }}</span>
                      <span v-if="item.code" class="diagnosis-code">({{ item.code }})</span>
                    </div>
                  </div>
                  <div v-else>-</div>
                </td>
              </tr>
              <tr>
                <td class="label-cell">治疗方案</td>
                <td class="value-cell">{{ recordData.treatmentPlan || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">处方</td>
                <td class="value-cell">
                  <div v-if="recordData.prescription && recordData.prescription.length > 0">
                    <table class="prescription-inner-table">
                      <thead>
                        <tr>
                          <th>药品名称</th>
                          <th>规格</th>
                          <th>用法用量</th>
                          <th>频次</th>
                          <th>天数</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in recordData.prescription" :key="index">
                          <td>{{ item.drugName }}</td>
                          <td>{{ item.specification }}</td>
                          <td>{{ item.dosage }}</td>
                          <td>{{ item.frequency }}</td>
                          <td>{{ item.duration }}天</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else>-</div>
                </td>
              </tr>
              <tr>
                <td class="label-cell">医嘱建议</td>
                <td class="value-cell">{{ recordData.advice || '-' }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 签名区域 -->
          <div class="signature-section">
            <div class="signature-row">
              <span class="signature-label">医师签名：</span>
              <div class="signature-image" v-if="recordData.doctorSignature">
                <img :src="recordData.doctorSignature" alt="医师签名" />
              </div>
              <span class="signature-text" v-else>{{ doctorName || '-' }}</span>
            </div>
            <div class="signature-row">
              <span class="signature-label">记录时间：</span>
              <span class="signature-text">{{ formatDateTime(recordData.createdAt) }}</span>
            </div>
          </div>

          <!-- 页脚 -->
          <div class="document-footer">
            <p>本病历由电子病历系统生成，仅供参考</p>
            <p>打印时间：{{ currentDateTime }}</p>
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
import { Printer, Edit } from '@element-plus/icons-vue'
import { getOutpatientRecord } from '@/api/outpatient'
import { getPatient } from '@/api/patient'
import type { OutpatientRecord } from '@/types/record'

const route = useRoute()
const router = useRouter()
const previewRef = ref<HTMLElement>()

const loading = ref(false)

const hospitalInfo = ref({
  name: '烟台毓璜顶医院',
  orgCode: '12370600493502999Y',
})

const hospitalName = ref('XX医院')
const departmentName = ref('内科')
const doctorName = ref('张医生')

const patientInfo = ref<any>(null)
const recordData = ref<Partial<OutpatientRecord>>({})

const visitDate = computed(() => {
  if (!recordData.value.createdAt) return '-'
  return new Date(recordData.value.createdAt).toLocaleDateString('zh-CN')
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

const currentDateTime = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

const formatDateTime = (date?: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const fetchRecord = async () => {
  loading.value = true
  try {
    const recordId = Number(route.params.id)
    if (!recordId) {
      ElMessage.error('病历ID无效')
      return
    }

    const record = await getOutpatientRecord(recordId)
    recordData.value = record

    // 加载患者信息
    if (record.patientId) {
      patientInfo.value = await getPatient(record.patientId)
    }
  } catch (error) {
    console.error('Failed to fetch record:', error)
    ElMessage.error('加载病历失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handlePrint = () => {
  // 显示提示信息
  ElMessage({
    message: '请在打印对话框中选择“另存为PDF”即可保存到本地',
    type: 'info',
    duration: 5000,
  })
  
  // 延迟一下再调用打印，让用户看到提示
  setTimeout(() => {
    window.print()
  }, 500)
}

const handleEdit = () => {
  const recordId = route.params.id
  router.push(`/outpatient/record/edit/${recordId}`)
}

onMounted(() => {
  fetchRecord()
})
</script>

<style scoped lang="scss">
.record-viewer {
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

    .emr-document {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 10mm 18mm;  /* 上下边距1cm，左右边距1.8cm */
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      font-family: 'SimSun', '宋体', serif;
      font-size: 13px;
      line-height: 1.6;
      color: #000;

      // 医院头部
      .hospital-header {
        text-align: center;
        margin-bottom: 10px;

        .header-row {
          font-size: 13px;
          margin-bottom: 8px;

          .label {
            font-weight: normal;
          }

          .value {
            font-weight: normal;
          }
        }

        .document-title {
          font-size: 22px;
          font-weight: bold;
          margin: 10px 0;
          letter-spacing: 8px;
          font-family: 'SimHei', '黑体', sans-serif;
        }

        .header-info-row {
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
      }

      // 通用表格样式
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;

        th,
        td {
          border: 1px solid #000;
          padding: 5px 6px;
          font-size: 12px;
          text-align: center;
        }

        th {
          background-color: #f0f0f0;
          font-weight: bold;
          padding: 6px 6px;
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
          padding: 5px 6px;
          font-size: 12px;
        }
      }

      // 病历内容表格
      .content-table {
        td {
          padding: 5px 6px;
          vertical-align: top;

          &.label-cell {
            width: 90px;
          }

          &.value-cell {
            min-height: 35px;
            line-height: 1.8;
            text-align: justify;

            .diagnosis-item {
              margin: 4px 0;
              
              .diagnosis-type {
                font-weight: bold;
                color: #c00;
                margin-right: 6px;
              }

              .diagnosis-name {
                margin-right: 5px;
              }

              .diagnosis-code {
                color: #333;
                font-size: 12px;
              }
            }

            .prescription-inner-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 12px;

              thead {
                tr {
                  th {
                    background-color: #e0e0e0;
                    padding: 6px 8px;
                    font-weight: bold;
                    text-align: center;
                  }
                }
              }

              tbody {
                tr {
                  td {
                    padding: 6px 8px;
                    text-align: center;
                  }
                }
              }
            }
          }
        }
      }

      // 签名区域
      .signature-section {
        margin-top: 35px;
        padding-top: 15px;
        border-top: 1px solid #000;

        .signature-row {
          display: flex;
          align-items: center;
          margin: 12px 0;
          font-size: 14px;

          .signature-label {
            font-weight: bold;
            margin-right: 10px;
            color: #000;
            white-space: nowrap;
          }

          .signature-image {
            img {
              max-height: 45px;
              border: 1px solid #ccc;
              padding: 2px;
              background: white;
            }
          }

          .signature-text {
            color: #000;
            font-family: 'KaiTi', '楷体', cursive;
          }
        }
      }

      // 页脚
      .document-footer {
        margin-top: 35px;
        padding-top: 12px;
        border-top: 1px dashed #999;
        text-align: center;
        font-size: 11px;
        color: #666;

        p {
          margin: 4px 0;
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

    .emr-document {
      box-shadow: none;
      padding: 0;
      margin: 0;
      page-break-after: always;
      font-size: 13px;
      line-height: 1.6;

      &:last-child {
        page-break-after: auto;
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
      
      .content-table td {
        padding: 5px 6px;
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
    }
  }

  .card-header,
  .no-print,
  .el-card__header {
    display: none !important;
  }
}
</style>