# 数据隔离功能实现说明

## 📋 概述

实现了学生-教师数据隔离机制，确保：
- ✅ 每个学生用户创建的患者/病历/病案只属于该学生
- ✅ 学生只能查看自己创建的数据
- ✅ 教师可以查看所有学生提交审核的病历/病案
- ✅ 不同学生之间的数据完全隔离，不可相互查看

## 🔧 实现的修改

### 1. 数据库模型修改

#### 添加 doctorId 字段

**门诊患者表 (patients)**
- 新增字段：`doctor_id` (INTEGER UNSIGNED, nullable)
- 外键关联：`users.id`
- 索引：已添加 `doctor_id` 索引

**住院患者表 (inpatient_patients)**
- 新增字段：`doctor_id` (INTEGER UNSIGNED, nullable)
- 外键关联：`users.id`
- 索引：已添加 `doctor_id` 索引

**住院病案表 (inpatient_records)**
- 已有字段：`doctor_id`（无需修改）

### 2. 后端控制器修改

#### 门诊患者控制器 (patientController.ts)

**getPatients() - 获取患者列表**
```typescript
// 数据隔离逻辑
if (currentUser.roleType !== 'teacher') {
  where.doctorId = currentUser.id  // 学生只看自己的患者
}
// 教师可以看到所有患者
```

**createPatient() - 创建患者**
```typescript
// 自动关联当前医生
patientData.doctorId = currentUser.id
```

#### 住院患者控制器 (inpatientController.ts)

**getInpatientPatients() - 获取住院患者列表**
```typescript
// 数据隔离逻辑
if (currentUser.roleType !== 'teacher') {
  whereCondition.doctorId = currentUser.id
}
```

**createInpatientPatient() - 创建住院患者**
```typescript
// 自动关联当前医生
const patientData = {
  ...req.body,
  doctorId: currentUser.id,
}
```

**getInpatientRecords() - 获取病案列表**
```typescript
// 数据隔离逻辑
if (currentUser.roleType !== 'teacher') {
  whereCondition.doctorId = currentUser.id  // 学生只看自己的病案
}
// 教师可以看到所有病案（用于质控审核）
```

**createInpatientRecord() - 创建病案**
```typescript
// 自动关联当前医生
req.body.doctorId = currentUser.id
```

### 3. 前端模型更新

- `Patient.ts` - 添加 `doctorId?: number` 字段
- `InpatientPatient.ts` - 添加 `doctorId?: number` 字段

## 🎯 数据隔离规则

### 学生用户 (roleType = 'student')
- ✅ 只能查看自己创建的患者
- ✅ 只能查看自己创建的病案
- ✅ 创建患者/病案时自动关联自己的ID
- ❌ 无法查看其他学生的数据
- ❌ 无法查看教师的数据

### 教师用户 (roleType = 'teacher')
- ✅ 可以查看所有学生创建的患者
- ✅ 可以查看所有学生提交的病案（用于质控）
- ✅ 创建患者/病案时也关联自己的ID
- ✅ 可以审核学生提交的病历

### 管理员用户 (roleType = 'admin')
- ✅ 拥有最高权限，可以查看所有数据
- （当前实现中，管理员被视为非教师角色，需要单独处理）

## 📝 注意事项

### 现有数据处理

如果数据库中已有患者/病案数据，这些数据的 `doctor_id` 字段为 NULL。建议：

1. **方案一**：为现有数据分配默认医生ID
   ```sql
   UPDATE patients SET doctor_id = 1 WHERE doctor_id IS NULL;
   UPDATE inpatient_patients SET doctor_id = 1 WHERE doctor_id IS NULL;
   UPDATE inpatient_records SET doctor_id = 1 WHERE doctor_id IS NULL;
   ```

2. **方案二**：允许NULL值查询（当前实现）
   - 当前实现中，如果 `doctorId` 为 NULL，则该记录不会被任何学生看到
   - 只有教师可以看到这些记录

### 测试建议

1. **学生A登录**
   - 创建患者 → 应该能看到
   - 创建病案 → 应该能看到

2. **学生B登录**
   - 应该看不到学生A创建的患者和病案
   - 创建自己的患者和病案

3. **教师登录**
   - 应该能看到所有学生创建的患者和病案
   - 可以进行质控审核

## 🚀 后续优化建议

1. **完善管理员权限**
   - 当前管理员被当作普通用户处理
   - 建议添加 `roleType === 'admin'` 的特殊处理

2. **添加数据归属显示**
   - 在列表中显示数据创建者姓名
   - 方便教师识别是哪个学生创建的

3. **添加数据转移功能**
   - 允许管理员将数据从一个学生转移到另一个学生
   - 处理学生毕业/离职的情况

4. **审计日志**
   - 记录谁在什么时候访问了哪些数据
   - 增强安全性和可追溯性

## 📊 数据库迁移

迁移文件位置：`emr-backend/src/database/migrations/add-doctor-id-to-patients.ts`

执行迁移：
```bash
cd emr-backend
npm run db:migrate
```

迁移内容：
- 为 `patients` 表添加 `doctor_id` 字段
- 为 `inpatient_patients` 表添加 `doctor_id` 字段
- 添加相应的外键约束和索引
