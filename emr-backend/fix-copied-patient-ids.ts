import sequelize from './src/config/database'
import { PatientAssignment, InpatientPatient } from './src/models'

async function fixCopiedPatientIds() {
  console.log('开始修复 copiedPatientId 为 NULL 的分配记录...')
  
  try {
    // 1. 查找所有 copiedPatientId 为 NULL 的分配记录
    const assignments = await PatientAssignment.findAll({
      where: {
        copiedPatientId: null,
      },
    })
    
    if (assignments.length === 0) {
      console.log('✅ 没有需要修复的分配记录')
      process.exit(0)
      return
    }
    
    console.log(`发现 ${assignments.length} 条需要修复的分配记录`)
    
    const transaction = await sequelize.transaction()
    
    try {
      let fixedCount = 0
      
      for (const assignment of assignments) {
        console.log(`\n处理分配记录 ID=${assignment.id}:`)
        console.log(`  - patientId (原始): ${assignment.patientId}`)
        console.log(`  - userId: ${assignment.userId}`)
        
        // 查找原始患者
        const originalPatient = await InpatientPatient.findByPk(assignment.patientId, { transaction })
        
        if (!originalPatient) {
          console.log(`  ❌ 原始患者不存在，跳过`)
          continue
        }
        
        // 查找该用户创建的、与原始患者同名同住院号的患者（副本）
        const potentialCopies = await InpatientPatient.findAll({
          where: {
            doctorId: assignment.userId,
            name: originalPatient.name,
            inpatientNo: originalPatient.inpatientNo,
          },
          transaction,
        })
        
        if (potentialCopies.length === 0) {
          console.log(`  ⚠️  未找到副本患者，可能需要重新下发`)
          continue
        }
        
        if (potentialCopies.length > 1) {
          console.log(`  ⚠️  找到多个可能的副本，选择第一个`)
        }
        
        const copiedPatientId = potentialCopies[0].id
        console.log(`  ✅ 找到副本患者 ID=${copiedPatientId}`)
        
        // 更新分配记录
        await assignment.update({
          copiedPatientId: copiedPatientId,
        }, { transaction })
        
        fixedCount++
        console.log(`  ✅ 已更新 copiedPatientId`)
      }
      
      await transaction.commit()
      console.log(`\n✅ 成功修复 ${fixedCount} 条分配记录`)
      
    } catch (err) {
      await transaction.rollback()
      console.error('❌ 修复失败:', err)
      throw err
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

fixCopiedPatientIds()
