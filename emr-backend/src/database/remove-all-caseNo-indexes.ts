import sequelize from '../config/database'

async function removeAllCaseNoIndexes() {
  console.log('开始删除所有 case_no 唯一索引...')
  
  try {
    // 1. 查询所有 case_no 相关的索引
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM inpatient_records WHERE Column_name = 'case_no';
    `)
    
    const caseNoIndexes = (indexes as any[]).filter((idx: any) => idx.Non_unique === 0)
    
    if (caseNoIndexes.length === 0) {
      console.log('✅ 没有需要删除的 case_no 索引')
    } else {
      console.log(`发现 ${caseNoIndexes.length} 个 case_no 唯一索引，开始删除...`)
      
      // 2. 删除所有 case_no 唯一索引
      for (const idx of caseNoIndexes) {
        const indexName = idx.Key_name
        console.log(`  删除索引: ${indexName}`)
        await sequelize.query(`ALTER TABLE inpatient_records DROP INDEX \`${indexName}\`;`)
        console.log(`  ✅ ${indexName} 已删除`)
      }
    }
    
    // 3. 检查是否已有联合唯一索引
    const [existingIndexes] = await sequelize.query(`
      SHOW INDEX FROM inpatient_records WHERE Key_name = 'idx_patient_record_type';
    `)
    
    if ((existingIndexes as any[]).length === 0) {
      // 4. 添加新的联合唯一索引
      console.log('\n添加联合唯一索引 (patient_id, record_type)...')
      await sequelize.query(`
        ALTER TABLE inpatient_records 
        ADD UNIQUE INDEX idx_patient_record_type (patient_id, record_type);
      `)
      console.log('✅ 联合唯一索引已创建')
    } else {
      console.log('\n✅ 联合唯一索引已存在，无需创建')
    }
    
    console.log('\n✅ 所有 case_no 唯一索引清理完成！')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 修复失败:', error)
    process.exit(1)
  }
}

removeAllCaseNoIndexes()
