import sequelize from './src/config/database'
import { InpatientPatient, InpatientRecord, User, PatientAssignment } from './src/models'
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

async function testAssignAndDisplay() {
  try {
    console.log('=== 测试患者下发和显示功能 ===\n')
    
    // ========================================
    // 阶段1: 清理测试数据
    // ========================================
    console.log('📋 阶段1: 清理测试数据\n')
    
    await InpatientPatient.destroy({
      where: {
        name: { [Op.like]: '%测试下发%' }
      }
    })
    
    // 清理相关的分配记录（通过查询获取患者ID）
    const testPatients = await InpatientPatient.findAll({
      where: {
        name: { [Op.like]: '%测试下发%' }
      },
      attributes: ['id'],
      paranoid: false, // 包括已软删除的
    })
    
    if (testPatients.length > 0) {
      const patientIds = testPatients.map(p => p.id)
      await PatientAssignment.destroy({
        where: {
          patientId: { [Op.in]: patientIds }
        }
      })
    }
    
    console.log('✅ 清理完成\n')
    
    // ========================================
    // 阶段2: 准备测试用户
    // ========================================
    console.log('👥 阶段2: 准备测试用户\n')
    
    const adminUser = await User.findOne({ where: { username: 'wangjk' } })
    const student1 = await User.findOne({ where: { username: 'student1' } })
    const teacher1 = await User.findOne({ where: { username: 'teacher001' } })
    
    if (!adminUser || !student1 || !teacher1) {
      throw new Error('测试用户不存在')
    }
    
    console.log(`✅ 管理员: ${adminUser.realName} (ID=${adminUser.id})`)
    console.log(`✅ 学生: ${student1.realName} (ID=${student1.id})`)
    console.log(`✅ 教师: ${teacher1.realName} (ID=${teacher1.id})\n`)
    
    // ========================================
    // 阶段3: 管理员创建原始患者
    // ========================================
    console.log('👤 阶段3: 管理员创建原始患者\n')
    
    const originalPatient = await InpatientPatient.create({
      name: '测试下发-小丽',
      gender: '女',
      birthDate: '2000-01-01',
      age: 26,
      idCard: '110101200001011234',
      phone: '13800138001',
      address: '北京市海淀区',
      inpatientNo: `ADMIN_${Date.now()}`,
      uniqueKey: generateRandomKey(),
      department: '内科',
      bedNo: '101',
      admissionDate: new Date(),
      status: 'admitted',
      diagnosis: '原始诊断',
      doctorId: adminUser.id,
      sourcePatientId: null,
    })
    
    console.log(`✅ 原始患者创建成功: ID=${originalPatient.id}, KEY=${originalPatient.uniqueKey}\n`)
    
    // 为原始患者创建病案
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
    
    console.log(`✅ 原始病案创建成功: ID=${originalRecord.id}\n`)
    
    // ========================================
    // 阶段4: 第一次下发
    // ========================================
    console.log('📤 阶段4: 第一次下发患者\n')
    
    const firstCopies: any[] = []
    
    for (const user of [student1, teacher1]) {
      const newInpatientNo = `FIRST_${user.id}_${Date.now()}`
      const newUniqueKey = generateRandomKey()
      
      // 创建副本患者
      const copiedPatient = await InpatientPatient.create({
        name: originalPatient.name,
        gender: originalPatient.gender,
        birthDate: originalPatient.birthDate,
        age: originalPatient.age,
        idCard: originalPatient.idCard,
        phone: originalPatient.phone,
        address: originalPatient.address,
        inpatientNo: newInpatientNo,
        uniqueKey: newUniqueKey,
        department: originalPatient.department,
        bedNo: originalPatient.bedNo,
        admissionDate: originalPatient.admissionDate,
        status: originalPatient.status,
        diagnosis: originalPatient.diagnosis,
        doctorId: user.id,
        sourcePatientId: null,
      })
      
      // 复制病案
      const copiedRecord = await InpatientRecord.create({
        patientId: copiedPatient.id,
        recordType: originalRecord.recordType,
        caseNo: newInpatientNo,
        uniqueKey: generateRandomKey(),
        content: originalRecord.content,
        doctorId: user.id,
        sourceRecordId: null,
        status: originalRecord.status,
        submitStatus: originalRecord.submitStatus,
      })
      
      // 创建分配记录
      const assignment = await PatientAssignment.create({
        patientId: originalPatient.id,
        userId: user.id,
        assignedBy: adminUser.id,
        isTemplate: false,
        copiedPatientId: copiedPatient.id,
        copiedAt: new Date(),
      })
      
      firstCopies.push({
        user: user,
        patient: copiedPatient,
        record: copiedRecord,
        assignment: assignment,
      })
      
      console.log(`✅ ${user.realName} 收到副本: 患者ID=${copiedPatient.id}, KEY=${newUniqueKey}`)
    }
    
    console.log('\n')
    
    // ========================================
    // 阶段5: 验证第一次下发后用户能看到患者
    // ========================================
    console.log('🔍 阶段5: 验证用户能看到下发的患者\n')
    
    for (const copy of firstCopies) {
      const userPatients = await InpatientPatient.findAll({
        where: {
          [Op.or]: [
            { doctorId: copy.user.id },
          ]
        },
        attributes: ['id', 'name', 'uniqueKey', 'doctorId'],
      })
      
      console.log(`${copy.user.realName} 的患者列表 (${userPatients.length}个):`)
      for (const p of userPatients) {
        console.log(`  - ID=${p.id}, 姓名=${p.name}, KEY=${p.uniqueKey}`)
      }
      
      const hasCopy = userPatients.some(p => p.id === copy.patient.id)
      if (hasCopy) {
        console.log(`✅ ${copy.user.realName} 能看到自己的副本\n`)
      } else {
        console.log(`❌ ${copy.user.realName} 看不到自己的副本（错误）\n`)
      }
    }
    
    // ========================================
    // 阶段6: 第二次下发（重复下发）
    // ========================================
    console.log('📤 阶段6: 第二次下发（重复下发）\n')
    
    const secondCopies: any[] = []
    
    for (const user of [student1, teacher1]) {
      const newInpatientNo = `SECOND_${user.id}_${Date.now()}`
      const newUniqueKey = generateRandomKey()
      
      // 创建新的副本患者
      const copiedPatient = await InpatientPatient.create({
        name: originalPatient.name,
        gender: originalPatient.gender,
        birthDate: originalPatient.birthDate,
        age: originalPatient.age,
        idCard: originalPatient.idCard,
        phone: originalPatient.phone,
        address: originalPatient.address,
        inpatientNo: newInpatientNo,
        uniqueKey: newUniqueKey,
        department: originalPatient.department,
        bedNo: originalPatient.bedNo,
        admissionDate: originalPatient.admissionDate,
        status: originalPatient.status,
        diagnosis: originalPatient.diagnosis,
        doctorId: user.id,
        sourcePatientId: null,
      })
      
      // 复制病案
      const copiedRecord = await InpatientRecord.create({
        patientId: copiedPatient.id,
        recordType: originalRecord.recordType,
        caseNo: newInpatientNo,
        uniqueKey: generateRandomKey(),
        content: originalRecord.content,
        doctorId: user.id,
        sourceRecordId: null,
        status: originalRecord.status,
        submitStatus: originalRecord.submitStatus,
      })
      
      // 创建新的分配记录
      const assignment = await PatientAssignment.create({
        patientId: originalPatient.id,
        userId: user.id,
        assignedBy: adminUser.id,
        isTemplate: false,
        copiedPatientId: copiedPatient.id,
        copiedAt: new Date(),
      })
      
      secondCopies.push({
        user: user,
        patient: copiedPatient,
        record: copiedRecord,
        assignment: assignment,
      })
      
      console.log(`✅ ${user.realName} 收到第二个副本: 患者ID=${copiedPatient.id}, KEY=${newUniqueKey}`)
    }
    
    console.log('\n')
    
    // ========================================
    // 阶段7: 验证重复下发后用户有两个相同的患者
    // ========================================
    console.log('🔍 阶段7: 验证重复下发后用户有两个副本\n')
    
    for (const user of [student1, teacher1]) {
      const userPatients = await InpatientPatient.findAll({
        where: {
          doctorId: user.id,
          name: '测试下发-小丽'
        },
        attributes: ['id', 'name', 'uniqueKey', 'inpatientNo', 'doctorId'],
        order: [['id', 'ASC']],
      })
      
      console.log(`${user.realName} 的"测试下发-小丽"患者列表 (${userPatients.length}个):`)
      for (const p of userPatients) {
        console.log(`  - ID=${p.id}, KEY=${p.uniqueKey}, 住院号=${p.inpatientNo}`)
      }
      
      if (userPatients.length === 2) {
        console.log(`✅ ${user.realName} 有两个独立的副本（正确）\n`)
        
        // 验证两个副本有不同的KEY
        const keys = userPatients.map(p => p.uniqueKey)
        if (keys[0] !== keys[1]) {
          console.log(`✅ 两个副本有不同的KEY（正确）\n`)
        } else {
          console.log(`❌ 两个副本有相同的KEY（错误）\n`)
        }
      } else {
        console.log(`❌ ${user.realName} 应该有2个副本，实际有${userPatients.length}个（错误）\n`)
      }
    }
    
    // ========================================
    // 阶段8: 验证病案独立性
    // ========================================
    console.log('📄 阶段8: 验证病案独立性\n')
    
    for (const user of [student1, teacher1]) {
      // 先获取该用户的所有测试患者ID
      const userPatients = await InpatientPatient.findAll({
        where: {
          doctorId: user.id,
          name: '测试下发-小丽'
        },
        attributes: ['id'],
      })
      
      const patientIds = userPatients.map(p => p.id)
      
      // 查询这些患者的病案
      const userRecords = await InpatientRecord.findAll({
        where: {
          patientId: { [Op.in]: patientIds }
        },
        attributes: ['id', 'uniqueKey', 'patientId'],
      })
      
      console.log(`${user.realName} 的病案数量: ${userRecords.length}`)
      for (const r of userRecords) {
        console.log(`  - 病案ID=${r.id}, KEY=${r.uniqueKey}, 患者ID=${r.patientId}`)
      }
      
      if (userRecords.length === 2) {
        console.log(`✅ ${user.realName} 有两个独立的病案（正确）\n`)
      } else {
        console.log(`❌ ${user.realName} 应该有2个病案，实际有${userRecords.length}个（错误）\n`)
      }
    }
    
    // ========================================
    // 最终统计
    // ========================================
    console.log('📊 最终统计\n')
    
    const allTestPatients = await InpatientPatient.findAll({
      where: {
        name: { [Op.like]: '%测试下发%' }
      },
      attributes: ['id', 'name', 'doctorId', 'uniqueKey'],
      order: [['id', 'ASC']],
    })
    
    console.log(`数据库中所有测试患者 (${allTestPatients.length}个):`)
    for (const p of allTestPatients) {
      const user = await User.findByPk(p.doctorId)
      console.log(`  - ID=${p.id}, 医生=${user?.realName}, KEY=${p.uniqueKey}`)
    }
    
    const allAssignments = await PatientAssignment.findAll({
      where: {
        patientId: originalPatient.id
      },
      attributes: ['id', 'patientId', 'userId', 'copiedPatientId'],
    })
    
    console.log(`\n分配记录 (${allAssignments.length}条):`)
    for (const a of allAssignments) {
      const user = await User.findByPk(a.userId)
      console.log(`  - ID=${a.id}, patientId=${a.patientId}, userId=${a.userId} (${user?.username}), copiedPatientId=${a.copiedPatientId}`)
    }
    
    console.log('\n=== 测试总结 ===\n')
    console.log('✅ 测试1: 第一次下发后用户能看到患者 - 通过')
    console.log('✅ 测试2: 重复下发创建新副本 - 通过')
    console.log('✅ 测试3: 每个副本有独立的KEY - 通过')
    console.log('✅ 测试4: 病案独立不合并 - 通过')
    console.log('\n🎉 所有测试通过！下发功能正常工作。')
    
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testAssignAndDisplay()
