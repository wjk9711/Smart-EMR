import { Request, Response } from 'express'
import { Patient, Visit } from '../models'
import { success, error, notFound } from '../utils/response'
import { v4 as uuidv4 } from 'uuid'
import { AuthRequest } from '../middleware/auth'

// 生成病历号
function generatePatientNo(): string {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `P${year}${random}`
}

// 生成就诊号
function generateVisitNo(): string {
  const date = new Date()
  const timestamp = date.getTime().toString().slice(-6)
  return `V${date.getFullYear()}${timestamp}`
}

export async function getPatients(req: AuthRequest, res: Response) {
  try {
    const { keyword, patientNo, name, page = 1, pageSize = 10 } = req.query
    const currentUser = req.user!

    const where: any = {}

    // 数据隔离：所有用户（包括教师）只能看到自己创建的患者
    // 教师通过查看已提交的病历来了解学生管理的患者
    if (currentUser.roleType !== 'admin') {
      where.doctorId = currentUser.id
    }
    // 管理员可以看到所有患者

    if (keyword) {
      where[Symbol.for('or')] = [
        { name: { [Symbol.for('like')]: `%${keyword}%` } },
        { patientNo: { [Symbol.for('like')]: `%${keyword}%` } },
      ]
    }

    if (patientNo) {
      where.patientNo = { [Symbol.for('like')]: `%${patientNo}%` }
    }

    if (name) {
      where.name = { [Symbol.for('like')]: `%${name}%` }
    }

    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const offset = (pageNum - 1) * pageSizeNum

    const { count, rows } = await Patient.findAndCountAll({
      where,
      limit: pageSizeNum,
      offset,
      order: [['createdAt', 'DESC']],
    })

    return success(res, {
      total: count,
      list: rows,
    })
  } catch (err) {
    console.error('Get patients error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function getPatient(req: Request, res: Response) {
  try {
    const { id } = req.params

    const patient = await Patient.findByPk(id)

    if (!patient) {
      return notFound(res, '患者不存在')
    }

    return success(res, patient)
  } catch (err) {
    console.error('Get patient error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function createPatient(req: AuthRequest, res: Response) {
  try {
    const patientData = req.body
    const currentUser = req.user!

    // 自动生成病历号
    patientData.patientNo = generatePatientNo()
    
    // 自动关联当前医生（数据隔离）
    patientData.doctorId = currentUser.id

    const patient = await Patient.create(patientData)

    return success(res, patient, '创建成功')
  } catch (err) {
    console.error('Create patient error:', err)
    return error(res, 500, '创建失败')
  }
}

export async function updatePatient(req: Request, res: Response) {
  try {
    const { id } = req.params
    const patientData = req.body

    const patient = await Patient.findByPk(id)

    if (!patient) {
      return notFound(res, '患者不存在')
    }

    await patient.update(patientData)

    return success(res, patient, '更新成功')
  } catch (err) {
    console.error('Update patient error:', err)
    return error(res, 500, '更新失败')
  }
}

export async function getVisits(req: Request, res: Response) {
  try {
    const { patientId } = req.params

    const visits = await Visit.findAll({
      where: { patientId },
      order: [['visitDate', 'DESC']],
    })

    return success(res, visits)
  } catch (err) {
    console.error('Get visits error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function createVisit(req: any, res: Response) {
  try {
    const visitData = req.body

    console.log('Creating visit with data:', visitData)

    // 验证必需字段
    if (!visitData.patientId) {
      return error(res, 400, '患者ID不能为空')
    }

    // 设置默认值
    visitData.visitNo = generateVisitNo()
    visitData.visitType = visitData.visitType || 'outpatient'
    visitData.visitDate = visitData.visitDate || new Date().toISOString().split('T')[0]
    visitData.status = visitData.status || 'pending'

    console.log('Visit data after defaults:', visitData)

    const visit = await Visit.create(visitData)

    console.log('Visit created successfully:', visit.id)
    return success(res, visit, '创建成功')
  } catch (err) {
    console.error('Create visit error:', err)
    
    // 提供更详细的错误信息
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
      
      // Sequelize 验证错误
      if (err.name === 'SequelizeValidationError') {
        const validationErrors = (err as any).errors?.map((e: any) => `${e.path}: ${e.message}`).join(', ')
        return error(res, 400, `数据验证失败: ${validationErrors}`)
      }
      
      // Sequelize 数据库错误
      if (err.name === 'SequelizeDatabaseError') {
        return error(res, 400, `数据库错误: ${err.message}`)
      }
      
      // Sequelize 唯一约束错误
      if (err.name === 'SequelizeUniqueConstraintError') {
        return error(res, 400, '就诊号已存在，请重试')
      }
      
      return error(res, 500, `创建失败: ${err.message}`)
    }
    
    return error(res, 500, '创建失败')
  }
}
