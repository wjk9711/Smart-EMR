import sequelize from './src/config/database'

async function checkIndexes() {
  try {
    console.log('=== inpatient_patients 索引 ===')
    const [indexes1] = await sequelize.query('SHOW INDEX FROM inpatient_patients')
    console.log(`索引数量: ${(indexes1 as any[]).length}`)
    console.table(indexes1)
    
    console.log('\n=== inpatient_records 索引 ===')
    const [indexes2] = await sequelize.query('SHOW INDEX FROM inpatient_records')
    console.log(`索引数量: ${(indexes2 as any[]).length}`)
    console.table(indexes2)
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkIndexes()
