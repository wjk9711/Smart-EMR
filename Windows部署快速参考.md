# Windows Server 2025 部署快速参考

## 🚀 快速开始

### 一键部署（推荐）

```powershell
# 以管理员身份运行 PowerShell
cd C:\emr-system  # 或你的项目目录
.\deploy-windows-server.ps1
```

或使用批处理文件：
```cmd
deploy-windows-server.bat
```

---

## 📋 前置要求检查清单

- [ ] Windows Server 2025 数据中心版
- [ ] Node.js 18+ 已安装
- [ ] MySQL 8.0+ 已安装并运行
- [ ] 管理员权限

---

## 🔧 常用命令速查

### 后端管理

```powershell
# 启动后端
cd C:\emr-system\emr-backend
node dist\app.js

# 后台运行
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node dist\app.js"

# 停止后端
Stop-Process -Name node -Force

# 查看后端日志
Get-Content backend.log -Tail 50

# 重新构建
npm run build

# 数据库迁移
npm run db:migrate

# 填充数据
npm run db:seed
```

### 前端管理

```powershell
# 构建前端
cd C:\emr-system\emr-frontend
npm run build

# 开发模式
npm run dev

# 预览生产版本
npm run preview
```

### 服务管理（使用 NSSM）

```powershell
# 安装服务
cd C:\nssm-2.24\win64
nssm.exe install EMR-Backend

# 启动服务
nssm.exe start EMR-Backend

# 停止服务
nssm.exe stop EMR-Backend

# 重启服务
nssm.exe restart EMR-Backend

# 查看状态
nssm.exe status EMR-Backend

# 卸载服务
nssm.exe remove EMR-Backend confirm
```

### Git 更新

```powershell
cd C:\emr-system

# 拉取最新代码
git pull origin main

# 重新构建后端
cd emr-backend
npm install
npm run build

# 重新构建前端
cd ..\emr-frontend
npm install
npm run build

# 重启服务
nssm.exe restart EMR-Backend
```

---

## 🌐 Web 服务器配置

### IIS 快速配置

```powershell
# 安装 IIS
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

# 安装 URL Rewrite（需手动下载安装）
# https://www.iis.net/downloads/microsoft/url-rewrite
```

**web.config 配置：**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:3000/api/{R:1}" />
        </rule>
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

### Nginx 快速配置

**nginx.conf：**
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root C:/emr-system/emr-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```powershell
# 启动 Nginx
C:\nginx\nginx.exe

# 重新加载配置
C:\nginx\nginx.exe -s reload

# 停止
C:\nginx\nginx.exe -s stop
```

---

## 🔥 防火墙配置

```powershell
# 以管理员身份运行

# 开放 HTTP (80)
New-NetFirewallRule -DisplayName "EMR HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# 开放后端端口 (3000) - 仅本地
New-NetFirewallRule -DisplayName "EMR Backend Local" -Direction Inbound -Protocol TCP -LocalPort 3000 -RemoteAddress 127.0.0.1 -Action Allow

# 如需远程访问后端
New-NetFirewallRule -DisplayName "EMR Backend Remote" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

---

## 💾 备份与恢复

### 数据库备份

```powershell
# 备份数据库
mysqldump -u root -p emr_system > C:\backup\emr-db-$(Get-Date -Format "yyyyMMdd-HHmmss").sql

# 定时备份（添加到任务计划程序）
# 每天凌晨2点备份
$action = New-ScheduledTaskAction -Execute "mysqldump" -Argument "-u root -p密码 emr_system > C:\backup\emr-db.sql"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "EMR Database Backup" -Action $action -Trigger $trigger
```

### 文件备份

```powershell
# 备份上传文件
Copy-Item -Path "C:\emr-system\emr-backend\uploads" -Destination "C:\backup\uploads-$(Get-Date -Format 'yyyyMMdd')" -Recurse

# 备份整个项目
Compress-Archive -Path "C:\emr-system" -DestinationPath "C:\backup\emr-full-$(Get-Date -Format 'yyyyMMdd').zip"
```

---

## 🐛 故障排查

### 后端无法启动

```powershell
# 检查端口占用
netstat -ano | findstr :3000

# 终止占用进程
taskkill /PID <PID> /F

# 查看详细错误
cd C:\emr-system\emr-backend
node dist\app.js

# 检查 .env 配置
notepad .env
```

### 数据库连接失败

```powershell
# 检查 MySQL 服务
Get-Service MySQL80

# 启动 MySQL
Start-Service MySQL80

# 测试连接
mysql -u root -p -e "SHOW DATABASES;"

# 检查数据库是否存在
mysql -u root -p -e "USE emr_system; SHOW TABLES;"
```

### 前端页面空白

```powershell
# 检查 dist 目录
dir C:\emr-system\emr-frontend\dist

# 检查浏览器控制台
# F12 -> Console 查看错误信息

# 验证 API 连接
curl http://localhost:3000/health
```

### API 请求 404

```powershell
# 测试后端直接访问
curl http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'

# 检查反向代理配置
# IIS: 查看 URL Rewrite 规则
# Nginx: 查看 nginx.conf 中的 proxy_pass 配置
```

### 权限问题

```powershell
# 给予 IIS 用户写入权限
icacls "C:\emr-system\emr-backend\uploads" /grant IIS_IUSRS:(OI)(CI)F

# 给予 Network Service 权限
icacls "C:\emr-system\emr-backend\uploads" /grant "NT AUTHORITY\NETWORK SERVICE":(OI)(CI)F
```

---

## 📊 监控与维护

### 查看日志

```powershell
# 后端日志
Get-Content C:\emr-system\emr-backend\backend.log -Tail 50 -Wait

# IIS 日志
Get-Content C:\inetpub\logs\LogFiles\W3SVC*\*.log -Tail 50

# Nginx 日志
Get-Content C:\nginx\logs\error.log -Tail 50
Get-Content C:\nginx\logs\access.log -Tail 50

# NSSM 服务日志
Get-Content C:\nssm-2.24\logs\EMR-Backend.log -Tail 50
```

### 性能监控

```powershell
# 查看 Node.js 进程
Get-Process node | Select-Object Id, CPU, WorkingSet

# 查看端口监听
netstat -ano | findstr :3000
netstat -ano | findstr :80

# 查看系统资源
Get-Counter '\Processor(_Total)\% Processor Time'
Get-Counter '\Memory\Available MBytes'
```

### 清理日志

```powershell
# 清理超过30天的日志
Get-ChildItem "C:\emr-system\emr-backend\*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item

# 清理 IIS 日志
Get-ChildItem "C:\inetpub\logs\LogFiles\*" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
```

---

## 🔒 安全建议

### 修改默认密码

```powershell
# 登录系统后修改 admin 密码
# 或通过数据库直接修改
mysql -u root -p -e "USE emr_system; UPDATE users SET password='$2b$10$...' WHERE username='admin';"
```

### 配置 HTTPS（IIS）

```powershell
# 1. 申请 SSL 证书
# 2. 在 IIS 管理器中绑定 HTTPS
# 3. 配置 HTTP 重定向到 HTTPS
```

### 定期更新

```powershell
# 更新依赖包
cd C:\emr-system\emr-backend
npm audit fix

cd ..\emr-frontend
npm audit fix

# 更新 Node.js
# 从 https://nodejs.org/ 下载最新版本
```

---

## 📞 获取帮助

- 📖 完整文档: `Windows_Server_2025_部署指南.md`
- 🐛 GitHub Issues: https://github.com/wjk9711/Smart-EMR/issues
- 📧 查看日志排查问题

---

## ⚡ 快捷脚本

创建以下快捷方式以提高效率：

**restart-emr.ps1**
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
cd C:\emr-system\emr-backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node dist\app.js"
Write-Host "EMR 后端已重启" -ForegroundColor Green
```

**backup-emr.ps1**
```powershell
$date = Get-Date -Format "yyyyMMdd-HHmmss"
mysqldump -u root -p密码 emr_system > "C:\backup\emr-db-$date.sql"
Copy-Item -Path "C:\emr-system\emr-backend\uploads" -Destination "C:\backup\uploads-$date" -Recurse
Write-Host "备份完成: $date" -ForegroundColor Green
```

---

**提示**: 将此文件保存在项目根目录，方便随时查阅！
