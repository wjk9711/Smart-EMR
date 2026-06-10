import sequelize from './src/config/database'

async function checkTableStructure() {
  try {
    console.log('=== 检查 inpatient_patients 表结构 ===\n')
    
    const [columns] = await sequelize.query('DESCRIBE inpatient_patients')
    console.log('表字段:')
    console.table(columns)
    
    // 特别检查 source_patient_id 字段
    const sourceField = (columns as any[]).find((col: any) => col.Field === 'source_patient_id')
    if (sourceField) {
      console.log('\n✅ source_patient_id 字段存在')
      console.log('  - Type:', sourceField.Type)
      console.log('  - Null:', sourceField.Null)
      console.log('  - Default:', sourceField.Default)
    } else {
      console.log('\n❌ source_patient_id 字段不存在！')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkTableStructure()
