import { Router } from 'express'
import { authenticate } from '../middleware/auth'

const router = Router()

// TODO: 实现质控相关路由
router.get('/rules', authenticate, (req, res) => {
  res.json({ code: 200, data: [], message: '质控模块开发中' })
})

router.post('/check/:recordId', authenticate, (req, res) => {
  res.json({ code: 200, data: null, message: '质控模块开发中' })
})

export default router
