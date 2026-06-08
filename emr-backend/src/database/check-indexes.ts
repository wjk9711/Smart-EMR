import sequelize from '../config/database'

async function checkIndexes() {
  console.log('检查 inpatient_records 表的索引...')
  
  try {
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM inpatient_records;
    `)
    
    console.log('\n当前索引列表：')
    console.log('===================')
    
    const uniqueIndexes = (indexes as any[]).filter((idx: any) => idx.Non_unique === 0)
    
    if (uniqueIndexes.length === 0) {
      console.log('✅ 没有唯一索引')
    } else {
      console.log('唯一索引：')
      uniqueIndexes.forEach((idx: any) => {
        console.log(`  - ${idx.Key_name}: ${idx.Column_name} (${idx.Seq_in_index})`)
      })
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 查询失败:', error)
    process.exit(1)
  }
}

checkIndexes()
