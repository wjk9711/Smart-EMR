import sequelize from './src/config/database'

async function checkTable() {
  try {
    const [results] = await sequelize.query('DESCRIBE patient_assignments')
    console.log('patient_assignments 表结构:')
    console.table(results)
    
    const [indexes] = await sequelize.query('SHOW INDEX FROM patient_assignments')
    console.log('\n索引信息:')
    console.table(indexes)
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkTable()
