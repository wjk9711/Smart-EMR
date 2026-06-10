@echo off
chcp 65001 >nul
echo ==========================================
echo 部署患者下发功能修复到云服务器
echo ==========================================
echo.

REM 设置服务器信息
set SERVER_IP=47.97.200.237
set SERVER_USER=root

echo 步骤 1: 上传修复后的代码文件到服务器...
echo.

REM 上传修改的文件
scp src\models\InpatientPatient.ts %SERVER_USER%@%SERVER_IP%:/tmp/InpatientPatient.ts
if errorlevel 1 (
    echo ❌ 上传 InpatientPatient.ts 失败
    pause
    exit /b 1
)

scp src\controllers\inpatientController.ts %SERVER_USER%@%SERVER_IP%:/tmp/inpatientController.ts
if errorlevel 1 (
    echo ❌ 上传 inpatientController.ts 失败
    pause
    exit /b 1
)

scp src\database\migrations\remove-idcard-unique-constraint.ts %SERVER_USER%@%SERVER_IP%:/tmp/remove-idcard-unique-constraint.ts
if errorlevel 1 (
    echo ❌ 上传迁移文件失败
    pause
    exit /b 1
)

scp fix-patient-assign.sh %SERVER_USER%@%SERVER_IP%:/tmp/fix-patient-assign.sh
if errorlevel 1 (
    echo ❌ 上传修复脚本失败
    pause
    exit /b 1
)

echo ✅ 所有文件上传成功
echo.

echo 步骤 2: 在服务器上执行修复...
echo.
echo 请在服务器上执行以下命令：
echo.
echo ssh %SERVER_USER%@%SERVER_IP%
echo cd /opt/emr/emr-backend
echo cp /tmp/InpatientPatient.ts src/models/InpatientPatient.ts
echo cp /tmp/inpatientController.ts src/controllers/inpatientController.ts
echo cp /tmp/remove-idcard-unique-constraint.ts src/database/migrations/remove-idcard-unique-constraint.ts
echo chmod +x /tmp/fix-patient-assign.sh
echo bash /tmp/fix-patient-assign.sh
echo.

pause
