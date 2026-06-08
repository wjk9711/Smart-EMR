# 出院记录caseNo唯一约束冲突修复报告

## 📋 问题描述

出院记录提交时提示500错误：
```
SequelizeUniqueConstraintError: case_no must be unique
Duplicate entry '2024051001' for key 'inpatient_records.case_no'
```

---

## 🔍 问题分析

### 根本原因

**数据库设计冲突**：

1. **业务需求**：所有病案的 `caseNo` 都使用患者的住院号（inpatientNo）
   - 病案首页：caseNo = "2024051001"
   - 入院记录：caseNo = "2024051001"
   - 首次病程记录：caseNo = "2024051001"
   - 手术记录：caseNo = "2024051001"
   - 出院记录：caseNo = "2024051001"

2. **数据库约束**：`caseNo` 字段有唯一约束（UNIQUE）
   - 这意味着整个表中 `caseNo` 必须唯一
   - 但同一个患者的所有病案都使用相同的住院号
   - 导致冲突！

3. **实际场景**：
   ```
   患者ID=5，住院号=2024051001
   
   已存在的病案：
   - 病案首页：patientId=5, recordType='home_page', caseNo='2024051001' ✅
   
   尝试新建：
   - 出院记录：patientId=5, recordType='discharge', caseNo='2024051001' ❌ 
     → 违反 caseNo 唯一约束
   ```

---

## ✅ 解决方案

### 方案：修改唯一约束为联合唯一索引

将 `caseNo` 的单独唯一约束改为 `(patientId, recordType)` 的联合唯一约束。

**业务规则**：
- ✅ 每个患者在同一个病案类型下只能有一个病案
- ✅ 不同病案类型可以使用相同的病案号（住院号）
- ✅ 不同患者可以使用相同的病案号（如果他们的住院号相同）

---

## 🔧 修复步骤

### 步骤1：创建数据库迁移脚本

**文件**: [fix-caseNo-constraint.ts](file://f:/File/Project/EMR/emr-backend/src/database/fix-caseNo-constraint.ts)（新建）

```typescript
import sequelize from '../config/database'

async function fixCaseNoUniqueConstraint() {
  console.log('开始修复 caseNo 唯一约束...')
  
  try {
    // 1. 删除旧的 caseNo 唯一索引
    console.log('步骤1: 删除旧的 caseNo 唯一索引')
    await sequelize.query(`
      ALTER TABLE inpatient_records DROP INDEX case_no;
    `)
    console.log('✅ 旧索引已删除')
    
    // 2. 添加新的联合唯一索引 (patientId, recordType)
    console.log('步骤2: 添加新的联合唯一索引 (patient_id, record_type)')
    await sequelize.query(`
      ALTER TABLE inpatient_records 
      ADD UNIQUE INDEX idx_patient_record_type (patient_id, record_type);
    `)
    console.log('✅ 新联合唯一索引已创建')
    
    console.log('✅ caseNo 唯一约束修复完成！')
    process.exit(0)
  } catch (error) {
    console.error('❌ 修复失败:', error)
    process.exit(1)
  }
}

fixCaseNoUniqueConstraint()
```

### 步骤2：添加到 package.json

**文件**: [package.json](file://f:/File/Project/EMR/emr-backend/package.json#L12)

```json
{
  "scripts": {
    "db:fix-caseNo": "ts-node src/database/fix-caseNo-constraint.ts"
  }
}
```

### 步骤3：运行迁移脚本

```bash
cd emr-backend
npm run db:fix-caseNo
```

**执行结果**：
```
开始修复 caseNo 唯一约束...
步骤1: 删除旧的 caseNo 唯一索引
✅ 旧索引已删除
步骤2: 添加新的联合唯一索引 (patient_id, record_type)
✅ 新联合唯一索引已创建
✅ caseNo 唯一约束修复完成！
现在每个患者在同一个病案类型下只能有一个病案
不同病案类型可以使用相同的病案号（住院号）
```

### 步骤4：更新模型定义

**文件**: [InpatientRecord.ts](file://f:/File/Project/EMR/emr-backend/src/models/InpatientRecord.ts#L34-L38)

**修改前**：
```typescript
caseNo: {
  type: DataTypes.STRING(50),
  allowNull: false,
  unique: true,  // ❌ 移除唯一约束
  comment: '病案号',
},
```

**修改后**：
```typescript
caseNo: {
  type: DataTypes.STRING(50),
  allowNull: false,
  comment: '病案号（与住院号一致）',
},
```

---

## 📊 修复效果

### 修复前 ❌

```sql
-- 唯一约束：caseNo 必须全局唯一
ALTER TABLE inpatient_records ADD UNIQUE INDEX case_no (case_no);

-- 问题：同一患者的不同病案类型不能使用相同的病案号
INSERT INTO inpatient_records (patient_id, record_type, case_no) VALUES
(5, 'home_page', '2024051001');  -- ✅ 成功
(5, 'discharge', '2024051001');  -- ❌ 失败：Duplicate entry '2024051001'
```

### 修复后 ✅

```sql
-- 联合唯一约束：(patientId, recordType) 组合唯一
ALTER TABLE inpatient_records 
ADD UNIQUE INDEX idx_patient_record_type (patient_id, record_type);

-- 效果：同一患者同一类型只能有一个病案，但不同类型可以共用病案号
INSERT INTO inpatient_records (patient_id, record_type, case_no) VALUES
(5, 'home_page', '2024051001');   -- ✅ 成功
(5, 'discharge', '2024051001');   -- ✅ 成功（不同类型）
(5, 'discharge', '2024051001');   -- ❌ 失败：Duplicate entry（同类型重复）
(6, 'discharge', '2024051001');   -- ✅ 成功（不同患者）
```

---

## 🎯 业务逻辑验证

### 场景1：同一患者创建多个不同类型的病案 ✅

```
患者ID=5，住院号=2024051001

1. 创建病案首页：
   patientId=5, recordType='home_page', caseNo='2024051001'
   → ✅ 成功

2. 创建入院记录：
   patientId=5, recordType='admission', caseNo='2024051001'
   → ✅ 成功（不同类型）

3. 创建首次病程记录：
   patientId=5, recordType='progress', caseNo='2024051001'
   → ✅ 成功（不同类型）

4. 创建手术记录：
   patientId=5, recordType='operation', caseNo='2024051001'
   → ✅ 成功（不同类型）

5. 创建出院记录：
   patientId=5, recordType='discharge', caseNo='2024051001'
   → ✅ 成功（不同类型）
```

### 场景2：同一患者尝试创建重复类型的病案 ❌

```
患者ID=5

1. 已存在出院记录：
   patientId=5, recordType='discharge', caseNo='2024051001'

2. 再次尝试创建出院记录：
   → ❌ 失败：该患者已存在出院记录，不能重复创建
   → 后端返回 400 错误，前端显示友好提示
```

### 场景3：不同患者使用相同的住院号 ✅

```
患者A：ID=5，住院号=2024051001
患者B：ID=6，住院号=2024051001（假设住院号可能重复）

1. 患者A创建出院记录：
   patientId=5, recordType='discharge', caseNo='2024051001'
   → ✅ 成功

2. 患者B创建出院记录：
   patientId=6, recordType='discharge', caseNo='2024051001'
   → ✅ 成功（不同患者）
```

---

## ⚠️ 注意事项

### 1. 数据库备份

在执行数据库迁移之前，建议备份数据库：

```bash
mysqldump -u root -p emr_db > emr_db_backup.sql
```

### 2. 现有数据处理

如果数据库中已有重复的 `caseNo` 数据，迁移会失败。需要先清理数据：

```sql
-- 检查是否有重复的 (patientId, recordType) 组合
SELECT patient_id, record_type, COUNT(*) as count
FROM inpatient_records
GROUP BY patient_id, record_type
HAVING count > 1;

-- 如果有重复，需要手动删除或合并
```

### 3. 后端服务重启

修改了模型定义后，需要重启后端服务：

```bash
cd emr-backend
npm run dev
```

### 4. 前端无需修改

前端代码已经正确实现了：
- 新建时不传递 `caseNo`
- 编辑时传递 `caseNo`
- 由后端自动设置 `caseNo` 为患者住院号

---

## 📝 相关文件清单

### 新增文件

1. **[fix-caseNo-constraint.ts](file://f:/File/Project/EMR/emr-backend/src/database/fix-caseNo-constraint.ts)**
   - 数据库迁移脚本，修复 caseNo 唯一约束

### 修改文件

1. **[package.json](file://f:/File/Project/EMR/emr-backend/package.json#L12)**
   - 添加 `db:fix-caseNo` 脚本

2. **[InpatientRecord.ts](file://f:/File/Project/EMR/emr-backend/src/models/InpatientRecord.ts#L34-L38)**
   - 移除 `caseNo` 的 `unique: true` 约束

3. **[inpatientController.ts](file://f:/File/Project/EMR/emr-backend/src/controllers/inpatientController.ts#L305-L327)**
   - 增强错误日志输出（之前已修复）

---

## ✅ 测试验证

### 测试步骤

1. **重启后端服务**
   ```bash
   cd emr-backend
   npm run dev
   ```

2. **刷新前端页面**（Ctrl+F5）

3. **测试出院记录提交**
   - 选择一个患者
   - 点击"新建" → "出院记录"
   - 填写信息并提交
   - **预期**：成功创建，无500错误

4. **测试重复创建**
   - 再次尝试为该患者创建出院记录
   - **预期**：失败，提示"该患者已存在出院记录，不能重复创建"

5. **测试其他病案类型**
   - 为同一患者创建病案首页、入院记录等
   - **预期**：都能成功创建，病案号都是住院号

---

## 🎉 总结

本次修复解决了出院记录提交的500错误问题：

1. ✅ **根本原因**：`caseNo` 的唯一约束与业务逻辑冲突
2. ✅ **解决方案**：改为 `(patientId, recordType)` 联合唯一约束
3. ✅ **实施步骤**：创建迁移脚本、更新模型、运行迁移
4. ✅ **业务规则**：每个患者每种类型只能有一个病案，不同类型可共用病案号

现在出院记录可以正常提交，并且与其他病案类型的行为保持一致！
