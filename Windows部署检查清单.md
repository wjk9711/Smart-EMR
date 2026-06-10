# Windows Server 2025 部署检查清单

## 📋 部署前准备

### 系统环境检查

- [ ] Windows Server 2025 数据中心版已安装
- [ ] 系统已更新到最新版本
- [ ] 服务器有足够的资源（至少 4GB RAM，20GB 磁盘空间）
- [ ] 网络连接正常
- [ ] 防火墙配置权限（需要管理员权限）

### 软件安装检查

- [ ] Node.js 18.x 或更高版本已安装
  ```powershell
  node --version
  npm --version
  ```

- [ ] MySQL 8.0 或更高版本已安装并运行
  ```powershell
  Get-Service MySQL80
  mysql --version
  ```

- [ ] Git 已安装（可选，用于代码更新）
  ```powershell
  git --version
  ```

- [ ] PowerShell 执行策略允许运行脚本
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## 🚀 部署步骤检查

### 第一步：获取项目代码

- [ ] 创建项目目录 `C:\emr-system`
- [ ] 克隆或上传项目文件
  ```powershell
  git clone https://github.com/wjk9711/Smart-EMR.git C:\emr-system
  ```
- [ ] 验证文件完整性

### 第二步：配置后端

- [ ] 进入后端目录
  ```powershell
  cd C:\emr-system\emr-backend
  ```

- [ ] 安装依赖
  ```powershell
  npm install
  ```

- [ ] 创建并配置 `.env` 文件
  ```powershell
  copy .env.example .env
  notepad .env
  ```
  
  配置项检查：
  - [ ] `PORT=3000`
  - [ ] `NODE_ENV=production`
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=3306`
  - [ ] `DB_NAME=emr_system`
  - [ ] `DB_USER=root`
  - [ ] `DB_PASSWORD=` (填写正确的 MySQL 密码)
  - [ ] `JWT_SECRET=` (设置强密钥)

- [ ] 构建后端代码
  ```powershell
  npm run build
  ```

### 第三步：初始化数据库

- [ ] 创建数据库
  ```sql
  CREATE DATABASE emr_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

- [ ] 运行数据库迁移
  ```powershell
  npm run db:migrate
  ```

- [ ] 填充初始数据
  ```powershell
  npm run db:seed
  ```

- [ ] 验证数据库表已创建
  ```sql
  USE emr_system;
  SHOW TABLES;
  ```

### 第四步：配置前端

- [ ] 进入前端目录
  ```powershell
  cd C:\emr-system\emr-frontend
  ```

- [ ] 安装依赖
  ```powershell
  npm install
  ```

- [ ] 配置 `.env.production`
  ```env
  VITE_API_BASE_URL=/api
  ```

- [ ] 构建前端
  ```powershell
  npm run build
  ```

- [ ] 验证 dist 目录已生成
  ```powershell
  dir dist
  ```

### 第五步：配置 Web 服务器

#### 选项 A：IIS（推荐）

- [ ] 安装 IIS
  ```powershell
  Install-WindowsFeature -Name Web-Server -IncludeManagementTools
  ```

- [ ] 安装 URL Rewrite 模块
  - [ ] 下载：https://www.iis.net/downloads/microsoft/url-rewrite
  - [ ] 安装完成

- [ ] 创建网站
  - [ ] 打开 IIS 管理器
  - [ ] 添加网站
  - [ ] 名称：EMR System
  - [ ] 物理路径：`C:\emr-system\emr-frontend\dist`
  - [ ] 端口：80

- [ ] 配置 web.config
  - [ ] 在 dist 目录创建 web.config
  - [ ] 配置 API 反向代理规则
  - [ ] 配置 Vue Router 支持

- [ ] 启动网站
  - [ ] 在 IIS 中启动网站
  - [ ] 测试访问 http://localhost

#### 选项 B：Nginx

- [ ] 下载 Nginx for Windows
  - [ ] 从 http://nginx.org/en/docs/windows.html 下载
  - [ ] 解压到 `C:\nginx`

- [ ] 配置 nginx.conf
  - [ ] 配置前端静态文件路径
  - [ ] 配置 API 反向代理
  - [ ] 保存配置

- [ ] 启动 Nginx
  ```powershell
  C:\nginx\nginx.exe
  ```

- [ ] 测试访问 http://localhost

### 第六步：启动后端服务

#### 选项 A：直接运行（测试用）

- [ ] 启动后端
  ```powershell
  cd C:\emr-system\emr-backend
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "node dist\app.js"
  ```

- [ ] 验证服务运行
  ```powershell
  curl http://localhost:3000/health
  ```

#### 选项 B：使用 NSSM（生产推荐）

- [ ] 下载 NSSM
  - [ ] 从 https://nssm.cc/release/nssm-2.24.zip 下载
  - [ ] 解压到 `C:\nssm-2.24`

- [ ] 安装服务
  ```powershell
  cd C:\nssm-2.24\win64
  nssm.exe install EMR-Backend
  ```
  
  配置：
  - Application: `C:\Program Files\nodejs\node.exe`
  - AppDirectory: `C:\emr-system\emr-backend`
  - AppParameters: `C:\emr-system\emr-backend\dist\app.js`

- [ ] 启动服务
  ```powershell
  nssm.exe start EMR-Backend
  ```

- [ ] 验证服务运行
  ```powershell
  nssm.exe status EMR-Backend
  curl http://localhost:3000/health
  ```

### 第七步：配置防火墙

- [ ] 开放 HTTP 端口 (80)
  ```powershell
  New-NetFirewallRule -DisplayName "EMR HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
  ```

- [ ] 开放后端端口 (3000) - 仅本地访问
  ```powershell
  New-NetFirewallRule -DisplayName "EMR Backend Local" -Direction Inbound -Protocol TCP -LocalPort 3000 -RemoteAddress 127.0.0.1 -Action Allow
  ```

- [ ] 如需远程访问，开放后端端口
  ```powershell
  New-NetFirewallRule -DisplayName "EMR Backend Remote" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
  ```

- [ ] 阿里云安全组配置（如适用）
  - [ ] 登录阿里云控制台
  - [ ] 添加入方向规则：TCP 80
  - [ ] 添加入方向规则：TCP 3000（如需要）

---

## ✅ 部署验证

### 基础功能测试

- [ ] 后端健康检查
  ```powershell
  curl http://localhost:3000/health
  # 应返回: {"status":"ok","timestamp":"..."}
  ```

- [ ] 前端页面访问
  - [ ] 浏览器访问 http://localhost
  - [ ] 页面正常加载
  - [ ] 无控制台错误

- [ ] 登录功能测试
  ```powershell
  curl -X POST http://localhost:3000/api/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
  ```
  - [ ] 返回 token
  - [ ] 无错误信息

- [ ] 完整登录流程
  - [ ] 浏览器访问系统
  - [ ] 输入账号：admin
  - [ ] 输入密码：admin123
  - [ ] 成功登录
  - [ ] 跳转到首页

### 核心功能测试

- [ ] 患者管理
  - [ ] 创建新患者
  - [ ] 查看患者列表
  - [ ] 编辑患者信息

- [ ] 病历管理
  - [ ] 创建病历
  - [ ] 编辑病历
  - [ ] 保存病历

- [ ] 数据持久化
  - [ ] 刷新页面数据不丢失
  - [ ] 重启服务数据仍存在

---

## 🔒 安全检查

### 账户安全

- [ ] 修改 admin 默认密码
- [ ] 创建其他用户账户
- [ ] 删除或禁用不必要的账户

### 网络安全

- [ ] 仅开放必要的端口
- [ ] 配置 HTTPS（推荐）
- [ ] 限制远程访问 IP（如需要）

### 数据安全

- [ ] 配置数据库备份计划
- [ ] 测试数据恢复流程
- [ ] 设置日志轮转

---

## 📊 性能优化

### 后端优化

- [ ] 使用 PM2 或 NSSM 管理进程
- [ ] 配置环境变量 NODE_ENV=production
- [ ] 启用日志轮转

### 前端优化

- [ ] 启用 Gzip 压缩（IIS/Nginx）
- [ ] 配置浏览器缓存
- [ ] 优化静态资源

### 数据库优化

- [ ] 创建必要的索引
- [ ] 配置查询缓存
- [ ] 定期优化表

---

## 📝 文档完善

- [ ] 记录服务器配置信息
- [ ] 记录数据库连接信息（妥善保管）
- [ ] 记录管理员账户信息（妥善保管）
- [ ] 创建运维手册
- [ ] 制定备份策略文档

---

## 🔄 日常维护计划

### 每日检查

- [ ] 检查服务运行状态
- [ ] 查看错误日志
- [ ] 监控系统资源

### 每周维护

- [ ] 清理临时文件
- [ ] 检查磁盘空间
- [ ] 审查访问日志

### 每月维护

- [ ] 完整备份数据库
- [ ] 更新系统补丁
- [ ] 审查安全日志
- [ ] 性能评估

### 每季度维护

- [ ] 更新 Node.js 和依赖包
- [ ] 数据库优化
- [ ] 安全审计
- [ ] 灾难恢复演练

---

## 🐛 问题记录

记录部署过程中遇到的问题和解决方案：

| 日期 | 问题描述 | 解决方案 | 负责人 |
|------|---------|---------|--------|
|      |         |         |        |
|      |         |         |        |

---

## ✍️ 签字确认

部署完成后，请相关人员签字确认：

- 部署工程师：________________ 日期：__________
- 测试工程师：________________ 日期：__________
- 项目负责人：________________ 日期：__________

---

**提示**: 
- 打印此清单，逐项勾选
- 保留完成的清单作为部署记录
- 遇到问题及时记录在"问题记录"部分
