import sequelize from './src/config/database'

async function checkPatientAssignmentsTable() {
  try {
    console.log('=== 检查 patient_assignments 表结构 ===\n')
    
    const [columns] = await sequelize.query('DESCRIBE patient_assignments')
    console.log('表字段:')
    console.table(columns)
    
    // 特别检查 copied_patient_id 和 copied_at 字段
    const copiedPatientField = (columns as any[]).find((col: any) => col.Field === 'copied_patient_id')
    const copiedAtField = (columns as any[]).find((col: any) => col.Field === 'copied_at')
    
    if (copiedPatientField) {
      console.log('\n✅ copied_patient_id 字段存在')
    } else {
      console.log('\n❌ copied_patient_id 字段不存在！需要添加')
    }
    
    if (copiedAtField) {
      console.log('✅ copied_at 字段存在')
    } else {
      console.log('❌ copied_at 字段不存在！需要添加')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkPatientAssignmentsTable()
