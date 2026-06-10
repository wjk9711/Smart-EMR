import sequelize from './src/config/database'

async function checkPatientDataIsolation() {
  try {
    console.log('=== 检查患者数据隔离 ===\n')
    
    const [patients] = await sequelize.query(`
      SELECT 
        id, name, inpatient_no, unique_key, doctor_id, source_patient_id,
        (SELECT username FROM users WHERE id = doctor_id) as doctor_name
      FROM inpatient_patients
      ORDER BY id ASC
    `)
    
    console.log('所有患者列表:')
    console.table(patients)
    
    // 按医生分组
    const patientsByDoctor: any = {}
    for (const patient of patients as any[]) {
      const doctorId = patient.doctor_id
      if (!patientsByDoctor[doctorId]) {
        patientsByDoctor[doctorId] = []
      }
      patientsByDoctor[doctorId].push(patient)
    }
    
    console.log('\n按医生分组:')
    for (const [doctorId, docs] of Object.entries(patientsByDoctor)) {
      const doctorName = (docs as any[])[0].doctor_name || '未知'
      console.log(`\n👤 医生 ${doctorName} (ID=${doctorId}): ${(docs as any[]).length} 个患者`)
      for (const p of docs as any[]) {
        console.log(`   - ID=${p.id}, 姓名=${p.name}, 住院号=${p.inpatient_no}, KEY=${p.unique_key}`)
      }
    }
    
    // 检查病案
    console.log('\n\n=== 检查病案数据隔离 ===\n')
    
    const [records] = await sequelize.query(`
      SELECT 
        r.id, r.patient_id, r.record_type, r.case_no, r.unique_key, r.doctor_id, r.source_record_id,
        p.name as patient_name,
        (SELECT username FROM users WHERE id = r.doctor_id) as doctor_name
      FROM inpatient_records r
      LEFT JOIN inpatient_patients p ON r.patient_id = p.id
      ORDER BY r.id ASC
    `)
    
    console.log('所有病案列表:')
    console.table(records)
    
    // 检查是否有sourceRecordId不为null的记录
    const recordsWithSource = (records as any[]).filter((r: any) => r.source_record_id !== null)
    if (recordsWithSource.length > 0) {
      console.log('\n⚠️  警告：发现以下病案仍有source_record_id（应该为null）:')
      console.table(recordsWithSource)
    } else {
      console.log('\n✅ 所有病案的source_record_id都是null（正确）')
    }
    
    // 检查是否有sourcePatientId不为null的患者
    const patientsWithSource = (patients as any[]).filter((p: any) => p.source_patient_id !== null)
    if (patientsWithSource.length > 0) {
      console.log('\n⚠️  警告：发现以下患者仍有source_patient_id（应该为null）:')
      console.table(patientsWithSource)
    } else {
      console.log('\n✅ 所有患者的source_patient_id都是null（正确）')
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

checkPatientDataIsolation()
