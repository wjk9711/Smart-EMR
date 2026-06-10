# 患者下发功能 id_card 字段问题修复报告

## 问题描述

在云服务器上点击"下发患者"时，PM2 后端日志报错：

### 第一次错误（唯一约束冲突）
```
SequelizeUniqueConstraintError: id_card must be unique
Duplicate entry '350120199211055621' for key 'id_card'
```

**原因**：`inpatient_patients` 表中 `id_card` 字段设置了唯一约束，但下发患者时需要为不同用户创建相同患者的副本，导致身份证号重复。

### 第二次错误（字段长度超限）
```
SequelizeDatabaseError: Data too long for column 'id_card' at row 1
```

**原因**：代码尝试生成新的身份证号（原始18位 + 下划线 + 时间戳 + 随机数 = 28位），超过了数据库字段定义的 VARCHAR(18) 长度限制。

## 解决方案

### 1. 移除 id_card 字段的唯一约束

**修改文件**：`emr-backend/src/models/InpatientPatient.ts`

```typescript
// 修改前
idCard: {
  type: DataTypes.STRING(18),
  allowNull: false,
  unique: true,  // ❌ 移除这行
  comment: '身份证号',
},

// 修改后
idCard: {
  type: DataTypes.STRING(18),
  allowNull: false,
  // unique: true, // ✅ 注释掉，允许不同用户拥有相同身份证号的患者副本
  comment: '身份证号',
},
```

### 2. 创建数据库迁移脚本

**新建文件**：`emr-backend/src/database/migrations/remove-idcard-unique-constraint.ts`

该脚本会：
- 检查 `inpatient_patients` 表中 `id_card` 字段是否存在唯一索引
- 如果存在，则移除该唯一索引
- 提供回滚功能以恢复唯一约束

### 3. 移除生成新身份证号的逻辑

**修改文件**：`emr-backend/src/controllers/inpatientController.ts`

```typescript
// 修改前（第899-915行）
// 生成唯一的身份证号（在原始身份证号后添加时间戳和随机数）
const timestamp = Date.now().toString().slice(-6)
const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
const newIdCard = originalPatient.idCard 
  ? `${originalPatient.idCard}_${timestamp}${random}`
  : null

console.log(`    - 新身份证号: ${newIdCard || '(空)'}`)

const copiedPatient = await InpatientPatient.create({
  // ...
  idCard: newIdCard, // ❌ 使用超长的新身份证号
  // ...
})

// 修改后
// 复制患者数据（完全独立，不记录来源）
// 注意：由于已移除 id_card 的唯一约束，不同用户可以有相同身份证号的患者副本
const copiedPatient = await InpatientPatient.create({
  // ...
  idCard: originalPatient.idCard, // ✅ 直接使用原始身份证号
  // ...
})
```

## 部署步骤

### 方法一：使用自动化脚本（推荐）

1. **上传修复文件到服务器**
   ```bash
   # 在本地 Windows 执行
   deploy-fix.bat
   ```

2. **在服务器上执行修复**
   ```bash
   # SSH 登录服务器
   ssh root@47.97.200.237
   
   # 进入项目目录
   cd /opt/emr/emr-backend
   
   # 复制修复文件
   cp /tmp/InpatientPatient.ts src/models/InpatientPatient.ts
   cp /tmp/inpatientController.ts src/controllers/inpatientController.ts
   cp /tmp/remove-idcard-unique-constraint.ts src/database/migrations/remove-idcard-unique-constraint.ts
   
   # 执行修复脚本
   chmod +x /tmp/fix-patient-assign.sh
   bash /tmp/fix-patient-assign.sh
   ```

### 方法二：手动部署

1. **上传修改的文件到服务器**
   ```bash
   scp src/models/InpatientPatient.ts root@47.97.200.237:/opt/emr/emr-backend/src/models/
   scp src/controllers/inpatientController.ts root@47.97.200.237:/opt/emr/emr-backend/src/controllers/
   scp src/database/migrations/remove-idcard-unique-constraint.ts root@47.97.200.237:/opt/emr/emr-backend/src/database/migrations/
   ```

2. **在服务器上运行迁移**
   ```bash
   ssh root@47.97.200.237
   cd /opt/emr/emr-backend
   npx ts-node src/database/migrations/remove-idcard-unique-constraint.ts
   ```

3. **重启后端服务**
   ```bash
   pm2 restart emr-backend
   ```

## 验证修复

1. **检查 PM2 日志**
   ```bash
   pm2 logs emr-backend --lines 50
   ```
   确保没有错误信息。

2. **测试下发患者功能**
   - 以管理员身份登录
   - 选择一个患者
   - 点击"下发患者"
   - 选择要下发的用户
   - 确认下发成功

3. **验证数据隔离**
   - 切换到被下发的用户账号
   - 查看患者列表
   - 确认可以看到下发的患者副本
   - 确认患者基本信息（包括身份证号）与原始患者一致

## 技术说明

### 为什么可以允许多个用户有相同的身份证号？

在教学系统中：
1. **数据隔离**：每个用户只能看到自己创建或被下发的患者
2. **完全独立副本**：下发的患者是完全独立的副本，有自己的 `uniqueKey` 和 `inpatientNo`
3. **业务需求**：教学场景中，多个学生可能需要处理同一个真实患者的病例，因此需要保留相同的患者基本信息

### 唯一性保证

虽然 `id_card` 不再唯一，但系统通过以下字段保证数据的唯一性：
- `unique_key`：每个患者副本都有唯一的13位随机字符串
- `inpatient_no`：每个患者副本都有唯一的住院号
- `doctor_id`：标识患者所属的医生/用户

## 相关文件

- `emr-backend/src/models/InpatientPatient.ts` - 患者模型定义
- `emr-backend/src/controllers/inpatientController.ts` - 患者控制器（包含下发逻辑）
- `emr-backend/src/database/migrations/remove-idcard-unique-constraint.ts` - 数据库迁移脚本
- `fix-patient-assign.sh` - 服务器端修复脚本
- `deploy-fix.bat` - Windows 部署脚本

## 注意事项

1. **备份数据**：在执行迁移前，建议备份数据库
2. **测试环境验证**：建议先在测试环境验证修复效果
3. **监控日志**：部署后密切监控 PM2 日志，确保没有其他错误
4. **回滚方案**：如果出现问题，可以使用迁移脚本的 `down` 方法恢复唯一约束

## 修复完成标记

- [x] 移除 InpatientPatient 模型中 id_card 的唯一约束
- [x] 创建数据库迁移脚本
- [x] 移除生成新身份证号的逻辑
- [x] 创建自动化部署脚本
- [x] 编写修复文档
- [ ] 在云服务器上执行修复（待用户操作）
- [ ] 验证下发患者功能正常（待用户测试）
