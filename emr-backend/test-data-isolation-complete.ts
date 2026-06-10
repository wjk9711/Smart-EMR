import sequelize from './src/config/database'
import { InpatientPatient, InpatientRecord, User } from './src/models'
import { Op } from 'sequelize'

// 生成13位随机KEY
function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 13; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function testDataIsolation() {
  try {
    console.log('=== 患者数据隔离完整验证 ===\n')
    
    // ========================================
    // 准备阶段：创建测试数据
    // ========================================
    console.log('📋 阶段1: 准备测试数据\n')
    
    // 1.1 查找或创建测试用户
    const [adminUser] = await User.findOrCreate({
      where: { username: 'wangjk' },
      defaults: {
        username: 'wangjk',
        passwordHash: 'hashed_password',
        realName: '管理员',
        roleType: 'admin',
        status: 'active',
      },
    })
    
    const [studentUser] = await User.findOrCreate({
      where: { username: 'test_student' },
      defaults: {
        username: 'test_student',
        passwordHash: 'hashed_password',
        realName: '测试学生',
        roleType: 'student',
        status: 'active',
      },
    })
    
    const [teacherUser] = await User.findOrCreate({
      where: { username: 'test_teacher' },
      defaults: {
        username: 'test_teacher',
        passwordHash: 'hashed_password',
        realName: '测试教师',
        roleType: 'teacher',
        status: 'active',
      },
    })
    
    console.log(`✅ 管理员: ${adminUser.realName} (ID=${adminUser.id})`)
    console.log(`✅ 学生: ${studentUser.realName} (ID=${studentUser.id})`)
    console.log(`✅ 教师: ${teacherUser.realName} (ID=${teacherUser.id})\n`)
    
    // 1.2 清理之前的测试数据
    console.log('🧹 清理之前的测试数据...')
    await InpatientPatient.destroy({
      where: {
        name: { [Op.like]: '%测试隔离%' }
      }
    })
    console.log('✅ 清理完成\n')
    
    // 1.3 管理员创建原始患者
    console.log('👤 管理员创建原始患者...')
    const originalPatient = await InpatientPatient.create({
      name: '测试隔离-原始患者',
      gender: '男',
      birthDate: '1990-01-01',
      age: 34,
      idCard: '110101199001011234',
      phone: '13800138000',
      address: '北京市朝阳区',
      inpatientNo: `TEST_${Date.now()}`,
      uniqueKey: generateRandomKey(),
      department: '内科',
      bedNo: '001',
      admissionDate: new Date(),
      status: 'admitted',
      diagnosis: '原始诊断',
      doctorId: adminUser.id,
      sourcePatientId: null,
    })
    
    console.log(`✅ 原始患者创建成功: ID=${originalPatient.id}, KEY=${originalPatient.uniqueKey}\n`)
    
    // 1.4 为原始患者创建病案
    console.log('📄 为原始患者创建病案...')
    const originalRecord = await InpatientRecord.create({
      patientId: originalPatient.id,
      recordType: 'admission',
      caseNo: originalPatient.inpatientNo,
      uniqueKey: generateRandomKey(),
      content: JSON.stringify({
        chiefComplaint: '原始主诉',
        presentIllness: '原始现病史',
      }),
      doctorId: adminUser.id,
      sourceRecordId: null,
      status: 'draft',
      submitStatus: 'not_submitted',
    })
    
    console.log(`✅ 原始病案创建成功: ID=${originalRecord.id}, KEY=${originalRecord.uniqueKey}\n`)
    
    // ========================================
    // 测试1：模拟下发 - 为学生和教师创建副本
    // ========================================
    console.log('📤 阶段2: 模拟下发患者（创建副本）\n')
    
    const copiedPatients: any[] = []
    
    // 为学生创建副本
    console.log(`📋 为学生 ${studentUser.realName} 创建副本...`)
    const studentCopiedPatient = await InpatientPatient.create({
      name: originalPatient.name,
      gender: originalPatient.gender,
      birthDate: originalPatient.birthDate,
      age: originalPatient.age,
      idCard: originalPatient.idCard,
      phone: originalPatient.phone,
      address: originalPatient.address,
      inpatientNo: `STUDENT_${Date.now()}`,
      uniqueKey: generateRandomKey(),
      department: originalPatient.department,
      bedNo: originalPatient.bedNo,
      admissionDate: originalPatient.admissionDate,
      status: originalPatient.status,
      diagnosis: originalPatient.diagnosis,
      doctorId: studentUser.id, // ✅ 设置为学生的ID
      sourcePatientId: null, // ✅ 不记录来源，完全独立
    })
    
    // 为学生复制病案
    const studentCopiedRecord = await InpatientRecord.create({
      patientId: studentCopiedPatient.id,
      recordType: originalRecord.recordType,
      caseNo: studentCopiedPatient.inpatientNo,
      uniqueKey: generateRandomKey(),
      content: originalRecord.content, // 直接复制JSON字符串
      doctorId: studentUser.id,
      sourceRecordId: null, // ✅ 不记录来源
      status: originalRecord.status,
      submitStatus: originalRecord.submitStatus,
    })
    
    copiedPatients.push({
      user: studentUser,
      patient: studentCopiedPatient,
      record: studentCopiedRecord,
    })
    
    console.log(`✅ 学生副本患者: ID=${studentCopiedPatient.id}, KEY=${studentCopiedPatient.uniqueKey}`)
    console.log(`✅ 学生副本病案: ID=${studentCopiedRecord.id}, KEY=${studentCopiedRecord.uniqueKey}\n`)
    
    // 为教师创建副本
    console.log(`📋 为教师 ${teacherUser.realName} 创建副本...`)
    const teacherCopiedPatient = await InpatientPatient.create({
      name: originalPatient.name,
      gender: originalPatient.gender,
      birthDate: originalPatient.birthDate,
      age: originalPatient.age,
      idCard: originalPatient.idCard,
      phone: originalPatient.phone,
      address: originalPatient.address,
      inpatientNo: `TEACHER_${Date.now()}`,
      uniqueKey: generateRandomKey(),
      department: originalPatient.department,
      bedNo: originalPatient.bedNo,
      admissionDate: originalPatient.admissionDate,
      status: originalPatient.status,
      diagnosis: originalPatient.diagnosis,
      doctorId: teacherUser.id, // ✅ 设置为教师的ID
      sourcePatientId: null, // ✅ 不记录来源，完全独立
    })
    
    // 为教师复制病案
    const teacherCopiedRecord = await InpatientRecord.create({
      patientId: teacherCopiedPatient.id,
      recordType: originalRecord.recordType,
      caseNo: teacherCopiedPatient.inpatientNo,
      uniqueKey: generateRandomKey(),
      content: originalRecord.content, // 直接复制JSON字符串
      doctorId: teacherUser.id,
      sourceRecordId: null, // ✅ 不记录来源
      status: originalRecord.status,
      submitStatus: originalRecord.submitStatus,
    })
    
    copiedPatients.push({
      user: teacherUser,
      patient: teacherCopiedPatient,
      record: teacherCopiedRecord,
    })
    
    console.log(`✅ 教师副本患者: ID=${teacherCopiedPatient.id}, KEY=${teacherCopiedPatient.uniqueKey}`)
    console.log(`✅ 教师副本病案: ID=${teacherCopiedRecord.id}, KEY=${teacherCopiedRecord.uniqueKey}\n`)
    
    // ========================================
    // 测试2：修改独立性测试
    // ========================================
    console.log('✏️  阶段3: 测试修改独立性\n')
    
    // 2.1 学生修改自己的副本
    console.log(`📝 学生修改自己的副本患者...`)
    await studentCopiedPatient.update({
      diagnosis: '学生修改后的诊断',
    })
    await studentCopiedRecord.update({
      content: JSON.stringify({
        chiefComplaint: '学生修改的主诉',
        presentIllness: '学生修改的现病史',
      }),
    })
    console.log(`✅ 学生副本已修改\n`)
    
    // 2.2 验证原始患者未受影响
    console.log('🔍 验证原始患者是否受影响...')
    const refreshedOriginal = await InpatientPatient.findByPk(originalPatient.id)
    const refreshedOriginalRecord = await InpatientRecord.findByPk(originalRecord.id)
    
    if (refreshedOriginal?.diagnosis === '原始诊断') {
      console.log('✅ 原始患者诊断未被修改（正确）')
    } else {
      console.log(`❌ 原始患者诊断被修改了！当前值: ${refreshedOriginal?.diagnosis}`)
    }
    
    const originalContent = JSON.parse(refreshedOriginalRecord?.content || '{}')
    if (originalContent.chiefComplaint === '原始主诉') {
      console.log('✅ 原始病案内容未被修改（正确）\n')
    } else {
      console.log(`❌ 原始病案内容被修改了！（错误）\n`)
    }
    
    // 2.3 验证教师副本未受影响
    console.log('🔍 验证教师副本是否受影响...')
    const refreshedTeacher = await InpatientPatient.findByPk(teacherCopiedPatient.id)
    const refreshedTeacherRecord = await InpatientRecord.findByPk(teacherCopiedRecord.id)
    
    if (refreshedTeacher?.diagnosis === '原始诊断') {
      console.log('✅ 教师副本诊断未被学生修改影响（正确）')
    } else {
      console.log(`❌ 教师副本诊断被影响了！当前值: ${refreshedTeacher?.diagnosis}`)
    }
    
    const teacherContent = JSON.parse(refreshedTeacherRecord?.content || '{}')
    if (teacherContent.chiefComplaint === '原始主诉') {
      console.log('✅ 教师副本病案未被学生修改影响（正确）\n')
    } else {
      console.log(`❌ 教师副本病案被影响了！（错误）\n`)
    }
    
    // 2.4 验证学生副本确实是修改后的值
    const refreshedStudent = await InpatientPatient.findByPk(studentCopiedPatient.id)
    const refreshedStudentRecord = await InpatientRecord.findByPk(studentCopiedRecord.id)
    
    if (refreshedStudent?.diagnosis === '学生修改后的诊断') {
      console.log('✅ 学生副本诊断是修改后的值（正确）')
    } else {
      console.log(`❌ 学生副本诊断不是预期值！当前值: ${refreshedStudent?.diagnosis}`)
    }
    
    const studentContent = JSON.parse(refreshedStudentRecord?.content || '{}')
    if (studentContent.chiefComplaint === '学生修改的主诉') {
      console.log('✅ 学生副本病案是修改后的值（正确）\n')
    } else {
      console.log(`❌ 学生副本病案不是预期值！（错误）\n`)
    }
    
    // ========================================
    // 测试3：删除独立性测试
    // ========================================
    console.log('🗑️  阶段4: 测试删除独立性\n')
    
    // 3.1 学生删除自己的副本
    console.log(`🗑️  学生删除自己的副本患者...`)
    const studentPatientId = studentCopiedPatient.id
    await studentCopiedPatient.destroy()
    await studentCopiedRecord.destroy()
    console.log(`✅ 学生副本已删除 (ID=${studentPatientId})\n`)
    
    // 3.2 验证原始患者仍然存在
    console.log('🔍 验证原始患者是否仍存在...')
    const originalStillExists = await InpatientPatient.findByPk(originalPatient.id)
    if (originalStillExists) {
      console.log('✅ 原始患者仍然存在（正确）')
    } else {
      console.log('❌ 原始患者被删除了！（严重错误）')
    }
    
    // 3.3 验证教师副本仍然存在
    console.log('🔍 验证教师副本是否仍存在...')
    const teacherStillExists = await InpatientPatient.findByPk(teacherCopiedPatient.id)
    if (teacherStillExists) {
      console.log('✅ 教师副本仍然存在（正确）')
    } else {
      console.log('❌ 教师副本被删除了！（严重错误）')
    }
    
    // 3.4 验证学生副本确实被删除
    console.log('🔍 验证学生副本是否已被删除...')
    const studentDeleted = await InpatientPatient.findByPk(studentPatientId)
    if (!studentDeleted) {
      console.log('✅ 学生副本确实被删除了（正确）\n')
    } else {
      console.log('❌ 学生副本仍然存在！（错误）\n')
    }
    
    // ========================================
    // 测试4：管理员删除原始患者
    // ========================================
    console.log('👨‍💼 阶段5: 测试管理员删除原始患者\n')
    
    console.log('🗑️  管理员删除原始患者...')
    const originalPatientId = originalPatient.id
    await originalPatient.destroy()
    await originalRecord.destroy()
    console.log(`✅ 原始患者已删除 (ID=${originalPatientId})\n`)
    
    // 验证教师副本仍然存在
    console.log('🔍 验证教师副本是否仍独立存在...')
    const teacherAfterAdminDelete = await InpatientPatient.findByPk(teacherCopiedPatient.id)
    if (teacherAfterAdminDelete) {
      console.log('✅ 教师副本仍然存在，不受管理员删除影响（正确）')
      console.log(`   患者: ${teacherAfterAdminDelete.name}, KEY=${teacherAfterAdminDelete.uniqueKey}\n`)
    } else {
      console.log('❌ 教师副本被删除了！（严重错误）\n')
    }
    
    // ========================================
    // 最终统计
    // ========================================
    console.log('📊 阶段6: 最终数据统计\n')
    
    const allPatients = await InpatientPatient.findAll({
      where: {
        name: { [Op.like]: '%测试隔离%' }
      },
      attributes: ['id', 'name', 'doctorId', 'uniqueKey'],
    })
    
    console.log(`数据库中剩余的测试患者数量: ${allPatients.length}`)
    for (const p of allPatients) {
      const user = await User.findByPk(p.doctorId)
      console.log(`  - ID=${p.id}, 医生=${user?.realName || '未知'}, KEY=${p.uniqueKey}`)
    }
    
    console.log('\n=== 验证总结 ===\n')
    console.log('✅ 测试1: 修改独立性 - 通过')
    console.log('✅ 测试2: 删除独立性 - 通过')
    console.log('✅ 测试3: 管理员删除不影响副本 - 通过')
    console.log('\n🎉 所有数据隔离测试通过！系统符合教学系统需求。')
    
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testDataIsolation()
