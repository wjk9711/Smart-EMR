import sequelize from './src/config/database'
import { InpatientPatient, InpatientRecord, PatientAssignment } from './src/models'

async function cleanInvalidData() {
  console.log('开始清理无效数据...\n')
  
  try {
    const transaction = await sequelize.transaction()
    
    try {
      // 1. 删除copiedPatientId为NULL的分配记录
      console.log('1️⃣ 删除copiedPatientId为NULL的分配记录...')
      const deletedAssignments = await PatientAssignment.destroy({
        where: {
          patientId: 18,
          copiedPatientId: null,
        },
        transaction,
      })
      console.log(`   ✅ 删除了 ${deletedAssignments} 条无效分配记录\n`)
      
      // 2. 查找所有患者ID=18的副本患者
      console.log('2️⃣ 查找所有副本患者...')
      const assignments = await PatientAssignment.findAll({
        where: { patientId: 18 },
        attributes: ['id', 'userId', 'copiedPatientId'],
        transaction,
      })
      
      console.log(`   找到 ${assignments.length} 个有效的分配记录\n`)
      
      // 3. 检查每个副本患者的病案数量
      console.log('3️⃣ 检查副本患者的病案数量...')
      let cleanedCount = 0
      
      for (const assignment of assignments) {
        if (!assignment.copiedPatientId) continue
        
        const copyPatient = await InpatientPatient.findByPk(assignment.copiedPatientId, { transaction })
        if (!copyPatient) continue
        
        const recordCount = await InpatientRecord.count({
          where: { patientId: assignment.copiedPatientId },
          transaction,
        })
        
        console.log(`   用户${assignment.userId}: 副本患者ID=${assignment.copiedPatientId}, 病案数=${recordCount}`)
        
        // 如果病案数量为0，删除这个副本和分配记录
        if (recordCount === 0) {
          console.log(`     ⚠️  病案数量为0，删除此副本...`)
          
          // 删除分配记录
          await assignment.destroy({ transaction })
          
          // 删除副本患者
          await copyPatient.destroy({ transaction })
          
          cleanedCount++
          console.log(`     ✅ 已删除`)
        }
      }
      
      console.log(`\n   ✅ 共清理了 ${cleanedCount} 个无效副本\n`)
      
      await transaction.commit()
      console.log('✅ 清理完成！')
      
    } catch (err) {
      await transaction.rollback()
      console.error('❌ 清理失败:', err)
      throw err
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

cleanInvalidData()
