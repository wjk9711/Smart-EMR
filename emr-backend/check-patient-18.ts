import sequelize from './src/config/database'
import { InpatientPatient, InpatientRecord, PatientAssignment } from './src/models'

async function checkPatient() {
  console.log('检查患者"小丽" (ID=18)...\n')
  
  try {
    // 1. 查询患者
    const patient = await InpatientPatient.findByPk(18)
    
    if (!patient) {
      console.log('❌ 患者不存在')
      process.exit(0)
      return
    }
    
    console.log('患者信息:')
    console.log(`  ID: ${patient.id}`)
    console.log(`  姓名: ${patient.name}`)
    console.log(`  住院号: ${patient.inpatientNo}`)
    console.log(`  医生ID: ${patient.doctorId}`)
    console.log('')
    
    // 2. 查询病案
    const records = await InpatientRecord.findAll({
      where: { patientId: patient.id },
    })
    
    console.log(`病案数量: ${records.length}`)
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. ID=${record.id}, 类型=${record.recordType}`)
    })
    console.log('')
    
    // 3. 查询分配记录
    const assignments = await PatientAssignment.findAll({
      where: { patientId: patient.id },
    })
    
    console.log(`分配记录数量: ${assignments.length}`)
    assignments.forEach((assignment, index) => {
      console.log(`  ${index + 1}. ID=${assignment.id}, userId=${assignment.userId}, copiedPatientId=${assignment.copiedPatientId}`)
    })
    console.log('')
    
    // 4. 查找副本患者
    if (assignments.length > 0) {
      console.log('查找副本患者...')
      for (const assignment of assignments) {
        if (assignment.copiedPatientId) {
          const copy = await InpatientPatient.findByPk(assignment.copiedPatientId)
          if (copy) {
            console.log(`  副本患者 ID=${copy.id}, doctorId=${copy.doctorId}, name=${copy.name}`)
            
            // 查询副本患者的病案
            const copyRecords = await InpatientRecord.findAll({
              where: { patientId: copy.id },
            })
            console.log(`    病案数量: ${copyRecords.length}`)
            copyRecords.forEach((r, i) => {
              console.log(`      ${i + 1}. ID=${r.id}, 类型=${r.recordType}`)
            })
          }
        } else {
          console.log(`  分配记录 ID=${assignment.id} 没有copiedPatientId`)
        }
      }
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 查询失败:', error)
    process.exit(1)
  }
}

checkPatient()
