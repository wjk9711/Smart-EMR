# ======================================
# EMR系统 Windows Server 2025 PowerShell 部署脚本
# 使用方法: 以管理员身份运行 PowerShell
#           .\deploy-windows-server.ps1
# ======================================

# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  EMR系统 Windows Server 2025 部署脚本" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[错误] 请以管理员身份运行此脚本！" -ForegroundColor Red
    Write-Host "右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 配置变量
$ProjectDir = "C:\emr-system"
$BackendPort = 3000

# ======================================
# 步骤 1: 检查系统环境
# ======================================
Write-Host "[步骤 1/8] 检查系统环境" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js 未安装" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查 npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm 已安装: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm 未安装" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查 MySQL
try {
    mysql --version | Out-Null
    Write-Host "✓ MySQL 已安装" -ForegroundColor Green
} catch {
    Write-Host "⚠ MySQL 命令行工具未找到（可能仍可正常使用）" -ForegroundColor Yellow
}

Write-Host ""

# ======================================
# 步骤 2: 设置项目目录
# ======================================
Write-Host "[步骤 2/8] 设置项目目录" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path $ProjectDir) {
    Write-Host "✓ 项目目录已存在: $ProjectDir" -ForegroundColor Green
} else {
    Write-Host "创建项目目录..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $ProjectDir -Force | Out-Null
    Write-Host "✓ 项目目录已创建" -ForegroundColor Green
}

Set-Location $ProjectDir

Write-Host ""

# ======================================
# 步骤 3: 获取项目代码
# ======================================
Write-Host "[步骤 3/8] 获取项目代码" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path ".git") {
    Write-Host "检测到 Git 仓库，拉取最新代码..." -ForegroundColor Cyan
    git pull origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 代码更新成功" -ForegroundColor Green
    } else {
        Write-Host "⚠ Git 拉取失败，将使用现有代码" -ForegroundColor Yellow
    }
} else {
    Write-Host "未检测到 Git 仓库" -ForegroundColor Yellow
    Write-Host "请手动克隆或上传项目文件到: $ProjectDir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "推荐命令:" -ForegroundColor Cyan
    Write-Host "  git clone https://github.com/wjk9711/Smart-EMR.git ." -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "是否继续部署？(Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
}

Write-Host ""

# ======================================
# 步骤 4: 配置和构建后端
# ======================================
Write-Host "[步骤 4/8] 配置和构建后端" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Set-Location "emr-backend"

# 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host "创建 .env 配置文件..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "⚠ 请编辑 $ProjectDir\emr-backend\.env 文件" -ForegroundColor Yellow
    Write-Host "配置数据库连接信息和其他参数" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按回车键打开 .env 文件进行编辑"
    notepad .env
    Write-Host ""
    Read-Host "编辑完成后按回车键继续"
}

Write-Host "安装后端依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 后端依赖安装失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "✓ 后端依赖安装完成" -ForegroundColor Green

Write-Host "构建后端代码..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 后端构建失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "✓ 后端构建完成" -ForegroundColor Green

Write-Host ""

# ======================================
# 步骤 5: 初始化数据库
# ======================================
Write-Host "[步骤 5/8] 初始化数据库" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

$initDb = Read-Host "是否要运行数据库迁移和种子数据？(Y/N)"
if ($initDb -eq "Y" -or $initDb -eq "y") {
    Write-Host "运行数据库迁移..." -ForegroundColor Cyan
    npm run db:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠ 数据库迁移失败，请检查数据库配置" -ForegroundColor Yellow
    } else {
        Write-Host "✓ 数据库迁移完成" -ForegroundColor Green
    }

    Write-Host "填充初始数据..." -ForegroundColor Cyan
    npm run db:seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠ 数据填充失败" -ForegroundColor Yellow
    } else {
        Write-Host "✓ 初始数据填充完成" -ForegroundColor Green
    }
} else {
    Write-Host "跳过数据库初始化" -ForegroundColor Yellow
}

Write-Host ""

# ======================================
# 步骤 6: 配置和构建前端
# ======================================
Write-Host "[步骤 6/8] 配置和构建前端" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Set-Location "..\emr-frontend"

Write-Host "安装前端依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 前端依赖安装失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "✓ 前端依赖安装完成" -ForegroundColor Green

Write-Host "构建前端生产版本..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 前端构建失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "✓ 前端构建完成" -ForegroundColor Green
Write-Host "输出目录: $ProjectDir\emr-frontend\dist" -ForegroundColor Cyan

Write-Host ""

# ======================================
# 步骤 7: 配置 Web 服务器
# ======================================
Write-Host "[步骤 7/8] 配置 Web 服务器" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "请选择 Web 服务器方案:" -ForegroundColor Cyan
Write-Host "  1. IIS (Windows内置，推荐)" -ForegroundColor White
Write-Host "  2. Nginx for Windows" -ForegroundColor White
Write-Host "  3. 跳过（稍后手动配置）" -ForegroundColor White
Write-Host ""

$webServerChoice = Read-Host "选择Web服务器 (1/2/3)"

switch ($webServerChoice) {
    "1" {
        Write-Host ""
        Write-Host "配置 IIS..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "请按照以下步骤手动配置 IIS:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. 确保已安装 IIS 和 URL Rewrite 模块" -ForegroundColor White
        Write-Host "   PowerShell 命令: Install-WindowsFeature -Name Web-Server -IncludeManagementTools" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. 下载并安装 URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor White
        Write-Host ""
        Write-Host "3. 打开 IIS 管理器" -ForegroundColor White
        Write-Host ""
        Write-Host "4. 添加网站，物理路径指向: $ProjectDir\emr-frontend\dist" -ForegroundColor White
        Write-Host ""
        Write-Host "5. 配置 URL Rewrite 规则（参考部署文档）" -ForegroundColor White
        Write-Host ""
        Write-Host "6. 启动网站" -ForegroundColor White
        Write-Host ""
        Write-Host "详细配置说明请查看: Windows_Server_2025_部署指南.md" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "按回车键继续"
    }
    "2" {
        Write-Host ""
        Write-Host "配置 Nginx..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "请按照以下步骤手动配置 Nginx:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. 下载 Nginx for Windows: http://nginx.org/en/docs/windows.html" -ForegroundColor White
        Write-Host ""
        Write-Host "2. 解压到 C:\nginx" -ForegroundColor White
        Write-Host ""
        Write-Host "3. 配置 nginx.conf（参考部署文档中的配置示例）" -ForegroundColor White
        Write-Host ""
        Write-Host "4. 启动 Nginx: C:\nginx\nginx.exe" -ForegroundColor White
        Write-Host ""
        Write-Host "详细配置说明请查看: Windows_Server_2025_部署指南.md" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "按回车键继续"
    }
    default {
        Write-Host "跳过 Web 服务器配置" -ForegroundColor Yellow
    }
}

Write-Host ""

# ======================================
# 步骤 8: 启动后端服务
# ======================================
Write-Host "[步骤 8/8] 启动后端服务" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "请选择后端启动方式:" -ForegroundColor Cyan
Write-Host "  1. 直接运行（测试用）" -ForegroundColor White
Write-Host "  2. 使用 NSSM 创建 Windows 服务（推荐）" -ForegroundColor White
Write-Host "  3. 跳过（稍后手动启动）" -ForegroundColor White
Write-Host ""

$startChoice = Read-Host "选择启动方式 (1/2/3)"

switch ($startChoice) {
    "1" {
        Write-Host ""
        Write-Host "以后台模式启动后端服务..." -ForegroundColor Cyan
        Write-Host "日志文件: $ProjectDir\emr-backend\backend.log" -ForegroundColor Cyan
        Write-Host ""
        
        Set-Location "..\emr-backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "node dist\app.js > backend.log 2>&1" -WindowStyle Normal
        
        Write-Host "✓ 后端服务已启动" -ForegroundColor Green
        Write-Host ""
        Write-Host "访问地址: http://localhost:$BackendPort" -ForegroundColor Cyan
    }
    "2" {
        Write-Host ""
        Write-Host "使用 NSSM 创建 Windows 服务..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "如果尚未安装 NSSM，请:" -ForegroundColor Yellow
        Write-Host "1. 下载: https://nssm.cc/release/nssm-2.24.zip" -ForegroundColor White
        Write-Host "2. 解压到 C:\nssm-2.24" -ForegroundColor White
        Write-Host ""
        Write-Host "然后运行以下命令:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  cd C:\nssm-2.24\win64" -ForegroundColor Gray
        Write-Host "  nssm.exe install EMR-Backend" -ForegroundColor Gray
        Write-Host "  nssm.exe set EMR-Backend Application `"C:\Program Files\nodejs\node.exe`"" -ForegroundColor Gray
        Write-Host "  nssm.exe set EMR-Backend AppDirectory `"$ProjectDir\emr-backend`"" -ForegroundColor Gray
        Write-Host "  nssm.exe set EMR-Backend AppParameters `"$ProjectDir\emr-backend\dist\app.js`"" -ForegroundColor Gray
        Write-Host "  nssm.exe start EMR-Backend" -ForegroundColor Gray
        Write-Host ""
        Read-Host "按回车键继续"
    }
    default {
        Write-Host "跳过服务启动" -ForegroundColor Yellow
    }
}

Write-Host ""

# ======================================
# 部署完成
# ======================================
Write-Host "======================================" -ForegroundColor Green
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 配置防火墙规则:" -ForegroundColor White
Write-Host "   - 开放端口 80 (HTTP)" -ForegroundColor Gray
Write-Host "   - 如需远程访问，开放端口 $BackendPort" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 测试访问:" -ForegroundColor White
Write-Host "   - 浏览器访问: http://localhost" -ForegroundColor Gray
Write-Host "   - 默认账号: admin / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 查看详细文档:" -ForegroundColor White
Write-Host "   - $ProjectDir\Windows_Server_2025_部署指南.md" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 常用命令:" -ForegroundColor White
Write-Host "   - 查看后端日志: Get-Content $ProjectDir\emr-backend\backend.log -Tail 50" -ForegroundColor Gray
Write-Host "   - 重启后端: Stop-Process -Name node; cd $ProjectDir\emr-backend; node dist\app.js" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Read-Host "按回车键退出"
