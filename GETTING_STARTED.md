# 项目启动指南

## 重要提示

在运行本项目之前,您需要先安装 **Node.js**。

### 安装 Node.js

1. 访问 [https://nodejs.org/](https://nodejs.org/)
2. 下载并安装 **LTS版本**(推荐 v18 或 v20)
3. 选择 Windows Installer (.msi)
4. 运行安装程序,使用默认选项即可
5. 安装完成后,**重启终端**

### 验证安装

打开命令行工具,运行:

```bash
node --version
npm --version
```

如果显示版本号,说明安装成功。

---

## 第一步: 准备数据库

### 1. 安装 MySQL

如果您还没有安装MySQL:

- 下载地址: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
- 选择 MySQL 8.0 版本
- 按照向导完成安装

### 2. 创建数据库

登录MySQL后,执行:

```sql
CREATE DATABASE emr_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置后端环境变量

1. 进入后端目录: `cd emr-backend`
2. 复制环境文件: `copy .env.example .env`
3. 编辑 `.env` 文件,修改数据库配置:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=emr_system
DB_USER=root
DB_PASSWORD=912210747
JWT_SECRET=任意字符串(生产环境请使用强随机字符串)
```

---

## 第二步: 启动后端服务

```bash
# 进入后端目录
cd emr-backend

# 安装依赖
npm install

# 初始化数据库(创建表和初始数据)
npm run db:migrate
npm run db:seed

# 启动开发服务器
npm run dev
```

看到以下输出表示启动成功:

```
Database connection established successfully.
Database synchronized successfully.
Server is running on port 3000
Environment: development
API URL: http://localhost:3000/api
```

**保持此窗口开启**,不要关闭。

---

## 第三步: 启动前端应用

打开**新的命令行窗口**:

```bash
# 进入前端目录
cd emr-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

看到以下输出表示启动成功:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 第四步: 访问系统

1. 打开浏览器,访问: [http://localhost:5173](http://localhost:5173)
2. 使用默认账户登录:
   - 用户名: `admin`
   - 密码: `admin123`

或者使用医生账户:
   - 用户名: `doctor1`
   - 密码: `123456`

---

## 常见问题

### 1. npm install 失败

**可能原因**: 网络问题或Node.js版本不兼容

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 2. 数据库连接失败

**检查项**:
- MySQL服务是否正常运行?
- `.env` 文件中的配置是否正确?
- 数据库 `emr_system` 是否已创建?
- 用户名和密码是否正确?

### 3. 端口被占用

**错误信息**: `EADDRINUSE: address already in use`

**解决方案**:
- 关闭占用端口的程序
- 或修改配置文件中的端口号

### 4. 前端无法连接后端

**检查项**:
- 后端服务是否正在运行?
- 前端 `vite.config.ts` 中的代理配置是否正确?
- 浏览器控制台是否有CORS错误?

---

## 开发建议

### 推荐的开发工具

- **代码编辑器**: VS Code
- **数据库管理**: MySQL Workbench 或 Navicat
- **API测试**: Postman 或 Apifox
- **浏览器**: Chrome 或 Edge

### VS Code 推荐插件

- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- Database Client

---

## 下一步

系统启动成功后,您可以:

1. **浏览患者列表**: 点击左侧菜单 "门诊管理" -> "患者列表"
2. **创建新患者**: 点击 "新建患者" 按钮
3. **编写病历**: 为患者创建就诊记录后,点击 "就诊" 按钮
4. **使用编辑器**: 在病历编辑页面填写各项内容
5. **保存病历**: 点击 "保存" 或 "完成" 按钮

---

## 技术支持

如遇到问题:

1. 查看控制台错误信息
2. 检查后端日志输出
3. 查阅项目文档
4. 提交Issue反馈

祝您使用愉快!
