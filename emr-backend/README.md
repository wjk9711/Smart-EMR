# EMR Backend

电子病历系统后端服务

## 技术栈

- Node.js + Express
- TypeScript
- MySQL + Sequelize ORM
- JWT认证

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置:

```bash
cp .env.example .env
```

编辑 `.env` 文件,设置数据库连接信息:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=emr_system
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

### 3. 初始化数据库

```bash
npm run db:migrate
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

## API文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取当前用户信息

### 患者管理

- `GET /api/patients` - 获取患者列表
- `GET /api/patients/:id` - 获取患者详情
- `POST /api/patients` - 创建患者
- `PUT /api/patients/:id` - 更新患者
- `GET /api/patients/:patientId/visits` - 获取就诊记录
- `POST /api/visits` - 创建就诊记录

### 门诊病历

- `GET /api/outpatient/records` - 获取病历列表
- `GET /api/outpatient/records/:id` - 获取病历详情
- `POST /api/outpatient/records` - 创建病历
- `PUT /api/outpatient/records/:id` - 更新病历
- `DELETE /api/outpatient/records/:id` - 删除病历
- `POST /api/outpatient/records/:id/complete` - 完成病历

### 模板管理

- `GET /api/templates` - 获取模板列表
- `GET /api/templates/:id` - 获取模板详情
- `POST /api/templates` - 创建模板
- `PUT /api/templates/:id` - 更新模板
- `DELETE /api/templates/:id` - 删除模板

## 默认账户

种子数据创建的默认账户:

- 管理员: admin / admin123
- 医生: doctor1 / 123456

## 项目结构

```
src/
├── config/          # 配置文件
├── controllers/     # 控制器
├── models/          # 数据模型
├── routes/          # 路由定义
├── middleware/      # 中间件
├── services/        # 业务逻辑层
├── utils/           # 工具函数
├── database/        # 数据库脚本
└── app.ts           # 应用入口
```

## 开发说明

- 所有API响应格式: `{ code: number, data?: any, message?: string }`
- 需要认证的接口需在请求头携带: `Authorization: Bearer <token>`
- 日期格式统一使用: `YYYY-MM-DD`
