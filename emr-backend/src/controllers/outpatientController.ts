import { Request, Response } from 'express'
import { OutpatientRecord, User } from '../models'
import { success, error, notFound } from '../utils/response'
import { Op } from 'sequelize'
import { AuthRequest } from '../middleware/auth'

export async function getRecords(req: AuthRequest, res: Response) {
  try {
    const { patientId, doctorId, status, page = 1, pageSize = 10 } = req.query
    const currentUser = req.user!

    const where: any = {}

    if (patientId) {
      where.patientId = patientId
    }

    if (doctorId) {
      where.doctorId = doctorId
    }

    if (status) {
      where.status = status
    }
    
    // 数据隔离：
    // - 学生：只能查看自己创建的病历（所有状态）
    // - 教师：只能查看学生已提交的病历（用于质控审核）
    if (currentUser.roleType === 'student') {
      where.doctorId = currentUser.id
    } else if (currentUser.roleType === 'teacher') {
      // 教师只看已提交的病历
      where.submitStatus = { [Op.in]: ['pending_review', 'passed', 'rejected'] }
    }

    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const offset = (pageNum - 1) * pageSizeNum

    const { count, rows } = await OutpatientRecord.findAndCountAll({
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
    console.error('Get records error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function getRecord(req: Request, res: Response) {
  try {
    const { id } = req.params

    const record = await OutpatientRecord.findByPk(id)

    if (!record) {
      return notFound(res, '病历不存在')
    }

    return success(res, record)
  } catch (err) {
    console.error('Get record error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function createRecord(req: any, res: Response) {
  try {
    const recordData = req.body

    console.log('Creating record with data:', recordData)

    // 验证必需字段
    if (!recordData.visitId) {
      return error(res, 400, '缺少就诊ID (visitId)')
    }
    
    if (!recordData.patientId) {
      return error(res, 400, '缺少患者ID (patientId)')
    }

    // 自动设置医生ID
    recordData.doctorId = req.user.id
    recordData.version = 1
    recordData.status = recordData.status || 'draft'

    // 将数组/对象转换为 JSON 字符串
    if (recordData.diagnosis && Array.isArray(recordData.diagnosis)) {
      recordData.diagnosis = JSON.stringify(recordData.diagnosis)
    }
    
    if (recordData.prescription && Array.isArray(recordData.prescription)) {
      recordData.prescription = JSON.stringify(recordData.prescription)
    }

    console.log('Record data after processing:', recordData)

    const record = await OutpatientRecord.create(recordData)

    return success(res, record, '创建成功')
  } catch (err) {
    console.error('Create record error:', err)
    
    // 提供更详细的错误信息
    if (err instanceof Error) {
      console.error('Error details:', err.message)
      console.error('Error stack:', err.stack)
      
      // Sequelize 验证错误
      if (err.name === 'SequelizeValidationError') {
        const validationErrors = (err as any).errors?.map((e: any) => e.message).join(', ')
        return error(res, 400, `数据验证失败: ${validationErrors}`)
      }
      
      // Sequelize 数据库错误
      if (err.name === 'SequelizeDatabaseError') {
        return error(res, 400, `数据库错误: ${err.message}`)
      }
      
      return error(res, 500, `创建失败: ${err.message}`)
    }
    
    return error(res, 500, '创建失败')
  }
}

export async function updateRecord(req: Request, res: Response) {
  try {
    const { id } = req.params
    const recordData = req.body

    const record = await OutpatientRecord.findByPk(id)

    if (!record) {
      return notFound(res, '病历不存在')
    }

    // 增加版本号
    recordData.version = (record.version || 1) + 1

    // 将数组/对象转换为 JSON 字符串
    if (recordData.diagnosis && Array.isArray(recordData.diagnosis)) {
      recordData.diagnosis = JSON.stringify(recordData.diagnosis)
    }
    
    if (recordData.prescription && Array.isArray(recordData.prescription)) {
      recordData.prescription = JSON.stringify(recordData.prescription)
    }

    await record.update(recordData)

    return success(res, record, '更新成功')
  } catch (err) {
    console.error('Update record error:', err)
    return error(res, 500, '更新失败')
  }
}

export async function deleteRecord(req: Request, res: Response) {
  try {
    const { id } = req.params

    const record = await OutpatientRecord.findByPk(id)

    if (!record) {
      return notFound(res, '病历不存在')
    }

    await record.destroy()

    return success(res, null, '删除成功')
  } catch (err) {
    console.error('Delete record error:', err)
    return error(res, 500, '删除失败')
  }
}

export async function completeRecord(req: Request, res: Response) {
  try {
    const { id } = req.params

    const record = await OutpatientRecord.findByPk(id)

    if (!record) {
      return notFound(res, '病历不存在')
    }

    await record.update({
      status: 'completed',
      completedAt: new Date(),
    })

    return success(res, record, '已完成')
  } catch (err) {
    console.error('Complete record error:', err)
    return error(res, 500, '操作失败')
  }
}

export async function getRevisions(req: Request, res: Response) {
  try {
    const { id } = req.params

    // TODO: 实现修订历史查询
    return success(res, [])
  } catch (err) {
    console.error('Get revisions error:', err)
    return error(res, 500, '服务器错误')
  }
}

// ==================== 门诊病历提交流程 API ====================

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
    
    const record = await OutpatientRecord.findByPk(id)
    
    if (!record) {
      return notFound(res, '病历不存在')
    }
    
    // 验证：只能提交自己的病历
    if (record.doctorId !== currentUser.id) {
      return error(res, 403, '无权操作：只能提交自己创建的病历')
    }
    
    // 验证：只能提交未提交的病历
    if (record.submitStatus !== 'not_submitted') {
      return error(res, 400, `当前状态为${getSubmitStatusText(record.submitStatus)}，无法提交`)
    }
    
    // 验证教师是否存在
    const teacher = await User.findByPk(teacherId)
    if (!teacher || teacher.roleType !== 'teacher') {
      return error(res, 400, '无效的教师ID')
    }
    
    // 更新病历状态
    await record.update({
      submitStatus: 'pending_review',
      teacherId,
      submittedAt: new Date(),
    })
    
    return success(res, record, '提交成功')
  } catch (err: any) {
    console.error('Submit record error:', err)
    return error(res, 500, err.message || '提交失败')
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
      return error(res, 403, '无权访问：只有教师可以审核病历')
    }
    
    const { status = 'pending_review', page = 1, pageSize = 10 } = req.query
    
    const whereCondition: any = {}
    
    // 如果是教师，只显示提交给自己的病历
    if (currentUser.roleType === 'teacher') {
      whereCondition.teacherId = currentUser.id
    }
    
    // 状态筛选
    if (status && status !== 'all') {
      whereCondition.submitStatus = status
    }
    
    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const offset = (pageNum - 1) * pageSizeNum
    
    const { count, rows } = await OutpatientRecord.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'username', 'realName'],
        },
      ],
      order: [['submittedAt', 'DESC']],
      limit: pageSizeNum,
      offset,
    })
    
    return success(res, {
      total: count,
      list: rows,
      page: pageNum,
      pageSize: pageSizeNum,
    })
  } catch (err: any) {
    console.error('Get pending review records error:', err)
    return error(res, 500, err.message || '获取列表失败')
  }
}

// 教师提交质控结果
export const reviewRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { result, comment } = req.body
    
    const currentUser = (req as any).user
    if (!currentUser) {
      return error(res, 401, '未授权：请先登录')
    }
    
    // 只有教师和管理员可以审核
    if (currentUser.roleType !== 'teacher' && currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：只有教师可以审核病历')
    }
    
    const record = await OutpatientRecord.findByPk(id)
    
    if (!record) {
      return notFound(res, '病历不存在')
    }
    
    // 验证：只能审核提交给自己的病历（教师）
    if (currentUser.roleType === 'teacher' && record.teacherId !== currentUser.id) {
      return error(res, 403, '无权操作：该病历未提交给您')
    }
    
    // 验证：只能审核待检查状态的病历
    if (record.submitStatus !== 'pending_review') {
      return error(res, 400, `当前状态为${getSubmitStatusText(record.submitStatus)}，无法审核`)
    }
    
    // 更新病历状态
    await record.update({
      submitStatus: result,
      qualityComment: comment || '',
      reviewedAt: new Date(),
    })
    
    return success(res, record, result === 'passed' ? '审核通过' : '已退回修改')
  } catch (err: any) {
    console.error('Review record error:', err)
    return error(res, 500, err.message || '审核失败')
  }
}

// 获取教师列表（供学生选择）
export const getTeacherList = async (req: Request, res: Response) => {
  try {
    const teachers = await User.findAll({
      where: {
        roleType: 'teacher',
        status: 'active',
      },
      attributes: ['id', 'username', 'realName'],
      order: [['realName', 'ASC']],
    })
    
    return success(res, teachers)
  } catch (err: any) {
    console.error('Get teacher list error:', err)
    return error(res, 500, err.message || '获取教师列表失败')
  }
}

// 辅助函数：获取提交状态文本
const getSubmitStatusText = (status?: string) => {
  const texts: Record<string, string> = {
    not_submitted: '未提交',
    pending_review: '待检查',
    passed: '通过',
    rejected: '不通过',
  }
  return texts[status || 'not_submitted'] || status
}
