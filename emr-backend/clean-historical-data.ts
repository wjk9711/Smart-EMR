import sequelize from './src/config/database'
import { InpatientPatient } from './src/models'

async function cleanHistoricalData() {
  try {
    console.log('=== 清理历史数据 ===\n')
    
    // 查找doctorId为null的患者
    const nullDoctorPatients = await InpatientPatient.findAll({
      where: { doctorId: null },
    })
    
    if (nullDoctorPatients.length === 0) {
      console.log('✅ 没有需要清理的历史数据')
      process.exit(0)
      return
    }
    
    console.log(`发现 ${nullDoctorPatients.length} 个doctorId为null的患者:`)
    nullDoctorPatients.forEach(patient => {
      console.log(`  - ID: ${patient.id}, 姓名: ${patient.name}, 住院号: ${patient.inpatientNo}`)
    })
    
    console.log('\n⚠️  这些患者将不会被任何用户看到，建议删除。')
    console.log('是否删除？(y/n)')
    
    // 自动确认删除（生产环境应该手动确认）
    const confirm = 'y'
    
    if (confirm.toLowerCase() === 'y') {
      for (const patient of nullDoctorPatients) {
        // 先删除相关的病案
        const InpatientRecord = require('./src/models').InpatientRecord
        await InpatientRecord.destroy({
          where: { patientId: patient.id },
        })
        
        // 再删除患者
        await patient.destroy()
        console.log(`✅ 已删除患者 ID=${patient.id} (${patient.name})`)
      }
      
      console.log('\n✅ 清理完成！')
    } else {
      console.log('\n❌ 取消操作')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanHistoricalData()
