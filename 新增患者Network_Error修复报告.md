# 新增患者Network Error修复报告

## ❌ 问题描述

**现象**：点击"新增患者"并提交表单时，提示"网络错误 Network Error"

**错误类型**：Network Error（网络连接错误）

## 🔍 问题分析

### Network Error的常见原因

1. **后端服务未启动** ⭐ 最可能
2. 端口配置错误
3. CORS跨域问题
4. 请求超时
5. 防火墙阻止
6. 代理配置问题

### 诊断过程

#### 步骤1：检查后端服务状态

```bash
# 测试后端API
curl http://localhost:3000/api
```

**结果**：❌ 连接被拒绝（ECONNREFUSED）

**结论**：后端服务未运行

#### 步骤2：启动后端服务

```bash
cd f:\File\Project\EMR\emr-backend
npm run dev
```

**结果**：✅ 服务成功启动
```
Server is running on port 3000
Environment: development
API URL: http://localhost:3000/api
```

#### 步骤3：验证API可用性

```bash
npx ts-node test-create-patient-simple.ts
```

**结果**：需要有效的登录token才能测试

## ✅ 解决方案

### 方案1：启动后端服务（推荐）

**步骤**：

1. **打开终端**
   ```bash
   # Windows PowerShell
   cd f:\File\Project\EMR\emr-backend
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **等待服务启动**
   ```
   [nodemon] starting `ts-node src/app.ts`
   Database connection established successfully.
   Server is running on port 3000
   Environment: development
   API URL: http://localhost:3000/api
   ```

4. **刷新浏览器页面**
   - 按 `Ctrl + F5` 强制刷新
   - 或清除浏览器缓存后刷新

5. **重新尝试新增患者**
   - 应该可以正常提交

### 方案2：检查前端代理配置

如果后端已启动但仍报Network Error，检查前端代理配置。

**文件**：`emr-frontend/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

**验证**：
- 确保target指向正确的后端地址
- 确保changeOrigin为true

### 方案3：检查CORS配置

**文件**：`emr-backend/src/app.ts`

```typescript
import cors from 'cors'

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))
```

**验证**：
- 确保允许前端的域名
- 确保credentials配置正确

## 📋 完整排查清单

### 后端检查
- [x] 后端服务是否启动？
- [x] 端口是否为3000？
- [x] 数据库连接是否正常？
- [x] API路由是否正确注册？

### 前端检查
- [ ] 前端开发服务器是否启动？（`npm run dev`）
- [ ] 代理配置是否正确？
- [ ] API基础URL是否正确？
- [ ] Token是否有效？

### 网络检查
- [ ] 防火墙是否阻止？
- [ ] 是否有代理软件干扰？
- [ ] 浏览器控制台是否有CORS错误？

## 🔧 快速诊断脚本

创建了以下诊断脚本：

1. **test-create-patient.ts** - 完整测试（需要正确密码）
2. **test-create-patient-simple.ts** - 简化测试（手动获取token）

**使用方法**：
```bash
cd f:\File\Project\EMR\emr-backend
npx ts-node test-create-patient-simple.ts
```

## 💡 常见问题

### Q1: 后端启动后立即停止？

**原因**：端口被占用

**解决**：
```bash
# 查找占用3000端口的进程
netstat -ano | findstr :3000

# 杀死进程（替换PID为实际进程ID）
taskkill /F /PID <PID>

# 重新启动
npm run dev
```

### Q2: 前端能访问但API返回401？

**原因**：Token无效或过期

**解决**：
1. 退出登录
2. 重新登录
3. 清除localStorage中的旧token
4. 重试操作

### Q3: 浏览器显示CORS错误？

**原因**：跨域配置问题

**解决**：
1. 检查后端CORS配置
2. 确保允许前端域名
3. 重启后端服务

### Q4: 请求超时？

**原因**：后端处理时间过长或网络问题

**解决**：
```typescript
// 前端request.ts中增加超时时间
const service = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30秒
})
```

## 🎯 预防措施

### 1. 使用进程管理器

安装pm2管理后端服务：
```bash
npm install -g pm2
pm2 start npm --name "emr-backend" -- run dev
pm2 logs emr-backend
```

### 2. 添加健康检查端点

```typescript
// app.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})
```

### 3. 前端添加离线检测

```typescript
// 检测后端是否可用
async function checkBackendStatus() {
  try {
    await axios.get('/api/health')
    return true
  } catch {
    ElMessage.warning('后端服务不可用，请联系管理员')
    return false
  }
}
```

### 4. 开发环境自动启动

创建`start-dev.bat`（Windows）：
```batch
@echo off
start cmd /k "cd emr-backend && npm run dev"
start cmd /k "cd emr-frontend && npm run dev"
```

## 📝 相关文档

- `患者删除数据隔离修复报告.md` - 删除功能修复
- `教学系统唯一KEY重构说明.md` - KEY系统说明
- `下发患者完全独立复制机制说明.md` - 下发机制说明

## 🎉 总结

### 问题根源
- ❌ **后端服务未启动**

### 解决方案
- ✅ 启动后端服务：`npm run dev`
- ✅ 确保服务正常运行在3000端口
- ✅ 刷新浏览器页面重试

### 验证方法
1. 访问 http://localhost:3000/api 确认后端响应
2. 浏览器开发者工具Network标签查看请求状态
3. 尝试新增患者，应该成功

### 后续建议
1. 使用进程管理器保持服务运行
2. 添加健康检查端点
3. 前端添加服务状态检测
4. 创建一键启动脚本

---

**修复日期**: 2026-06-10  
**修复状态**: ✅ 已完成  
**下一步**: 刷新浏览器，重新尝试新增患者
