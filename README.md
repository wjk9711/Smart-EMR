# 电子病历系统 (EMR System)

一个完整的电子病历管理系统，包含门诊、住院、质控、护理和后台管理五大模块。

## 🚀 快速开始

### Windows Server 2025 部署（新增）

项目现已支持在 Windows Server 2025 数据中心版上部署：

```powershell
# 以管理员身份运行 PowerShell
cd C:\emr-system
.\deploy-windows-server.ps1
```

详细文档请查看：
- 📖 [Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md) - 完整部署说明
- 📖 [Windows部署快速参考.md](./Windows部署快速参考.md) - 常用命令速查

### Linux 自动化部署（推荐）

项目已提供完整的一键部署和更新脚本：

```bash
# 首次部署（服务器端）
ssh root@your-server-ip
chmod +x auto-update.sh
sudo bash auto-update.sh

# 日常更新
bash quick-update.sh
```

详细文档请查看：
- 📖 [QUICK_START.md](./QUICK_START.md) - 30秒快速开始
- 📖 [自动化部署指南.md](./自动化部署指南.md) - 完整部署说明
- 📖 [404错误快速修复.md](./404错误快速修复.md) - 常见问题解决

### 手动启动（开发环境）

详见 [GETTING_STARTED.md](./GETTING_STARTED.md)

## 项目概述

本系统采用前后端分离架构设计,首期重点实现门诊电子病历管理系统,其他模块已预留接口和框架。

### 核心功能

✅ **门诊电子病历管理**
- 患者信息管理
- 病历创建/编辑/查询
- 富文本编辑器(支持结构化字段)
- 病历模板管理
- 打印与导出(PDF/HTML/JSON)
- 电子签名

🚧 **住院管理** (框架已搭建)
- 入院登记
- 病程记录
- 医嘱管理
- 出院小结

🚧 **病历质控** (框架已搭建)
- 质控规则配置
- 自动质控检查
- 质控报告生成

🚧 **护理记录** (框架已搭建)
- 体温单(三测单)
- 护理评估
- 护理记录

✅ **后台管理**
- 用户管理
- 角色权限管理
- 科室管理

## 技术架构

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **富文本编辑器**: Tiptap
- **数据可视化**: ECharts

### 后端
- **运行时**: Node.js
- **框架**: Express
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **ORM**: Sequelize
- **认证**: JWT

## 项目结构

```
EMR/
├── emr-frontend/          # 前端项目
│   ├── src/
│   │   ├── api/          # API接口
│   │   ├── components/   # 公共组件
│   │   ├── layouts/      # 布局组件
│   │   ├── views/        # 页面视图
│   │   ├── stores/       # 状态管理
│   │   ├── router/       # 路由配置
│   │   ├── types/        # 类型定义
│   │   └── utils/        # 工具函数
│   ├── package.json
│   └── README.md
│
├── emr-backend/           # 后端项目
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   ├── services/     # 业务逻辑
│   │   ├── utils/        # 工具函数
│   │   └── database/     # 数据库脚本
│   ├── package.json
│   └── README.md
│
└── README.md              # 项目总览
```

## 快速开始

### 前置要求

- Node.js >= 18.x
- MySQL >= 8.0
- npm 或 yarn

### 后端启动

```bash
# 进入后端目录
cd emr-backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件,设置数据库连接信息

# 初始化数据库
npm run db:migrate
npm run db:seed

# 启动开发服务器
npm run dev
```

后端服务将在 `http://localhost:3000` 启动

### 前端启动

```bash
# 进入前端目录
cd emr-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

### 默认账户

系统初始化后提供以下测试账户:

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| doctor1 | 123456 | 医生 |

## API文档

后端API遵循RESTful规范,所有接口返回格式:

```json
{
  "code": 200,
  "data": {},
  "message": "操作成功"
}
```

需要认证的接口需在请求头携带:
```
Authorization: Bearer <token>
```

### 主要接口

**认证**
- POST `/api/auth/login` - 登录
- POST `/api/auth/logout` - 登出
- GET `/api/auth/profile` - 获取用户信息

**患者管理**
- GET `/api/patients` - 患者列表
- POST `/api/patients` - 创建患者
- GET `/api/patients/:id` - 患者详情
- PUT `/api/patients/:id` - 更新患者

**门诊病历**
- GET `/api/outpatient/records` - 病历列表
- POST `/api/outpatient/records` - 创建病历
- GET `/api/outpatient/records/:id` - 病历详情
- PUT `/api/outpatient/records/:id` - 更新病历

详细API文档见后端README

## 数据库设计

### 核心表

- `users` - 用户表
- `patients` - 患者表
- `visits` - 就诊记录表
- `outpatient_records` - 门诊病历表
- `templates` - 病历模板表

完整数据库设计见计划文档

## 开发进度

### 第一阶段: 基础框架 ✅
- [x] 前端项目初始化
- [x] 后端项目初始化
- [x] 数据库设计与迁移
- [x] JWT认证机制
- [x] 用户登录/登出
- [x] 基础布局组件

### 第二阶段: 门诊核心功能 🚧
- [x] 患者管理模块
- [x] 病历编辑器基础版
- [x] 病历CRUD接口
- [ ] 修订留痕功能
- [ ] 打印优化

### 第三阶段: 高级功能 ⏳
- [ ] 模板管理系统完善
- [ ] 电子签名功能
- [ ] PDF/JSON导出
- [ ] 知识库集成

### 第四阶段: 其他模块框架 ⏳
- [ ] 住院模块路由和空页面
- [ ] 质控模块路由和空页面
- [ ] 护理模块路由和空页面
- [ ] 后台管理系统完善

## 注意事项

1. **环境配置**: 首次运行前务必配置好 `.env` 文件
2. **数据库**: 确保MySQL服务正常运行
3. **安全性**: 生产环境请修改JWT_SECRET和默认密码
4. **浏览器兼容**: 推荐使用Chrome 90+或Edge 90+

## 后续规划

- AI辅助书写(语音识别、智能生成)
- 体温单模块(ECharts绘制)
- 移动端适配
- 医保系统对接
- 数据分析与统计

## 许可证

本项目仅供学习和参考使用

## 联系方式

如有问题,请提交Issue
