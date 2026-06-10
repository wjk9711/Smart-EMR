import axios from 'axios'

async function testCreatePatient() {
  try {
    console.log('=== 测试创建患者API ===\n')
    
    // 1. 先登录
    console.log('1. 登录...')
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'wangjk',
      password: '123456',
    })
    
    const token = loginResponse.data.data.token
    console.log('✅ 登录成功\n')
    
    // 2. 创建患者
    console.log('2. 创建患者...')
    const patientData = {
      name: '测试患者',
      gender: '男',
      birthDate: '1990-01-01',
      age: 34,
      idCard: '110101199001011234',
      phone: '13800138000',
      address: '北京市朝阳区',
      inpatientNo: 'TEST20260610',
      department: '内科',
      bedNo: '001',
      admissionDate: '2026-06-10',
      status: 'admitted',
      diagnosis: '测试诊断',
    }
    
    const response = await axios.post(
      'http://localhost:3000/api/inpatient/patients',
      patientData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    console.log('✅ 创建成功')
    console.log('响应状态:', response.status)
    console.log('响应数据:', JSON.stringify(response.data, null, 2))
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ 错误:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 后端服务未启动或端口不正确')
      console.error('   请检查: http://localhost:3000 是否可访问')
    } else if (error.code === 'ERR_NETWORK') {
      console.error('\n💡 提示: 网络连接错误')
      console.error('   可能原因:')
      console.error('   - 后端服务未启动')
      console.error('   - 防火墙阻止')
      console.error('   - CORS配置问题')
    }
    
    if (error.response) {
      console.error('\n响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    
    process.exit(1)
  }
}

testCreatePatient()
