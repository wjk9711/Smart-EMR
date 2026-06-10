import sequelize from './src/config/database'

async function fixAssignmentRecords() {
  try {
    console.log('=== 修复 PatientAssignment 记录 ===\n')
    
    // 1. 查找所有copied_patient_id为null的分配记录
    const [assignments] = await sequelize.query(`
      SELECT pa.id, pa.patientId, pa.userId, 
             (SELECT username FROM users WHERE id = pa.userId) as user_name
      FROM patient_assignments pa
      WHERE pa.copied_patient_id IS NULL
    `)
    
    console.log(`发现 ${ (assignments as any[]).length } 条需要修复的分配记录\n`)
    
    if ((assignments as any[]).length === 0) {
      console.log('✅ 所有分配记录都已正确设置copied_patient_id')
      process.exit(0)
      return
    }
    
    console.log('需要修复的记录:')
    console.table(assignments)
    
    // 2. 为每条记录找到对应的副本患者
    let fixedCount = 0
    let notFoundCount = 0
    
    for (const assignment of assignments as any[]) {
      const originalPatientId = assignment.patientId
      const userId = assignment.userId
      
      // 查找该用户创建的、与原始患者同名的患者（可能是副本）
      const [originalPatient]: any = await sequelize.query(`
        SELECT name, inpatient_no FROM inpatient_patients WHERE id = ?
      `, { replacements: [originalPatientId] })
      
      if (!originalPatient || originalPatient.length === 0) {
        console.log(`⚠️  原始患者 ID=${originalPatientId} 不存在，跳过`)
        notFoundCount++
        continue
      }
      
      const patientName = originalPatient[0].name
      
      // 查找该用户创建的、同名但不同ID的患者
      const [copiedPatients]: any = await sequelize.query(`
        SELECT id, name, inpatient_no, unique_key 
        FROM inpatient_patients 
        WHERE doctor_id = ? 
          AND name = ?
          AND id != ?
        LIMIT 1
      `, { replacements: [userId, patientName, originalPatientId] })
      
      if (copiedPatients && copiedPatients.length > 0) {
        const copiedPatientId = copiedPatients[0].id
        
        // 更新分配记录
        await sequelize.query(`
          UPDATE patient_assignments 
          SET copied_patient_id = ?, copied_at = NOW()
          WHERE id = ?
        `, { replacements: [copiedPatientId, assignment.id] })
        
        console.log(`✅ 修复记录 ID=${assignment.id}: patientId=${originalPatientId} -> copied_patient_id=${copiedPatientId} (${copiedPatients[0].name})`)
        fixedCount++
      } else {
        console.log(`❌ 未找到用户 ${userId} 的副本患者 (原始患者: ${patientName}, ID=${originalPatientId})`)
        notFoundCount++
      }
    }
    
    console.log(`\n=== 修复完成 ===`)
    console.log(`✅ 成功修复: ${fixedCount} 条`)
    console.log(`❌ 无法修复: ${notFoundCount} 条`)
    
    // 3. 验证修复结果
    console.log('\n=== 验证修复结果 ===\n')
    const [verifyAssignments] = await sequelize.query(`
      SELECT pa.id, pa.patientId, pa.copied_patient_id, pa.userId,
             (SELECT username FROM users WHERE id = pa.userId) as user_name,
             (SELECT name FROM inpatient_patients WHERE id = pa.patientId) as original_name,
             (SELECT name FROM inpatient_patients WHERE id = pa.copied_patient_id) as copied_name
      FROM patient_assignments pa
      ORDER BY pa.id ASC
    `)
    
    console.log('所有分配记录:')
    console.table(verifyAssignments)
    
    const nullRecords = (verifyAssignments as any[]).filter((a: any) => a.copied_patient_id === null)
    if (nullRecords.length > 0) {
      console.log(`\n⚠️  仍有 ${nullRecords.length} 条记录的copied_patient_id为null`)
    } else {
      console.log('\n✅ 所有分配记录的copied_patient_id都已设置')
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

fixAssignmentRecords()
