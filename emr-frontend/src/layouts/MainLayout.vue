<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>电子病历系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-sub-menu index="outpatient">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>门诊管理</span>
          </template>
          <el-menu-item index="/outpatient/patients">患者列表</el-menu-item>
          <el-menu-item index="/outpatient/records">病历列表</el-menu-item>
          <!-- <el-menu-item index="/outpatient/templates">模板管理</el-menu-item> -->
        </el-sub-menu>

        <el-sub-menu index="inpatient">
          <template #title>
            <el-icon><FirstAidKit /></el-icon>
            <span>住院管理</span>
          </template>
          <el-menu-item index="/inpatient/patients">患者列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="quality">
          <template #title>
            <el-icon><CircleCheck /></el-icon>
            <span>病历质控</span>
          </template>
          <el-menu-item index="/quality">质控检查</el-menu-item>
          <el-menu-item 
            v-if="userStore.userInfo?.roleType === 'teacher' || userStore.userInfo?.roleType === 'admin'"
            index="/quality/review"
          >
            住院病历审核
          </el-menu-item>
          <el-menu-item 
            v-if="userStore.userInfo?.roleType === 'teacher' || userStore.userInfo?.roleType === 'admin'"
            index="/quality/outpatient-review"
          >
            门诊病历审核
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="nursing">
          <template #title>
            <el-icon><User /></el-icon>
            <span>护理记录</span>
          </template>
          <el-menu-item index="/nursing">护理工作台</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system" v-if="userStore.userInfo?.roleType === 'admin'">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/users">用户管理</el-menu-item>
          <el-menu-item index="/system/roles">角色管理</el-menu-item>
          <el-menu-item index="/system/departments">科室管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.userInfo?.realName || '管理员' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Document,
  FirstAidKit,
  CircleCheck,
  User,
  Setting,
  ArrowDown,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title as string || '')

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
  } else if (command === 'profile') {
    // TODO: 跳转到个人信息页面
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow-y: auto;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3a4d;

    h2 {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }
  }

  :deep(.el-menu) {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-right {
    .user-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        color: #409eff;
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
