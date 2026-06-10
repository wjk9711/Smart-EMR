# Windows Server 2025 部署 - 5分钟快速开始

## 🚀 超快速部署（3个命令）

```powershell
# 1. 以管理员身份打开 PowerShell

# 2. 克隆项目
git clone https://github.com/wjk9711/Smart-EMR.git C:\emr-system

# 3. 运行部署脚本
cd C:\emr-system
.\deploy-windows-server.ps1
```

**就这么简单！** 脚本会自动引导你完成所有步骤。

---

## 📋 前置要求（5分钟检查）

在运行脚本之前，确保已安装：

### ✅ 必需软件

1. **Node.js 18+**
   ```powershell
   node --version  # 应该显示 v18.x.x 或更高
   ```
   未安装？访问 https://nodejs.org/ 下载 LTS 版本

2. **MySQL 8.0+**
   ```powershell
   mysql --version  # 应该显示版本号
   Get-Service MySQL80  # 应该显示 Running
   ```
   未安装？访问 https://dev.mysql.com/downloads/installer/

3. **Git**（可选）
   ```powershell
   git --version
   ```
   未安装？访问 https://git-scm.com/download/win

### ✅ 系统要求

- Windows Server 2025 数据中心版
- 至少 4GB RAM
- 至少 20GB 可用磁盘空间
- 管理员权限

---

## 🎬 部署过程预览

运行 `deploy-windows-server.ps1` 后，脚本会：

1. ✅ 检查系统环境
2. ✅ 创建项目目录
3. ✅ 下载项目代码
4. ⚙️  配置后端（需要你编辑 .env 文件）
5. 🔨 构建后端代码
6. 💾 初始化数据库（可选）
7. 🎨 构建前端
8. 🌐 引导配置 Web 服务器
9. ▶️  启动后端服务
10. ✅ 完成！

**整个过程约需 10-15 分钟**（取决于网络速度）

---

## ⚙️ 关键配置

### 数据库配置（必须）

脚本会提示你编辑 `.env` 文件，确保配置正确：

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=emr_system
DB_USER=root
DB_PASSWORD=你的MySQL密码    # ← 修改这里
JWT_SECRET=随机字符串        # ← 修改这里（生产环境）
```

### Web 服务器选择

脚本会让你选择：
- **IIS**（推荐）- Windows 内置，图形化管理
- **Nginx** - 高性能，配置灵活
- **跳过** - 稍后手动配置

---

## ✅ 验证部署

部署完成后，测试是否成功：

### 1. 测试后端
```powershell
curl http://localhost:3000/health
# 应返回: {"status":"ok","timestamp":"..."}
```

### 2. 测试前端
打开浏览器访问：`http://localhost`

### 3. 测试登录
- 用户名：`admin`
- 密码：`admin123`

---

## 🐛 常见问题

### Q1: 脚本无法运行？

**A**: 确保以管理员身份运行 PowerShell：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: Node.js 或 MySQL 未安装？

**A**: 
- Node.js: https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/installer/

### Q3: 端口被占用？

**A**: 修改 `.env` 中的 `PORT` 为其他端口（如 3001）

### Q4: 数据库连接失败？

**A**: 
1. 检查 MySQL 服务是否运行：`Get-Service MySQL80`
2. 检查 `.env` 中的密码是否正确
3. 确保数据库已创建：`CREATE DATABASE emr_system;`

### Q5: 前端页面空白？

**A**: 
1. 检查浏览器控制台错误（F12）
2. 确认前端已构建：`dir emr-frontend\dist`
3. 检查 Web 服务器配置

---

## 📚 深入学习

完成快速部署后，建议阅读：

1. **[Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md)** - 完整教程
2. **[Windows部署快速参考.md](./Windows部署快速参考.md)** - 命令速查
3. **[Windows部署架构图解.md](./Windows部署架构图解.md)** - 理解架构

---

## 🔄 日常使用

### 启动服务
```powershell
# 如果使用 NSSM
nssm.exe start EMR-Backend

# 如果直接运行
cd C:\emr-system\emr-backend
node dist\app.js
```

### 停止服务
```powershell
# 如果使用 NSSM
nssm.exe stop EMR-Backend

# 如果直接运行
Stop-Process -Name node
```

### 更新代码
```powershell
cd C:\emr-system
git pull origin main

# 重新构建
cd emr-backend && npm run build
cd ..\emr-frontend && npm run build

# 重启服务
nssm.exe restart EMR-Backend
```

---

## 💡 专业提示

1. **使用 NSSM**: 将后端注册为 Windows 服务，开机自启
2. **配置防火墙**: 仅开放必要的端口（80, 443）
3. **定期备份**: 每天自动备份数据库
4. **启用 HTTPS**: 生产环境务必使用 SSL 证书
5. **监控日志**: 定期检查错误日志

---

## 🆘 需要帮助？

- 📖 查看完整文档: [Windows部署总览.md](./Windows部署总览.md)
- 🐛 提交 Issue: https://github.com/wjk9711/Smart-EMR/issues
- 📧 查看日志: `Get-Content emr-backend\backend.log -Tail 50`

---

## ✨ 准备好了吗？

现在开始部署：

```powershell
# 复制以下命令到 PowerShell（管理员模式）

git clone https://github.com/wjk9711/Smart-EMR.git C:\emr-system
cd C:\emr-system
.\deploy-windows-server.ps1
```

**祝你部署顺利！** 🎉
