import sequelize from './src/config/database'

async function removeInpatientNoUniqueConstraint() {
  try {
    console.log('=== 移除住院号唯一约束 ===\n')
    
    // 检查当前索引
    const [indexes] = await sequelize.query('SHOW INDEX FROM inpatient_patients')
    const indexList = (indexes as any[]).map((idx: any) => idx.Key_name)
    
    console.log('当前索引:', indexList)
    
    // 删除 inpatient_no 唯一索引（如果存在）
    if (indexList.includes('inpatient_no')) {
      await sequelize.query('ALTER TABLE `inpatient_patients` DROP INDEX `inpatient_no`')
      console.log('✅ 已删除 inpatient_no 唯一索引')
    } else {
      console.log('⚠️  inpatient_no 索引不存在')
    }
    
    // 验证
    const [newIndexes] = await sequelize.query('SHOW INDEX FROM inpatient_patients')
    console.log(`\n剩余索引数量: ${(newIndexes as any[]).length}`)
    console.table(newIndexes)
    
    console.log('\n✅ 完成！现在住院号可以重复了。')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

removeInpatientNoUniqueConstraint()
