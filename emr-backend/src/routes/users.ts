import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getUserList,
  createUser,
  batchCreateUsers,
  deleteUser,
  batchDeleteUsers,
  updateUser,
} from '../controllers/userController'

const router = Router()

// 所有路由都需要认证
router.use(authenticate)

// 获取用户列表
router.get('/', getUserList)

// 创建单个用户
router.post('/', createUser)

// 批量创建用户
router.post('/batch-create', batchCreateUsers)

// 更新用户
router.put('/:id', updateUser)

// 删除单个用户
router.delete('/:id', deleteUser)

// 批量删除用户
router.delete('/batch-delete', batchDeleteUsers)

export default router
