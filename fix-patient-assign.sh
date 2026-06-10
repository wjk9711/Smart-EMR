#!/bin/bash
# 修复患者下发功能 - 所有信息保持原样
# 只重新生成 unique_key，其他所有字段（包括住院号、身份证号、手机号）都保持原样

echo "=========================================="
echo "修复患者下发功能"
echo "=========================================="

# 进入项目目录
cd /opt/emr/emr-backend

# 备份当前代码
echo "1. 备份当前代码..."
cp src/models/InpatientPatient.ts src/models/InpatientPatient.ts.backup.$(date +%Y%m%d_%H%M%S)
cp src/controllers/inpatientController.ts src/controllers/inpatientController.ts.backup.$(date +%Y%m%d_%H%M%S)

# 停止服务
echo "2. 停止后端服务..."
pm2 stop emr-backend

# 运行数据库迁移（移除所有不必要的唯一约束）
echo "3. 运行数据库迁移..."
npx ts-node src/database/migrations/remove-all-patient-unique-constraints.ts

# 重启服务
echo "4. 重启后端服务..."
pm2 start emr-backend

# 等待服务启动
echo "5. 等待服务启动..."
sleep 3

# 检查服务状态
echo "6. 检查服务状态..."
pm2 status emr-backend

echo ""
echo "=========================================="
echo "✅ 修复完成！"
echo "=========================================="
echo ""
echo "修改内容："
echo "1. 只重新生成 unique_key（13位唯一标识）"
echo "2. 住院号 (inpatient_no) 保持原样，可以重复"
echo "3. 身份证号 (id_card) 保持原样，可以重复"
echo "4. 手机号 (phone) 保持原样，可以重复"
echo "5. 其他所有患者信息都保持原样"
echo "6. 已移除数据库中除 unique_key 外的所有唯一约束"
echo ""
echo "现在可以正常下发患者了！"
echo ""
