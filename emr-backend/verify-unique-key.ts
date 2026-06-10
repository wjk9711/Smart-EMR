import sequelize from './src/config/database'
import { InpatientPatient, InpatientRecord } from './src/models'

async function verifyUniqueKeySystem() {
  try {
    console.log('=== 唯一KEY系统验证 ===\n')
    
    // 1. 检查所有患者是否有uniqueKey
    console.log('1. 检查患者uniqueKey...')
    const patients = await InpatientPatient.findAll({
      attributes: ['id', 'name', 'inpatientNo', 'uniqueKey', 'doctorId'],
      order: [['id', 'ASC']],
    })
    
    console.log(`   患者总数: ${patients.length}`)
    
    let patientsWithKey = 0
    let patientsWithoutKey = 0
    
    patients.forEach(patient => {
      const hasKey = patient.uniqueKey ? '✅' : '❌'
      if (patient.uniqueKey) {
        patientsWithKey++
      } else {
        patientsWithoutKey++
      }
      console.log(`   ${hasKey} ID=${patient.id}, 姓名=${patient.name}, 住院号=${patient.inpatientNo}, uniqueKey=${patient.uniqueKey || 'NULL'}, doctorId=${patient.doctorId}`)
    })
    
    console.log(`   统计: 有KEY=${patientsWithKey}, 无KEY=${patientsWithoutKey}`)
    
    // 2. 检查所有病案是否有uniqueKey
    console.log('\n2. 检查病案uniqueKey...')
    const records = await InpatientRecord.findAll({
      attributes: ['id', 'patientId', 'caseNo', 'uniqueKey', 'recordType', 'doctorId'],
      order: [['id', 'ASC']],
    })
    
    console.log(`   病案总数: ${records.length}`)
    
    let recordsWithKey = 0
    let recordsWithoutKey = 0
    
    records.forEach(record => {
      const hasKey = record.uniqueKey ? '✅' : '❌'
      if (record.uniqueKey) {
        recordsWithKey++
      } else {
        recordsWithoutKey++
      }
      console.log(`   ${hasKey} ID=${record.id}, patientId=${record.patientId}, caseNo=${record.caseNo}, uniqueKey=${record.uniqueKey || 'NULL'}, type=${record.recordType}, doctorId=${record.doctorId}`)
    })
    
    console.log(`   统计: 有KEY=${recordsWithKey}, 无KEY=${recordsWithoutKey}`)
    
    // 3. 检查唯一性
    console.log('\n3. 检查KEY唯一性...')
    
    const [patientDuplicates] = await sequelize.query(`
      SELECT unique_key, COUNT(*) as count 
      FROM inpatient_patients 
      WHERE unique_key IS NOT NULL
      GROUP BY unique_key 
      HAVING count > 1
    `)
    
    if ((patientDuplicates as any[]).length === 0) {
      console.log('   ✅ 患者KEY无重复')
    } else {
      console.log('   ❌ 患者KEY有重复:')
      console.table(patientDuplicates)
    }
    
    const [recordDuplicates] = await sequelize.query(`
      SELECT unique_key, COUNT(*) as count 
      FROM inpatient_records 
      WHERE unique_key IS NOT NULL
      GROUP BY unique_key 
      HAVING count > 1
    `)
    
    if ((recordDuplicates as any[]).length === 0) {
      console.log('   ✅ 病案KEY无重复')
    } else {
      console.log('   ❌ 病案KEY有重复:')
      console.table(recordDuplicates)
    }
    
    // 4. 按用户分组检查
    console.log('\n4. 按用户分组检查...')
    const [users] = await sequelize.query('SELECT id, username, role_type FROM users ORDER BY id')
    
    for (const user of users as any[]) {
      const userPatients = patients.filter(p => p.doctorId === user.id)
      const userRecords = records.filter(r => r.doctorId === user.id)
      
      console.log(`   用户 ${user.username} (ID=${user.id}, 角色=${user.role_type}):`)
      console.log(`     - 患者数: ${userPatients.length}`)
      console.log(`     - 病案数: ${userRecords.length}`)
      
      if (userPatients.length > 0) {
        const withKey = userPatients.filter(p => p.uniqueKey).length
        console.log(`     - 患者KEY覆盖率: ${withKey}/${userPatients.length} (${(withKey/userPatients.length*100).toFixed(1)}%)`)
      }
      
      if (userRecords.length > 0) {
        const withKey = userRecords.filter(r => r.uniqueKey).length
        console.log(`     - 病案KEY覆盖率: ${withKey}/${userRecords.length} (${(withKey/userRecords.length*100).toFixed(1)}%)`)
      }
    }
    
    // 5. 总结
    console.log('\n=== 验证总结 ===')
    console.log(`✅ 患者KEY覆盖率: ${patientsWithKey}/${patients.length} (${(patientsWithKey/patients.length*100).toFixed(1)}%)`)
    console.log(`✅ 病案KEY覆盖率: ${recordsWithKey}/${records.length} (${(recordsWithKey/records.length*100).toFixed(1)}%)`)
    console.log(`✅ 患者KEY唯一性: ${(patientDuplicates as any[]).length === 0 ? '通过' : '失败'}`)
    console.log(`✅ 病案KEY唯一性: ${(recordDuplicates as any[]).length === 0 ? '通过' : '失败'}`)
    
    if (patientsWithoutKey === 0 && recordsWithoutKey === 0 && 
        (patientDuplicates as any[]).length === 0 && (recordDuplicates as any[]).length === 0) {
      console.log('\n🎉 所有验证通过！唯一KEY系统工作正常。')
    } else {
      console.log('\n⚠️  存在一些问题，请检查上述输出。')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

verifyUniqueKeySystem()
