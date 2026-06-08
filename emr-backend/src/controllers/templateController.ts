import { Request, Response } from 'express'
import { Template } from '../models'
import { success, error, notFound } from '../utils/response'

export async function getTemplates(req: Request, res: Response) {
  try {
    const { category } = req.query

    const where: any = {}

    if (category) {
      where.category = category
    }

    const templates = await Template.findAll({
      where,
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
    })

    return success(res, templates)
  } catch (err) {
    console.error('Get templates error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function getTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params

    const template = await Template.findByPk(id)

    if (!template) {
      return notFound(res, '模板不存在')
    }

    return success(res, template)
  } catch (err) {
    console.error('Get template error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function createTemplate(req: any, res: Response) {
  try {
    const templateData = req.body

    // 自动设置创建者ID
    templateData.creatorId = req.user.id
    templateData.usageCount = 0

    const template = await Template.create(templateData)

    return success(res, template, '创建成功')
  } catch (err) {
    console.error('Create template error:', err)
    return error(res, 500, '创建失败')
  }
}

export async function updateTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params
    const templateData = req.body

    const template = await Template.findByPk(id)

    if (!template) {
      return notFound(res, '模板不存在')
    }

    await template.update(templateData)

    return success(res, template, '更新成功')
  } catch (err) {
    console.error('Update template error:', err)
    return error(res, 500, '更新失败')
  }
}

export async function deleteTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params

    const template = await Template.findByPk(id)

    if (!template) {
      return notFound(res, '模板不存在')
    }

    await template.destroy()

    return success(res, null, '删除成功')
  } catch (err) {
    console.error('Delete template error:', err)
    return error(res, 500, '删除失败')
  }
}
