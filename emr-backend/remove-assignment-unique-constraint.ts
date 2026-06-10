import sequelize from './src/config/database'

async function removeUniqueConstraint() {
  try {
    console.log('=== 移除 patient_assignments 的唯一约束 ===\n')
    
    // 1. 删除唯一索引
    console.log('1. 删除唯一索引 unique_patient_user_assignment...')
    await sequelize.query(`
      ALTER TABLE patient_assignments 
      DROP INDEX unique_patient_user_assignment
    `)
    console.log('✅ 唯一索引已删除\n')
    
    // 2. 添加普通索引（用于查询优化）
    console.log('2. 添加普通索引 idx_patient_user...')
    await sequelize.query(`
      CREATE INDEX idx_patient_user 
      ON patient_assignments (patientId, userId)
    `)
    console.log('✅ 普通索引已创建\n')
    
    // 3. 验证
    console.log('3. 验证索引...')
    const [indexes] = await sequelize.query('SHOW INDEX FROM patient_assignments')
    
    const uniqueIndexes = (indexes as any[]).filter((idx: any) => idx.Non_unique === 0)
    console.log(`唯一索引数量: ${uniqueIndexes.length}`)
    for (const idx of uniqueIndexes) {
      console.log(`  - ${idx.Key_name} (${idx.Column_name})`)
    }
    
    if (uniqueIndexes.length === 1 && uniqueIndexes[0].Key_name === 'PRIMARY') {
      console.log('\n✅ 只有PRIMARY是唯一索引（正确）')
    } else {
      console.log('\n⚠️  还有其他唯一索引')
    }
    
    process.exit(0)
  } catch (error: any) {
    if (error.original && error.original.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('⚠️  索引不存在，可能已经被删除')
      process.exit(0)
    }
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

removeUniqueConstraint()
