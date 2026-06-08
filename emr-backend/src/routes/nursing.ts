import { Router } from 'express'
import { authenticate } from '../middleware/auth'

const router = Router()

// TODO: 实现护理相关路由
router.get('/vital-signs/:patientId', authenticate, (req, res) => {
  res.json({ code: 200, data: [], message: '护理模块开发中' })
})

router.post('/vital-signs', authenticate, (req, res) => {
  res.json({ code: 200, data: null, message: '护理模块开发中' })
})

export default router
