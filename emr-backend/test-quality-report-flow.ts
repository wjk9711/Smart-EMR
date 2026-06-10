/**
 * 质控报告全流程测试脚本
 * 测试：新建报告 -> 获取列表 -> 验证数据
 */

import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

// 模拟登录获取token
async function login() {
  console.log('=== 步骤1: 登录获取Token ===')
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123',  // 尝试常用密码
    })
    
    if (res.data.code === 200) {
      const token = res.data.data.token
      console.log('✅ 登录成功')
      console.log('Token:', token.substring(0, 20) + '...')
      return token
    } else {
      throw new Error(res.data.message || '登录失败')
    }
  } catch (error: any) {
    console.error('❌ 登录失败:', error.response?.data || error.message)
    console.log('\n提示：请手动登录系统，从浏览器LocalStorage中获取token')
    console.log('然后修改此脚本中的token变量\n')
    throw error
  }
}

// 获取报告列表
async function getReports(token: string) {
  console.log('\n=== 步骤2: 获取报告列表 ===')
  try {
    const res = await axios.get(`${API_BASE}/quality-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (res.data.code === 200) {
      const reports = res.data.data
      console.log('✅ 获取成功')
      console.log('报告数量:', reports.length)
      console.log('报告列表:')
      reports.forEach((report: any, index: number) => {
        console.log(`  ${index + 1}. ${report.reportName} (关键值: ${report.reportKey})`)
      })
      return reports
    } else {
      throw new Error(res.data.message || '获取失败')
    }
  } catch (error: any) {
    console.error('❌ 获取失败:', error.response?.data || error.message)
    throw error
  }
}

// 创建新报告
async function createReport(token: string, reportName: string) {
  console.log('\n=== 步骤3: 创建新报告 ===')
  console.log('报告名称:', reportName)
  
  try {
    const res = await axios.post(
      `${API_BASE}/quality-reports`,
      { reportName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (res.data.code === 200) {
      const report = res.data.data
      console.log('✅ 创建成功')
      console.log('报告ID:', report.id)
      console.log('报告关键值:', report.reportKey)
      console.log('报告名称:', report.reportName)
      console.log('文件路径:', report.filePath)
      return report
    } else {
      throw new Error(res.data.message || '创建失败')
    }
  } catch (error: any) {
    console.error('❌ 创建失败:', error.response?.data || error.message)
    throw error
  }
}

// 更新报告（保存内容）
async function updateReport(token: string, reportId: number, content: string) {
  console.log('\n=== 步骤4: 更新报告内容 ===')
  console.log('报告ID:', reportId)
  
  try {
    const res = await axios.put(
      `${API_BASE}/quality-reports/${reportId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (res.data.code === 200) {
      console.log('✅ 更新成功')
      console.log('文件大小:', res.data.data.fileSize, 'bytes')
      return res.data.data
    } else {
      throw new Error(res.data.message || '更新失败')
    }
  } catch (error: any) {
    console.error('❌ 更新失败:', error.response?.data || error.message)
    throw error
  }
}

// 删除报告
async function deleteReport(token: string, reportId: number) {
  console.log('\n=== 步骤5: 删除测试报告 ===')
  console.log('报告ID:', reportId)
  
  try {
    const res = await axios.delete(`${API_BASE}/quality-reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (res.data.code === 200) {
      console.log('✅ 删除成功')
    } else {
      throw new Error(res.data.message || '删除失败')
    }
  } catch (error: any) {
    console.error('❌ 删除失败:', error.response?.data || error.message)
    throw error
  }
}

// 主测试流程
async function runTest() {
  console.log('========================================')
  console.log('   质控报告全流程测试')
  console.log('========================================\n')
  
  let token = ''
  let createdReportId = 0
  
  try {
    // 1. 登录
    token = await login()
    
    // 2. 获取初始列表
    const initialReports = await getReports(token)
    const initialCount = initialReports.length
    
    // 3. 创建新报告
    const testReportName = `测试报告_${new Date().getTime()}`
    const newReport = await createReport(token, testReportName)
    createdReportId = newReport.id
    
    // 4. 再次获取列表，验证是否刷新
    console.log('\n=== 步骤6: 验证列表刷新 ===')
    const updatedReports = await getReports(token)
    const updatedCount = updatedReports.length
    
    console.log('\n对比结果:')
    console.log('  初始数量:', initialCount)
    console.log('  更新后数量:', updatedCount)
    console.log('  新增数量:', updatedCount - initialCount)
    
    if (updatedCount > initialCount) {
      console.log('✅ 列表刷新成功！新报告已显示')
      
      // 检查新报告是否在列表中
      const foundNewReport = updatedReports.find((r: any) => r.id === createdReportId)
      if (foundNewReport) {
        console.log('✅ 新报告在列表中找到')
        console.log('   报告名称:', foundNewReport.reportName)
        console.log('   关键值:', foundNewReport.reportKey)
      } else {
        console.log('❌ 新报告未在列表中找到')
      }
    } else {
      console.log('❌ 列表未刷新！数量没有变化')
    }
    
    // 5. 测试更新功能
    const testContent = '<h1>测试内容</h1><p>这是测试报告的正文内容。</p>'
    await updateReport(token, createdReportId, testContent)
    
    // 6. 清理：删除测试报告
    await deleteReport(token, createdReportId)
    
    // 7. 最终验证
    console.log('\n=== 步骤7: 最终验证 ===')
    const finalReports = await getReports(token)
    console.log('最终报告数量:', finalReports.length)
    
    if (finalReports.length === initialCount) {
      console.log('✅ 测试报告已成功删除，数量恢复到初始状态')
    } else {
      console.log('⚠️  数量不一致，可能需要手动清理')
    }
    
    console.log('\n========================================')
    console.log('   测试完成！')
    console.log('========================================')
    
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误')
    
    // 如果创建了报告但测试失败，尝试清理
    if (createdReportId && token) {
      console.log('\n尝试清理测试数据...')
      try {
        await deleteReport(token, createdReportId)
        console.log('✅ 测试数据已清理')
      } catch (cleanupError) {
        console.error('❌ 清理失败，请手动删除报告ID:', createdReportId)
      }
    }
    
    throw error
  }
}

// 运行测试
runTest().catch(error => {
  console.error('\n测试失败:', error.message)
  process.exit(1)
})
