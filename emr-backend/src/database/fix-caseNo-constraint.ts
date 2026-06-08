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
    console.log('现在每个患者在同一个病案类型下只能有一个病案')
    console.log('不同病案类型可以使用相同的病案号（住院号）')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 修复失败:', error)
    process.exit(1)
  }
}

fixCaseNoUniqueConstraint()
