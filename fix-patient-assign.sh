#!/bin/bash
# 修复患者下发功能 - id_card 字段问题
# 1. 移除 id_card 唯一约束
# 2. 移除生成新身份证号的逻辑

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

# 运行数据库迁移（移除 id_card 唯一约束）
echo "3. 运行数据库迁移..."
npx ts-node src/database/migrations/remove-idcard-unique-constraint.ts

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
echo "1. 移除了 InpatientPatient 模型中 id_card 字段的 unique 约束"
echo "2. 移除了下发患者时生成新身份证号的逻辑，直接使用原始身份证号"
echo "3. 运行了数据库迁移脚本，移除了数据库中的唯一索引"
echo ""
echo "现在可以正常下发患者了！"
echo ""
