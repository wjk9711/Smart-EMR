import sequelize from './src/config/database'

async function checkCurrentState() {
  try {
    console.log('=== 检查当前数据库状态 ===\n')
    
    // 1. 查看所有"小丽"患者
    console.log('1. 所有"小丽"患者:')
    const [patients] = await sequelize.query(`
      SELECT id, name, doctor_id, unique_key, inpatient_no, source_patient_id
      FROM inpatient_patients 
      WHERE name = '小丽'
      ORDER BY id
    `)
    console.table(patients)
    
    // 2. 查看所有分配记录
    console.log('\n2. 所有分配记录:')
    const [assignments] = await sequelize.query(`
      SELECT pa.id, pa.patientId, pa.userId, pa.copied_patient_id, u.username
      FROM patient_assignments pa
      JOIN users u ON pa.userId = u.id
      ORDER BY pa.id
    `)
    console.table(assignments)
    
    // 3. 检查哪些用户有copied_patient_id为null的记录
    console.log('\n3. copied_patient_id为null的分配记录:')
    const [nullAssignments] = await sequelize.query(`
      SELECT pa.id, pa.patientId, pa.userId, u.username
      FROM patient_assignments pa
      JOIN users u ON pa.userId = u.id
      WHERE pa.copied_patient_id IS NULL
    `)
    if ((nullAssignments as any[]).length > 0) {
      console.table(nullAssignments)
    } else {
      console.log('✅ 没有copied_patient_id为null的记录')
    }
    
    // 4. 统计每个用户的患者数量
    console.log('\n4. 每个用户的患者数量:')
    const [userStats] = await sequelize.query(`
      SELECT u.username, COUNT(p.id) as patient_count
      FROM users u
      LEFT JOIN inpatient_patients p ON u.id = p.doctor_id
      GROUP BY u.id, u.username
      ORDER BY u.id
    `)
    console.table(userStats)
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

checkCurrentState()
