<template>
  <div class="sample-preview">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <span class="title">住院病案首页 - 样例预览</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handlePrint">
              <el-icon><Printer /></el-icon>
              打印/导出PDF
            </el-button>
          </div>
        </div>
      </template>

      <div class="document-container" ref="printContent">
        <!-- 第1页 -->
        <div class="page page-1">
          <!-- 医院头部 -->
          <div class="hospital-header">
            <div class="header-row">
              <span class="label">医疗机构</span>
              <span class="value">{{ sampleData.hospitalName }}</span>
              <span class="label">（组织机构代码：</span>
              <span class="value">{{ sampleData.orgCode }}</span>
              <span class="label">）</span>
            </div>
            <h1 class="document-title">住 院 病 案 首 页</h1>
            <div class="header-info">
              <span>医疗付费方式： {{ sampleData.paymentMethod }}</span>
              <span class="spacer"></span>
              <span>健康卡号：{{ sampleData.healthCardNo }}</span>
              <span class="spacer"></span>
              <span>第 {{ sampleData.hospitalTimes }} 次住院</span>
              <span class="spacer"></span>
              <span>病案号：{{ sampleData.caseNo }}</span>
            </div>
          </div>

          <!-- 患者基本信息表 -->
          <table class="info-table">
            <tbody>
              <tr>
                <td class="label-cell">姓名</td>
                <td class="value-cell">{{ sampleData.name }}</td>
                <td class="label-cell">性别</td>
                <td class="value-cell">{{ sampleData.gender }}</td>
                <td class="label-cell">出生日期</td>
                <td class="value-cell" colspan="3">{{ sampleData.birthDate }}</td>
                <td class="label-cell">年龄</td>
                <td class="value-cell">{{ sampleData.age }}</td>
                <td class="label-cell">国籍</td>
                <td class="value-cell">{{ sampleData.nationality }}</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">（年龄不足1周岁的）年龄</td>
                <td class="value-cell">- 月</td>
                <td class="label-cell" colspan="2">新生儿出生体重</td>
                <td class="value-cell">- 克</td>
                <td class="label-cell" colspan="2">新生儿入院体重</td>
                <td class="value-cell" colspan="2">- 克</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">出生地</td>
                <td class="value-cell" colspan="4">{{ sampleData.birthPlace }}</td>
                <td class="label-cell" colspan="2">籍贯</td>
                <td class="value-cell" colspan="2">{{ sampleData.nativePlace }}</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">身份证件类别</td>
                <td class="value-cell" colspan="3">{{ sampleData.idCard }}</td>
                <td class="label-cell" colspan="2">职业</td>
                <td class="value-cell" colspan="3"></td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">现住址</td>
                <td class="value-cell" colspan="3">{{ sampleData.currentAddress }}</td>
                <td class="label-cell">电话</td>
                <td class="value-cell">{{ sampleData.phone }}</td>
                <td class="label-cell">邮编</td>
                <td class="value-cell">{{ sampleData.postcode }}</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">户口地址</td>
                <td class="value-cell" colspan="5"></td>
                <td class="label-cell">邮编</td>
                <td class="value-cell" colspan="2"></td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">工作单位及地址</td>
                <td class="value-cell" colspan="3">— 单位电话</td>
                <td class="label-cell">邮编</td>
                <td class="value-cell" colspan="3"></td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">联系人姓名</td>
                <td class="value-cell">{{ sampleData.contactName }}</td>
                <td class="label-cell">关系</td>
                <td class="value-cell">{{ sampleData.contactRelation }}</td>
                <td class="label-cell" colspan="2">地址</td>
                <td class="value-cell" colspan="2"></td>
                <td class="label-cell">电话</td>
                <td class="value-cell">{{ sampleData.contactPhone }}</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">入院途径</td>
                <td class="value-cell" colspan="8">{{ sampleData.admissionRoute }}</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">入院时间</td>
                <td class="value-cell" colspan="3">{{ sampleData.admissionDate }}</td>
                <td class="label-cell" colspan="2">入院科别</td>
                <td class="value-cell">病房</td>
                <td class="label-cell" colspan="2">转科科别</td>
                <td class="value-cell">-</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">出院时间</td>
                <td class="value-cell" colspan="3">{{ sampleData.dischargeDate }}</td>
                <td class="label-cell" colspan="2">出院科别</td>
                <td class="value-cell">病房</td>
                <td class="label-cell" colspan="2">实际住院</td>
                <td class="value-cell">{{ sampleData.hospitalDays }} 天</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">门（急）诊诊断</td>
                <td class="value-cell" colspan="4"></td>
                <td class="label-cell" colspan="2">疾病编码</td>
                <td class="value-cell" colspan="2"></td>
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
                <td class="label-cell" colspan="2">主要诊断：</td>
                <td></td>
                <td>1-有</td>
                <td class="label-cell" colspan="2">其他诊断</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">其他诊断：</td>
                <td></td>
                <td>1-有</td>
                <td colspan="2"></td>
                <td></td>
                <td></td>
              </tr>
              <tr v-for="n in 8" :key="n">
                <td colspan="2"></td>
                <td></td>
                <td></td>
                <td colspan="2"></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td class="label-cell" colspan="4">入院病情：1.有，2.临床未确定，3.情况不明，4.无</td>
                <td colspan="4"></td>
              </tr>
            </tbody>
          </table>

          <!-- 损伤、中毒 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell">损伤、中毒的外部原因</td>
                <td class="value-cell" colspan="2"></td>
                <td class="label-cell">疾病编码</td>
                <td class="value-cell"></td>
              </tr>
            </tbody>
          </table>

          <!-- 病理诊断 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell">病理诊断：</td>
                <td class="value-cell" colspan="2"></td>
                <td class="label-cell">疾病编码</td>
                <td class="value-cell"></td>
              </tr>
              <tr>
                <td class="label-cell">病理号</td>
                <td class="value-cell" colspan="4"></td>
              </tr>
            </tbody>
          </table>

          <!-- 诊断依据和血型 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell" colspan="4">最高诊断依据 病理(包括细胞学 药物过敏 1-无 1.无2.有 过敏药物：</td>
                <td class="label-cell">死亡患者尸检</td>
                <td class="value-cell">1.是2.否</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">血型 1-A 1.A 2.B 3.0 4.AB 5.不详 6.未查 Rh 2-阳 1.阴 2.阳 3.不详 4.未查</td>
              </tr>
            </tbody>
          </table>

          <!-- 医务人员信息 -->
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

          <div class="page-number">第 1 页</div>
        </div>

        <!-- 第2页 -->
        <div class="page page-2">
          <!-- 医院头部 -->
          <div class="hospital-header">
            <div class="header-row">
              <span class="label">医疗机构</span>
              <span class="value">{{ sampleData.hospitalName }}</span>
              <span class="label">（组织机构代码：</span>
              <span class="value">{{ sampleData.orgCode }}</span>
              <span class="label">）</span>
            </div>
            <h1 class="document-title">住 院 病 案 首 页</h1>
          </div>

          <!-- 病案质量 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell" colspan="8">
                  病案质量 1-甲 1.甲 2.乙 3.丙 质控医师 质控护士 日期 {{ sampleData.qualityDate }}
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
              <tr v-for="n in 8" :key="n">
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
                <td class="label-cell" colspan="11">
                  临床路径：入径情况 -空 1.是 2.否 完成情况 -空 1.完成 2.退出 变异情况 -空 1.有 2.无
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 离院方式 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell" colspan="4">
                  离院方式 1-医嘱离院 1.医嘱离院 2.医嘱转院，拟接收机构名称：
                </td>
                <td class="value-cell" colspan="2">非医嘱转院</td>
              </tr>
              <tr>
                <td class="label-cell" colspan="4">
                  3.医嘱转社区卫生服务机构/乡镇卫生院，拟接收机构名称：
                </td>
                <td class="label-cell" colspan="2">
                  4.非医嘱转院 5.死亡 9.其他
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  是否有出院31天内再住院计划 1-无 1.无 2.有 目的：
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  颅脑损伤患者昏迷时间：入院前 天 小时 分钟 入院后 天 小时 分钟
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="3">入院诊断</td>
                <td class="label-cell" colspan="3">
                  出院情况： 1.治愈 2.好转 3.未愈 4.死亡 5.自动出院 6.其他
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="2">诊断符合情况：门诊与出院</td>
                <td class="value-cell">入院与出院</td>
                <td class="value-cell">术前与术后</td>
                <td class="label-cell" colspan="2">临床与病理</td>
              </tr>
            </tbody>
          </table>

          <div class="page-number">第 2 页</div>
        </div>

        <!-- 第3页 -->
        <div class="page page-3">
          <!-- 医院头部 -->
          <div class="hospital-header">
            <div class="header-row">
              <span class="label">医疗机构</span>
              <span class="value">{{ sampleData.hospitalName }}</span>
              <span class="label">（组织机构代码：</span>
              <span class="value">{{ sampleData.orgCode }}</span>
              <span class="label">）</span>
            </div>
            <h1 class="document-title">住 院 病 案 首 页</h1>
          </div>

          <!-- 放射与病理 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell">放射与病理</td>
                <td class="value-cell" colspan="2">0、未做 1、符合 2、不符合 3、不肯定</td>
                <td class="label-cell">医院感染</td>
                <td class="value-cell" colspan="2">1、有 2、无 感染名称：</td>
              </tr>
            </tbody>
          </table>

          <!-- 危重抢救等信息 -->
          <table class="simple-table">
            <tbody>
              <tr>
                <td class="label-cell">危重抢救：</td>
                <td class="value-cell" colspan="2">1、有 2、无 抢救次数</td>
                <td class="label-cell">成功次数</td>
                <td class="value-cell" colspan="2"></td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  术后非预期重返手术室再手术： 1、是 2、否 手术中异物遗留： 1、是 2、否
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  手术中死亡： 1、是 2、否 手术后死亡 1、是 2、否 医源性气胸 1、有 2、无
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  医源性切、穿刺伤： 1、有 2、无 医源性撕裂伤： 1、有 2、无
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  患者因同一疾病再住院： 1、15日内再住院 2、31日内再住院 3.无
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  因用药错误导致患者死亡： 1、是 2、否 由麻醉医师实施心肺复苏治疗成功 0、未做 1、是 2、否
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="3">
                  输液反应： 0、未做 1、有 2、无 输血品种：1、红细胞 u 2、血小板
                </td>
                <td class="label-cell" colspan="3">
                  输血反应： 0、未做 1、有 2、无 治疗量 3、血浆 ml 4、冷沉淀 u 5、其他
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="3">
                  抗生素使用情况： 0、未用 1、预防 2、治疗 未送检
                </td>
                <td class="label-cell" colspan="3">
                  细菌培养及药敏实验： 1、已送检 2、
                </td>
              </tr>
              <tr>
                <td class="label-cell" colspan="6">
                  择期手术： 1、是 2、否 择期手术后并发症：
                </td>
              </tr>
              <tr>
                <td class="value-cell" colspan="6" style="padding: 10px; text-align: left;">
                  1、手术并发症（严重但可治疗）导致的死亡 2、手术后伤口裂开 3、手术后肺栓塞或深静脉血栓<br/>
                  4、手术后出血或血肿 5、手术后髋关节骨折 6、手术后生理与代谢紊乱<br/>
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

          <div class="page-number">第 3 页</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const printContent = ref<HTMLElement>()

// 样例数据
const sampleData = ref({
  hospitalName: '烟台毓璜顶医院',
  orgCode: '12370600493502999Y',
  paymentMethod: '2-城镇居民基本医疗保险',
  healthCardNo: '001677741400',
  hospitalTimes: '2',
  caseNo: '2325089',
  name: '韩秀梅',
  gender: '女',
  birthDate: '1969年12月04日',
  age: '52岁',
  nationality: '中国',
  birthPlace: '山东省烟台市龙口市',
  nativePlace: '山东省烟台市龙口市',
  idCard: '370729196912042329',
  currentAddress: '',
  phone: '15553502541',
  postcode: '265700',
  contactName: '',
  contactRelation: '配偶',
  contactPhone: '13573552863',
  admissionRoute: '2-门诊 1.急诊 2.门诊 3.其他医疗机构转入,转诊医疗机构名称 9.其他',
  admissionDate: '2022年04月14日 08时',
  dischargeDate: '2022年04月24日 07时',
  hospitalDays: '',
  qualityDate: '2022年04月24日',
})

const handleBack = () => {
  router.back()
}

const handlePrint = () => {
  ElMessage({
    message: '请在打印对话框中选择"另存为PDF"即可保存到本地',
    type: 'info',
    duration: 5000,
  })
  
  setTimeout(() => {
    window.print()
  }, 500)
}
</script>

<style scoped lang="scss">
.sample-preview {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .document-container {
    background: #f5f5f5;
    padding: 20px;
    overflow-y: auto;
    max-height: calc(100vh - 250px);
  }

  .page {
    background: white;
    padding: 20mm 18mm;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    font-family: 'SimSun', '宋体', serif;
    font-size: 11px;
    line-height: 1.5;
    color: #000;
    max-width: 210mm;
    margin-left: auto;
    margin-right: auto;

    // 医院头部
    .hospital-header {
      text-align: center;
      margin-bottom: 15px;

      .header-row {
        font-size: 11px;
        margin-bottom: 8px;

        .label {
          font-weight: normal;
        }

        .value {
          font-weight: normal;
        }
      }

      .document-title {
        font-size: 20px;
        font-weight: bold;
        margin: 10px 0;
        letter-spacing: 8px;
        font-family: 'SimHei', '黑体', sans-serif;
        color: #000;
      }

      .header-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        margin: 8px 0;

        .spacer {
          flex: 1;
        }
      }
    }

    // 通用表格样式
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      border: 2px solid #000;

      th,
      td {
        border: 1px solid #000;
        padding: 4px 6px;
        font-size: 10px;
        text-align: center;
        color: #000;
      }

      th {
        background-color: #e8e8e8;
        font-weight: bold;
        padding: 5px 6px;
      }

      .label-cell {
        background-color: #f5f5f5;
        font-weight: bold;
        white-space: nowrap;
      }

      .value-cell {
        text-align: left;
        padding-left: 8px;
      }
    }

    .info-table {
      td {
        padding: 4px 5px;
        font-size: 10.5px;
      }
    }

    .diagnosis-table {
      th,
      td {
        padding: 4px 5px;
      }
    }

    .surgery-table {
      th,
      td {
        padding: 3px 4px;
        font-size: 9.5px;
      }
    }

    .simple-table {
      td {
        padding: 4px 6px;
        font-size: 10px;
      }
    }

    // 页码
    .page-number {
      text-align: center;
      font-size: 10px;
      margin-top: 15px;
      color: #333;
      font-weight: normal;
    }

    // 页脚说明
    .document-footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px dashed #ccc;
      font-size: 9px;
      line-height: 1.6;
      color: #666;

      p {
        margin: 5px 0;
        text-align: justify;
      }
    }
  }
}

// 打印样式
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 18mm;
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

  .document-container,
  .document-container * {
    visibility: visible;
  }

  .document-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
    background: white;
    max-height: none;

    .page {
      box-shadow: none;
      padding: 0;
      margin: 0;
      page-break-after: always;
      page-break-inside: avoid;

      &:last-child {
        page-break-after: auto;
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
