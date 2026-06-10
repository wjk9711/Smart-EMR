import axios from 'axios'

async function testAPI() {
  try {
    console.log('=== 测试患者列表API ===\n')
    
    // 1. 先登录wangjk账号
    console.log('1. 登录wangjk账号...')
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'wangjk',
      password: '123456', // 假设密码
    })
    
    const token = loginResponse.data.data.token
    console.log('✅ 登录成功')
    console.log('Token:', token.substring(0, 20) + '...')
    console.log('用户信息:', loginResponse.data.data.user)
    
    // 2. 获取患者列表
    console.log('\n2. 获取患者列表...')
    const patientsResponse = await axios.get('http://localhost:3000/api/inpatient/patients', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: 1,
        pageSize: 10,
      },
    })
    
    console.log('✅ API调用成功')
    console.log('响应状态:', patientsResponse.status)
    console.log('响应数据:')
    console.log('  - code:', patientsResponse.data.code)
    console.log('  - message:', patientsResponse.data.message)
    console.log('  - total:', patientsResponse.data.data?.total)
    console.log('  - list length:', patientsResponse.data.data?.list?.length)
    
    if (patientsResponse.data.data?.list && patientsResponse.data.data.list.length > 0) {
      console.log('\n患者列表:')
      patientsResponse.data.data.list.forEach((patient: any, index: number) => {
        console.log(`  ${index + 1}. ID=${patient.id}, 姓名=${patient.name}, 住院号=${patient.inpatientNo}, doctorId=${patient.doctorId}`)
      })
    } else {
      console.log('\n⚠️  患者列表为空！')
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    process.exit(1)
  }
}

testAPI()
