@echo off
chcp 65001 >nul
REM EMR系统本地更新脚本（Windows版本）
REM 从GitHub拉取最新代码并重新构建
REM 使用方法: update-local.bat

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   EMR系统本地更新
echo ==========================================
echo.

REM 询问用户确认
set /p confirm="即将从GitHub拉取最新代码并重新构建，是否继续？(y/n): "
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
echo [1/5] 拉取最新代码...
git pull origin main
if errorlevel 1 (
    echo ✗ 代码拉取失败
    pause
    exit /b 1
)
echo ✓ 代码已更新
echo.

REM 停止后端服务
echo [2/5] 停止后端服务...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ 服务已停止
echo.

REM 构建后端
echo [3/5] 构建后端...
cd emr-backend
call npm install --production
if errorlevel 1 (
    echo ✗ 后端依赖安装失败
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ✗ 后端构建失败
    pause
    exit /b 1
)
echo ✓ 后端构建完成
echo.

REM 构建前端
echo [4/5] 构建前端...
cd ..\emr-frontend
call npm install
if errorlevel 1 (
    echo ✗ 前端依赖安装失败
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ✗ 前端构建失败
    pause
    exit /b 1
)
echo ✓ 前端构建完成
echo.

REM 启动后端
echo [5/5] 启动后端服务...
cd ..\emr-backend
start /B node dist\app.js
timeout /t 3 /nobreak >nul
echo ✓ 后端服务已启动
echo.

echo ==========================================
echo   更新完成！
echo ==========================================
echo.
echo 访问地址: http://localhost:5173
echo API地址: http://localhost:3000/api
echo.
pause
