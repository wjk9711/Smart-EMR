@echo off
chcp 65001 >nul
REM EMR系统生产环境快速部署脚本 (Windows版本)
REM 使用方法: deploy.bat

echo ======================================
echo EMR系统生产环境部署脚本
echo ======================================

set SERVER_IP=47.97.200.237
set BACKEND_PORT=3000
set FRONTEND_DIR=emr-frontend
set BACKEND_DIR=emr-backend

echo.
echo [步骤1] 检查后端服务状态
echo 测试后端健康检查端点...
curl -s http://localhost:%BACKEND_PORT%/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 后端服务运行正常
) else (
    echo ✗ 后端服务未运行或无法访问
    echo 请先启动后端服务：
    echo   cd %BACKEND_DIR%
    echo   npm install
    echo   npm run build
    echo   node dist\app.js
    pause
    exit /b 1
)

echo.
echo [步骤2] 构建前端
cd %FRONTEND_DIR%
if not exist "node_modules" (
    echo 安装依赖...
    call npm install
)

echo 构建生产版本...
call npm run build

if %errorlevel% equ 0 (
    echo ✓ 前端构建成功
) else (
    echo ✗ 前端构建失败
    pause
    exit /b 1
)

echo.
echo [步骤3] 验证配置
echo 检查环境变量配置...
if exist ".env.production" (
    echo ✓ 生产环境配置文件存在
    echo 当前API地址配置:
    findstr VITE_API_BASE_URL .env.production
) else (
    echo ✗ 缺少.env.production文件
)

echo.
echo [步骤4] 部署说明
echo ======================================
echo 前端构建完成！dist目录包含生产文件
echo.
echo 接下来需要：
echo 1. 将 %FRONTEND_DIR%\dist 目录上传到服务器
echo 2. 确保后端服务在服务器上运行并监听 0.0.0.0:%BACKEND_PORT%
echo 3. 配置防火墙/安全组允许 %BACKEND_PORT% 端口
echo 4. 使用Web服务器(Nginx/Apache)托管前端文件
echo.
echo 快速测试命令：
echo   curl http://%SERVER_IP%:%BACKEND_PORT%/health
echo   curl -X POST http://%SERVER_IP%:%BACKEND_PORT%/api/auth/login ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
echo.
echo 部署准备完成！
echo ======================================
pause
