<template>
  <div class="department-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>科室管理</span>
          <el-button type="primary" @click="handleCreate">新建科室</el-button>
        </div>
      </template>

      <el-empty description="科室管理功能待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const handleCreate = () => {
  ElMessage.info('新建科室功能待实现')
}
</script>

<style scoped lang="scss">
.department-manage {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
