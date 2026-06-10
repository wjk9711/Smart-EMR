<template>
  <div class="quality-report-list">
    <el-card shadow="never" class="page-header">
      <template #header>
        <div class="card-header">
          <span class="title">质控报告</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/quality' }">病历质控</el-breadcrumb-item>
            <el-breadcrumb-item>质控报告</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </template>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar">
      <el-button type="primary" size="large" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建报告
      </el-button>
      <el-button 
        type="danger" 
        size="large" 
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedIds.length }})
      </el-button>
    </el-card>

    <!-- 报告列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="reports"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="reportName" label="报告名称" min-width="250">
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row)">
              {{ row.reportName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="reportKey" label="报告关键值" width="180" align="center">
          <template #default="{ row }">
            <el-tag>{{ row.reportKey }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="上次保存时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑器弹窗 -->
    <el-dialog
      v-model="editorVisible"
      :title="isEdit ? '编辑报告' : '新建报告'"
      width="90%"
      top="5vh"
      class="editor-dialog"
      :close-on-click-modal="false"
    >
      <div class="editor-container">
        <!-- 报告名称输入 -->
        <div class="report-name-input">
          <el-input
            v-model="currentReport.reportName"
            placeholder="请输入报告名称"
            size="large"
            clearable
          >
            <template #prepend>报告名称</template>
          </el-input>
        </div>

        <!-- Word编辑器 -->
        <div class="editor-wrapper">
          <div ref="editorRef" class="editor"></div>
        </div>
      </div>

      <template #footer>
        <el-button size="large" @click="editorVisible = false">取消</el-button>
        <el-button type="primary" size="large" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon>
          保存为Word文档
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, Check } from '@element-plus/icons-vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import {
  getQualityReports,
  createQualityReport,
  updateQualityReport,
  deleteQualityReport,
  batchDeleteQualityReports,
  getQualityReportDetail,
  type QualityReport,
} from '@/api/qualityReport'
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

// 数据
const loading = ref(false)
const reports = ref<QualityReport[]>([])
const selectedIds = ref<number[]>([])

// 编辑器相关
const editorVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const editorRef = ref<HTMLElement | null>(null)
let quillEditor: any = null

const currentReport = ref<Partial<QualityReport>>({
  reportName: '',
})

// 获取报告列表
const fetchReports = async () => {
  loading.value = true
  try {
    console.log('开始获取报告列表...')
    const reportData = await getQualityReports()
    console.log('获取到的报告数据:', reportData)
    // 注意：响应拦截器已经返回了res.data，所以这里直接使用
    reports.value = Array.isArray(reportData) ? reportData : []
    console.log('报告列表已更新，数量:', reports.value.length)
  } catch (error: any) {
    console.error('获取报告列表失败:', error)
    ElMessage.error(error.message || '获取报告列表失败')
  } finally {
    loading.value = false
  }
}

// 新建报告
const handleCreate = () => {
  isEdit.value = false
  currentReport.value = {
    reportName: '',
  }
  editorVisible.value = true
  
  // 初始化编辑器
  nextTick(() => {
    initEditor()
  })
}

// 编辑报告
const handleEdit = async (row: QualityReport) => {
  isEdit.value = true
  currentReport.value = { ...row }
  editorVisible.value = true
  
  // 加载报告详情
  try {
    const res = await getQualityReportDetail(row.id)
    const detail = res.data
    
    // 初始化编辑器并加载内容
    nextTick(() => {
      initEditor()
      if (detail.content && quillEditor) {
        quillEditor.root.innerHTML = atob(detail.content)
      }
    })
  } catch (error: any) {
    ElMessage.error(error.message || '加载报告失败')
  }
}

// 初始化Quill编辑器
const initEditor = () => {
  if (!editorRef.value) return
  
  // 销毁旧编辑器
  if (quillEditor) {
    quillEditor = null
  }
  
  quillEditor = new Quill(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    },
    placeholder: '请输入报告内容...'
  })
}

// 保存报告
const handleSave = async () => {
  if (!currentReport.value.reportName) {
    ElMessage.warning('请输入报告名称')
    return
  }

  saving.value = true
  try {
    // 获取编辑器内容
    const htmlContent = quillEditor.root.innerHTML
    
    // 将HTML转换为Word文档
    const doc = convertHtmlToDocx(htmlContent)
    
    // 生成Word文档Blob
    const blob = await Packer.toBlob(doc)
    
    // 转换为base64用于传输
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    
    // 使用Promise包装FileReader
    const base64Content = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string
        const content = result.split(',')[1] // 去掉data:application/...;base64,前缀
        resolve(content)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
    })
    
    if (isEdit.value && currentReport.value.id) {
      // 更新现有报告
      console.log('更新报告 ID:', currentReport.value.id)
      await updateQualityReport(currentReport.value.id, {
        reportName: currentReport.value.reportName,
        content: base64Content,
      })
      console.log('更新成功')
      ElMessage.success('保存成功')
    } else {
      // 创建新报告
      console.log('创建新报告，名称:', currentReport.value.reportName)
      const result = await createQualityReport({
        reportName: currentReport.value.reportName!,
      })
      console.log('创建成功，返回数据:', result)
      ElMessage.success('创建成功')
    }
    
    // 关闭编辑器
    editorVisible.value = false
    
    // 刷新列表
    console.log('开始刷新列表...')
    await fetchReports()
    console.log('列表刷新完成')
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// HTML转DOCX（简化版）
const convertHtmlToDocx = (html: string): DocxDocument => {
  // 这是一个简化的实现
  // 实际项目中应该使用更完善的HTML到DOCX转换库
  
  // 提取纯文本内容（简单实现）
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const text = tempDiv.innerText || tempDiv.textContent || ''
  
  // 按行分割
  const lines = text.split('\n').filter(line => line.trim())
  
  // 创建段落
  const paragraphs = lines.map(line => 
    new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 24, // 12pt
        }),
      ],
    })
  )
  
  return new DocxDocument({
    sections: [{
      properties: {},
      children: paragraphs.length > 0 ? paragraphs : [
        new Paragraph({
          children: [
            new TextRun({
              text: currentReport.value.reportName || '质控报告',
              size: 32,
              bold: true,
            }),
          ],
        }),
      ],
    }],
  })
}

// 删除单个报告
const handleDelete = async (row: QualityReport) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告"${row.reportName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteQualityReport(row.id)
    ElMessage.success('删除成功')
    fetchReports()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的报告')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedIds.value.length}个报告吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await batchDeleteQualityReports(selectedIds.value)
    ElMessage.success(`成功删除${selectedIds.value.length}个报告`)
    selectedIds.value = []
    fetchReports()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: QualityReport[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 初始化
onMounted(() => {
  fetchReports()
})
</script>

<style scoped lang="scss">
.quality-report-list {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 24px;
        font-weight: 700;
        color: #303133;
      }
    }
  }
  
  .toolbar {
    margin-bottom: 20px;
    
    .el-button {
      margin-right: 10px;
    }
  }
  
  .table-card {
    :deep(.el-table) {
      font-size: 16px;
    }
  }
}

.editor-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .editor-container {
    .report-name-input {
      margin-bottom: 20px;
    }
    
    .editor-wrapper {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      
      .editor {
        height: 500px;
        
        :deep(.ql-toolbar) {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #dcdfe6;
        }
        
        :deep(.ql-container) {
          border: none;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
