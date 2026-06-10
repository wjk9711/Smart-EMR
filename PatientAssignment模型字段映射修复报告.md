# PatientAssignment模型字段映射修复报告

## ❌ 问题描述

执行下发患者功能时报错：
```
Unknown column 'copiedPatientId' in 'field list'
```

**错误SQL**:
```sql
SELECT `id`, `patientId`, `userId`, `assignedBy`, `isTemplate`, 
       `copiedPatientId`, `copiedAt`, `createdAt`, `updatedAt` 
FROM `patient_assignments` AS `PatientAssignment` 
WHERE `PatientAssignment`.`patientId` = 14 AND `PatientAssignment`.`userId` = 11 LIMIT 1;
```

## 🔍 问题分析

### 数据库字段命名不一致

检查`patient_assignments`表结构发现：

| 字段 | 数据库实际名称 | 命名风格 |
|------|--------------|---------|
| id | `id` | - |
| patientId | `patientId` | 驼峰 |
| userId | `userId` | 驼峰 |
| assignedBy | `assignedBy` | 驼峰 |
| isTemplate | `isTemplate` | 驼峰 |
| createdAt | `createdAt` | 驼峰 |
| updatedAt | `updatedAt` | 驼峰 |
| **copied_patient_id** | `copied_patient_id` | **下划线** ⚠️ |
| **copied_at** | `copied_at` | **下划线** ⚠️ |

**问题根源**：
- 原有字段使用**驼峰命名**（`patientId`, `userId`等）
- 新增字段使用**下划线命名**（`copied_patient_id`, `copied_at`）
- Sequelize模型的`underscored`配置无法同时匹配两种命名风格

### 尝试的解决方案

#### 方案1：设置`underscored: true`
```typescript
{
  underscored: true, // 所有字段转为下划线
}
```
**结果**: ❌ 失败
- Sequelize查询时使用`patient_id`，但数据库是`patientId`
- 错误：`Unknown column 'patient_id'`

#### 方案2：设置`underscored: false` + 手动指定字段名
```typescript
{
  underscored: false, // 保持驼峰命名
  copiedPatientId: {
    field: 'copied_patient_id', // 手动映射
  },
  copiedAt: {
    field: 'copied_at', // 手动映射
  }
}
```
**结果**: ✅ 成功
- 大部分字段使用驼峰命名（匹配数据库）
- 新字段通过`field`属性手动映射到下划线命名

## ✅ 修复方案

### 修改文件
`emr-backend/src/models/PatientAssignment.ts`

### 关键修改

#### 1. 保持underscored: false
```typescript
{
  sequelize,
  tableName: 'patient_assignments',
  timestamps: true,
  underscored: false, // ✅ 保持驼峰命名，匹配大部分字段
  // ...
}
```

#### 2. 为新字段添加field映射
```typescript
copiedPatientId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  comment: '复制后的患者ID',
  field: 'copied_patient_id', // ✅ 手动指定数据库字段名
  references: {
    model: 'inpatient_patients',
    key: 'id',
  },
  onDelete: 'SET NULL',
},
copiedAt: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: '复制时间',
  field: 'copied_at', // ✅ 手动指定数据库字段名
},
```

#### 3. 索引使用数据库实际字段名
```typescript
indexes: [
  {
    fields: ['patientId', 'userId'], // 驼峰
    unique: true,
    name: 'unique_patient_user_assignment',
  },
  {
    fields: ['userId'], // 驼峰
    name: 'idx_patient_assignments_user',
  },
  {
    fields: ['patientId'], // 驼峰
    name: 'idx_patient_assignments_patient',
  },
  {
    fields: ['copied_patient_id'], // ✅ 下划线（数据库实际名称）
    name: 'idx_copied_patient',
  },
]
```

## 🧪 验证结果

### 测试脚本
```bash
npx ts-node test-patient-assignment.ts
```

### 测试结果
```
=== 测试 PatientAssignment 模型 ===

1. 测试查询...
Executing (default): SELECT `id`, `patientId`, `userId`, `assignedBy`, 
                     `isTemplate`, `copied_patient_id` AS `copiedPatientId`, 
                     `copied_at` AS `copiedAt`, `createdAt`, `updatedAt` 
FROM `patient_assignments` AS `PatientAssignment` 
WHERE `PatientAssignment`.`patientId` = 14 AND `PatientAssignment`.`userId` = 11 LIMIT 1;
⚠️  没有找到记录（这是正常的，如果还没有下发过）

2. 测试创建...
Executing (default): INSERT INTO `patient_assignments` 
                     (`id`,`patientId`,`userId`,`assignedBy`,`isTemplate`,
                      `copied_patient_id`,`copied_at`,`createdAt`,`updatedAt`) 
VALUES (DEFAULT,?,?,?,?,?,?,?,?);
✅ 创建成功
   ID: 1
   patientId: 14
   userId: 11
   copiedPatientId: null

3. 清理测试数据...
Executing (default): DELETE FROM `patient_assignments` WHERE `id` = 1
✅ 已删除测试记录

🎉 PatientAssignment 模型工作正常！
```

### SQL分析
**生成的SQL正确**：
- 查询时：`copied_patient_id` AS `copiedPatientId` ✅
- 插入时：使用`copied_patient_id` ✅
- 其他字段：使用驼峰命名 ✅

## 📋 技术要点

### Sequelize字段映射机制

#### 默认行为
```typescript
// underscored: false（默认）
modelName: 'camelCase' → 数据库: 'camelCase'

// underscored: true
modelName: 'camelCase' → 数据库: 'camel_case'
```

#### 手动覆盖
```typescript
fieldName: {
  type: DataTypes.STRING,
  field: 'custom_db_name', // 手动指定数据库字段名
}
```

### 混合命名场景的最佳实践

当数据库字段命名不一致时：

1. **确定主要命名风格**
   - 统计各种命名风格的字段数量
   - 选择占多数的风格作为默认

2. **设置underscored配置**
   ```typescript
   underscored: false // 或 true，根据主要风格
   ```

3. **手动映射例外字段**
   ```typescript
   exceptionField: {
     type: DataTypes.XXX,
     field: 'actual_db_name', // 手动指定
   }
   ```

4. **索引使用数据库实际名称**
   ```typescript
   indexes: [
     { fields: ['actual_db_field_name'] }
   ]
   ```

## 🎯 总结

### 问题根源
- 数据库字段命名不一致（驼峰+下划线混合）
- Sequelize的`underscored`配置无法同时匹配两种风格

### 解决方案
- 保持`underscored: false`（匹配大部分驼峰字段）
- 为下划线字段添加`field`属性手动映射
- 索引使用数据库实际字段名

### 修复效果
- ✅ 查询功能正常
- ✅ 创建功能正常
- ✅ 下发患者功能可以正常使用
- ✅ 所有字段正确映射

### 经验教训
1. **数据库设计应保持命名一致性**
2. **迁移脚本应遵循现有命名规范**
3. **Sequelize的`field`属性可以解决命名不匹配问题**
4. **测试时应覆盖所有字段的读写操作**

---

**修复日期**: 2026-06-10  
**修复状态**: ✅ 已完成并验证通过  
**影响范围**: PatientAssignment模型  
**下一步**: 可以正常使用下发患者功能
