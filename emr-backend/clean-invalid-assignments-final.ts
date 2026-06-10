import sequelize from './src/config/database'

async function cleanInvalidAssignments() {
  try {
    console.log('=== 清理无效的分配记录 ===\n')
    
    // 查找所有copied_patient_id为null的分配记录
    const [assignments] = await sequelize.query(`
      SELECT pa.id, pa.patientId, pa.userId, u.username
      FROM patient_assignments pa
      JOIN users u ON pa.userId = u.id
      WHERE pa.copied_patient_id IS NULL
    `)
    
    console.log(`发现 ${ (assignments as any[]).length } 条无效记录\n`)
    
    if ((assignments as any[]).length === 0) {
      console.log('✅ 没有需要清理的记录')
      process.exit(0)
      return
    }
    
    console.log('无效记录列表:')
    console.table(assignments)
    
    let deletedCount = 0
    
    for (const assignment of assignments as any[]) {
      await sequelize.query(`
        DELETE FROM patient_assignments WHERE id = ?
      `, { replacements: [assignment.id] })
      
      console.log(`✅ 删除记录 ID=${assignment.id} (用户: ${assignment.username})`)
      deletedCount++
    }
    
    console.log(`\n=== 清理完成 ===`)
    console.log(`✅ 已删除 ${deletedCount} 条无效记录`)
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

cleanInvalidAssignments()
