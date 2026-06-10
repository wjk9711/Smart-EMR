import sequelize from './src/config/database'
import { InpatientPatient, InpatientRecord, PatientAssignment } from './src/models'

async function cleanAllCopies() {
  console.log('清理患者ID=18的所有副本和分配记录...\n')
  
  try {
    const transaction = await sequelize.transaction()
    
    try {
      // 1. 删除所有分配记录
      console.log('1️⃣ 删除所有分配记录...')
      const deletedAssignments = await PatientAssignment.destroy({
        where: { patientId: 18 },
        transaction,
      })
      console.log(`   ✅ 删除了 ${deletedAssignments} 条分配记录\n`)
      
      // 2. 查找并删除所有副本患者
      console.log('2️⃣ 查找所有副本患者...')
      const copies = await InpatientPatient.findAll({
        where: {
          name: '小丽',
          inpatientNo: '2024051001',
        },
        attributes: ['id', 'doctorId'],
        transaction,
      })
      
      // 排除原始患者（doctorId=4是管理员wangjk）
      const realCopies = copies.filter(c => c.doctorId !== 4)
      
      console.log(`   找到 ${realCopies.length} 个副本患者\n`)
      
      let deletedPatients = 0
      let deletedRecords = 0
      
      for (const copy of realCopies) {
        console.log(`   处理副本患者 ID=${copy.id}, doctorId=${copy.doctorId}`)
        
        // 删除病案
        const recordsDeleted = await InpatientRecord.destroy({
          where: { patientId: copy.id },
          transaction,
        })
        
        if (recordsDeleted > 0) {
          console.log(`     - 删除 ${recordsDeleted} 个病案`)
          deletedRecords += recordsDeleted
        }
        
        // 删除患者
        await copy.destroy({ transaction })
        deletedPatients++
        console.log(`     ✅ 已删除\n`)
      }
      
      console.log(`\n📊 清理统计:`)
      console.log(`   - 分配记录: ${deletedAssignments} 条`)
      console.log(`   - 副本患者: ${deletedPatients} 个`)
      console.log(`   - 病案记录: ${deletedRecords} 条`)
      
      await transaction.commit()
      console.log('\n✅ 清理完成！')
      
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

cleanAllCopies()
