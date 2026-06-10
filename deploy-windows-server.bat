@echo off
chcp 65001 >nul
REM ======================================
REM EMR系统 Windows Server 2025 自动化部署脚本
REM 使用方法: 以管理员身份运行 PowerShell，然后执行此脚本
REM ======================================

echo.
echo ======================================
echo   EMR系统 Windows Server 2025 部署脚本
echo ======================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本！
    echo 右键点击脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo [步骤 1/8] 检查系统环境
echo ----------------------------------------

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js 已安装: %NODE_VERSION%
) else (
    echo ✗ Node.js 未安装
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✓ npm 已安装: %NPM_VERSION%
) else (
    echo ✗ npm 未安装
    pause
    exit /b 1
)

REM 检查 MySQL
where mysql >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MySQL 命令行工具已安装
) else (
    echo ⚠ MySQL 命令行工具未找到（可能仍可正常使用）
)

echo.
echo [步骤 2/8] 设置项目目录
echo ----------------------------------------

set PROJECT_DIR=C:\emr-system

if exist "%PROJECT_DIR%" (
    echo ✓ 项目目录已存在: %PROJECT_DIR%
) else (
    echo 创建项目目录...
    mkdir "%PROJECT_DIR%"
    echo ✓ 项目目录已创建
)

cd /d "%PROJECT_DIR%"

echo.
echo [步骤 3/8] 获取项目代码
echo ----------------------------------------

if exist ".git" (
    echo 检测到 Git 仓库，拉取最新代码...
    git pull origin main
    if %errorlevel% equ 0 (
        echo ✓ 代码更新成功
    ) else (
        echo ⚠ Git 拉取失败，将使用现有代码
    )
) else (
    echo 未检测到 Git 仓库
    echo 请手动克隆或上传项目文件到: %PROJECT_DIR%
    echo.
    echo 推荐命令:
    echo   git clone https://github.com/wjk9711/Smart-EMR.git .
    echo.
    choice /C YN /M "是否继续部署"
    if errorlevel 2 exit /b 1
)

echo.
echo [步骤 4/8] 配置和构建后端
echo ----------------------------------------

cd emr-backend

REM 检查 .env 文件
if not exist ".env" (
    echo 创建 .env 配置文件...
    copy .env.example .env
    echo.
    echo ⚠ 请编辑 %PROJECT_DIR%\emr-backend\.env 文件
    echo 配置数据库连接信息和其他参数
    echo.
    echo 按任意键打开 .env 文件进行编辑...
    pause
    notepad .env
    echo.
    echo 编辑完成后按任意键继续...
    pause
)

echo 安装后端依赖...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✓ 后端依赖安装完成

echo 构建后端代码...
call npm run build
if %errorlevel% neq 0 (
    echo ✗ 后端构建失败
    pause
    exit /b 1
)
echo ✓ 后端构建完成

echo.
echo [步骤 5/8] 初始化数据库
echo ----------------------------------------

echo 是否要运行数据库迁移和种子数据？
choice /C YN /M "运行数据库初始化"
if errorlevel 2 goto skip_db_init

echo 运行数据库迁移...
call npm run db:migrate
if %errorlevel% neq 0 (
    echo ⚠ 数据库迁移失败，请检查数据库配置
) else (
    echo ✓ 数据库迁移完成
)

echo 填充初始数据...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ⚠ 数据填充失败
) else (
    echo ✓ 初始数据填充完成
)

:skip_db_init

echo.
echo [步骤 6/8] 配置和构建前端
echo ----------------------------------------

cd ..\emr-frontend

echo 安装前端依赖...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✓ 前端依赖安装完成

echo 构建前端生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo ✗ 前端构建失败
    pause
    exit /b 1
)
echo ✓ 前端构建完成
echo 输出目录: %PROJECT_DIR%\emr-frontend\dist

echo.
echo [步骤 7/8] 配置 Web 服务器
echo ----------------------------------------

echo 请选择 Web 服务器方案:
echo   1. IIS (Windows内置，推荐)
echo   2. Nginx for Windows
echo   3. 跳过（稍后手动配置）
echo.
choice /C 123 /M "选择Web服务器"

if errorlevel 3 goto skip_webserver
if errorlevel 2 goto setup_nginx
if errorlevel 1 goto setup_iis

:setup_iis
echo.
echo 配置 IIS...
echo.
echo 请按照以下步骤手动配置 IIS:
echo.
echo 1. 确保已安装 IIS 和 URL Rewrite 模块
echo 2. 打开 IIS 管理器
echo 3. 添加网站，物理路径指向: %PROJECT_DIR%\emr-frontend\dist
echo 4. 配置 URL Rewrite 规则（参考部署文档）
echo 5. 启动网站
echo.
echo 详细配置说明请查看: Windows_Server_2025_部署指南.md
echo.
pause
goto after_webserver

:setup_nginx
echo.
echo 配置 Nginx...
echo.
echo 请按照以下步骤手动配置 Nginx:
echo.
echo 1. 下载 Nginx for Windows: http://nginx.org/en/docs/windows.html
echo 2. 解压到 C:\nginx
echo 3. 配置 nginx.conf（参考部署文档中的配置示例）
echo 4. 启动 Nginx: C:\nginx\nginx.exe
echo.
echo 详细配置说明请查看: Windows_Server_2025_部署指南.md
echo.
pause
goto after_webserver

:skip_webserver
echo 跳过 Web 服务器配置

:after_webserver

echo.
echo [步骤 8/8] 启动后端服务
echo ----------------------------------------

echo 请选择后端启动方式:
echo   1. 直接运行（测试用）
echo   2. 使用 NSSM 创建 Windows 服务（推荐）
echo   3. 跳过（稍后手动启动）
echo.
choice /C 123 /M "选择启动方式"

if errorlevel 3 goto skip_start
if errorlevel 2 goto setup_service
if errorlevel 1 goto direct_start

:direct_start
echo.
echo 以后台模式启动后端服务...
echo 日志文件: %PROJECT_DIR%\emr-backend\backend.log
echo.
cd ..\emr-backend
start "EMR Backend" cmd /k "node dist\app.js > backend.log 2>&1"
echo ✓ 后端服务已启动
echo.
echo 访问地址: http://localhost:3000
goto after_start

:setup_service
echo.
echo 使用 NSSM 创建 Windows 服务...
echo.
echo 如果尚未安装 NSSM，请:
echo 1. 下载: https://nssm.cc/release/nssm-2.24.zip
echo 2. 解压到 C:\nssm-2.24
echo.
echo 然后运行以下命令:
echo   cd C:\nssm-2.24\win64
echo   nssm.exe install EMR-Backend
echo   nssm.exe set EMR-Backend Application "C:\Program Files\nodejs\node.exe"
echo   nssm.exe set EMR-Backend AppDirectory "%PROJECT_DIR%\emr-backend"
echo   nssm.exe set EMR-Backend AppParameters "%PROJECT_DIR%\emr-backend\dist\app.js"
echo   nssm.exe start EMR-Backend
echo.
pause
goto after_start

:skip_start
echo 跳过服务启动

:after_start

echo.
echo ======================================
echo   部署完成！
echo ======================================
echo.
echo 下一步操作:
echo.
echo 1. 配置防火墙规则:
echo    - 开放端口 80 (HTTP)
echo    - 如需远程访问，开放端口 3000
echo.
echo 2. 测试访问:
echo    - 浏览器访问: http://localhost
echo    - 默认账号: admin / admin123
echo.
echo 3. 查看详细文档:
echo    - %PROJECT_DIR%\Windows_Server_2025_部署指南.md
echo.
echo 4. 常用命令:
echo    - 查看后端日志: type %PROJECT_DIR%\emr-backend\backend.log
echo    - 重启后端: taskkill /IM node.exe ^&^& cd %PROJECT_DIR%\emr-backend ^&^& node dist\app.js
echo.
echo ======================================
echo.

pause
