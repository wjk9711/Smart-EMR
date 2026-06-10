import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('=== 开始添加唯一KEY字段 ===\n')
  
  // 1. 为 inpatient_patients 表添加 unique_key 字段
  console.log('1. 添加 inpatient_patients.unique_key 字段...')
  await queryInterface.addColumn('inpatient_patients', 'unique_key', {
    type: DataTypes.STRING(13),
    allowNull: true,
    comment: '患者唯一标识（13位随机字符串）',
  })
  
  // 添加索引
  await queryInterface.addIndex('inpatient_patients', ['unique_key'], {
    unique: true,
    name: 'idx_patient_unique_key',
  })
  console.log('✅ inpatient_patients.unique_key 字段已添加')
  
  // 2. 为 inpatient_records 表添加 unique_key 字段
  console.log('\n2. 添加 inpatient_records.unique_key 字段...')
  await queryInterface.addColumn('inpatient_records', 'unique_key', {
    type: DataTypes.STRING(13),
    allowNull: true,
    comment: '病案唯一标识（13位随机字符串）',
  })
  
  // 添加索引
  await queryInterface.addIndex('inpatient_records', ['unique_key'], {
    unique: true,
    name: 'idx_record_unique_key',
  })
  console.log('✅ inpatient_records.unique_key 字段已添加')
  
  console.log('\n✅ 所有字段添加完成！')
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('=== 回滚：删除唯一KEY字段 ===\n')
  
  // 删除索引
  await queryInterface.removeIndex('inpatient_patients', 'idx_patient_unique_key')
  await queryInterface.removeIndex('inpatient_records', 'idx_record_unique_key')
  
  // 删除字段
  await queryInterface.removeColumn('inpatient_patients', 'unique_key')
  await queryInterface.removeColumn('inpatient_records', 'unique_key')
  
  console.log('✅ 回滚完成')
}
