import { Router } from 'express'
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  completeRecord,
  getRevisions,
  // 新增：提交流程相关
  submitRecord,
  getPendingReviewRecords,
  reviewRecord,
  getTeacherList,
} from '../controllers/outpatientController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/records', authenticate, getRecords)
router.get('/records/:id', authenticate, getRecord)
router.post('/records', authenticate, createRecord)
router.put('/records/:id', authenticate, updateRecord)
router.delete('/records/:id', authenticate, deleteRecord)
router.post('/records/:id/complete', authenticate, completeRecord)
router.get('/records/:id/revisions', authenticate, getRevisions)

// 提交流程相关路由
router.post('/records/:id/submit', authenticate, submitRecord)
router.get('/records/pending-review', authenticate, getPendingReviewRecords)
router.post('/records/:id/review', authenticate, reviewRecord)
router.get('/teachers', authenticate, getTeacherList)

export default router
