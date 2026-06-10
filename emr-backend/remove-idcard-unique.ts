import sequelize from './src/config/database'

async function removeIdCardUniqueConstraint() {
  try {
    console.log('移除 inpatient_patients 表的 idCard 唯一约束...')
    
    // 检查当前索引
    const [indexes] = await sequelize.query('SHOW INDEX FROM inpatient_patients')
    const indexList = (indexes as any[]).map((idx: any) => idx.Key_name)
    
    console.log('当前索引:', indexList)
    
    // 删除 id_card 唯一索引（如果存在）
    if (indexList.includes('id_card')) {
      await sequelize.query('ALTER TABLE `inpatient_patients` DROP INDEX `id_card`')
      console.log('✅ 已删除 id_card 索引')
    } else {
      console.log('⚠️  id_card 索引不存在')
    }
    
    // 验证
    const [newIndexes] = await sequelize.query('SHOW INDEX FROM inpatient_patients')
    console.log(`\n剩余索引数量: ${(newIndexes as any[]).length}`)
    console.table(newIndexes)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

removeIdCardUniqueConstraint()
