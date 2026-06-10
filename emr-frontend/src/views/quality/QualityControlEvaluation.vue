<template>
  <div class="quality-control-evaluation">
    <el-card shadow="never" class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">质控评价</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/quality' }">病历质控</el-breadcrumb-item>
            <el-breadcrumb-item>质控评价</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </template>
    </el-card>

    <!-- 上半部分：质控概览信息 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.completedCount }}/{{ overviewStats.totalCount }}</div>
              <div class="stat-label">完成人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.avgTime }}</div>
              <div class="stat-label">平均时间</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.avgAccuracy }}%</div>
              <div class="stat-label">平均正确率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="32"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.aiScore }}</div>
              <div class="stat-label">AI分数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 下半部分：图表和修改意见 -->
    <el-row :gutter="20" class="detail-section">
      <!-- 左侧：诊断正确率图表 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-title">
              <el-icon><DataAnalysis /></el-icon>
              <span>诊断编码正确率分析</span>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧：修改意见 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="suggestion-card">
          <template #header>
            <div class="card-title">
              <el-icon><DocumentChecked /></el-icon>
              <span>智能修改建议</span>
            </div>
          </template>
          <div class="suggestion-content">
            <el-alert
              title="基于AI分析的质控建议"
              type="info"
              :closable="false"
              show-icon
              class="mb-4"
            />
            
            <div v-for="(item, index) in suggestions" :key="index" class="suggestion-item">
              <div class="suggestion-header">
                <el-tag :type="getSuggestionType(item.priority)" size="small">
                  {{ item.priority === 'high' ? '重要' : item.priority === 'medium' ? '一般' : '提示' }}
                </el-tag>
                <span class="diagnosis-name">{{ item.diagnosis }}</span>
              </div>
              <div class="suggestion-text">{{ item.suggestion }}</div>
              <div class="suggestion-footer">
                <el-icon color="#909399"><InfoFilled /></el-icon>
                <span class="confidence">置信度: {{ (item.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { 
  User, Clock, TrendCharts, Star, DataAnalysis, 
  DocumentChecked, InfoFilled 
} from '@element-plus/icons-vue'

// 概览统计数据
const overviewStats = reactive({
  completedCount: 43,
  totalCount: 43,
  avgTime: '4m21s',
  avgAccuracy: 87.1, // ✅ 修改为87.1%
  aiScore: 93,
})

// 图表相关
const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

// 诊断数据（根据要求生成）
// 目标：平均正确率87.1%，单胎活产40.8%
const diagnosisData = [
  { name: '瘢痕子宫N85.805', accuracy: 95.2 },
  { name: '梗阻性分娩O66.901', accuracy: 88.5 },
  { name: '孕39周O26.900x506', accuracy: 92.8 },
  { name: '孕2次O26.900x603', accuracy: 90.1 },
  { name: '产2次O26.900x703', accuracy: 89.7 },
  { name: '胎盘粘连伴出血O72.001', accuracy: 93.4 },
  { name: '妊娠合并羊水过少O41.001', accuracy: 91.6 },
  { name: '女性盆腔炎N73.901', accuracy: 87.3 },
  { name: '轻度贫血D64.906', accuracy: 94.8 },
  { name: '低钾血症E87.601', accuracy: 89.2 },
  { name: '真菌性阴道炎B37.304', accuracy: 90.4 },
  { name: '单胎活产Z37.000X001', accuracy: 40.8 }, // ✅ 新增，正确率40.8%
]

// 调整准确率以确保平均值为87.1%
const adjustAccuracies = () => {
  const targetAvg = 87.1 // 目标平均值
  
  // 计算除单胎活产外其他诊断的总和
  const otherDiagnoses = diagnosisData.filter(d => d.name !== '单胎活产Z37.000X001')
  const singleBirthIndex = diagnosisData.findIndex(d => d.name === '单胎活产Z37.000X001')
  
  // 单胎活产固定为40.8%
  const singleBirthAccuracy = 40.8
  
  // 计算其他诊断需要的总和
  // 公式：(其他诊断总和 + 40.8) / 总数 = 87.1
  // 其他诊断总和 = 87.1 * 总数 - 40.8
  const requiredSum = targetAvg * diagnosisData.length - singleBirthAccuracy
  
  // 计算当前其他诊断的总和
  const currentSum = otherDiagnoses.reduce((sum, d) => sum + d.accuracy, 0)
  
  // 计算需要调整的差值
  const diff = (requiredSum - currentSum) / otherDiagnoses.length
  
  // 微调每个其他诊断的值
  otherDiagnoses.forEach(d => {
    d.accuracy = Math.min(100, Math.max(0, d.accuracy + diff))
  })
  
  // 四舍五入到小数点后1位
  diagnosisData.forEach(d => {
    d.accuracy = Math.round(d.accuracy * 10) / 10
  })
  
  // 验证平均值
  const actualAvg = diagnosisData.reduce((sum, d) => sum + d.accuracy, 0) / diagnosisData.length
  console.log(`调整后平均值: ${actualAvg.toFixed(2)}% (目标: ${targetAvg}%)`)
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  adjustAccuracies()
  
  chartInstance = echarts.init(chartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>正确率: ${data.value}%`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: diagnosisData.map(d => d.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 11,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      min: 0, // ✅ 修改为0，确保所有数据都能显示
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
        },
      },
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        data: diagnosisData.map(d => ({
          value: d.accuracy,
          itemStyle: {
            // ✅ 使用经典蓝色渐变配色，统一风格
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#5470c6' },  // 顶部：深蓝色
              { offset: 1, color: '#91cc75' },  // 底部：浅绿色
            ]),
          },
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 11,
          color: '#333',
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 87.1,
              label: {
                formatter: '平均: 87.1%',
                position: 'end',
              },
              lineStyle: {
                color: '#f56c6c',
                type: 'dashed',
              },
            },
          ],
        },
      },
    ],
  }
  
  chartInstance.setOption(option)
}

// 修改建议数据
const suggestions = ref([
  {
    diagnosis: '瘢痕子宫N85.805',
    suggestion: '建议补充手术史详细描述，包括剖宫产次数、时间及术后恢复情况。当前病历中缺少关键的手术细节记录。',
    priority: 'high',
    confidence: 0.92,
  },
  {
    diagnosis: '梗阻性分娩O66.901',
    suggestion: '应详细记录胎位异常情况及产程进展受阻的具体表现，建议增加骨盆测量数据和胎儿估重信息。',
    priority: 'high',
    confidence: 0.88,
  },
  {
    diagnosis: '孕39周O26.900x506',
    suggestion: '孕周计算依据需要明确标注，建议补充末次月经日期及早期超声检查结果作为佐证。',
    priority: 'medium',
    confidence: 0.85,
  },
  {
    diagnosis: '胎盘粘连伴出血O72.001',
    suggestion: '产后出血量需要精确记录，建议补充出血时间、处理方式及输血情况。当前记录不够详细。',
    priority: 'high',
    confidence: 0.91,
  },
  {
    diagnosis: '妊娠合并羊水过少O41.001',
    suggestion: '羊水量测量方法需注明（AFI或最大羊水池深度），建议补充胎心监护结果及胎儿宫内状况评估。',
    priority: 'medium',
    confidence: 0.87,
  },
  {
    diagnosis: '低钾血症E87.601',
    suggestion: '血钾具体数值未记录，建议补充电解质检查完整结果及补钾治疗方案和复查情况。',
    priority: 'medium',
    confidence: 0.89,
  },
])

// 获取建议类型样式
const getSuggestionType = (priority: string) => {
  const types: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return types[priority] || 'info'
}

onMounted(() => {
  initChart()
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})
</script>

<style scoped lang="scss">
.quality-control-evaluation {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .overview-section {
    margin-bottom: 20px;
    
    .stat-card {
      border-radius: 8px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }
          
          .stat-label {
            font-size: 13px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }
  
  .detail-section {
    .chart-card,
    .suggestion-card {
      border-radius: 8px;
      height: 100%;
      
      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        
        .el-icon {
          font-size: 18px;
          color: #409eff;
        }
      }
    }
    
    .chart-card {
      .chart-container {
        width: 100%;
        height: 500px;
      }
    }
    
    .suggestion-card {
      .suggestion-content {
        .mb-4 {
          margin-bottom: 16px;
        }
        
        .suggestion-item {
          padding: 16px;
          margin-bottom: 12px;
          background: #f5f7fa;
          border-radius: 8px;
          border-left: 4px solid #409eff;
          transition: all 0.3s;
          
          &:hover {
            background: #ecf5ff;
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
          }
          
          .suggestion-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            
            .diagnosis-name {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
            }
          }
          
          .suggestion-text {
            font-size: 13px;
            color: #606266;
            line-height: 1.8;
            margin-bottom: 10px;
          }
          
          .suggestion-footer {
            display: flex;
            align-items: center;
            gap: 6px;
            
            .confidence {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .quality-control-evaluation {
    padding: 10px;
    
    .detail-section {
      .chart-card .chart-container {
        height: 400px;
      }
    }
  }
}
</style>
