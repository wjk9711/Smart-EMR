# Windows Server 2025 部署架构图解

## 🏗️ 系统架构概览

```
┌─────────────────────────────────────────────────────────┐
│                  Windows Server 2025                     │
│                                                         │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │   浏览器      │      │   Web 服务器              │    │
│  │  (Client)    │◄────►│  IIS / Nginx (Port 80)   │    │
│  └──────────────┘      └──────────┬───────────────┘    │
│                                   │                     │
│                          ┌────────▼────────┐           │
│                          │  反向代理        │           │
│                          │  /api → :3000   │           │
│                          └────────┬────────┘           │
│                                   │                     │
│  ┌──────────────┐      ┌──────────▼───────────┐       │
│  │   MySQL      │◄────►│  Node.js 后端         │       │
│  │  (Port 3306) │      │  Express (Port 3000)  │       │
│  └──────────────┘      └──────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 组件详解

### 1. 前端 (Vue 3 + Vite)

```
位置: C:\emr-system\emr-frontend\dist

文件结构:
dist/
├── index.html          # 入口 HTML
├── assets/             # 静态资源
│   ├── js/            # JavaScript 文件
│   ├── css/           # CSS 样式文件
│   └── images/        # 图片资源
└── web.config         # IIS 配置（如使用 IIS）

访问方式:
- 直接访问: http://localhost
- 通过 Web 服务器提供静态文件
```

### 2. 后端 (Node.js + Express)

```
位置: C:\emr-system\emr-backend

核心文件:
emr-backend/
├── dist/               # 编译后的代码
│   └── app.js         # 主应用文件
├── src/                # TypeScript 源代码
├── .env                # 环境变量配置
├── package.json        # 依赖配置
└── uploads/            # 文件上传目录

启动命令:
node dist/app.js

监听地址:
- 开发: http://localhost:3000
- 生产: http://0.0.0.0:3000
```

### 3. 数据库 (MySQL)

```
服务名: MySQL80 (Windows 服务)

数据库: emr_system

主要表:
- users              # 用户账户
- patients           # 患者信息
- inpatient_records  # 住院记录
- outpatient_records # 门诊记录
- templates          # 病历模板
- visits             # 就诊记录

连接配置 (.env):
DB_HOST=localhost
DB_PORT=3306
DB_NAME=emr_system
DB_USER=root
DB_PASSWORD=your_password
```

### 4. Web 服务器

#### 选项 A: IIS

```
特点:
✓ Windows 内置
✓ 图形化管理界面
✓ 与 Windows 集成好
✓ 支持 URL Rewrite

配置位置:
- 网站配置: IIS 管理器
- web.config: C:\emr-system\emr-frontend\dist\web.config

端口: 80 (HTTP), 443 (HTTPS)
```

#### 选项 B: Nginx

```
特点:
✓ 高性能
✓ 配置灵活
✓ 资源占用少
✓ 跨平台

配置位置:
- 主配置: C:\nginx\conf\nginx.conf
- 日志: C:\nginx\logs\

端口: 80 (HTTP), 443 (HTTPS)

管理命令:
C:\nginx\nginx.exe          # 启动
C:\nginx\nginx.exe -s reload # 重载
C:\nginx\nginx.exe -s stop   # 停止
```

---

## 🔄 请求流程

### 用户访问流程

```
1. 用户在浏览器输入: http://your-server-ip

2. 请求到达 Web 服务器 (IIS/Nginx)
   ↓

3. Web 服务器返回前端静态文件 (index.html, JS, CSS)
   ↓

4. 浏览器渲染页面，显示登录界面
   ↓

5. 用户输入账号密码，点击登录
   ↓

6. 前端发送 POST 请求到: /api/auth/login
   ↓

7. Web 服务器通过反向代理转发到: http://localhost:3000/api/auth/login
   ↓

8. Node.js 后端处理请求
   ├─ 验证用户名密码
   ├─ 查询数据库
   ├─ 生成 JWT Token
   └─ 返回响应
   ↓

9. 响应返回给浏览器
   ↓

10. 前端保存 Token，跳转到首页
```

### API 调用流程

```
前端 Vue App
    ↓ (axios 请求)
Web 服务器 (IIS/Nginx)
    ↓ (反向代理)
Node.js Express Server (:3000)
    ↓ (Sequelize ORM)
MySQL Database (:3306)
    ↓
返回数据
    ↓
JSON 响应
    ↓
前端更新 UI
```

---

## 🔧 配置文件关系

```
项目根目录 (C:\emr-system)
│
├── emr-backend/
│   ├── .env                    # 后端环境变量
│   │   ├── PORT=3000          # 后端端口
│   │   ├── DB_HOST=localhost  # 数据库主机
│   │   ├── DB_PASSWORD=xxx    # 数据库密码
│   │   └── JWT_SECRET=xxx     # JWT 密钥
│   │
│   └── dist/app.js             # 后端主程序
│
├── emr-frontend/
│   ├── .env.production         # 前端生产环境配置
│   │   └── VITE_API_BASE_URL=/api
│   │
│   └── dist/                   # 构建输出
│       ├── index.html
│       └── web.config          # IIS 配置（可选）
│
└── Web 服务器配置
    ├── IIS: web.config
    └── Nginx: C:\nginx\conf\nginx.conf
```

---

## 🌐 网络拓扑

### 本地部署（单机）

```
┌─────────────────────────────────────┐
│      Windows Server 2025            │
│                                     │
│  Browser ◄──► IIS/Nginx :80        │
│                      │              │
│                      ▼              │
│                 Node.js :3000       │
│                      │              │
│                      ▼              │
│                  MySQL :3306        │
│                                     │
└─────────────────────────────────────┘

所有组件在同一台服务器上
```

### 分离部署（多机）

```
┌──────────────┐         ┌──────────────┐
│  Client PC   │         │ Web Server   │
│              │ HTTP    │ (IIS/Nginx)  │
│  Browser     │────────►│  Port 80     │
└──────────────┘         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │ App Server   │
                         │ Node.js      │
                         │ Port 3000    │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │ DB Server    │
                         │ MySQL        │
                         │ Port 3306    │
                         └──────────────┘

各组件可以分布在不同的服务器上
```

---

## 💾 数据存储

### 文件系统

```
C:\emr-system\
├── emr-backend\
│   ├── uploads\              # 用户上传的文件
│   │   ├── signatures\       # 电子签名
│   │   └── attachments\      # 附件
│   └── logs\                 # 应用日志
│
├── emr-frontend\
│   └── dist\                 # 静态文件
│
└── backup\                   # 备份目录
    ├── database\             # 数据库备份
    └── files\                # 文件备份
```

### 数据库存储

```
MySQL 数据目录 (默认):
C:\ProgramData\MySQL\MySQL Server 8.0\Data\

包含:
- emr_system/          # 数据库文件夹
  ├── users.ibd        # 用户表数据
  ├── patients.ibd     # 患者表数据
  └── ...              # 其他表
```

---

## 🔐 安全层级

```
外部访问
    ↓
┌─────────────────────┐
│  防火墙规则          │  ← 第一层：网络层安全
│  - 开放 80/443      │
│  - 限制 3000/3306   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Web 服务器          │  ← 第二层：应用层安全
│  - HTTPS/TLS        │
│  - 请求过滤          │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Node.js 后端        │  ← 第三层：业务层安全
│  - JWT 认证         │
│  - 输入验证          │
│  - SQL 注入防护      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  MySQL 数据库        │  ← 第四层：数据层安全
│  - 用户权限          │
│  - 数据加密          │
│  - 备份恢复          │
└─────────────────────┘
```

---

## 📊 进程管理

### 使用 NSSM（推荐）

```
Windows Service Manager
    ↓
NSSM (Non-Sucking Service Manager)
    ↓
Node.js Process (EMR-Backend)
    ├─ PID: 12345
    ├─ CPU: 5%
    ├─ Memory: 150MB
    └─ Uptime: 24h

管理命令:
nssm.exe start EMR-Backend    # 启动
nssm.exe stop EMR-Backend     # 停止
nssm.exe restart EMR-Backend  # 重启
nssm.exe status EMR-Backend   # 状态
```

### 使用任务计划程序

```
Task Scheduler
    ↓
Trigger: System Startup
    ↓
Action: Start Program
    ├─ Program: node.exe
    ├─ Arguments: dist\app.js
    └─ Directory: C:\emr-system\emr-backend
```

---

## 🔄 更新流程

### 代码更新

```
1. Git Pull
   cd C:\emr-system
   git pull origin main
   
2. 重新构建后端
   cd emr-backend
   npm install
   npm run build
   
3. 重新构建前端
   cd ..\emr-frontend
   npm install
   npm run build
   
4. 重启服务
   nssm.exe restart EMR-Backend
   
5. 清除浏览器缓存
   Ctrl + F5 (强制刷新)
```

### 数据库更新

```
1. 备份数据库
   mysqldump -u root -p emr_system > backup.sql
   
2. 运行迁移
   cd emr-backend
   npm run db:migrate
   
3. 验证数据
   mysql -u root -p emr_system -e "SHOW TABLES;"
```

---

## 🎯 性能关键点

```
用户请求
    ↓
[CDN] → 缓存静态资源（可选）
    ↓
[IIS/Nginx] → 快速提供静态文件
    ↓
[反向代理] → 最小化代理开销
    ↓
[Node.js] → 异步非阻塞处理
    ↓
[连接池] → 复用数据库连接
    ↓
[MySQL] → 索引优化查询
    ↓
[缓存] → Redis/Memory Cache（可选）
```

---

## 📝 监控要点

### 系统层面
- CPU 使用率
- 内存使用量
- 磁盘空间
- 网络带宽

### 应用层面
- Node.js 进程状态
- 响应时间
- 错误率
- 并发连接数

### 数据库层面
- 查询性能
- 连接数
- 锁等待
- 慢查询日志

---

**提示**: 将此图保存在项目文档中，方便理解系统架构！
