import sequelize from './src/config/database'

async function testPatientAssignment() {
  try {
    console.log('=== 测试 PatientAssignment 模型 ===\n')
    
    const { PatientAssignment } = require('./src/models')
    
    // 尝试查询一条记录
    console.log('1. 测试查询...')
    const assignment = await PatientAssignment.findOne({
      where: { patientId: 14, userId: 11 },
    })
    
    if (assignment) {
      console.log('✅ 查询成功')
      console.log('   ID:', assignment.id)
      console.log('   patientId:', assignment.patientId)
      console.log('   userId:', assignment.userId)
      console.log('   copiedPatientId:', assignment.copiedPatientId)
      console.log('   copiedAt:', assignment.copiedAt)
    } else {
      console.log('⚠️  没有找到记录（这是正常的，如果还没有下发过）')
    }
    
    // 测试创建
    console.log('\n2. 测试创建...')
    const newAssignment = await PatientAssignment.create({
      patientId: 14,
      userId: 11,
      assignedBy: 4,
      isTemplate: false,
      copiedPatientId: null,
      copiedAt: null,
    })
    
    console.log('✅ 创建成功')
    console.log('   ID:', newAssignment.id)
    console.log('   patientId:', newAssignment.patientId)
    console.log('   userId:', newAssignment.userId)
    console.log('   copiedPatientId:', newAssignment.copiedPatientId)
    
    // 清理测试数据
    console.log('\n3. 清理测试数据...')
    await newAssignment.destroy()
    console.log('✅ 已删除测试记录')
    
    console.log('\n🎉 PatientAssignment 模型工作正常！')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.original) {
      console.error('原始错误:', error.original.sqlMessage)
    }
    process.exit(1)
  }
}

testPatientAssignment()
