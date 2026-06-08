<template>
  <div class="role-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleCreate">新建角色</el-button>
        </div>
      </template>

      <el-empty description="角色管理功能待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const handleCreate = () => {
  ElMessage.info('新建角色功能待实现')
}
</script>

<style scoped lang="scss">
.role-manage {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
