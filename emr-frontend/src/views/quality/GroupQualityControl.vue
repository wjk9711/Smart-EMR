<template>
  <div class="group-quality-control">
    <el-card shadow="never" class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">小组质控</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/quality' }">病历质控</el-breadcrumb-item>
            <el-breadcrumb-item>小组质控</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </template>
    </el-card>

    <!-- 小组卡片网格 -->
    <el-row :gutter="20" class="group-grid">
      <el-col 
        v-for="group in groups" 
        :key="group.id"
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="6"
      >
        <el-card 
          shadow="hover" 
          class="group-card"
          @click="handleViewGroupReport(group)"
        >
          <div class="group-content">
            <div class="group-header">
              <div class="group-avatar" :style="{ background: group.color }">
                {{ group.name.charAt(0) }}
              </div>
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-members">{{ group.memberCount }}人</div>
              </div>
            </div>
            
            <div class="group-score-section">
              <div class="score-label">质控分数</div>
              <div class="score-value" :class="getScoreClass(group.score)">
                {{ group.score }}
              </div>
              <el-progress 
                :percentage="group.score" 
                :color="getProgressColor(group.score)"
                :stroke-width="8"
                :show-text="false"
              />
            </div>
            
            <div class="group-stats">
              <div class="stat-item">
                <div class="stat-label">完成数</div>
                <div class="stat-value">{{ group.completedCount }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">正确率</div>
                <div class="stat-value">{{ group.accuracy }}%</div>
              </div>
            </div>
            
            <div class="group-footer">
              <el-button type="primary" size="small" plain>
                查看报告
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 小组质控报告弹窗 -->
    <el-dialog 
      v-model="reportDialogVisible" 
      :title="currentGroup?.name + ' - 质控报告'"
      width="90%"
      top="5vh"
      class="report-dialog"
    >
      <div v-if="currentGroup" class="report-content">
        <el-row :gutter="20">
          <!-- 左侧：质控报告内容 -->
          <el-col :xs="24" :lg="14">
            <el-card shadow="never" class="report-card">
              <template #header>
                <div class="report-header">
                  <el-icon><Document /></el-icon>
                  <span>质控报告详情</span>
                </div>
              </template>
              
              <div class="report-content">
                <!-- 基本信息 -->
                <section class="report-section">
                  <h3 class="section-title">
                    <el-icon><InfoFilled /></el-icon>
                    基本信息
                  </h3>
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="小组名称">{{ currentGroup.name }}</el-descriptions-item>
                    <el-descriptions-item label="成员数量">{{ currentGroup.memberCount }}人</el-descriptions-item>
                    <el-descriptions-item label="质控周期">2024-01-01 至 2024-01-31</el-descriptions-item>
                    <el-descriptions-item label="质控状态">
                      <el-tag :type="currentGroup.score >= 90 ? 'success' : currentGroup.score >= 80 ? 'warning' : 'danger'">
                        {{ currentGroup.score >= 90 ? '优秀' : currentGroup.score >= 80 ? '良好' : '需改进' }}
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </section>

                <!-- 质控统计 -->
                <section class="report-section">
                  <h3 class="section-title">
                    <el-icon><DataAnalysis /></el-icon>
                    质控统计
                  </h3>
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <div class="stat-box">
                        <div class="stat-box-label">总病历数</div>
                        <div class="stat-box-value">{{ currentGroup.totalRecords }}</div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="stat-box">
                        <div class="stat-box-label">已完成</div>
                        <div class="stat-box-value success">{{ currentGroup.completedCount }}</div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="stat-box">
                        <div class="stat-box-label">待完善</div>
                        <div class="stat-box-value warning">{{ currentGroup.totalRecords - currentGroup.completedCount }}</div>
                      </div>
                    </el-col>
                  </el-row>
                  
                  <el-table :data="currentGroup.diagnosisStats" style="margin-top: 16px" size="small" border>
                    <el-table-column prop="diagnosis" label="诊断名称" min-width="180" />
                    <el-table-column prop="count" label="出现次数" width="100" align="center" />
                    <el-table-column prop="accuracy" label="编码正确率" width="120" align="center">
                      <template #default="{ row }">
                        <el-tag :type="row.accuracy >= 90 ? 'success' : row.accuracy >= 80 ? 'warning' : 'danger'">
                          {{ row.accuracy }}%
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="issues" label="问题数" width="100" align="center" />
                  </el-table>
                </section>

                <!-- 常见问题 -->
                <section class="report-section">
                  <h3 class="section-title">
                    <el-icon><Warning /></el-icon>
                    常见问题分析
                  </h3>
                  <el-timeline>
                    <el-timeline-item 
                      v-for="(issue, index) in currentGroup.commonIssues" 
                      :key="index"
                      :timestamp="issue.date"
                      placement="top"
                    >
                      <el-card shadow="never">
                        <h4>{{ issue.title }}</h4>
                        <p>{{ issue.description }}</p>
                        <div class="issue-meta">
                          <el-tag size="small" :type="issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'">
                            {{ issue.severity === 'high' ? '严重' : issue.severity === 'medium' ? '中等' : '轻微' }}
                          </el-tag>
                          <span class="frequency">出现频率: {{ issue.frequency }}次</span>
                        </div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </section>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：AI修改意见 -->
          <el-col :xs="24" :lg="10">
            <el-card shadow="never" class="ai-suggestion-card">
              <template #header>
                <div class="report-header">
                  <el-icon><Cpu /></el-icon>
                  <span>AI智能建议</span>
                  <el-tag type="success" effect="plain" size="small">基于深度学习</el-tag>
                </div>
              </template>
              
              <div class="ai-suggestions">
                <el-alert
                  title="以下建议由AI自动生成，仅供参考"
                  type="info"
                  :closable="false"
                  show-icon
                  class="mb-4"
                />

                <!-- 总体评价 -->
                <div class="suggestion-block">
                  <h4 class="block-title">
                    <el-icon><Star /></el-icon>
                    总体评价
                  </h4>
                  <div class="block-content">
                    <p>{{ currentGroup.aiEvaluation.overall }}</p>
                    <div class="score-breakdown">
                      <div class="score-item">
                        <span>诊断准确性</span>
                        <el-progress 
                          :percentage="currentGroup.aiEvaluation.scores.diagnosis" 
                          :color="getProgressColor(currentGroup.aiEvaluation.scores.diagnosis)"
                        />
                      </div>
                      <div class="score-item">
                        <span>编码规范性</span>
                        <el-progress 
                          :percentage="currentGroup.aiEvaluation.scores.coding" 
                          :color="getProgressColor(currentGroup.aiEvaluation.scores.coding)"
                        />
                      </div>
                      <div class="score-item">
                        <span>记录完整性</span>
                        <el-progress 
                          :percentage="currentGroup.aiEvaluation.scores.completeness" 
                          :color="getProgressColor(currentGroup.aiEvaluation.scores.completeness)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 改进建议 -->
                <div class="suggestion-block">
                  <h4 class="block-title">
                    <el-icon><EditPen /></el-icon>
                    改进建议
                  </h4>
                  <div class="block-content">
                    <el-collapse accordion>
                      <el-collapse-item 
                        v-for="(suggestion, index) in currentGroup.aiEvaluation.suggestions" 
                        :key="index"
                        :title="suggestion.title"
                      >
                        <div class="suggestion-detail">
                          <p class="suggestion-desc">{{ suggestion.description }}</p>
                          <div class="suggestion-actions">
                            <el-tag size="small" :type="getSuggestionType(suggestion.priority)">
                              {{ suggestion.priority === 'high' ? '优先处理' : suggestion.priority === 'medium' ? '建议处理' : '可选优化' }}
                            </el-tag>
                            <span class="impact">预期提升: +{{ suggestion.expectedImprovement }}分</span>
                          </div>
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </div>

                <!-- 学习资源推荐 -->
                <div class="suggestion-block">
                  <h4 class="block-title">
                    <el-icon><Reading /></el-icon>
                    学习资源推荐
                  </h4>
                  <div class="block-content">
                    <ul class="resource-list">
                      <li v-for="(resource, index) in currentGroup.aiEvaluation.resources" :key="index">
                        <el-link :href="resource.url" target="_blank" type="primary">
                          <el-icon><Link /></el-icon>
                          {{ resource.title }}
                        </el-link>
                        <span class="resource-type">{{ resource.type }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <template #footer>
        <el-button @click="reportDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportReport">导出报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowRight, Document, InfoFilled, DataAnalysis, Warning,
  Cpu, Star, EditPen, Reading, Link
} from '@element-plus/icons-vue'

// 小组数据
const groups = ref([
  {
    id: 1,
    name: '第一小组',
    memberCount: 7,
    score: 94.5,
    completedCount: 42,
    accuracy: 92.8,
    totalRecords: 45,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    diagnosisStats: [
      { diagnosis: '瘢痕子宫N85.805', count: 12, accuracy: 95.2, issues: 1 },
      { diagnosis: '梗阻性分娩O66.901', count: 8, accuracy: 88.5, issues: 2 },
      { diagnosis: '孕39周O26.900x506', count: 15, accuracy: 92.8, issues: 1 },
      { diagnosis: '胎盘粘连伴出血O72.001', count: 6, accuracy: 93.4, issues: 0 },
    ],
    commonIssues: [
      {
        date: '2024-01-28',
        title: '诊断编码填写不规范',
        description: '部分成员在填写ICD-10编码时未按照标准格式，导致系统识别困难。建议统一编码填写规范。',
        severity: 'high',
        frequency: 8,
      },
      {
        date: '2024-01-25',
        title: '现病史描述不够详细',
        description: '现病史部分缺少关键的时间节点和症状演变过程，影响诊断的准确性判断。',
        severity: 'medium',
        frequency: 12,
      },
      {
        date: '2024-01-20',
        title: '辅助检查结果缺失',
        description: '部分病历未完整记录实验室检查和影像学检查结果，需要补充完善。',
        severity: 'medium',
        frequency: 6,
      },
    ],
    aiEvaluation: {
      overall: '该小组整体表现优秀，病历书写质量较高，诊断编码准确率处于领先水平。但在细节把控上仍有提升空间，特别是在现病史描述的完整性和辅助检查结果的记录方面。',
      scores: {
        diagnosis: 94,
        coding: 92,
        completeness: 88,
      },
      suggestions: [
        {
          title: '加强现病史书写培训',
          description: '建议组织专项培训，重点讲解现病史书写的要点和规范，包括时间顺序、症状演变、诊疗经过等关键要素的记录方法。',
          priority: 'high',
          expectedImprovement: 3,
        },
        {
          title: '建立编码审核机制',
          description: '建议在提交前增加编码自查环节，可以使用系统提供的编码验证工具进行预检，减少编码错误率。',
          priority: 'high',
          expectedImprovement: 2,
        },
        {
          title: '完善辅助检查记录模板',
          description: '建议优化病历模板，将常用辅助检查项目设为必填项，确保检查结果的完整性。',
          priority: 'medium',
          expectedImprovement: 2,
        },
        {
          title: '开展病例讨论活动',
          description: '建议定期组织疑难病例讨论，通过集体学习提高全组的诊断思维和病历书写水平。',
          priority: 'low',
          expectedImprovement: 1,
        },
      ],
      resources: [
        {
          title: 'ICD-10编码规范手册（2024版）',
          type: '文档',
          url: '#',
        },
        {
          title: '病历书写质量标准解读',
          type: '视频课程',
          url: '#',
        },
        {
          title: '妇产科常见疾病诊断要点',
          type: '学习资料',
          url: '#',
        },
      ],
    },
  },
  {
    id: 2,
    name: '第二小组',
    memberCount: 8,
    score: 91.2,
    completedCount: 38,
    accuracy: 90.5,
    totalRecords: 42,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    diagnosisStats: [
      { diagnosis: '妊娠合并羊水过少O41.001', count: 10, accuracy: 91.6, issues: 1 },
      { diagnosis: '女性盆腔炎N73.901', count: 7, accuracy: 87.3, issues: 2 },
      { diagnosis: '轻度贫血D64.906', count: 14, accuracy: 94.8, issues: 0 },
    ],
    commonIssues: [
      {
        date: '2024-01-27',
        title: '诊断依据不充分',
        description: '部分诊断缺少必要的临床依据支持，如实验室检查结果或影像学证据。',
        severity: 'high',
        frequency: 5,
      },
    ],
    aiEvaluation: {
      overall: '第二小组表现良好，基本掌握了病历书写规范。主要问题在于诊断依据的充分性，需要加强对临床思维的训练。',
      scores: {
        diagnosis: 90,
        coding: 89,
        completeness: 92,
      },
      suggestions: [
        {
          title: '强化诊断依据训练',
          description: '每个诊断都应有相应的临床表现、检查结果作为支撑，避免主观臆断。',
          priority: 'high',
          expectedImprovement: 3,
        },
      ],
      resources: [
        {
          title: '临床诊断思维训练',
          type: '在线课程',
          url: '#',
        },
      ],
    },
  },
  {
    id: 3,
    name: '第三小组',
    memberCount: 6,
    score: 88.7,
    completedCount: 35,
    accuracy: 87.9,
    totalRecords: 40,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    diagnosisStats: [
      { diagnosis: '低钾血症E87.601', count: 9, accuracy: 89.2, issues: 1 },
      { diagnosis: '真菌性阴道炎B37.304', count: 11, accuracy: 90.4, issues: 1 },
    ],
    commonIssues: [],
    aiEvaluation: {
      overall: '第三小组有较大提升空间，需要在编码准确性和病历完整性方面加强训练。',
      scores: {
        diagnosis: 87,
        coding: 86,
        completeness: 90,
      },
      suggestions: [],
      resources: [],
    },
  },
  {
    id: 4,
    name: '第四小组',
    memberCount: 7,
    score: 92.8,
    completedCount: 40,
    accuracy: 91.5,
    totalRecords: 43,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    diagnosisStats: [],
    commonIssues: [],
    aiEvaluation: {
      overall: '第四小组表现稳定，各项指标均衡。',
      scores: {
        diagnosis: 92,
        coding: 91,
        completeness: 93,
      },
      suggestions: [],
      resources: [],
    },
  },
  {
    id: 5,
    name: '第五小组',
    memberCount: 8,
    score: 89.5,
    completedCount: 37,
    accuracy: 88.7,
    totalRecords: 41,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    diagnosisStats: [],
    commonIssues: [],
    aiEvaluation: {
      overall: '第五小组需要关注编码准确性的提升。',
      scores: {
        diagnosis: 88,
        coding: 87,
        completeness: 91,
      },
      suggestions: [],
      resources: [],
    },
  },
  {
    id: 6,
    name: '第六小组',
    memberCount: 7,
    score: 90.3,
    completedCount: 39,
    accuracy: 89.8,
    totalRecords: 42,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    diagnosisStats: [],
    commonIssues: [],
    aiEvaluation: {
      overall: '第六小组表现中规中矩，有进一步提升的空间。',
      scores: {
        diagnosis: 89,
        coding: 88,
        completeness: 92,
      },
      suggestions: [],
      resources: [],
    },
  },
])

// 弹窗相关
const reportDialogVisible = ref(false)
const currentGroup = ref<any>(null)

// 查看小组报告
const handleViewGroupReport = (group: any) => {
  currentGroup.value = group
  reportDialogVisible.value = true
}

// 获取分数样式类
const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  return 'average'
}

// 获取进度条颜色
const getProgressColor = (score: number) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取建议类型
const getSuggestionType = (priority: string) => {
  const types: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return types[priority] || 'info'
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
  
  .group-grid {
    .group-card {
      cursor: pointer;
      transition: all 0.3s;
      border-radius: 12px;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      }
      
      .group-content {
        .group-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          
          .group-avatar {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: 700;
            flex-shrink: 0;
          }
          
          .group-info {
            flex: 1;
            
            .group-name {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }
            
            .group-members {
              font-size: 13px;
              color: #909399;
            }
          }
        }
        
        .group-score-section {
          margin-bottom: 16px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 8px;
          
          .score-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
          }
          
          .score-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            
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
        
        .group-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          
          .stat-item {
            flex: 1;
            text-align: center;
            padding: 8px;
            background: #fafafa;
            border-radius: 6px;
            
            .stat-label {
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }
            
            .stat-value {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }
          }
        }
        
        .group-footer {
          text-align: center;
        }
      }
    }
  }
  
  .report-dialog {
    :deep(.el-dialog__body) {
      padding: 20px;
      max-height: 75vh;
      overflow-y: auto;
    }
    
    .report-access {
      .report-card,
      .ai-suggestion-card {
        border-radius: 8px;
        
        .report-header {
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
      
      .report-content {
        .report-section {
          margin-bottom: 24px;
          
          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e4e7ed;
            
            .el-icon {
              color: #409eff;
            }
          }
          
          .stat-box {
            text-align: center;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            color: white;
            
            .stat-box-label {
              font-size: 13px;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            
            .stat-box-value {
              font-size: 28px;
              font-weight: 700;
              
              &.success {
                background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
              }
              
              &.warning {
                background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
              }
            }
          }
          
          .issue-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
            
            .frequency {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
      
      .ai-suggestions {
        .mb-4 {
          margin-bottom: 16px;
        }
        
        .suggestion-block {
          margin-bottom: 24px;
          
          .block-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
            
            .el-icon {
              color: #409eff;
            }
          }
          
          .block-content {
            .score-breakdown {
              margin-top: 16px;
              
              .score-item {
                margin-bottom: 12px;
                
                span {
                  display: block;
                  font-size: 13px;
                  color: #606266;
                  margin-bottom: 6px;
                }
              }
            }
            
            .suggestion-detail {
              .suggestion-desc {
                font-size: 13px;
                color: #606266;
                line-height: 1.8;
                margin-bottom: 10px;
              }
              
              .suggestion-actions {
                display: flex;
                align-items: center;
                justify-content: space-between;
                
                .impact {
                  font-size: 12px;
                  color: #67c23a;
                  font-weight: 600;
                }
              }
            }
            
            .resource-list {
              list-style: none;
              padding: 0;
              margin: 0;
              
              li {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #ebeef5;
                
                &:last-child {
                  border-bottom: none;
                }
                
                .resource-type {
                  font-size: 12px;
                  color: #909399;
                  padding: 2px 8px;
                  background: #f4f4f5;
                  border-radius: 4px;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .group-quality-control {
    padding: 10px;
  }
}
</style>
