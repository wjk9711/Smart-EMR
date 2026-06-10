import sequelize from './src/config/database'
const { QueryTypes } = require('sequelize')

async function checkPatientData() {
  try {
    console.log('=== 检查患者数据 ===\n')
    
    // 1. 查看所有用户
    const [users] = await sequelize.query('SELECT id, username, real_name, role_type FROM users ORDER BY id')
    console.log('所有用户:')
    console.table(users)
    
    // 2. 查看所有患者及其doctorId
    const [patients] = await sequelize.query(`
      SELECT ip.id, ip.name, ip.inpatient_no, ip.doctor_id, u.username as doctor_username
      FROM inpatient_patients ip
      LEFT JOIN users u ON ip.doctor_id = u.id
      ORDER BY ip.created_at DESC
      LIMIT 20
    `)
    console.log('\n最近20个患者:')
    console.table(patients)
    
    // 3. 特别检查wangjk用户
    const wangjkUser = (users as any[]).find((u: any) => u.username === 'wangjk')
    if (wangjkUser) {
      console.log(`\n=== wangjk用户信息 ===`)
      console.log('ID:', wangjkUser.id)
      console.log('用户名:', wangjkUser.username)
      console.log('真实姓名:', wangjkUser.real_name)
      console.log('角色:', wangjkUser.role_type)
      
      // 查看wangjk创建的患者
      const wangjkPatients = (patients as any[]).filter((p: any) => p.doctor_id === wangjkUser.id)
      console.log(`\nwangjk创建的患者数量: ${wangjkPatients.length}`)
      if (wangjkPatients.length > 0) {
        console.table(wangjkPatients)
      } else {
        console.log('⚠️  wangjk没有创建任何患者')
      }
      
      // 查看wangjk应该能看到的所有患者（包括被分配的）
      const [allVisiblePatients] = await sequelize.query(`
        SELECT DISTINCT ip.id, ip.name, ip.inpatient_no, ip.doctor_id, 
               u.username as doctor_username,
               pa.user_id as assigned_to
        FROM inpatient_patients ip
        LEFT JOIN users u ON ip.doctor_id = u.id
        LEFT JOIN patient_assignments pa ON ip.id = pa.patient_id AND pa.user_id = ?
        WHERE ip.doctor_id = ? OR pa.user_id = ?
        ORDER BY ip.created_at DESC
      `, { replacements: [wangjkUser.id, wangjkUser.id, wangjkUser.id], type: QueryTypes.SELECT })
      
      console.log(`\nwangjk应该能看到的患者总数: ${(allVisiblePatients as unknown as any[]).length}`)
      if ((allVisiblePatients as unknown as any[]).length > 0) {
        console.table(allVisiblePatients)
      } else {
        console.log('⚠️  wangjk看不到任何患者（这不应该发生！）')
      }
    } else {
      console.log('\n❌ 未找到wangjk用户')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkPatientData()
