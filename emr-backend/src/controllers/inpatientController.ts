import { Request, Response } from 'express'
import { InpatientPatient, InpatientRecord } from '../models'
import { success, error } from '../utils/response'
import { AuthRequest } from '../middleware/auth'

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
    
    // 数据隔离：
    // - 学生：只能查看自己创建的患者
    // - 教师：可以查看所有患者（用于教学和质控）
    // - 管理员：可以查看所有患者
    if (currentUser.roleType === 'student') {
      whereCondition.doctorId = currentUser.id
    }
    // 教师和管理员不限制 doctorId，可以查看所有患者
    
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
    
    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      },
      message: '获取成功',
    })
  } catch (err: any) {
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
    const patientData = {
      ...req.body,
      doctorId: currentUser.id,
    }
    
    const patient = await InpatientPatient.create(patientData)
    res.json({
      code: 200,
      data: patient,
      message: '创建成功',
    })
  } catch (err: any) {
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
    
    await patient.update(req.body)
    res.json({
      code: 200,
      data: patient,
      message: '更新成功',
    })
  } catch (err: any) {
    return error(res, 500, err.message)
  }
}

// 删除住院患者
export const deleteInpatientPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const patient = await InpatientPatient.findByPk(id)
    
    if (!patient) {
      return error(res, 404, '患者不存在')
    }
    
    await patient.destroy()
    res.json({
      code: 200,
      data: null,
      message: '删除成功',
    })
  } catch (err: any) {
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
    
    // 数据隔离：
    // - 学生：只能查看自己创建的病案（所有状态）
    // - 教师：可以查看所有病案（用于教学和质控）
    // - 管理员：可以查看所有病案
    if (currentUser.roleType === 'student') {
      whereCondition.doctorId = currentUser.id
    }
    // 教师和管理员不限制 doctorId，可以查看所有病案
    
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
