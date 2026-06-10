# Windows Server 2025 数据中心版部署指南

## 📋 系统要求

### 硬件要求
- CPU: 2核心或更高
- 内存: 4GB RAM 或更高（推荐8GB）
- 硬盘: 至少20GB可用空间
- 网络: 稳定的网络连接

### 软件要求
- Windows Server 2025 数据中心版
- Node.js 18.x 或更高版本
- MySQL 8.0 或更高版本
- Git（可选，用于代码更新）

---

## 🚀 部署步骤

### 第一步：安装必要软件

#### 1. 安装 Node.js

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐 18.x 或 20.x）
3. 运行安装程序，选择默认选项
4. 验证安装：
```powershell
node --version
npm --version
```

#### 2. 安装 MySQL

**选项A：使用 MySQL Installer（推荐）**
1. 访问 [MySQL下载页面](https://dev.mysql.com/downloads/installer/)
2. 下载 MySQL Installer for Windows
3. 运行安装程序，选择以下组件：
   - MySQL Server 8.0
   - MySQL Workbench（可选，用于数据库管理）
4. 配置 MySQL：
   - 设置 root 密码（请记住这个密码）
   - 端口：3306（默认）
   - 字符集：utf8mb4

**选项B：使用 Chocolatey 包管理器**
```powershell
# 以管理员身份运行 PowerShell
choco install mysql -y
```

#### 3. 安装 Git（可选）

```powershell
# 使用 Chocolatey
choco install git -y

# 或从 https://git-scm.com/download/win 下载安装
```

---

### 第二步：准备项目文件

#### 方法1：从 GitHub 克隆（推荐）

```powershell
# 创建项目目录
cd C:\
mkdir emr-system
cd emr-system

# 克隆仓库
git clone https://github.com/wjk9711/Smart-EMR.git .
```

#### 方法2：手动上传文件

1. 在本地打包项目文件夹
2. 通过远程桌面或 FTP 上传到服务器
3. 解压到 `C:\emr-system`

---

### 第三步：配置后端

#### 1. 安装后端依赖

```powershell
cd C:\emr-system\emr-backend
npm install
```

#### 2. 创建环境变量文件

```powershell
# 复制示例文件
copy .env.example .env
```

编辑 `.env` 文件，配置以下内容：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=emr_system
DB_USER=root
DB_PASSWORD=你的MySQL密码

# JWT配置（生产环境请修改为复杂密钥）
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=24h

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 通义千问API配置（可选）
QWEN_API_KEY=your-qwen-api-key
```

#### 3. 初始化数据库

```powershell
# 构建 TypeScript 代码
npm run build

# 运行数据库迁移
npm run db:migrate

# 填充初始数据
npm run db:seed
```

---

### 第四步：配置前端

#### 1. 安装前端依赖

```powershell
cd C:\emr-system\emr-frontend
npm install
```

#### 2. 配置生产环境变量

编辑 `.env.production` 文件：

```env
# 如果前后端在同一服务器，使用相对路径
VITE_API_BASE_URL=/api

# 如果后端在不同服务器或端口，使用完整URL
# VITE_API_BASE_URL=http://localhost:3000
# VITE_API_BASE_URL=http://你的服务器IP:3000
```

#### 3. 构建前端

```powershell
npm run build
```

构建完成后，会在 `emr-frontend\dist` 目录生成静态文件。

---

### 第五步：配置 Web 服务器

#### 方案A：使用 IIS（Windows内置，推荐）

##### 1. 安装 IIS

```powershell
# 以管理员身份运行 PowerShell
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
Install-WindowsFeature -Name Web-Http-Redirect
Install-WindowsFeature -Name Web-Url-Auth
```

##### 2. 安装 URL Rewrite 模块

1. 下载 [URL Rewrite 2.1](https://www.iis.net/downloads/microsoft/url-rewrite)
2. 运行安装程序

##### 3. 配置 IIS 站点

**创建网站：**
1. 打开 IIS 管理器
2. 右键"网站" → "添加网站"
3. 配置：
   - 网站名称：EMR System
   - 物理路径：`C:\emr-system\emr-frontend\dist`
   - 绑定：HTTP，端口 80
   - 主机名：（留空或填写域名）

**配置反向代理：**

在 IIS 管理器中：
1. 选择刚创建的网站
2. 双击"URL Rewrite"
3. 点击右侧"添加规则" → "空白规则"
4. 配置规则：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- API 反向代理 -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:3000/api/{R:1}" />
        </rule>
        
        <!-- Vue Router 历史模式支持 -->
        <rule name="Vue Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

保存为 `web.config` 放在 `emr-frontend\dist` 目录下。

##### 4. 启动后端服务

创建 Windows 服务或使用任务计划程序：

**方法1：使用 NSSM（推荐）**

```powershell
# 下载 NSSM
# https://nssm.cc/release/nssm-2.24.zip

# 解压后
cd C:\nssm-2.24\win64

# 安装后端服务
nssm.exe install EMR-Backend
# 配置：
# Application: C:\Program Files\nodejs\node.exe
# Arguments: C:\emr-system\emr-backend\dist\app.js
# App directory: C:\emr-system\emr-backend

# 启动服务
nssm.exe start EMR-Backend
```

**方法2：使用任务计划程序**

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：系统启动时
4. 操作：启动程序
   - 程序：`node.exe`
   - 参数：`C:\emr-system\emr-backend\dist\app.js`
   - 起始于：`C:\emr-system\emr-backend`

---

#### 方案B：使用 Nginx for Windows

##### 1. 下载 Nginx

1. 访问 [Nginx Windows版下载](http://nginx.org/en/docs/windows.html)
2. 下载稳定版
3. 解压到 `C:\nginx`

##### 2. 配置 Nginx

编辑 `C:\nginx\conf\nginx.conf`：

```nginx
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        # 前端静态文件
        location / {
            root   C:/emr-system/emr-frontend/dist;
            index  index.html;
            try_files $uri $uri/ /index.html;
        }

        # 后端API代理
        location /api/ {
            proxy_pass http://localhost:3000/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

##### 3. 启动 Nginx

```powershell
cd C:\nginx
.\nginx.exe

# 测试配置
.\nginx.exe -t

# 重新加载配置
.\nginx.exe -s reload

# 停止
.\nginx.exe -s stop
```

##### 4. 启动后端服务

参考方案A中的后端服务启动方法。

---

### 第六步：配置防火墙

#### 开放必要端口

```powershell
# 以管理员身份运行 PowerShell

# 开放 HTTP (80)
New-NetFirewallRule -DisplayName "EMR HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# 开放后端端口 (3000) - 仅本地访问
New-NetFirewallRule -DisplayName "EMR Backend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -RemoteAddress 127.0.0.1

# 如果使用其他端口，相应调整
```

#### 阿里云安全组配置（如果使用云服务器）

1. 登录阿里云控制台
2. 进入 ECS 实例 → 安全组
3. 添加入方向规则：
   - 端口范围：80/80
   - 授权对象：0.0.0.0/0
   - 协议类型：TCP

---

## ✅ 验证部署

### 1. 检查后端服务

```powershell
# 测试健康检查
curl http://localhost:3000/health

# 应该返回
# {"status":"ok","timestamp":"..."}
```

### 2. 检查前端

在浏览器中访问：
```
http://localhost
或
http://你的服务器IP
```

### 3. 测试登录

```powershell
# 测试登录API
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### 4. 检查服务状态

```powershell
# 检查 Node.js 进程
Get-Process node

# 检查端口监听
netstat -ano | findstr :3000
netstat -ano | findstr :80
```

---

## 🔧 日常维护

### 更新代码

#### 方法1：使用 Git

```powershell
cd C:\emr-system

# 拉取最新代码
git pull origin main

# 重新构建后端
cd emr-backend
npm install
npm run build

# 重启后端服务
nssm.exe restart EMR-Backend

# 重新构建前端
cd ..\emr-frontend
npm install
npm run build

# IIS/Nginx 会自动使用新的 dist 文件
```

#### 方法2：手动更新

1. 停止后端服务
2. 替换项目文件
3. 重新构建
4. 启动服务

### 备份数据

```powershell
# 备份数据库
mysqldump -u root -p emr_system > C:\backup\emr-db-$(Get-Date -Format "yyyyMMdd").sql

# 备份上传文件
Copy-Item -Path "C:\emr-system\emr-backend\uploads" -Destination "C:\backup\uploads-$(Get-Date -Format "yyyyMMdd")" -Recurse
```

### 查看日志

```powershell
# 后端日志（如果使用NSSM）
Get-Content C:\nssm-2.24\logs\EMR-Backend.log -Tail 50

# 自定义日志
Get-Content C:\emr-system\emr-backend\backend.log -Tail 50

# IIS 日志
Get-Content C:\inetpub\logs\LogFiles\W3SVC*\*.log -Tail 50

# Nginx 日志
Get-Content C:\nginx\logs\error.log -Tail 50
```

---

## 🐛 常见问题

### 1. 后端无法启动

**问题：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决：**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 终止进程（替换 PID）
taskkill /PID <PID> /F

# 或修改 .env 中的 PORT
```

### 2. 数据库连接失败

**问题：** `Access denied for user 'root'@'localhost'`

**解决：**
1. 检查 `.env` 中的数据库密码是否正确
2. 确认 MySQL 服务正在运行：
```powershell
Get-Service MySQL80
Start-Service MySQL80
```

### 3. 前端页面空白

**问题：** 访问网站显示空白页

**解决：**
1. 检查浏览器控制台错误
2. 确认 `emr-frontend\dist` 目录存在且包含文件
3. 检查 IIS/Nginx 配置是否正确指向 dist 目录
4. 确认 `.env.production` 中的 API 地址正确

### 4. API 请求 404

**问题：** 前端能访问，但 API 请求返回 404

**解决：**
1. 确认后端服务正在运行
2. 检查 IIS URL Rewrite 或 Nginx 反向代理配置
3. 测试直接访问后端：`curl http://localhost:3000/health`

### 5. 权限问题

**问题：** 文件上传失败或无法写入

**解决：**
```powershell
# 给予 IIS_IUSRS 用户写入权限
icacls "C:\emr-system\emr-backend\uploads" /grant IIS_IUSRS:(OI)(CI)F

# 或给予 Network Service 权限
icacls "C:\emr-system\emr-backend\uploads" /grant "NT AUTHORITY\NETWORK SERVICE":(OI)(CI)F
```

---

## 📊 性能优化建议

### 1. 使用 PM2 管理 Node.js 进程

```powershell
# 安装 PM2
npm install -g pm2

# 启动后端
pm2 start emr-backend\dist\app.js --name emr-backend

# 开机自启
pm2 startup
pm2 save
```

### 2. 启用 Gzip 压缩

**IIS：** 已默认启用

**Nginx：** 在 `nginx.conf` 中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 3. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_patient_id ON inpatient_records(patient_id);
CREATE INDEX idx_doctor_id ON inpatient_records(doctor_id);
```

---

## 🔒 安全建议

1. **修改默认密码**
   - 修改 admin 用户密码
   - 使用强密码策略

2. **配置 HTTPS**
   - 申请 SSL 证书（Let's Encrypt 免费）
   - 配置 IIS/Nginx 使用 HTTPS

3. **定期更新**
   - 更新 Node.js 和 npm
   - 更新依赖包：`npm audit fix`

4. **限制访问**
   - 使用防火墙限制不必要的端口
   - 配置 IP 白名单（如需要）

5. **备份策略**
   - 每日自动备份数据库
   - 保留最近7天的备份
   - 定期测试恢复流程

---

## 📞 技术支持

- GitHub Issues: https://github.com/wjk9711/Smart-EMR/issues
- 查看日志排查问题
- 参考项目根目录的其他文档

---

**祝部署顺利！** 🎉
