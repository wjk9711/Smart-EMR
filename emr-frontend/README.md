# EMR Frontend

电子病历系统前端应用

## 技术栈

- Vue 3 + TypeScript
- Vite
- Element Plus UI
- Pinia状态管理
- Vue Router
- Tiptap编辑器

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 3. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── api/             # API接口定义
├── components/      # 公共组件
├── layouts/         # 布局组件
├── views/           # 页面视图
├── stores/          # Pinia状态管理
├── router/          # 路由配置
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── styles/          # 全局样式
├── App.vue          # 根组件
└── main.ts          # 应用入口
```

## 模块说明

### 门诊管理
- 患者列表管理
- 病历编辑(支持四种模式)
- 模板管理
- 打印与导出

### 住院管理 (待开发)
- 入院登记
- 病程记录
- 医嘱管理

### 病历质控 (待开发)
- 质控规则
- 自动检查
- 质控报告

### 护理记录 (待开发)
- 体温单
- 护理评估
- 护理记录

### 系统管理
- 用户管理
- 角色权限
- 科室管理

## 默认账户

- admin / admin123
- doctor1 / 123456

## 开发规范

- 使用TypeScript编写代码
- 组件采用 `<script setup>` 语法
- 遵循Vue 3组合式API最佳实践
- 使用Element Plus组件库
