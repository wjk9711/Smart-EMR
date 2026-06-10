import { Request, Response } from 'express'
import { InpatientPatient, InpatientRecord, PatientAssignment, User } from '../models'
import { success, error } from '../utils/response'
import { AuthRequest } from '../middleware/auth'
import { Op } from 'sequelize'

// 病案类型名称映射
const getRecordTypeName = (recordType: string): string => {
  const typeMap: Record<string, string> = {
    home_page: '病案首页',
    admission: '入院记录',
    progress: '首次病程记录',
    operation: '手术记录',
    discharge: '出院记录',
  }
  return typeMap[recordType] || recordType
}

// 病案类型排序权重（用于自定义排序）
const getRecordTypeSortWeight = (recordType: string): number => {
  const weightMap: Record<string, number> = {
    home_page: 1,      // 病案首页
    admission: 2,      // 入院记录
    progress: 3,       // 首次病程记录
    operation: 4,      // 手术记录
    discharge: 5,      // 出院记录
  }
  return weightMap[recordType] || 99
}

// 获取住院患者列表
export const getInpatientPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10, name, inpatientNo, department, status } = req.query
    const currentUser = req.user!
    
    const whereCondition: any = {}
    
    // 数据隔离优化：
    // - 学生：只能查看自己创建的患者 + 管理员下发的患者
    // - 教师：只能查看自己创建的患者 + 管理员下发的患者
    // - 管理员：只能查看自己创建的患者（不能看到其他用户的病人）
    
    let patientIds: number[] = []
    
    if (currentUser.roleType === 'admin') {
      // 管理员只能看到自己创建的患者
      whereCondition.doctorId = currentUser.id
    } else {
      // 学生和教师：查看自己创建的 + 被分配的副本
      const assignments = await PatientAssignment.findAll({
        where: { userId: currentUser.id },
        attributes: ['copiedPatientId'], // 获取副本患者ID
      })
      
      // 过滤掉null值（可能有些分配记录没有copiedPatientId）
      const copiedPatientIds = assignments
        .map(a => a.copiedPatientId)
        .filter(id => id !== null) as number[]
      
      if (copiedPatientIds.length > 0) {
        // 使用 OR 条件：doctorId = currentUser.id OR id IN (copiedPatientIds)
        whereCondition[Op.or] = [
          { doctorId: currentUser.id },
          { id: { [Op.in]: copiedPatientIds } }
        ]
      } else {
        // 没有被分配的患者，只显示自己创建的
        whereCondition.doctorId = currentUser.id
      }
    }
    
    if (name) whereCondition.name = { like: `%${name}%` }
    if (inpatientNo) whereCondition.inpatientNo = { like: `%${inpatientNo}%` }
    if (department) whereCondition.department = department
    if (status) whereCondition.status = status
    
    const { count, rows } = await InpatientPatient.findAndCountAll({
      where: whereCondition,
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['createdAt', 'DESC']],
    })
    
    // 为每个患者添加isTemplate标记（仅对非管理员用户）
    let patientsWithTemplate = rows
    if (currentUser.roleType !== 'admin' && patientIds.length > 0) {
      const templateAssignments = await PatientAssignment.findAll({
        where: {
          userId: currentUser.id,
          patientId: patientIds,
        },
        attributes: ['patientId', 'isTemplate'],
      })
      
      const templateMap = new Map<number, boolean>()
      templateAssignments.forEach(assignment => {
        templateMap.set(assignment.patientId, assignment.isTemplate)
      })
      
      patientsWithTemplate = rows.map(patient => {
        const patientData = patient.toJSON()
        return {
          ...patientData,
          isTemplate: templateMap.get(patient.id) || false,
        }
      })
    }
    
    res.json({
      code: 200,
      data: {
        list: patientsWithTemplate,
        total: count,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
      message: '获取成功',
    })
  } catch (err: any) {
    console.error('Get inpatient patients error:', err)
    return error(res, 500, err.message)
  }
}

// 获取住院患者详情
export const getInpatientPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const patient = await InpatientPatient.findByPk(id)
    
    if (!patient) {
      return error(res, 404, '患者不存在')
    }
    
    res.json({
      code: 200,
      data: patient,
      message: '获取成功',
    })
  } catch (err: any) {
    return error(res, 500, err.message)
  }
}

// 创建住院患者
export const createInpatientPatient = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!
    
    // 自动关联当前医生（数据隔离）
    // 注意：排除 sourcePatientId，新创建的患者不应该有来源
    const { sourcePatientId, inpatientNo: requestedInpatientNo, ...restData } = req.body
    
    // 处理住院号：如果未提供，则自动生成（允许重复）
    let finalInpatientNo = requestedInpatientNo
    
    if (!finalInpatientNo) {
      // 未提供住院号，自动生成（现在可以重复，仅作为显示用途）
      finalInpatientNo = await generateUniqueInpatientNo()
    }
    // 注意：不再检查住院号是否已存在，因为教学系统中住院号可以重复
    
    const patientData = {
      ...restData,
      inpatientNo: finalInpatientNo,
      uniqueKey: await generateUniqueKey('inpatient_patients'), // 生成唯一KEY
      doctorId: currentUser.id,
      sourcePatientId: null, // 明确设置为null
    }
    
    const patient = await InpatientPatient.create(patientData)
    res.json({
      code: 200,
      data: patient,
      message: '创建成功',
    })
  } catch (err: any) {
    console.error('Create inpatient patient error:', err)
    return error(res, 500, err.message)
  }
}

// 更新住院患者
export const updateInpatientPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const patient = await InpatientPatient.findByPk(id)
    
    if (!patient) {
      return error(res, 404, '患者不存在')
    }
    
    // 不允许修改 sourcePatientId
    const updateData = { ...req.body }
    delete updateData.sourcePatientId
    
    await patient.update(updateData)
    res.json({
      code: 200,
      data: patient,
      message: '更新成功',
    })
  } catch (err: any) {
    console.error('Update inpatient patient error:', err)
    return error(res, 500, err.message)
  }
}

// 删除住院患者
export const deleteInpatientPatient = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!
    const { id } = req.params
    
    const patient = await InpatientPatient.findByPk(id)
    
    if (!patient) {
      return error(res, 404, '患者不存在')
    }
    
    // 权限检查：只能删除自己创建的患者
    if (patient.doctorId !== currentUser.id) {
      return error(res, 403, '无权操作：只能删除自己创建的患者')
    }
    
    // 注意：下发后的患者是完全独立的副本，没有依赖关系
    // 每个用户可以独立删除自己的患者，不影响其他人
    
    // 删除相关的病案
    await InpatientRecord.destroy({
      where: { patientId: patient.id },
    })
    
    // 删除分配记录（如果有）
    const PatientAssignment = require('../models').PatientAssignment
    await PatientAssignment.destroy({
      where: { patientId: patient.id },
    })
    
    // 删除患者
    await patient.destroy()
    
    console.log(`✅ 用户 ${currentUser.username} 删除了患者 ID=${patient.id} (${patient.name})`)
    
    res.json({
      code: 200,
      data: null,
      message: '删除成功',
    })
  } catch (err: any) {
    console.error('Delete inpatient patient error:', err)
    return error(res, 500, err.message)
  }
}

// 获取病案列表
export const getInpatientRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10, patientId, caseNo, status } = req.query
    const currentUser = req.user!
    
    const whereCondition: any = {}
    if (patientId) whereCondition.patientId = patientId
    if (caseNo) whereCondition.caseNo = { like: `%${caseNo}%` }
    if (status) whereCondition.status = status
    
    // 数据隔离优化：
    // - 学生：只能查看自己创建的病案 + 管理员下发患者的病案
    // - 教师：只能查看自己创建的病案 + 管理员下发患者的病案
    // - 管理员：只能查看自己创建的病案（不能看到其他用户的病案）
    
    let accessiblePatientIds: number[] = []
    
    if (currentUser.roleType === 'admin') {
      // 管理员只能看到自己创建的患者对应的病案
      const adminPatients = await InpatientPatient.findAll({
        where: { doctorId: currentUser.id },
        attributes: ['id'],
      })
      accessiblePatientIds = adminPatients.map(p => p.id)
      
      if (accessiblePatientIds.length > 0) {
        whereCondition.patientId = { [Op.in]: accessiblePatientIds }
      } else {
        // 如果没有患者，返回空列表
        return res.json({
          code: 200,
          data: {
            list: [],
            total: 0,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
          },
          message: '获取成功',
        })
      }
    } else {
      // 学生和教师：查看自己创建的患者的病案 + 被分配患者的病案
      const assignments = await PatientAssignment.findAll({
        where: { userId: currentUser.id },
        attributes: ['patientId'],
      })
      const assignedPatientIds = assignments.map(a => a.patientId)
      
      // 获取自己创建的患者ID
      const ownPatients = await InpatientPatient.findAll({
        where: { doctorId: currentUser.id },
        attributes: ['id'],
      })
      const ownPatientIds = ownPatients.map(p => p.id)
      
      // 合并两个列表
      accessiblePatientIds = [...new Set([...ownPatientIds, ...assignedPatientIds])]
      
      if (accessiblePatientIds.length > 0) {
        whereCondition.patientId = { [Op.in]: accessiblePatientIds }
      } else {
        // 如果没有患者，返回空列表
        return res.json({
          code: 200,
          data: {
            list: [],
            total: 0,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
          },
          message: '获取成功',
        })
      }
    }
    
    const { count, rows } = await InpatientRecord.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: require('../models').InpatientPatient,
          as: 'patient',
          attributes: ['id', 'name', 'gender', 'age', 'inpatientNo', 'department', 'bedNo', 'admissionDate', 'dischargeDate'],
        },
      ],
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['createdAt', 'DESC']],
    })
    
    // 将患者信息合并到病案数据中
    const recordsWithPatient = rows.map((record: any) => {
      const recordData = record.toJSON()
      if (recordData.patient) {
        console.log('=== 患者信息调试 ===')
        console.log('patient:', recordData.patient)
        console.log('gender:', recordData.patient.gender)
        console.log('age:', recordData.patient.age)
        console.log('bedNo:', recordData.patient.bedNo)
        console.log('=====================')
        
        return {
          ...recordData,
          patientName: recordData.patient.name,
          gender: recordData.patient.gender,
          age: recordData.patient.age,
          inpatientNo: recordData.patient.inpatientNo,
          department: recordData.patient.department,
          bedNo: recordData.patient.bedNo,
          admissionDate: recordData.patient.admissionDate,
          dischargeDate: recordData.patient.dischargeDate,
        }
      }
      return recordData
    })
    
    // 按病案类型排序：病案首页 -> 入院记录 -> 首次病程记录 -> 手术记录 -> 出院记录
    recordsWithPatient.sort((a: any, b: any) => {
      const weightA = getRecordTypeSortWeight(a.recordType)
      const weightB = getRecordTypeSortWeight(b.recordType)
      return weightA - weightB
    })
    
    res.json({
      code: 200,
      data: {
        list: recordsWithPatient,
        total: count,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
      message: '获取成功',
    })
  } catch (err: any) {
    console.error('Get records error:', err)
    return error(res, 500, err.message)
  }
}

// 获取病案详情
export const getInpatientRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const record = await InpatientRecord.findByPk(id)
    
    if (!record) {
      return error(res, 404, '病案不存在')
    }
    
    res.json({
      code: 200,
      data: record,
      message: '获取成功',
    })
  } catch (err: any) {
    return error(res, 500, err.message)
  }
}

// 创建病案
export const createInpatientRecord = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!
    
    // 确保doctorId被设置（数据隔离）
    req.body.doctorId = currentUser.id
    
    // 病案号统一使用患者的住院号（inpatientNo）
    if (req.body.patientId) {
      const InpatientPatient = require('../models').InpatientPatient
      const patient = await InpatientPatient.findByPk(req.body.patientId)
      if (patient && patient.inpatientNo) {
        req.body.caseNo = patient.inpatientNo
        console.log('✅ 病案号设置为患者住院号:', req.body.caseNo)
        
        // 检查该患者是否已有该类型的病案
        const existingRecord = await InpatientRecord.findOne({
          where: {
            patientId: req.body.patientId,
            recordType: req.body.recordType,
          },
        })
        
        if (existingRecord) {
          console.log('❌ 病案类型重复:', req.body.recordType)
          return error(res, 400, `该患者已存在${getRecordTypeName(req.body.recordType)}，不能重复创建`)
        }
      }
    }
    
    // 序列化content字段为JSON字符串
    if (req.body.content && typeof req.body.content === 'object') {
      req.body.content = JSON.stringify(req.body.content)
    }
    
    console.log('=== 创建病案调试信息 ===')
    console.log('请求体:', JSON.stringify(req.body, null, 2))
    console.log('patientId:', req.body.patientId)
    console.log('recordType:', req.body.recordType)
    console.log('caseNo:', req.body.caseNo)
    console.log('=========================')
    
    const record = await InpatientRecord.create(req.body)
    res.json({
      code: 200,
      data: record,
      message: '创建成功',
    })
  } catch (err: any) {
    console.error('❌ Create record error:', err)
    console.error('❌ Error name:', err.name)
    console.error('❌ Error message:', err.message)
    console.error('❌ Error details:', JSON.stringify(err.errors, null, 2))
    console.error('❌ Error original:', err.original)
    
    // 如果是唯一约束错误，返回更友好的提示
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors?.[0]?.path || '未知字段'
      return error(res, 400, `${field}已存在，不能重复创建`)
    }
    
    // 如果是验证错误，返回详细信息
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors?.map((e: any) => e.message).join(', ') || '验证失败'
      return error(res, 400, messages)
    }
    
    return error(res, 500, err.message || '服务器错误')
  }
}

// 更新病案
export const updateInpatientRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    console.log('更新病案 - ID:', id)
    console.log('更新病案 - 请求体:', req.body)
    
    const record = await InpatientRecord.findByPk(id)
    
    if (!record) {
      return error(res, 404, '病案不存在')
    }
    
    // 序列化诊断和处方字段（如果存在）
    if (req.body.diagnosis) {
      req.body.diagnosis = JSON.stringify(req.body.diagnosis)
    }
    if (req.body.prescription) {
      req.body.prescription = JSON.stringify(req.body.prescription)
    }
    
    // content 字段已经是 JSON 字符串，不需要额外处理
    // 但需要确保它是有效的 JSON 字符串
    if (req.body.content && typeof req.body.content === 'object') {
      req.body.content = JSON.stringify(req.body.content)
    }
    
    console.log('更新病案 - 处理后的数据:', req.body)
    
    await record.update(req.body)
    
    console.log('更新病案 - 成功')
    
    res.json({
      code: 200,
      data: record,
      message: '更新成功',
    })
  } catch (err: any) {
    console.error('更新病案 - 错误:', err)
    console.error('更新病案 - 错误详情:', err.message)
    
    // 如果是 Sequelize 验证错误，输出详细信息
    if (err.name === 'SequelizeValidationError') {
      console.error('验证错误详情:')
      err.errors.forEach((e: any) => {
        console.error(`  - 字段: ${e.path}, 值: ${e.value}, 消息: ${e.message}`)
      })
    }
    
    return error(res, 500, err.message || '更新失败')
  }
}

// 删除病案
export const deleteInpatientRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const record = await InpatientRecord.findByPk(id)
    
    if (!record) {
      return error(res, 404, '病案不存在')
    }
    
    await record.destroy()
    res.json({
      code: 200,
      data: null,
      message: '删除成功',
    })
  } catch (err: any) {
    return error(res, 500, err.message)
  }
}

// ==================== 病历提交流程 API ====================

// 学生提交病历给教师
export const submitRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { teacherId } = req.body
    
    const currentUser = (req as any).user
    if (!currentUser) {
      return error(res, 401, '未授权：请先登录')
    }
    
    // 只有学生可以提交
    if (currentUser.roleType !== 'student') {
      return error(res, 403, '无权操作：只有学生可以提交病历')
    }
    
    const record = await InpatientRecord.findByPk(id)
    
    if (!record) {
      return error(res, 404, '病案不存在')
    }
    
    // 检查是否是当前学生的病历
    if (record.doctorId !== currentUser.id) {
      return error(res, 403, '无权操作：这不是您的病历')
    }
    
    // 更新提交状态
    await record.update({
      submitStatus: 'pending_review',
      teacherId: teacherId,
      submittedAt: new Date(),
    })
    
    res.json({
      code: 200,
      data: record,
      message: '提交成功，等待教师审核',
    })
  } catch (err: any) {
    console.error('Submit record error:', err)
    return error(res, 500, err.message)
  }
}

// 教师获取待质控的病历列表
export const getPendingReviewRecords = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    if (!currentUser) {
      return error(res, 401, '未授权：请先登录')
    }
    
    // 只有教师和管理员可以查看
    if (currentUser.roleType !== 'teacher' && currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：只有教师可以查看待质控病历')
    }
    
    const { page = 1, pageSize = 10, status } = req.query
    
    const whereCondition: any = {}
    
    // 教师只能看到提交给自己的病历（管理员可以看到所有）
    if (currentUser.roleType === 'teacher') {
      whereCondition.teacherId = currentUser.id
    }
    
    // 按提交状态筛选
    if (status) {
      whereCondition.submitStatus = status
    } else {
      // 默认只显示待审核的
      whereCondition.submitStatus = 'pending_review'
    }
    
    const { count, rows } = await InpatientRecord.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: require('../models').InpatientPatient,
          as: 'patient',
          attributes: ['id', 'name', 'inpatientNo', 'department', 'bedNo'],
        },
        {
          model: require('../models').User,
          as: 'doctor',
          attributes: ['id', 'username', 'realName'],
        },
      ],
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['submittedAt', 'DESC']],
    })
    
    // 将患者和医生信息合并到病案数据中
    const recordsWithInfo = rows.map((record: any) => {
      const recordData = record.toJSON()
      const result: any = {
        ...recordData,
        patientName: recordData.patient?.name || '-',
        inpatientNo: recordData.patient?.inpatientNo || '-',
        department: recordData.patient?.department || '-',
        bedNo: recordData.patient?.bedNo || '-',
        studentName: recordData.doctor?.realName || recordData.doctor?.username || '-',
      }
      return result
    })
    
    res.json({
      code: 200,
      data: {
        list: recordsWithInfo,
        total: count,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
      message: '获取成功',
    })
  } catch (err: any) {
    console.error('Get pending review records error:', err)
    return error(res, 500, err.message)
  }
}

// 教师提交质控结果
export const reviewRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { result, comment } = req.body // result: 'passed' | 'rejected'
    
    const currentUser = (req as any).user
    if (!currentUser) {
      return error(res, 401, '未授权：请先登录')
    }
    
    // 只有教师可以审核
    if (currentUser.roleType !== 'teacher' && currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：只有教师可以审核病历')
    }
    
    const record = await InpatientRecord.findByPk(id)
    
    if (!record) {
      return error(res, 404, '病案不存在')
    }
    
    // 检查是否是提交给当前教师的病历（管理员可以审核所有）
    if (currentUser.roleType === 'teacher' && record.teacherId !== currentUser.id) {
      return error(res, 403, '无权操作：这不是提交给您的病历')
    }
    
    // 检查状态是否为待审核
    if (record.submitStatus !== 'pending_review') {
      return error(res, 400, '该病历不在待审核状态')
    }
    
    // 更新审核结果
    await record.update({
      submitStatus: result === 'passed' ? 'passed' : 'rejected',
      qualityComment: comment || '',
      reviewedAt: new Date(),
    })
    
    res.json({
      code: 200,
      data: record,
      message: result === 'passed' ? '审核通过' : '审核不通过，已返回修改',
    })
  } catch (err: any) {
    console.error('Review record error:', err)
    return error(res, 500, err.message)
  }
}

// 获取教师列表（供学生选择提交对象）
export const getTeacherList = async (req: Request, res: Response) => {
  try {
    const { User } = require('../models')
    
    const teachers = await User.findAll({
      where: {
        roleType: 'teacher',
        status: 'active',
      },
      attributes: ['id', 'username', 'realName'],
      order: [['realName', 'ASC']],
    })
    
    res.json({
      code: 200,
      data: teachers,
      message: '获取成功',
    })
  } catch (err: any) {
    console.error('Get teacher list error:', err)
    return error(res, 500, err.message)
  }
}

// ==================== 辅助函数 ====================

// 生成13位随机字符串（大写字母+数字）
function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 13; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 检查KEY是否已存在
async function isKeyExists(table: string, key: string): Promise<boolean> {
  const sequelize = require('../config/database').default
  const [rows] = await sequelize.query(
    `SELECT id FROM \`${table}\` WHERE unique_key = ? LIMIT 1`,
    { replacements: [key] }
  )
  return (rows as any[]).length > 0
}

// 生成唯一的KEY（最多尝试10次）
async function generateUniqueKey(table: string, maxRetries: number = 10): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const key = generateRandomKey()
    const exists = await isKeyExists(table, key)
    
    if (!exists) {
      return key
    }
    
    console.log(`⚠️  KEY ${key} 已存在，重试 (${i + 1}/${maxRetries})`)
  }
  
  throw new Error(`无法生成唯一KEY，已重试${maxRetries}次`)
}

// 生成唯一住院号
async function generateUniqueInpatientNo(): Promise<string> {
  let inpatientNo = ''
  let exists = true
  
  while (exists) {
    const date = new Date()
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    inpatientNo = `ZY${dateStr}${random}`
    
    const existing = await InpatientPatient.findOne({
      where: { inpatientNo },
    })
    
    exists = !!existing
  }
  
  return inpatientNo
}

// ==================== 患者下发功能 API ====================

// 管理员下发患者给所有非管理员用户（方案B：完全复制）
export const assignPatientsToAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!
    
    // 只有管理员可以下发患者
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：只有管理员可以下发患者')
    }
    
    const { patientIds, isTemplate = false } = req.body
    
    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return error(res, 400, '请选择要下发的患者')
    }
    
    // 验证患者是否存在且属于管理员
    const patients = await InpatientPatient.findAll({
      where: {
        id: patientIds,
        doctorId: currentUser.id, // 确保是管理员创建的患者
      },
    })
    
    if (patients.length !== patientIds.length) {
      return error(res, 400, '部分患者不存在或不属于您')
    }
    
    // 获取所有非管理员用户
    const users = await User.findAll({
      where: {
        roleType: { [Op.ne]: 'admin' }, // 排除管理员
      },
      attributes: ['id'],
    })
    
    if (users.length === 0) {
      return error(res, 400, '没有可接收患者的用户')
    }
    
    // 使用事务确保原子性
    const sequelize = require('../config/database').default
    const transaction = await sequelize.transaction()
    
    console.log('=== 开始下发患者 ===')
    console.log('患者IDs:', patientIds)
    console.log('用户数量:', users.length)
    console.log('isTemplate:', isTemplate)
    
    try {
      let totalCopiedPatients = 0
      let totalCopiedRecords = 0
      
      for (const originalPatient of patients) {
        console.log(`\n处理原始患者: ${originalPatient.id} (${originalPatient.name})`)
        
        for (const user of users) {
          console.log(`  → 下发给用户: ${user.id}`)
          // 注意：不再检查是否已分配过，允许重复下发
          // 每次下发都创建新的副本患者和病案
          
          // 生成新的唯一KEY（唯一需要重新生成的字段）
          console.log(`    - 生成患者唯一KEY...`)
          const newUniqueKey = await generateUniqueKey('inpatient_patients')
          console.log(`    - 患者KEY: ${newUniqueKey}`)
          
          // 复制患者数据（完全独立，不记录来源）
          // 注意：除了 unique_key 外，所有其他字段都保持原样
          console.log(`    - 创建副本患者...`)
          const copiedPatient = await InpatientPatient.create({
            name: originalPatient.name,
            gender: originalPatient.gender,
            birthDate: originalPatient.birthDate,
            age: originalPatient.age,
            idCard: originalPatient.idCard,      // ✅ 保持原样
            phone: originalPatient.phone,         // ✅ 保持原样
            address: originalPatient.address,     // ✅ 保持原样
            inpatientNo: originalPatient.inpatientNo, // ✅ 保持原样（住院号可以重复）
            uniqueKey: newUniqueKey,              // ✅ 唯一需要重新生成的字段
            department: originalPatient.department,
            bedNo: originalPatient.bedNo,
            admissionDate: originalPatient.admissionDate,
            dischargeDate: originalPatient.dischargeDate,
            status: originalPatient.status,
            diagnosis: originalPatient.diagnosis,
            doctorId: user.id,                    // ✅ 设置为接收者
            sourcePatientId: null,                // ✅ 不记录来源，完全独立
          }, { transaction })
          
          totalCopiedPatients++
          console.log(`✅ 复制患者: ${originalPatient.id} -> ${copiedPatient.id} (住院号: ${originalPatient.inpatientNo})`)
          
          // 复制该患者的所有病案
          const originalRecords = await InpatientRecord.findAll({
            where: { patientId: originalPatient.id },
            transaction,
          })
          
          for (const record of originalRecords) {
            // 为每个病案生成新的唯一KEY
            const recordUniqueKey = await generateUniqueKey('inpatient_records')
            
            await InpatientRecord.create({
              patientId: copiedPatient.id,
              recordType: record.recordType,
              caseNo: originalPatient.inpatientNo, // ✅ 使用原始住院号（保持原样）
              uniqueKey: recordUniqueKey, // ✅ 新生成的唯一KEY
              content: record.content,
              doctorId: user.id,
              sourceRecordId: null, // 不记录来源，完全独立
              status: record.status,
              submitStatus: record.submitStatus,
              teacherId: record.teacherId,
              qualityComment: record.qualityComment,
            }, { transaction })
            
            totalCopiedRecords++
          }
          
          if (originalRecords.length > 0) {
            console.log(`  └─ 复制了 ${originalRecords.length} 个病案`)
          }
          
          // 创建分配记录
          await PatientAssignment.create({
            patientId: originalPatient.id, // 原始患者ID
            userId: user.id,
            assignedBy: currentUser.id,
            isTemplate,
            copiedPatientId: copiedPatient.id, // 复制后的患者ID
            copiedAt: new Date(),
          }, { transaction })
        }
      }
      
      await transaction.commit()
      
      res.json({
        code: 200,
        data: {
          copiedPatients: totalCopiedPatients,
          copiedRecords: totalCopiedRecords,
          patientCount: patients.length,
          userCount: users.length,
        },
        message: `成功将 ${patients.length} 个患者下发给 ${users.length} 个用户，创建了 ${totalCopiedPatients} 个患者副本和 ${totalCopiedRecords} 个病案副本`,
      })
    } catch (err: any) {
      await transaction.rollback()
      console.error('❌ 事务回滚:', err.message)
      throw err
    }
  } catch (err: any) {
    console.error('Assign patients error:', err)
    return error(res, 500, err.message)
  }
}

// 切换患者的模板状态
export const togglePatientTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!
    const { patientId } = req.params
    const { isTemplate } = req.body
    
    // 只有管理员可以设置模板
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：只有管理员可以设置模板')
    }
    
    // 验证患者是否存在
    const patient = await InpatientPatient.findByPk(patientId)
    if (!patient) {
      return error(res, 404, '患者不存在')
    }
    
    // 更新所有该患者的分配记录的模板状态
    await PatientAssignment.update(
      { isTemplate },
      {
        where: { patientId },
      }
    )
    
    res.json({
      code: 200,
      data: { patientId, isTemplate },
      message: isTemplate ? '已设为模板' : '已取消模板',
    })
  } catch (err: any) {
    console.error('Toggle template error:', err)
    return error(res, 500, err.message)
  }
}
