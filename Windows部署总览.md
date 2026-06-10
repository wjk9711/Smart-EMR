# Windows Server 2025 部署总览

## 📚 文档导航

本目录包含在 Windows Server 2025 数据中心版上部署 EMR 系统的完整资源。

### 核心文档

1. **[Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md)** ⭐
   - 完整的分步部署教程
   - 包含 IIS 和 Nginx 两种 Web 服务器配置
   - 详细的故障排除指南
   - 适合首次部署

2. **[Windows部署快速参考.md](./Windows部署快速参考.md)** ⚡
   - 常用命令速查表
   - 快捷操作指南
   - 日常维护命令
   - 适合日常使用

3. **[Windows部署检查清单.md](./Windows部署检查清单.md)** ✅
   - 逐项检查的部署清单
   - 验证测试步骤
   - 签字确认表格
   - 适合正式部署流程

### 自动化脚本

4. **[deploy-windows-server.ps1](./deploy-windows-server.ps1)** 🔧
   - PowerShell 自动化部署脚本
   - 交互式引导部署
   - 自动检查环境
   - **推荐使用**

5. **[deploy-windows-server.bat](./deploy-windows-server.bat)** 🔧
   - 批处理版本部署脚本
   - 兼容性更好
   - 适合不熟悉 PowerShell 的用户

---

## 🚀 快速开始（3 步部署）

### 方法 1：自动化脚本（推荐）

```powershell
# 1. 以管理员身份打开 PowerShell
# 2. 执行部署脚本
cd C:\emr-system
.\deploy-windows-server.ps1

# 3. 按照提示完成部署
```

### 方法 2：手动部署

查看 [Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md) 中的详细步骤。

---

## 📋 部署流程图

```
开始
  ↓
检查系统环境 (Node.js, MySQL, Git)
  ↓
获取项目代码 (Git clone 或手动上传)
  ↓
配置后端 (.env 文件)
  ↓
安装依赖并构建 (npm install && npm run build)
  ↓
初始化数据库 (迁移 + 种子数据)
  ↓
配置前端 (.env.production)
  ↓
构建前端 (npm run build)
  ↓
配置 Web 服务器 (IIS 或 Nginx)
  ↓
启动后端服务 (直接运行或 NSSM)
  ↓
配置防火墙规则
  ↓
验证部署 (健康检查 + 功能测试)
  ↓
完成 ✓
```

---

## 🎯 选择适合的方案

### 场景 1：首次部署

**推荐**: 使用自动化脚本 + 完整指南

1. 阅读 [Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md)
2. 运行 `deploy-windows-server.ps1`
3. 使用 [Windows部署检查清单.md](./Windows部署检查清单.md) 验证

### 场景 2：快速更新

**推荐**: 使用快速参考

1. 查看 [Windows部署快速参考.md](./Windows部署快速参考.md)
2. 执行 Git 拉取和重新构建命令
3. 重启服务

### 场景 3：问题排查

**推荐**: 结合多个文档

1. 查看 [Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md) 的"常见问题"章节
2. 参考 [Windows部署快速参考.md](./Windows部署快速参考.md) 的"故障排查"部分
3. 检查日志文件

### 场景 4：正式生产部署

**推荐**: 使用检查清单

1. 打印 [Windows部署检查清单.md](./Windows部署检查清单.md)
2. 逐项执行并勾选
3. 完成验证测试
4. 相关人员签字确认

---

## 🔧 技术栈说明

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **认证**: JWT

### 前端
- **框架**: Vue 3
- **构建工具**: Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router

### Web 服务器（二选一）
- **IIS**: Windows 内置，图形化管理
- **Nginx**: 高性能，配置文件驱动

### 进程管理（可选）
- **NSSM**: Windows 服务封装
- **PM2**: Node.js 进程管理器

---

## 📊 系统要求

### 最低配置
- CPU: 2 核心
- 内存: 4GB RAM
- 硬盘: 20GB 可用空间
- 网络: 稳定连接

### 推荐配置
- CPU: 4 核心
- 内存: 8GB RAM
- 硬盘: 50GB SSD
- 网络: 千兆以太网

### 软件版本
- Windows Server 2025 数据中心版
- Node.js 18.x LTS 或 20.x LTS
- MySQL 8.0+
- Git 2.x+（可选）

---

## 🌐 网络端口

| 端口 | 用途 | 访问范围 | 必需性 |
|------|------|---------|--------|
| 80 | HTTP (Web) | 公开 | 必需 |
| 443 | HTTPS (Web) | 公开 | 推荐 |
| 3000 | 后端 API | 本地/公开 | 必需* |
| 3306 | MySQL | 本地 | 必需 |

*注：如果使用反向代理，3000 端口只需本地访问

---

## 🔐 安全建议

### 必须执行
1. ✅ 修改 admin 默认密码
2. ✅ 设置强 JWT_SECRET
3. ✅ 配置防火墙规则
4. ✅ 定期更新系统和依赖

### 强烈推荐
1. ⭐ 配置 HTTPS
2. ⭐ 限制数据库远程访问
3. ⭐ 启用日志审计
4. ⭐ 定期备份数据

### 可选增强
1. 💡 配置 IP 白名单
2. 💡 启用双因素认证
3. 💡 配置 WAF（Web 应用防火墙）
4. 💡 实施入侵检测系统

---

## 📞 获取帮助

### 文档资源
- 📖 完整部署指南: [Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md)
- ⚡ 快速参考: [Windows部署快速参考.md](./Windows部署快速参考.md)
- ✅ 检查清单: [Windows部署检查清单.md](./Windows部署检查清单.md)

### 在线支持
- 🐛 GitHub Issues: https://github.com/wjk9711/Smart-EMR/issues
- 📧 项目仓库: https://github.com/wjk9711/Smart-EMR

### 日志位置
```
后端日志:    C:\emr-system\emr-backend\backend.log
IIS 日志:    C:\inetpub\logs\LogFiles\
Nginx 日志:  C:\nginx\logs\
NSSM 日志:   C:\nssm-2.24\logs\
```

---

## 🔄 更新策略

### 日常更新流程

```powershell
# 1. 备份当前版本
mysqldump -u root -p emr_system > backup.sql

# 2. 拉取最新代码
cd C:\emr-system
git pull origin main

# 3. 重新构建
cd emr-backend
npm install
npm run build

cd ..\emr-frontend
npm install
npm run build

# 4. 重启服务
nssm.exe restart EMR-Backend

# 5. 验证功能
curl http://localhost:3000/health
```

### 版本回滚

如果更新后出现问题：

```powershell
# 1. 停止服务
nssm.exe stop EMR-Backend

# 2. 恢复代码（Git）
cd C:\emr-system
git reset --hard HEAD~1

# 3. 恢复数据库
mysql -u root -p emr_system < backup.sql

# 4. 重新启动
nssm.exe start EMR-Backend
```

---

## 📈 性能优化建议

### 立即可做
1. 启用 Gzip 压缩
2. 配置浏览器缓存
3. 使用 CDN（如有）
4. 优化图片资源

### 中期优化
1. 添加数据库索引
2. 实施查询缓存
3. 优化慢查询
4. 使用连接池

### 长期规划
1. 负载均衡
2. 读写分离
3. 微服务拆分
4. 容器化部署

---

## 🎓 学习资源

### 相关技术文档
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Express.js 指南](https://expressjs.com/en/guide/)
- [Vue 3 文档](https://vuejs.org/)
- [MySQL 文档](https://dev.mysql.com/doc/)
- [IIS 文档](https://docs.microsoft.com/en-us/iis/)
- [Nginx 文档](https://nginx.org/en/docs/)

### 最佳实践
- Node.js 生产环境最佳实践
- MySQL 性能优化指南
- Windows Server 安全加固
- Web 应用安全防护

---

## 📝 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01 | 初始版本，支持 Windows Server 2025 |

---

## ✨ 下一步

1. **开始部署**: 运行 `deploy-windows-server.ps1`
2. **阅读指南**: 查看 [Windows_Server_2025_部署指南.md](./Windows_Server_2025_部署指南.md)
3. **打印清单**: 使用 [Windows部署检查清单.md](./Windows部署检查清单.md)
4. **保存参考**: 收藏 [Windows部署快速参考.md](./Windows部署快速参考.md)

---

**祝部署顺利！** 🎉

如有问题，请查阅相关文档或提交 GitHub Issue。
