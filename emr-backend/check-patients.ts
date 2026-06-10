import sequelize from './src/config/database'
import { InpatientPatient, User } from './src/models'

async function checkPatients() {
  try {
    console.log('=== 检查所有住院患者 ===')
    
    // 查询所有患者
    const allPatients = await InpatientPatient.findAll({
      order: [['createdAt', 'DESC']]
    })
    
    console.log(`\n总共有 ${allPatients.length} 个住院患者:`)
    for (const patient of allPatients) {
      let doctorInfo = 'N/A'
      if (patient.doctorId) {
        const doctor = await User.findByPk(patient.doctorId, {
          attributes: ['id', 'username', 'roleType']
        })
        doctorInfo = `${doctor?.username} (${doctor?.roleType})`
      }
      console.log(`- ID: ${patient.id}, 姓名: ${patient.name}, 住院号: ${patient.inpatientNo}, doctorId: ${patient.doctorId}, 创建者: ${doctorInfo}`)
    }
    
    // 特别查找"小丽"
    const xiaoli = await InpatientPatient.findOne({
      where: { name: '小丽' }
    })
    
    if (xiaoli) {
      console.log('\n=== "小丽"患者信息 ===')
      console.log(`ID: ${xiaoli.id}`)
      console.log(`姓名: ${xiaoli.name}`)
      console.log(`住院号: ${xiaoli.inpatientNo}`)
      console.log(`doctorId: ${xiaoli.doctorId}`)
      
      if (xiaoli.doctorId) {
        const doctor = await User.findByPk(xiaoli.doctorId, {
          attributes: ['id', 'username', 'roleType']
        })
        console.log(`创建者: ${doctor?.username} (${doctor?.roleType})`)
      }
    } else {
      console.log('\n未找到"小丽"患者')
    }
    
    // 检查各角色的患者数量
    console.log('\n=== 按创建者统计患者数量 ===')
    const patientsByDoctor = await InpatientPatient.findAll({
      attributes: ['doctorId'],
      group: ['doctorId'],
      raw: true
    })
    
    for (const item of patientsByDoctor) {
      if (item.doctorId) {
        const user = await User.findByPk(item.doctorId, {
          attributes: ['id', 'username', 'roleType']
        })
        const count = await InpatientPatient.count({ where: { doctorId: item.doctorId } })
        console.log(`医生ID ${item.doctorId} (${user?.username}, ${user?.roleType}): ${count} 个患者`)
      }
    }
    
    // 检查patient_assignments表
    console.log('\n=== 检查患者分配记录 ===')
    const [assignments] = await sequelize.query('SELECT * FROM patient_assignments LIMIT 10')
    console.log(`分配记录数量: ${(assignments as any[]).length}`)
    if ((assignments as any[]).length > 0) {
      console.table(assignments)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkPatients()
