import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { success, error } from '../utils/response'
import QualityReport from '../models/QualityReport'
import User from '../models/User'
import fs from 'fs'
import path from 'path'

// 生成15位随机字符串（大写字母+数字）
const generateReportKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 获取质控报告列表
 */
export const getQualityReports = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const userId = currentUser?.id
    
    console.log('=== 获取质控报告列表 ===')
    console.log('当前用户:', currentUser ? {
      id: currentUser.id,
      username: currentUser.username,
      roleType: currentUser.roleType
    } : 'null')
    console.log('用户ID:', userId)
    
    if (!userId) {
      console.error('❌ 未获取到用户ID')
      return error(res, 401, '未登录')
    }

    console.log('查询条件: userId =', userId)
    const reports = await QualityReport.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'reportKey', 'reportName', 'fileSize', 'createdAt', 'updatedAt'],
    })

    console.log('✅ 查询成功，返回', reports.length, '条记录')
    reports.forEach((report, index) => {
      console.log(`  ${index + 1}. ID:${report.id} 名称:${report.reportName} 用户ID:${report.userId}`)
    })

    return success(res, reports, '获取成功')
  } catch (err: any) {
    console.error('获取质控报告列表失败:', err)
    return error(res, 500, err.message || '获取失败')
  }
}

/**
 * 创建新质控报告
 */
export const createQualityReport = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const userId = currentUser?.id
    
    console.log('=== 创建质控报告 ===')
    console.log('当前用户:', currentUser ? {
      id: currentUser.id,
      username: currentUser.username
    } : 'null')
    console.log('用户ID:', userId)
    
    if (!userId) {
      console.error('❌ 未获取到用户ID')
      return error(res, 401, '未登录')
    }

    const { reportName } = req.body
    if (!reportName) {
      return error(res, 400, '报告名称不能为空')
    }

    console.log('报告名称:', reportName)

    // 生成唯一的15位报告关键值
    let reportKey = generateReportKey()
    let exists = await QualityReport.findOne({ where: { reportKey } })
    
    // 确保唯一性
    while (exists) {
      reportKey = generateReportKey()
      exists = await QualityReport.findOne({ where: { reportKey } })
    }

    console.log('生成的关键值:', reportKey)

    // 创建文件存储目录
    const uploadDir = path.join(__dirname, '../../uploads/quality-reports')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 初始文件路径（空文档）
    const fileName = `${userId}_${reportKey}.docx`
    const filePath = path.join(uploadDir, fileName)
    
    console.log('文件路径:', filePath)
    
    // 创建空的Word文档（最小化的DOCX结构）
    const emptyDocx = Buffer.from(
      'UEsDBBQABgAIAAAAIQDd/JHvvgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC',
      'base64'
    )
    fs.writeFileSync(filePath, emptyDocx)

    console.log('准备创建数据库记录...')
    const report = await QualityReport.create({
      userId,
      reportKey,
      reportName,
      filePath,
      fileSize: 0,
    })

    console.log('✅ 创建成功')
    console.log('报告ID:', report.id)
    console.log('报告用户ID:', report.userId)
    console.log('报告关键值:', report.reportKey)

    return success(res, report, '创建成功')
  } catch (err: any) {
    console.error('创建质控报告失败:', err)
    return error(res, 500, err.message || '创建失败')
  }
}

/**
 * 更新质控报告（保存Word文档内容）
 */
export const updateQualityReport = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const userId = currentUser?.id
    if (!userId) {
      return error(res, 401, '未登录')
    }

    const { id } = req.params
    const { reportName, content } = req.body

    const report = await QualityReport.findOne({
      where: { id, userId },
    })

    if (!report) {
      return error(res, 404, '报告不存在或无权限')
    }

    // 更新报告名称
    if (reportName) {
      report.reportName = reportName
    }

    // 保存Word文档内容
    if (content) {
      // 将HTML内容转换为Word文档格式
      const docxContent = convertHtmlToDocx(content)
      fs.writeFileSync(report.filePath, docxContent)
      
      // 更新文件大小
      const stats = fs.statSync(report.filePath)
      report.fileSize = stats.size
    }

    await report.save()

    return success(res, report, '保存成功')
  } catch (err: any) {
    console.error('更新质控报告失败:', err)
    return error(res, 500, err.message || '保存失败')
  }
}

/**
 * 删除单个质控报告
 */
export const deleteQualityReport = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const userId = currentUser?.id
    if (!userId) {
      return error(res, 401, '未登录')
    }

    const { id } = req.params

    const report = await QualityReport.findOne({
      where: { id, userId },
    })

    if (!report) {
      return error(res, 404, '报告不存在或无权限')
    }

    // 删除文件
    if (fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath)
    }

    // 删除数据库记录
    await report.destroy()

    return success(res, null, '删除成功')
  } catch (err: any) {
    console.error('删除质控报告失败:', err)
    return error(res, 500, err.message || '删除失败')
  }
}

/**
 * 批量删除质控报告
 */
export const batchDeleteQualityReports = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const userId = currentUser?.id
    if (!userId) {
      return error(res, 401, '未登录')
    }

    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error(res, 400, '请选择要删除的报告')
    }

    const reports = await QualityReport.findAll({
      where: {
        id: { [Op.in]: ids },
        userId,
      },
    })

    if (reports.length === 0) {
      return error(res, 404, '没有找到要删除的报告')
    }

    // 删除所有文件
    reports.forEach(report => {
      if (fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath)
      }
    })

    // 批量删除数据库记录
    await QualityReport.destroy({
      where: {
        id: { [Op.in]: ids },
        userId,
      },
    })

    return success(res, null, `成功删除${reports.length}个报告`)
  } catch (err: any) {
    console.error('批量删除质控报告失败:', err)
    return error(res, 500, err.message || '批量删除失败')
  }
}

/**
 * 获取质控报告详情（用于编辑器加载）
 */
export const getQualityReportDetail = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const userId = currentUser?.id
    if (!userId) {
      return error(res, 401, '未登录')
    }

    const { id } = req.params

    const report = await QualityReport.findOne({
      where: { id, userId },
    })

    if (!report) {
      return error(res, 404, '报告不存在或无权限')
    }

    // 读取文件内容
    let content = ''
    if (fs.existsSync(report.filePath)) {
      const buffer = fs.readFileSync(report.filePath)
      // 这里可以添加DOCX到HTML的转换逻辑
      content = buffer.toString('base64')
    }

    return success(res, {
      id: report.id,
      userId: report.userId,
      reportKey: report.reportKey,
      reportName: report.reportName,
      filePath: report.filePath,
      fileSize: report.fileSize,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      content,
    }, '获取成功')
  } catch (err: any) {
    console.error('获取质控报告详情失败:', err)
    return error(res, 500, err.message || '获取失败')
  }
}

/**
 * 简单的HTML转DOCX（简化版，实际项目中建议使用专业库如html-docx-js）
 */
const convertHtmlToDocx = (html: string): Buffer => {
  // 这是一个简化的实现，实际项目中应该使用专业的HTML转Word库
  // 例如：html-docx-js、mammoth.js等
  
  // 创建一个基本的DOCX结构
  const docxHeader = Buffer.from([
    0x50, 0x4B, 0x03, 0x04, // ZIP header
    // ... DOCX structure
  ])
  
  // 在实际项目中，这里应该使用专业库进行转换
  // 暂时返回一个简单的文本文件作为占位符
  return Buffer.from(html)
}
