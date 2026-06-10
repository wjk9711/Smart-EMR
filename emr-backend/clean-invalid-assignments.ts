import sequelize from './src/config/database'

async function cleanInvalidAssignments() {
  try {
    console.log('=== 清理无效的 PatientAssignment 记录 ===\n')
    
    // 查找所有copied_patient_id为null的分配记录
    const [assignments] = await sequelize.query(`
      SELECT pa.id, pa.patientId, pa.userId,
             (SELECT username FROM users WHERE id = pa.userId) as user_name,
             (SELECT name FROM inpatient_patients WHERE id = pa.patientId) as patient_name
      FROM patient_assignments pa
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
    
    // 询问是否删除
    console.log('\n⚠️  这些记录表示下发失败，建议删除。\n')
    console.log('按回车键继续删除，或按 Ctrl+C 取消...')
    
    // 自动确认（生产环境应该交互式确认）
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question('确认删除？(y/n): ', async (answer: string) => {
      rl.close()
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ 已取消')
        process.exit(0)
        return
      }
      
      let deletedCount = 0
      
      for (const assignment of assignments as any[]) {
        await sequelize.query(`
          DELETE FROM patient_assignments WHERE id = ?
        `, { replacements: [assignment.id] })
        
        console.log(`✅ 删除记录 ID=${assignment.id} (用户: ${assignment.user_name}, 患者: ${assignment.patient_name})`)
        deletedCount++
      }
      
      console.log(`\n=== 清理完成 ===`)
      console.log(`✅ 已删除 ${deletedCount} 条无效记录`)
      
      // 验证
      const [remaining] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM patient_assignments 
        WHERE copied_patient_id IS NULL
      `)
      
      const remainingCount = (remaining as any[])[0].count
      if (remainingCount === 0) {
        console.log('✅ 所有无效记录已清理')
      } else {
        console.log(`⚠️  仍有 ${remainingCount} 条无效记录`)
      }
      
      process.exit(0)
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

cleanInvalidAssignments()
