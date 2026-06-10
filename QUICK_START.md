# EMR系统一键部署 - 快速开始

## 🚀 30秒快速部署

### 首次部署（服务器端）

```bash
# 1. SSH登录服务器
ssh root@47.97.200.237

# 2. 上传并运行部署脚本
# （从本地电脑执行）
scp auto-update.sh root@47.97.200.237:/root/

# 3. 在服务器上执行
ssh root@47.97.200.237
chmod +x auto-update.sh
sudo bash auto-update.sh

# 4. 配置数据库
cd /opt/emr-system/emr-backend
nano .env  # 修改数据库密码

# 5. 初始化数据库
npm run db:migrate
npm run db:seed

# 6. 访问系统
# http://47.97.200.237
# 账号: admin / admin123
```

---

## 🔄 日常更新（3步完成）

```bash
# 1. SSH登录
ssh root@47.97.200.237

# 2. 进入目录
cd /opt/emr-system

# 3. 运行更新
bash quick-update.sh
```

✅ 完成！系统已更新到最新版本。

---

## 📁 文件位置

| 类型 | 路径 | 说明 |
|------|------|------|
| 代码目录 | `/opt/emr-system` | Git仓库根目录 |
| 后端代码 | `/opt/emr-system/emr-backend` | Node.js后端 |
| 前端代码 | `/opt/emr-system/emr-frontend` | Vue前端 |
| 前端部署 | `/var/www/html` | Nginx静态文件 |
| 备份目录 | `/opt/emr-backup` | 自动备份（保留5个） |
| 日志文件 | `/var/log/emr-update.log` | 更新日志 |
| 后端日志 | `/opt/emr-system/emr-backend/backend.log` | 运行日志 |

---

## 🔧 常用命令

### 服务管理

```bash
# 查看后端进程
ps aux | grep node

# 停止后端
pkill -f "node.*dist/app.js"

# 启动后端
cd /opt/emr-system/emr-backend
nohup node dist/app.js > backend.log 2>&1 &

# 重启Nginx
systemctl restart nginx

# 查看Nginx状态
systemctl status nginx
```

### 日志查看

```bash
# 实时更新日志
tail -f /opt/emr-system/emr-backend/backend.log

# 查看最近100行
tail -n 100 /opt/emr-system/emr-backend/backend.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log
```

### 数据库操作

```bash
# 登录MySQL
mysql -u root -p

# 备份数据库
mysqldump -u root -p emr_system > backup.sql

# 恢复数据库
mysql -u root -p emr_system < backup.sql
```

---

## ⚠️ 常见问题速查

### 问题1：端口被占用

```bash
# 查找并杀死占用3000端口的进程
lsof -i :3000
kill -9 <PID>
```

### 问题2：Git拉取失败

```bash
cd /opt/emr-system
git remote set-url origin https://github.com/wjk9711/Smart-EMR.git
git pull origin main
```

### 问题3：前端页面空白

```bash
# 重新构建并部署前端
cd /opt/emr-system/emr-frontend
npm run build
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/
```

### 问题4：API返回404

```bash
# 检查后端是否运行
curl http://localhost:3000/health

# 检查Nginx配置
nginx -t
systemctl restart nginx
```

### 问题5：权限错误

```bash
# 修复文件权限
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

---

## 📊 系统监控

```bash
# 检查所有服务
echo "=== 后端服务 ==="
ps aux | grep node | grep -v grep

echo "=== 端口监听 ==="
netstat -tlnp | grep -E '80|3000'

echo "=== Nginx状态 ==="
systemctl is-active nginx

echo "=== 磁盘空间 ==="
df -h

echo "=== 内存使用 ==="
free -h
```

---

## 🔐 安全配置

### 防火墙设置

```bash
# Ubuntu/Debian
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw enable

# CentOS/RHEL
firewall-cmd --add-port=80/tcp --permanent
firewall-cmd --add-port=443/tcp --permanent
firewall-cmd --add-port=3000/tcp --permanent
firewall-cmd --reload
```

### 阿里云安全组

在阿里云控制台添加以下入站规则：
- TCP 80 (HTTP)
- TCP 443 (HTTPS)
- TCP 3000 (API)

授权对象：`0.0.0.0/0`

---

## 📞 获取帮助

1. **查看文档**：`cat 自动化部署指南.md`
2. **查看日志**：`tail -f /var/log/emr-update.log`
3. **测试API**：`curl http://localhost:3000/health`
4. **GitHub Issues**：https://github.com/wjk9711/Smart-EMR/issues

---

## 💡 提示

- ✅ 首次部署使用 `auto-update.sh`
- ✅ 日常更新使用 `quick-update.sh`
- ✅ 本地测试使用 `update-local.bat`
- ✅ 定期备份数据库
- ✅ 监控日志文件
- ✅ 保持系统更新

---

**祝部署顺利！** 🎉
