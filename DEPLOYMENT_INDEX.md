# 部署脚本和文档索引

## 📦 自动化部署脚本

### 1. auto-update.sh
**完整部署脚本（服务器端）**

- **用途**: 首次部署或完整更新服务器
- **功能**: 
  - ✅ 检查系统依赖
  - ✅ 自动备份当前版本
  - ✅ 从GitHub拉取最新代码
  - ✅ 恢复配置文件
  - ✅ 构建后端和前端
  - ✅ 配置Nginx反向代理
  - ✅ 配置防火墙规则
  - ✅ 启动服务并验证
- **使用**: `sudo bash auto-update.sh`
- **权限**: 需要root权限

### 2. quick-update.sh
**快速更新脚本（服务器端）**

- **用途**: 日常快速更新（已部署环境）
- **功能**:
  - ✅ 拉取最新代码
  - ✅ 重新构建前后端
  - ✅ 部署前端文件
  - ✅ 重启服务
- **使用**: `bash quick-update.sh`
- **位置**: `/opt/emr-system`
- **速度**: 比auto-update.sh快3-5倍

### 3. update-local.bat
**Windows本地更新脚本**

- **用途**: Windows本地开发环境更新
- **功能**:
  - ✅ 拉取最新代码
  - ✅ 重新构建前后端
  - ✅ 启动后端服务
- **使用**: 双击运行或在命令行执行
- **注意**: 仅用于本地测试，不部署到Web服务器

### 4. deploy.sh / deploy.bat
**构建和检查脚本**

- **用途**: 本地构建前端并检查配置
- **功能**:
  - ✅ 检查后端服务状态
  - ✅ 构建前端生产版本
  - ✅ 验证环境变量配置
  - ✅ 提供部署说明
- **使用**: `bash deploy.sh` 或 `deploy.bat`

### 5. server-check.sh
**服务器端检查脚本**

- **用途**: 在服务器上检查部署状态
- **功能**:
  - ✅ 检查Node.js和npm
  - ✅ 检查后端进程
  - ✅ 检查端口监听
  - ✅ 测试API接口
  - ✅ 检查防火墙配置
  - ✅ 检查阿里云安全组
- **使用**: `bash server-check.sh`（在服务器上运行）

---

## 📚 文档列表

### 1. QUICK_START.md
**30秒快速开始指南**

- ⭐ 推荐阅读（第一个查看的文档）
- 包含：快速部署、常用命令、问题速查
- 适合：快速上手和日常参考

### 2. 自动化部署指南.md
**完整的自动化部署文档**

- 包含：详细步骤、配置说明、故障排除
- 适合：首次部署和深入学习
- 章节：
  - 脚本说明
  - 首次部署流程
  - 日常更新流程
  - 配置说明
  - 常见问题
  - 备份与恢复
  - 监控与维护
  - 安全建议

### 3. 404错误快速修复.md
**生产环境404错误解决方案**

- 包含：问题诊断、修复步骤、排查清单
- 适合：解决API访问404错误
- 章节：
  - 问题描述和原因分析
  - 已实施的修复
  - 立即执行的步骤
  - 常见问题排查
  - Nginx配置方案
  - 验证清单

### 4. 生产环境部署指南.md
**传统部署方式说明**

- 包含：多种部署方案对比
- 适合：了解不同部署选项
- 章节：
  - 问题诊断
  - 三种解决方案
  - 快速修复步骤
  - 常见问题排查
  - 推荐的长期方案

### 5. GETTING_STARTED.md
**入门指南（已更新）**

- 包含：手动启动步骤、开发环境配置
- 新增：生产环境部署章节
- 适合：开发者和初学者

### 6. README.md
**项目主文档（已更新）**

- 新增：快速开始章节
- 链接：所有相关文档

---

## 🎯 使用场景指南

### 场景1：首次在服务器部署

```bash
# 1. 阅读文档
cat QUICK_START.md

# 2. 上传脚本
scp auto-update.sh root@47.97.200.237:/root/

# 3. 运行部署
ssh root@47.97.200.237
chmod +x auto-update.sh
sudo bash auto-update.sh

# 4. 配置数据库
cd /opt/emr-system/emr-backend
nano .env

# 5. 初始化数据库
npm run db:migrate
npm run db:seed
```

### 场景2：日常更新代码

```bash
# 方法1：快速更新（推荐）
ssh root@47.97.200.237
cd /opt/emr-system
bash quick-update.sh

# 方法2：完整更新（包含备份）
sudo bash auto-update.sh
```

### 场景3：本地开发测试

```bash
# Windows
update-local.bat

# Linux/Mac
bash deploy.sh
```

### 场景4：排查问题

```bash
# 1. 运行检查脚本
bash server-check.sh

# 2. 查看日志
tail -f /var/log/emr-update.log
tail -f /opt/emr-system/emr-backend/backend.log

# 3. 查看快速修复文档
cat 404错误快速修复.md
```

### 场景5：备份系统

```bash
# 自动备份（运行auto-update.sh时）
ls -lt /opt/emr-backup/

# 手动备份
tar -czf emr-backup-$(date +%Y%m%d).tar.gz /opt/emr-system
mysqldump -u root -p emr_system > db-backup.sql
```

---

## 📊 脚本对比表

| 脚本 | 平台 | 用途 | 速度 | 备份 | 配置 | 适用场景 |
|------|------|------|------|------|------|----------|
| auto-update.sh | Linux | 完整部署 | 慢 | ✅ | ✅ | 首次部署 |
| quick-update.sh | Linux | 快速更新 | 快 | ❌ | ❌ | 日常更新 |
| update-local.bat | Windows | 本地更新 | 中 | ❌ | ❌ | 本地测试 |
| deploy.sh | Linux/Mac | 构建检查 | 快 | ❌ | ❌ | 构建验证 |
| server-check.sh | Linux | 状态检查 | 快 | ❌ | ❌ | 问题排查 |

---

## 🔗 GitHub仓库

所有代码和脚本都托管在GitHub：

**仓库地址**: https://github.com/wjk9711/Smart-EMR

### 拉取最新代码

```bash
# 服务器端
cd /opt/emr-system
git pull origin main

# 本地开发
git pull origin main
```

### 提交更改

```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

---

## 💡 最佳实践

### 1. 更新前备份

```bash
# 虽然auto-update.sh会自动备份，但建议手动备份重要数据
mysqldump -u root -p emr_system > backup-$(date +%Y%m%d).sql
```

### 2. 测试后再部署

```bash
# 先在本地测试
update-local.bat

# 确认无误后再部署到服务器
bash quick-update.sh
```

### 3. 监控日志

```bash
# 更新后检查日志
tail -n 50 /var/log/emr-update.log
tail -f /opt/emr-system/emr-backend/backend.log
```

### 4. 验证功能

```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试登录API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 浏览器访问
# http://your-server-ip
```

### 5. 定期维护

```bash
# 每周检查
bash server-check.sh

# 每月清理日志
find /opt/emr-system -name "*.log" -mtime +30 -delete

# 每季度备份
tar -czf quarterly-backup.tar.gz /opt/emr-system
```

---

## 🆘 获取帮助

### 文档查询顺序

1. **遇到问题？** → 查看 `QUICK_START.md` 的常见问题速查
2. **需要详细说明？** → 查看 `自动化部署指南.md`
3. **404错误？** → 查看 `404错误快速修复.md`
4. **首次部署？** → 查看 `GETTING_STARTED.md`

### 日志位置

- 更新日志：`/var/log/emr-update.log`
- 后端日志：`/opt/emr-system/emr-backend/backend.log`
- Nginx日志：`/var/log/nginx/access.log` 和 `error.log`

### 社区支持

- GitHub Issues: https://github.com/wjk9711/Smart-EMR/issues
- 提交问题时请附上：
  - 操作系统版本
  - Node.js版本
  - 相关日志内容
  - 错误截图

---

## 📝 更新日志

### v1.0 (2024-01-01)
- ✅ 创建完整的自动化部署系统
- ✅ 添加5个部署脚本
- ✅ 编写6份详细文档
- ✅ 支持Nginx反向代理
- ✅ 支持自动备份和恢复
- ✅ 支持PM2进程管理

---

**祝部署顺利！** 🎉

如有问题，请查阅相关文档或提交GitHub Issue。
