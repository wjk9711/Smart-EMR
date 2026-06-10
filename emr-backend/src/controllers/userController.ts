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
    const userId = Number(id)
    
    // 验证ID是否有效
    if (isNaN(userId) || userId <= 0) {
      console.log('❌ 无效的用户ID:', id)
      return error(res, 400, '无效的用户ID')
    }
    
    if (userId === currentUser.id) {
      return error(res, 400, '不能删除当前登录的账户')
    }
    
    console.log('删除用户 ID:', userId)
    
    const user = await User.findByPk(userId)
    
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
    
    console.log('=== 批量删除用户 ===')
    console.log('当前用户:', currentUser?.id, currentUser?.username)
    console.log('要删除的IDs:', ids)
    
    // 检查是否为管理员
    if (currentUser.roleType !== 'admin') {
      console.log('❌ 非管理员尝试删除用户')
      return error(res, 403, '无权操作：仅管理员可批量删除用户')
    }
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.log('❌ 未提供有效的用户ID列表')
      return error(res, 400, '请提供要删除的用户ID列表')
    }
    
    // 不能删除自己
    const currentUserId = Number(currentUser.id)
    
    // 验证并转换IDs，过滤掉无效值
    const userIds = ids
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0)
    
    console.log('当前用户ID:', currentUserId)
    console.log('原始IDs:', ids)
    console.log('有效用户IDs:', userIds)
    
    if (userIds.length === 0) {
      console.log('❌ 没有有效的用户ID')
      return error(res, 400, '请提供有效的用户ID列表')
    }
    
    if (userIds.includes(currentUserId)) {
      console.log('❌ 尝试删除自己')
      return error(res, 400, '不能删除当前登录的账户')
    }
    
    // 先检查用户是否存在
    const existingUsers = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
      },
      attributes: ['id', 'username', 'realName'],
    })
    
    console.log('找到的用户:', existingUsers.map(u => ({ id: u.id, username: u.username })))
    console.log('找到的用户详情:', JSON.stringify(existingUsers.map(u => ({ id: u.id, typeof_id: typeof u.id, username: u.username })), null, 2))
    
    if (existingUsers.length === 0) {
      console.log('❌ 没有找到任何要删除的用户')
      return error(res, 404, '没有找到要删除的用户')
    }
    
    console.log(`准备删除 ${existingUsers.length} 个用户...`)
    
    // 使用事务确保原子性
    const sequelize = require('../config/database').default
    const transaction = await sequelize.transaction()
    
    try {
      // 检查每个用户是否有关联数据，并级联删除
      const { InpatientPatient, InpatientRecord, PatientAssignment } = require('../models')
      
      console.log('模型加载检查:')
      console.log('  - InpatientPatient:', !!InpatientPatient)
      console.log('  - InpatientRecord:', !!InpatientRecord)
      console.log('  - PatientAssignment:', !!PatientAssignment)
      
      let totalDeletedPatients = 0
      let totalDeletedRecords = 0
      let totalDeletedAssignments = 0
      
      for (const user of existingUsers) {
        console.log(`\n处理用户 ${user.id} (${user.username})...`)
        
        // 1. 删除患者分配记录
        const deletedAssignments = await PatientAssignment.destroy({
          where: { userId: user.id },
          transaction,
        })
        if (deletedAssignments > 0) {
          console.log(`  ✅ 删除 ${deletedAssignments} 条患者分配记录`)
          totalDeletedAssignments += deletedAssignments
        }
        
        // 2. 获取该用户创建的所有患者ID
        const patients = await InpatientPatient.findAll({
          where: { doctorId: user.id },
          attributes: ['id'],
          transaction,
        })
        const patientIds = patients.map((p: any) => p.id)
        
        // 3. 删除这些患者的所有病案
        if (patientIds.length > 0) {
          const deletedRecords = await InpatientRecord.destroy({
            where: { patientId: { [Op.in]: patientIds } },
            transaction,
          })
          if (deletedRecords > 0) {
            console.log(`  ✅ 删除 ${deletedRecords} 条病案记录`)
            totalDeletedRecords += deletedRecords
          }
        }
        
        // 4. 删除该用户创建的所有患者
        const deletedPatients = await InpatientPatient.destroy({
          where: { doctorId: user.id },
          transaction,
        })
        if (deletedPatients > 0) {
          console.log(`  ✅ 删除 ${deletedPatients} 个患者`)
          totalDeletedPatients += deletedPatients
        }
        
        console.log(`  📊 用户 ${user.username} 清理完成: 分配=${deletedAssignments}, 病案=${patientIds.length > 0 ? '已清理' : '无'}, 患者=${deletedPatients}`)
      }
      
      console.log('\n📊 关联数据清理统计:')
      console.log(`  - 患者分配: ${totalDeletedAssignments} 条`)
      console.log(`  - 病案记录: ${totalDeletedRecords} 条`)
      console.log(`  - 患者数据: ${totalDeletedPatients} 个`)
      
      // 5. 删除用户
      console.log('\n开始删除用户...')
      const deletedCount = await User.destroy({
        where: {
          id: { [Op.in]: userIds },
        },
        transaction,
      })
      
      // 提交事务
      await transaction.commit()
      
      console.log(`✅ 成功删除 ${deletedCount} 个用户及其关联数据`)
      
      return success(res, {
        deletedUsers: deletedCount,
        deletedPatients: totalDeletedPatients,
        deletedRecords: totalDeletedRecords,
        deletedAssignments: totalDeletedAssignments,
      }, `成功删除${deletedCount}个用户及${totalDeletedPatients}个患者、${totalDeletedRecords}条病案、${totalDeletedAssignments}条分配记录`)
    } catch (err: any) {
      // 回滚事务
      await transaction.rollback()
      
      console.error('❌ 批量删除失败，事务已回滚:', err)
      console.error('❌ Error name:', err.name)
      console.error('❌ Error message:', err.message)
      console.error('❌ Error stack:', err.stack)
      
      return error(res, 500, err.message || '批量删除失败')
    }
  } catch (err: any) {
    console.error('❌ Batch delete users error:', err)
    console.error('❌ Error name:', err.name)
    console.error('❌ Error message:', err.message)
    console.error('❌ Error stack:', err.stack)
    console.error('❌ Error original:', err.original)
    console.error('❌ Error sql:', err.sql)
    
    // 如果是外键约束错误，返回友好提示
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return error(res, 400, '删除失败：该用户有关联的数据（如患者、病案等），请先删除相关数据')
    }
    
    return error(res, 500, err.message || '删除失败')
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
