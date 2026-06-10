import axios from 'axios'

async function testCreatePatient() {
  try {
    console.log('=== 测试创建患者API ===\n')
    
    // 使用admin账号登录（假设密码是admin123）
    console.log('1. 尝试登录admin账号...')
    let token = ''
    
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        username: 'admin',
        password: 'admin123',
      })
      token = loginResponse.data.data.token
      console.log('✅ admin登录成功\n')
    } catch (e) {
      console.log('⚠️  admin登录失败，尝试其他账号...\n')
    }
    
    if (!token) {
      console.log('❌ 无法登录，请手动获取token后测试')
      console.log('\n💡 解决方案:')
      console.log('1. 打开浏览器开发者工具 (F12)')
      console.log('2. 登录系统')
      console.log('3. 在Network标签查看请求头中的Authorization')
      console.log('4. 复制token进行测试')
      process.exit(1)
      return
    }
    
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
    console.log('患者ID:', response.data.data.id)
    console.log('患者姓名:', response.data.data.name)
    console.log('uniqueKey:', response.data.data.uniqueKey)
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ 错误:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 后端服务未启动')
      console.error('   请运行: cd emr-backend && npm run dev')
    } else if (error.response) {
      console.error('\n响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    
    process.exit(1)
  }
}

testCreatePatient()
