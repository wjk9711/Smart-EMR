import { InpatientPatient } from './src/models'
import sequelize from './src/config/database'
const { QueryTypes } = require('sequelize')

async function testQuery() {
  try {
    console.log('=== 测试Sequelize查询 ===\n')
    
    // wangjk的ID是4
    const userId = 4
    
    console.log(`查询条件: doctorId = ${userId}`)
    
    // 执行查询
    const patients = await InpatientPatient.findAll({
      where: { doctorId: userId },
      order: [['createdAt', 'DESC']],
    })
    
    console.log(`\n查询结果: 找到 ${patients.length} 个患者`)
    
    if (patients.length > 0) {
      console.table(patients.map(p => ({
        id: p.id,
        name: p.name,
        inpatientNo: p.inpatientNo,
        doctorId: p.doctorId,
        createdAt: p.createdAt,
      })))
    } else {
      console.log('⚠️  没有找到任何患者！')
      
      // 检查数据库中是否有doctorId=4的患者
      const [rawPatients] = await sequelize.query(
        'SELECT * FROM inpatient_patients WHERE doctor_id = ?',
        { replacements: [userId], type: QueryTypes.SELECT }
      )
      
      console.log(`\n直接SQL查询结果: 找到 ${(rawPatients as unknown as any[]).length} 个患者`)
      if ((rawPatients as unknown as any[]).length > 0) {
        console.table(rawPatients)
        console.log('\n❗ 发现问题：SQL能查到，但Sequelize查不到！')
      }
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testQuery()
