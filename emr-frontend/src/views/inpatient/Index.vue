<template>
  <div class="inpatient-index">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>住院管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleGoToPatients">住院患者</el-button>
            <el-button type="success" @click="handleGoToRecords">病案管理</el-button>
          </div>
        </div>
      </template>
      <el-empty description="住院管理模块">
        <template #image>
          <el-icon :size="100"><Document /></el-icon>
        </template>
        <div class="empty-actions">
          <el-button type="primary" @click="handleGoToPatients">住院患者列表</el-button>
          <el-button type="success" @click="handleGoToRecords">病案管理</el-button>
        </div>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'

const router = useRouter()

const handleGoToPatients = () => {
  router.push('/inpatient/patients')
}

const handleGoToRecords = () => {
  router.push('/inpatient/records')
}
</script>

<style scoped lang="scss">
.inpatient-index {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .empty-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
