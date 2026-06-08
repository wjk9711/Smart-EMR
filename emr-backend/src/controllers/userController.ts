import { Request, Response } from 'express'
import { User } from '../models'
import { success, error } from '../utils/response'
import { Op } from 'sequelize'

// 获取用户列表（仅管理员可见）
export const getUserList = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权访问：仅管理员可查看用户列表')
    }
    
    const { page = 1, pageSize = 10, keyword, roleType, status } = req.query
    
    const whereCondition: any = {}
    
    if (keyword) {
      whereCondition[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } },
      ]
    }
    
    if (roleType && roleType !== '') {
      whereCondition.roleType = roleType
    }
    
    if (status && status !== '') {
      whereCondition.status = status
    }
    
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['passwordHash'] }, // 排除密码
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    })
    
    return success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    })
  } catch (err: any) {
    console.error('Get user list error:', err)
    return error(res, 500, err.message)
  }
}

// 创建单个用户
export const createUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：仅管理员可创建用户')
    }
    
    const { username, password, realName, roleType, departmentId, roleId } = req.body
    
    // 验证必填字段
    if (!username || !password || !realName) {
      return error(res, 400, '用户名、密码和真实姓名不能为空')
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return error(res, 400, '用户名已存在')
    }
    
    // 创建用户
    const user = await User.create({
      username,
      passwordHash: password, // beforeCreate hook会自动加密
      realName,
      roleType: roleType || 'student',
      departmentId,
      roleId,
      status: 'active',
    })
    
    // 返回不包含密码的用户信息
    const userData = user.toJSON()
    
    return success(res, userData, '用户创建成功')
  } catch (err: any) {
    console.error('Create user error:', err)
    return error(res, 500, err.message)
  }
}

// 批量创建用户
export const batchCreateUsers = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：仅管理员可批量创建用户')
    }
    
    const { startNumber, endNumber, roleType, passwordPrefix, namePrefix } = req.body
    
    // 验证参数
    if (!startNumber || !endNumber || startNumber > endNumber) {
      return error(res, 400, '请提供有效的数字区间')
    }
    
    if (endNumber - startNumber + 1 > 1000) {
      return error(res, 400, '一次最多创建1000个用户')
    }
    
    const users = []
    const errors = []
    
    for (let i = startNumber; i <= endNumber; i++) {
      const username = `${namePrefix || 'student'}${String(i).padStart(4, '0')}`
      const password = `${passwordPrefix || '123456'}${String(i).padStart(4, '0')}`
      const realName = `${namePrefix || '学生'}${i}号`
      
      try {
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ where: { username } })
        if (existingUser) {
          errors.push(`用户名 ${username} 已存在，跳过`)
          continue
        }
        
        const user = await User.create({
          username,
          passwordHash: password,
          realName,
          roleType: roleType || 'student',
          status: 'active',
        })
        
        users.push(user.toJSON())
      } catch (err: any) {
        errors.push(`创建用户 ${username} 失败: ${err.message}`)
      }
    }
    
    return success(res, {
      successCount: users.length,
      failCount: errors.length,
      users,
      errors,
    }, `批量创建完成：成功${users.length}个，失败${errors.length}个`)
  } catch (err: any) {
    console.error('Batch create users error:', err)
    return error(res, 500, err.message)
  }
}

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const { id } = req.params
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：仅管理员可删除用户')
    }
    
    // 不能删除自己
    if (Number(id) === currentUser.id) {
      return error(res, 400, '不能删除当前登录的账户')
    }
    
    const user = await User.findByPk(Number(id))
    
    if (!user) {
      return error(res, 404, '用户不存在')
    }
    
    await user.destroy()
    
    return success(res, null, '用户删除成功')
  } catch (err: any) {
    console.error('Delete user error:', err)
    return error(res, 500, err.message)
  }
}

// 批量删除用户
export const batchDeleteUsers = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const { ids } = req.body
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：仅管理员可批量删除用户')
    }
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error(res, 400, '请提供要删除的用户ID列表')
    }
    
    // 不能删除自己
    const currentUserId = Number(currentUser.id)
    const userIds = ids.map(id => Number(id))
    
    if (userIds.includes(currentUserId)) {
      return error(res, 400, '不能删除当前登录的账户')
    }
    
    const deletedCount = await User.destroy({
      where: {
        id: { [Op.in]: userIds },
      },
    })
    
    return success(res, { deletedCount }, `成功删除${deletedCount}个用户`)
  } catch (err: any) {
    console.error('Batch delete users error:', err)
    return error(res, 500, err.message)
  }
}

// 更新用户信息
export const updateUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const { id } = req.params
    const { realName, roleType, departmentId, roleId, status } = req.body
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      return error(res, 403, '无权操作：仅管理员可修改用户信息')
    }
    
    const user = await User.findByPk(Number(id))
    
    if (!user) {
      return error(res, 404, '用户不存在')
    }
    
    // 更新字段
    await user.update({
      realName: realName || user.realName,
      roleType: roleType || user.roleType,
      departmentId: departmentId !== undefined ? departmentId : user.departmentId,
      roleId: roleId !== undefined ? roleId : user.roleId,
      status: status || user.status,
    })
    
    return success(res, user.toJSON(), '用户信息更新成功')
  } catch (err: any) {
    console.error('Update user error:', err)
    return error(res, 500, err.message)
  }
}
