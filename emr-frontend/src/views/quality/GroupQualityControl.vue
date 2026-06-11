<template>
  <div class="group-quality-control">
    <el-card shadow="never" class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">妇产科病案质控报告</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/quality' }">病历质控</el-breadcrumb-item>
            <el-breadcrumb-item>小组质控</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </template>
    </el-card>

    <!-- 三个大组卡片 -->
    <el-row :gutter="30" class="group-grid">
      <el-col 
        v-for="group in groups" 
        :key="group.id"
        :xs="24" 
        :sm="12" 
        :md="8"
      >
        <el-card 
          shadow="hover" 
          class="group-card-large"
          @click="handleViewGroupReport(group)"
        >
          <div class="group-content-large">
            <div class="group-icon" :style="{ background: group.color }">
              {{ group.name.charAt(0) }}
            </div>
            <div class="group-title">{{ group.name }}</div>
            <div class="group-desc">{{ group.description }}</div>
            <div class="group-stats-large">
              <div class="stat-large">
                <div class="stat-label">成员数</div>
                <div class="stat-value">{{ group.memberCount }}人</div>
              </div>
              <div class="stat-large">
                <div class="stat-label">质控分数</div>
                <div class="stat-value score" :class="getScoreClass(group.score)">{{ group.score }}</div>
              </div>
            </div>
            <el-button type="primary" size="large" class="view-report-btn">
              <el-icon><Document /></el-icon>
              查看完整报告
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 大型报告弹窗 -->
    <el-dialog 
      v-model="reportDialogVisible" 
      :title="currentGroup?.name + ' - 详细质控报告'"
      width="95%"
      top="3vh"
      class="large-report-dialog"
    >
      <div v-if="currentGroup" class="large-report-content">
        <!-- 报告头部信息 -->
        <div class="report-banner" :style="{ background: currentGroup.color }">
          <div class="banner-content">
            <h1 class="banner-title">{{ currentGroup.name }}</h1>
            <p class="banner-subtitle">{{ currentGroup.reportTitle }}</p>
            <div class="banner-meta">
              <span>报告编号：OB-QC-2026-001</span>
              <span>质控日期：2026年6月8日</span>
              <span>患者姓名：小丽（化名）</span>
            </div>
          </div>
        </div>

        <!-- 报告主体内容 -->
        <div class="report-body-body">
          <!-- 仁心组、仁术组（reportType=1）：病案编码质控结果 -->
          <div v-if="currentGroup.reportType === 1" class="report-section-large">
            <h2 class="section-heading">
              <el-icon :size="32"><CircleCheckFilled /></el-icon>
              二、病案编码质控结果
            </h2>

            <!-- 主要诊断修正 -->
            <div class="subsection">
              <h3 class="subsection-title">1. 主要诊断修正</h3>
              <el-table :data="mainDiagnosisData" border class="large-table">
                <el-table-column prop="item" label="项目" width="120" align="center">
                  <template #default="{ row }">
                    <strong>{{ row.item }}</strong>
                  </template>
                </el-table-column>
                <el-table-column prop="original" label="原诊断及编码" min-width="200">
                  <template #default="{ row }">
                    <span class="original-text">{{ row.original }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="correct" label="正确诊断及编码" min-width="200">
                  <template #default="{ row }">
                    <span class="correct-text">{{ row.correct }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="basis" label="修正依据" min-width="300">
                  <template #default="{ row }">
                    <div class="basis-content">{{ row.basis }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 其他诊断修正与补充 -->
            <div class="subsection">
              <h3 class="subsection-title">2. 其他诊断修正与补充</h3>
              <el-table :data="otherDiagnosisData" border class="large-table">
                <el-table-column prop="original" label="原诊断" width="150" />
                <el-table-column prop="originalCode" label="原编码" width="120" align="center" />
                <el-table-column prop="corrected" label="修正后诊断" min-width="200">
                  <template #default="{ row }">
                    <span class="corrected-text">{{ row.corrected }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="correctedCode" label="修正后编码" width="150" align="center" />
                <el-table-column prop="explanation" label="修正说明" min-width="250" />
              </el-table>
              
              <el-alert
                title="注：胎盘粘连伴出血（O72.001）、妊娠合并羊水过少（O41.001）编码正确，无需修改。"
                type="info"
                :closable="false"
                style="margin-top: 16px; font-size: 16px;"
              />
            </div>

            <!-- 手术操作编码核查 -->
            <div class="subsection">
              <h3 class="subsection-title">3. 手术操作编码核查</h3>
              <el-table :data="operationData" border class="large-table">
                <el-table-column prop="operation" label="手术操作" min-width="250" />
                <el-table-column prop="code" label="原编码" width="150" align="center" />
                <el-table-column prop="accurate" label="是否准确" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag type="success" size="large">{{ row.accurate }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="200" />
              </el-table>
              
              <el-alert
                title="结论：手术操作编码全部正确，无需修正。"
                type="success"
                :closable="false"
                style="margin-top: 16px; font-size: 18px; font-weight: bold;"
              />
            </div>
          </div>

          <!-- 精益组、求精组（reportType=2）：DRG入组逻辑与结果分析 -->
          <div v-if="currentGroup.reportType === 2" class="report-section-large">
            <h2 class="section-heading">
              <el-icon :size="32"><TrendCharts /></el-icon>
              三、DRG入组逻辑与结果分析
            </h2>

            <!-- 修正前后入组路径对比 -->
            <div class="subsection">
              <h3 class="subsection-title">1. 修正前后入组路径对比</h3>
              <el-table :data="drgComparisonData" border class="large-table comparison-table">
                <el-table-column prop="item" label="项目" width="150" align="center">
                  <template #default="{ row }">
                    <strong>{{ row.item }}</strong>
                  </template>
                </el-table-column>
                <el-table-column prop="before" label="修正前（错误主诊）" min-width="250">
                  <template #default="{ row }">
                    <div class="before-cell">{{ row.before }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="after" label="修正后（正确主诊）" min-width="250">
                  <template #default="{ row }">
                    <div class="after-cell">{{ row.after }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 权重与支付差异 -->
            <div class="subsection">
              <h3 class="subsection-title">2. 权重与支付差异</h3>
              <el-table :data="paymentData" border class="large-table">
                <el-table-column prop="drgGroup" label="DRG组" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.type" size="large">{{ row.drgGroup }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="rw" label="相对权重（RW）参考" width="200" align="center" />
                <el-table-column prop="payment" label="预估支付（按某地区费率）" min-width="200" />
                <el-table-column prop="impact" label="盈亏影响" min-width="150">
                  <template #default="{ row }">
                    <el-tag :type="row.impactType" size="large">{{ row.impact }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              
              <el-alert
                title="注：实际权重以当地医保DRG付费方案为准。本案例中，错误分组可导致权重损失约50%，单例亏损可达数千元。"
                type="warning"
                :closable="false"
                style="margin-top: 16px; font-size: 16px;"
              />
            </div>

            <!-- DRG入组错误原因总结 -->
            <div class="subsection">
              <h3 class="subsection-title">3. DRG入组错误原因总结</h3>
              <el-card shadow="never" class="summary-card">
                <el-icon :size="24" color="#e6a23c"><WarningFilled /></el-icon>
                <p class="summary-text">
                  主要诊断误选为"瘢痕子宫"（N编码），未按产科原则选择"梗阻性分娩"（O编码）。
                </p>
              </el-card>
            </div>
          </div>

          <!-- 开拓组、进取组（reportType=3）：绩效影响与风险分析 + 质控改进建议 -->
          <div v-if="currentGroup.reportType === 3" class="report-section-large">
            <h2 class="section-heading">
              <el-icon :size="32"><Monitor /></el-icon>
              四、绩效影响与风险分析
            </h2>

            <!-- 经济绩效影响 -->
            <div class="subsection">
              <h3 class="subsection-title">1. 经济绩效影响</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card shadow="hover" class="impact-card loss">
                    <div class="impact-icon">
                      <el-icon :size="48"><Money /></el-icon>
                    </div>
                    <h4>直接医保收入损失</h4>
                    <p class="impact-detail">
                      以OB23权重2.0、费率10000元/权重计，正确入组可获约<strong>20000元</strong>；
                      NZ13权重0.9，仅获约<strong>9000元</strong>。
                    </p>
                    <div class="loss-amount">单例潜在亏损约11000元</div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card shadow="hover" class="impact-card performance">
                    <div class="impact-icon">
                      <el-icon :size="48"><Trophy /></el-icon>
                    </div>
                    <h4>科室绩效评价</h4>
                    <p class="impact-detail">
                      CMI值、总权重、结余率均受负面影响，长期影响科室运营。
                    </p>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 质控合规风险 -->
            <div class="subsection">
              <h3 class="subsection-title">2. 质控合规风险</h3>
              <el-alert
                title='医保飞行检查或病案评审若发现主诊断选择错误，可能判定为“高编高靠”或“低编低靠”，面临拒付、扣款甚至行政处罚。'
                type="error"
                :closable="false"
                style="margin-bottom: 16px; font-size: 16px;"
              />
              <el-alert
                title="医院质量考核指标（如主要诊断正确率）不达标，影响等级评审。"
                type="warning"
                :closable="false"
                style="font-size: 16px;"
              />
              
              <el-card shadow="never" class="conclusion-card">
                <el-icon :size="28" color="#67c23a"><CircleCheck /></el-icon>
                <p class="conclusion-text">
                  结论：病案质控必须坚持规则优先；同时应加强编码员与临床医生的沟通培训，建立互信机制。
                </p>
              </el-card>
            </div>

            <!-- 质控改进建议 -->
            <h2 class="section-heading" style="margin-top: 40px;">
              <el-icon :size="32"><MagicStick /></el-icon>
              五、质控改进建议
            </h2>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover" class="suggestion-card-large">
                  <div class="suggestion-number">1</div>
                  <h4>编码技术与培训</h4>
                  <ul class="suggestion-list">
                    <li>每季度开展产科主要诊断选择专项培训，重点讲解"梗阻性分娩""剖宫产指征"的编码规则。</li>
                    <li>编制产科常见错误案例集（如本案例），纳入住院医师及编码员继续教育。</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="suggestion-card-large">
                  <div class="suggestion-number">2</div>
                  <h4>流程与机制</h4>
                  <ul class="suggestion-list">
                    <li>在电子病历系统中增设产科主诊断规则提示：当医生写入"瘢痕子宫"且同时存在剖宫产、梗阻性分娩征象时，系统自动弹窗提醒。</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="suggestion-card-large">
                  <div class="suggestion-number">3</div>
                  <h4>持续监测</h4>
                  <ul class="suggestion-list">
                    <li>每月抽取产科出院病案，对比原分组与质控后分组，计算DRG组变动率及权重偏差率，纳入质控通报。</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button size="large" @click="reportDialogVisible = false">关闭报告</el-button>
        <el-button type="primary" size="large" @click="handleExportReport">
          <el-icon><Download /></el-icon>
          导出PDF报告
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document, CircleCheckFilled, TrendCharts, Monitor, WarningFilled,
  Money, Trophy, Check, MagicStick, Download
} from '@element-plus/icons-vue'

// 六个小组数据（复用三个报告模板）
const groups = ref([
  {
    id: 1,
    name: '仁心组',
    description: '病案编码质控专家',
    reportTitle: '二、病案编码质控结果',
    reportType: 1,  // 使用仁心仁术组的报告
    icon: 'CircleCheckFilled',
    memberCount: 7,
    score: 94.5,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    name: '仁术组',
    description: '病案编码质控专家',
    reportTitle: '二、病案编码质控结果',
    reportType: 1,  // 使用仁心仁术组的报告
    icon: 'CircleCheckFilled',
    memberCount: 7,
    score: 93.8,
    color: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  },
  {
    id: 3,
    name: '精益组',
    description: 'DRG入组逻辑分析',
    reportTitle: '三、DRG入组逻辑与结果分析',
    reportType: 2,  // 使用精益求精组的报告
    icon: 'TrendCharts',
    memberCount: 7,
    score: 91.2,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 4,
    name: '求精组',
    description: 'DRG入组逻辑分析',
    reportTitle: '三、DRG入组逻辑与结果分析',
    reportType: 2,  // 使用精益求精组的报告
    icon: 'TrendCharts',
    memberCount: 7,
    score: 90.5,
    color: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  },
  {
    id: 5,
    name: '开拓组',
    description: '绩效分析与改进建议',
    reportTitle: '四、绩效影响与风险分析 / 五、质控改进建议',
    reportType: 3,  // 使用开拓进取组的报告
    icon: 'Monitor',
    memberCount: 7,
    score: 89.8,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 6,
    name: '进取组',
    description: '绩效分析与改进建议',
    reportTitle: '四、绩效影响与风险分析 / 五、质控改进建议',
    reportType: 3,  // 使用开拓进取组的报告
    icon: 'Monitor',
    memberCount: 8,
    score: 88.9,
    color: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
  },
])

// 弹窗状态
const reportDialogVisible = ref(false)
const currentGroup = ref<any>(null)

// 主要诊断修正数据
const mainDiagnosisData = [
  {
    item: '主要诊断',
    original: '瘢痕子宫（N85.805）',
    correct: '子宫瘢痕引起的梗阻性分娩（O65.500x002）',
    basis: '1.产科主要诊断应选择产科的主要并发症或合并症，且影响产程进展的情况作为主诊（参见规范第十四条及原则第2条。\n2.瘢痕子宫仅为病因表述，不应作为本次分娩住院的主要诊断。',
  },
]

// 其他诊断修正数据
const otherDiagnosisData = [
  {
    original: '梗阻性分娩',
    originalCode: 'O66.901',
    corrected: '无需单独列出（已纳入主诊断）',
    correctedCode: '——',
    explanation: '主诊断已明确为"子宫瘢痕引起的梗阻性分娩"，不再重复编码非特异性梗阻性分娩。',
  },
  {
    original: '女性盆腔炎',
    originalCode: 'N73.901',
    corrected: '妊娠合并盆腔炎',
    correctedCode: 'O23.501',
    explanation: '盆腔炎发生于妊娠期，应使用O编码（妊娠合并感染性疾病）。',
  },
  {
    original: '轻度贫血',
    originalCode: 'D64.906',
    corrected: '妊娠合并轻度贫血',
    correctedCode: 'O99.005',
    explanation: '贫血与妊娠相关，应使用O99.-编码。',
  },
  {
    original: '低钾血症',
    originalCode: 'E87.601',
    corrected: '妊娠合并低钾血症',
    correctedCode: 'O99.205',
    explanation: '电解质紊乱发生于妊娠期，应归入O99.2。',
  },
  {
    original: '真菌性阴道炎',
    originalCode: 'B37.304',
    corrected: '妊娠合并真菌性阴道炎',
    correctedCode: 'O98.800x002',
    explanation: '妊娠期阴道感染，应使用O98（孕产妇其他感染性疾病）。',
  },
  {
    original: '漏编诊断',
    originalCode: '无',
    corrected: '在医院内出生的单胎活产婴儿',
    correctedCode: 'Z38.000x001',
    explanation: '母婴同室病案需补充新生儿出生状况编码（Z38），用于产科与新生儿统计。',
  },
]

// 手术操作编码数据
const operationData = [
  {
    operation: '剖宫产术（子宫下段横切口）',
    code: '74.1x01',
    accurate: '是',
    remark: '——',
  },
  {
    operation: '盆腔粘连松解术',
    code: '54.5904',
    accurate: '是',
    remark: '——',
  },
  {
    operation: '手取胎盘',
    code: '75.4x00y002',
    accurate: '是',
    remark: '需注意该编码归类于"其他产科操作"，无遗漏。',
  },
]

// DRG对比数据
const drgComparisonData = [
  {
    item: '主要诊断',
    before: '瘢痕子宫（N85.805）',
    after: '子宫瘢痕引起的梗阻性分娩（O65.500x002）',
  },
  {
    item: 'MDC',
    before: 'MDCN（女性生殖系统疾病）',
    after: 'MDCO（妊娠、分娩及产褥期）',
  },
  {
    item: 'ADRG判定',
    before: '虽有剖宫产术，但MDCN无产科剖宫产组，按盆腔手术入NZ组',
    after: '在MDCO内，有剖宫产手术 → OC组（剖宫产术）',
  },
  {
    item: 'DRG细分组',
    before: '存在胎盘粘连伴出血等合并症（CC）→ NZ13',
    after: '存在一般合并症（CC）→ OB23',
  },
  {
    item: '最终DRG',
    before: 'NZ13（女性生殖系统其他疾患，伴合并症）',
    after: 'OB23（剖宫产术，伴一般合并症或并发症）',
  },
]

// 支付差异数据
const paymentData = [
  {
    drgGroup: 'NZ13',
    rw: '约0.8 ~ 1.0',
    payment: '偏低',
    impact: '亏损风险',
    type: 'danger',
    impactType: 'danger',
  },
  {
    drgGroup: 'OB23',
    rw: '约1.6 ~ 2.0',
    payment: '显著提高',
    impact: '合理补偿',
    type: 'success',
    impactType: 'success',
  },
]

// 查看报告
const handleViewGroupReport = (group: any) => {
  currentGroup.value = group
  reportDialogVisible.value = true
}

// 获取分数样式
const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  return 'average'
}

// 导出报告
const handleExportReport = () => {
  ElMessage.success('报告导出功能开发中...')
}
</script>

<style scoped lang="scss">
.group-quality-control {
  padding: 20px;
  
  .page-header {
    margin-bottom: 30px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
      }
    }
  }
  
  .group-grid {
    .group-card-large {
      cursor: pointer;
      transition: all 0.3s ease;
      height: 100%;
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      }
      
      .group-content-large {
        text-align: center;
        padding: 30px 20px;
        
        .group-icon {
          width: 120px;
          height: 120px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          font-size: 56px;  // ✅ 增大字体
          font-weight: 700;  // ✅ 加粗
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        .group-title {
          font-size: 32px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 12px;
        }
        
        .group-desc {
          font-size: 18px;
          color: #909399;
          margin-bottom: 24px;
        }
        
        .group-stats-large {
          display: flex;
          justify-content: space-around;
          margin-bottom: 24px;
          padding: 20px;
          background: #f5f7fa;
          border-radius: 12px;
          
          .stat-large {
            .stat-label {
              font-size: 16px;
              color: #909399;
              margin-bottom: 8px;
            }
            
            .stat-value {
              font-size: 36px;
              font-weight: 700;
              color: #303133;
              
              &.score {
                &.excellent {
                  color: #67c23a;
                }
                
                &.good {
                  color: #e6a23c;
                }
                
                &.average {
                  color: #f56c6c;
                }
              }
            }
          }
        }
        
        .view-report-btn {
          width: 100%;
          height: 56px;
          font-size: 20px;
          font-weight: 600;
          
          .el-icon {
            margin-right: 8px;
          }
        }
      }
    }
  }
}

// 大型报告弹窗样式
.large-report-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 85vh;
    overflow-y: auto;
  }
  
  .report-banner {
    padding: 40px;
    color: white;
    
    .banner-content {
      .banner-title {
        font-size: 48px;
        font-weight: 700;
        margin: 0 0 12px 0;
      }
      
      .banner-subtitle {
        font-size: 28px;
        margin: 0 0 20px 0;
        opacity: 0.95;
      }
      
      .banner-meta {
        display: flex;
        gap: 30px;
        font-size: 18px;
        opacity: 0.9;
        
        span {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 6px;
        }
      }
    }
  }
  
  .report-body-body {
    padding: 40px;
    
    .report-section-large {
      margin-bottom: 50px;
      
      .section-heading {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 36px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 30px;
        padding-bottom: 16px;
        border-bottom: 3px solid #409eff;
      }
      
      .subsection {
        margin-bottom: 40px;
        
        .subsection-title {
          font-size: 28px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 20px;
          padding-left: 16px;
          border-left: 4px solid #409eff;
        }
        
        // 大表格样式
        .large-table {
          font-size: 18px;
          
          :deep(.el-table__header th) {
            font-size: 20px;
            font-weight: 600;
            background: #f5f7fa;
            padding: 16px 0;
          }
          
          :deep(.el-table__body td) {
            padding: 16px 0;
            line-height: 1.8;
          }
          
          .original-text {
            color: #f56c6c;
            font-weight: 500;
          }
          
          .correct-text,
          .corrected-text {
            color: #67c23a;
            font-weight: 600;
          }
          
          .basis-content {
            white-space: pre-line;
            line-height: 2;
          }
          
          .before-cell {
            color: #f56c6c;
            background: #fef0f0;
            padding: 8px;
            border-radius: 4px;
          }
          
          .after-cell {
            color: #67c23a;
            background: #f0f9ff;
            padding: 8px;
            border-radius: 4px;
          }
        }
        
        // 对比表格特殊样式
        .comparison-table {
          :deep(.el-table__body tr:hover) {
            background: #fafafa;
          }
        }
        
        // 总结卡片
        .summary-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: #fdf6ec;
          border-left: 4px solid #e6a23c;
          
          .summary-text {
            font-size: 20px;
            color: #303133;
            margin: 0;
            line-height: 1.8;
          }
        }
        
        // 影响卡片
        .impact-card {
          padding: 30px;
          text-align: center;
          height: 100%;
          
          .impact-icon {
            margin-bottom: 20px;
            color: #409eff;
          }
          
          h4 {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #303133;
          }
          
          .impact-detail {
            font-size: 18px;
            color: #606266;
            line-height: 1.8;
            margin: 0 0 16px 0;
          }
          
          .loss-amount {
            font-size: 28px;
            font-weight: 700;
            color: #f56c6c;
            padding: 12px;
            background: #fef0f0;
            border-radius: 8px;
          }
          
          &.loss {
            border-top: 4px solid #f56c6c;
          }
          
          &.performance {
            border-top: 4px solid #e6a23c;
          }
        }
        
        // 结论文字卡片
        .conclusion-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: #f0f9ff;
          border-left: 4px solid #67c23a;
          margin-top: 20px;
          
          .conclusion-text {
            font-size: 20px;
            color: #303133;
            margin: 0;
            line-height: 1.8;
            font-weight: 500;
          }
        }
        
        // 建议卡片
        .suggestion-card-large {
          padding: 30px;
          height: 100%;
          position: relative;
          
          .suggestion-number {
            position: absolute;
            top: -10px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          
          h4 {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #303133;
          }
          
          .suggestion-list {
            list-style: none;
            padding: 0;
            margin: 0;
            
            li {
              font-size: 18px;
              color: #606266;
              line-height: 2;
              margin-bottom: 12px;
              padding-left: 24px;
              position: relative;
              
              &::before {
                content: '•';
                position: absolute;
                left: 8px;
                color: #409eff;
                font-weight: bold;
                font-size: 24px;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .group-quality-control {
    .group-grid {
      .group-card-large {
        .group-content-large {
          .group-icon {
            width: 80px;
            height: 80px;
            font-size: 40px;  // ✅ 响应式字体
          }
          
          .group-title {
            font-size: 24px;
          }
          
          .group-stats-large {
            flex-direction: column;
            gap: 16px;
          }
        }
      }
    }
  }
  
  .large-report-dialog {
    .report-banner {
      .banner-content {
        .banner-title {
          font-size: 32px;
        }
        
        .banner-subtitle {
          font-size: 20px;
        }
        
        .banner-meta {
          flex-direction: column;
          gap: 12px;
        }
      }
    }
    
    .report-body-body {
      padding: 20px;
      
      .report-section-large {
        .section-heading {
          font-size: 28px;
        }
        
        .subsection {
          .subsection-title {
            font-size: 22px;
          }
          
          .large-table {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
