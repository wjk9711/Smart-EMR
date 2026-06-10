import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

async function testAssignPatient() {
  console.log('=== 开始测试下发患者功能 ===\n')
  
  try {
    // 1. 管理员登录
    console.log('1️⃣ 管理员登录...')
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123456',
    })
    
    const adminToken = loginRes.data.data.token
    const adminId = loginRes.data.data.user.id
    console.log(`✅ 管理员登录成功 (ID: ${adminId})`)
    
    // 2. 获取管理员的患者列表，找到"小丽"
    console.log('\n2️⃣ 查找患者"小丽"...')
    const patientsRes = await axios.get(`${API_BASE}/inpatient/patients`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { page: 1, pageSize: 100, name: '小丽' },
    })
    
    const xiaoliPatient = patientsRes.data.data.list.find((p: any) => p.name === '小丽')
    if (!xiaoliPatient) {
      console.error('❌ 未找到患者"小丽"')
      return
    }
    
    console.log(`✅ 找到患者: ID=${xiaoliPatient.id}, 姓名=${xiaoliPatient.name}, 住院号=${xiaoliPatient.inpatientNo}`)
    
    // 3. 获取该患者的病案数量
    console.log('\n3️⃣ 检查患者病案...')
    const recordsRes = await axios.get(`${API_BASE}/inpatient/records`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { patientId: xiaoliPatient.id, page: 1, pageSize: 100 },
    })
    
    const recordCount = recordsRes.data.data.total
    console.log(`✅ 患者有 ${recordCount} 个病案`)
    
    // 4. 获取所有非管理员用户
    console.log('\n4️⃣ 获取所有学生用户...')
    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { roleType: 'student', page: 1, pageSize: 100 },
    })
    
    const students = usersRes.data.data.list
    console.log(`✅ 找到 ${students.length} 个学生用户`)
    
    if (students.length === 0) {
      console.error('❌ 没有学生用户可以接收患者')
      return
    }
    
    // 5. 下发患者
    console.log('\n5️⃣ 下发患者给所有学生...')
    const assignRes = await axios.post(
      `${API_BASE}/inpatient/patients/assign`,
      {
        patientIds: [xiaoliPatient.id],
        isTemplate: false,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    )
    
    console.log('✅ 下发成功!')
    console.log(`   - 患者数: ${assignRes.data.data.patientCount}`)
    console.log(`   - 用户数: ${assignRes.data.data.userCount}`)
    console.log(`   - 创建副本患者: ${assignRes.data.data.copiedPatients}`)
    console.log(`   - 创建副本病案: ${assignRes.data.data.copiedRecords}`)
    
    // 6. 验证第一个学生是否收到患者
    console.log('\n6️⃣ 验证学生是否收到患者...')
    const firstStudent = students[0]
    console.log(`   测试学生: ${firstStudent.username} (ID: ${firstStudent.id})`)
    
    // 学生登录
    const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: firstStudent.username,
      password: '123456',
    })
    
    const studentToken = studentLoginRes.data.data.token
    
    // 获取学生的患者列表
    const studentPatientsRes = await axios.get(`${API_BASE}/inpatient/patients`, {
      headers: { Authorization: `Bearer ${studentToken}` },
      params: { page: 1, pageSize: 100 },
    })
    
    const studentPatients = studentPatientsRes.data.data.list
    console.log(`   ✅ 学生共有 ${studentPatients.length} 个患者`)
    
    // 查找是否有"小丽"的副本
    const xiaoliCopy = studentPatients.find((p: any) => 
      p.name === '小丽' && p.doctorId === firstStudent.id
    )
    
    if (xiaoliCopy) {
      console.log(`   ✅ 学生收到了"小丽"的副本 (ID: ${xiaoliCopy.id})`)
      
      // 检查病案数量
      const studentRecordsRes = await axios.get(`${API_BASE}/inpatient/records`, {
        headers: { Authorization: `Bearer ${studentToken}` },
        params: { patientId: xiaoliCopy.id, page: 1, pageSize: 100 },
      })
      
      const studentRecordCount = studentRecordsRes.data.data.total
      console.log(`   ✅ 副本患者有 ${studentRecordCount} 个病案`)
      
      if (studentRecordCount === recordCount) {
        console.log(`   ✅ 病案数量正确 (${studentRecordCount} = ${recordCount})`)
      } else {
        console.log(`   ❌ 病案数量不匹配 (期望: ${recordCount}, 实际: ${studentRecordCount})`)
      }
      
      // 检查是否有重复病案
      const recordTypes = studentRecordsRes.data.data.list.map((r: any) => r.recordType)
      const uniqueTypes = new Set(recordTypes)
      
      if (recordTypes.length === uniqueTypes.size) {
        console.log(`   ✅ 没有重复病案 (${recordTypes.length} 个病案，${uniqueTypes.size} 种类型)`)
      } else {
        console.log(`   ❌ 发现重复病案! (${recordTypes.length} 个病案，但只有 ${uniqueTypes.size} 种类型)`)
        console.log(`   病案类型:`, recordTypes)
      }
    } else {
      console.log(`   ❌ 学生未收到"小丽"的副本`)
      console.log(`   学生患者列表:`, studentPatients.map((p: any) => ({ id: p.id, name: p.name, doctorId: p.doctorId })))
    }
    
    console.log('\n=== 测试完成 ===')
    
  } catch (error: any) {
    console.error('❌ 测试失败:', error.response?.data || error.message)
    if (error.response?.data) {
      console.error('详细错误:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

testAssignPatient()
