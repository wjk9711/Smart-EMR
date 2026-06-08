<template>
  <div class="template-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>模板管理</span>
          <el-button type="primary" @click="handleCreate">新建模板</el-button>
        </div>
      </template>

      <el-table :data="templates" v-loading="loading">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="isPublic" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublic ? 'success' : 'info'">
              {{ row.isPublic ? '公共' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usageCount" label="使用次数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTemplates } from '@/api/outpatient'
import type { Template } from '@/types/record'

const loading = ref(false)
const templates = ref<Template[]>([])

const fetchTemplates = async () => {
  loading.value = true
  try {
    templates.value = await getTemplates()
  } catch (error) {
    console.error('Failed to fetch templates:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  ElMessage.info('新建模板功能待实现')
}

const handleEdit = (row: Template) => {
  ElMessage.info('编辑模板功能待实现')
}

const handleDelete = (row: Template) => {
  ElMessage.info('删除模板功能待实现')
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped lang="scss">
.template-manage {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
