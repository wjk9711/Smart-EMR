import { Router } from 'express'
import { authenticate } from '../middleware/auth'

const router = Router()

// TODO: 实现系统管理相关路由
router.get('/users', authenticate, (req, res) => {
  res.json({ code: 200, data: [], message: '用户管理功能开发中' })
})

router.post('/users', authenticate, (req, res) => {
  res.json({ code: 200, data: null, message: '用户管理功能开发中' })
})

router.get('/roles', authenticate, (req, res) => {
  res.json({ code: 200, data: [], message: '角色管理功能开发中' })
})

router.get('/departments', authenticate, (req, res) => {
  res.json({ code: 200, data: [], message: '科室管理功能开发中' })
})

export default router
