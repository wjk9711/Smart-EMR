import sequelize from './src/config/database'

async function addUniqueKeyFields() {
  try {
    console.log('=== 开始添加唯一KEY字段 ===\n')
    
    // 1. 为 inpatient_patients 表添加 unique_key 字段
    console.log('1. 添加 inpatient_patients.unique_key 字段...')
    await sequelize.query(`
      ALTER TABLE \`inpatient_patients\` 
      ADD COLUMN \`unique_key\` VARCHAR(13) NULL COMMENT '患者唯一标识（13位随机字符串）'
    `)
    
    await sequelize.query(`
      ALTER TABLE \`inpatient_patients\` 
      ADD UNIQUE INDEX \`idx_patient_unique_key\` (\`unique_key\`)
    `)
    console.log('✅ inpatient_patients.unique_key 字段已添加')
    
    // 2. 为 inpatient_records 表添加 unique_key 字段
    console.log('\n2. 添加 inpatient_records.unique_key 字段...')
    await sequelize.query(`
      ALTER TABLE \`inpatient_records\` 
      ADD COLUMN \`unique_key\` VARCHAR(13) NULL COMMENT '病案唯一标识（13位随机字符串）'
    `)
    
    await sequelize.query(`
      ALTER TABLE \`inpatient_records\` 
      ADD UNIQUE INDEX \`idx_record_unique_key\` (\`unique_key\`)
    `)
    console.log('✅ inpatient_records.unique_key 字段已添加')
    
    console.log('\n✅ 所有字段添加完成！')
    process.exit(0)
  } catch (error: any) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  字段已存在，跳过添加')
      process.exit(0)
    }
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

addUniqueKeyFields()
