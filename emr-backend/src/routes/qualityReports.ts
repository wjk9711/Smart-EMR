import express from 'express'
import { authenticate } from '../middleware/auth'
import {
  getQualityReports,
  createQualityReport,
  updateQualityReport,
  deleteQualityReport,
  batchDeleteQualityReports,
  getQualityReportDetail,
} from '../controllers/qualityReportController'

const router = express.Router()

// 所有路由都需要认证
router.use(authenticate)

// 获取质控报告列表
router.get('/', getQualityReports)

// 获取单个报告详情
router.get('/:id', getQualityReportDetail)

// 创建新报告
router.post('/', createQualityReport)

// 更新报告
router.put('/:id', updateQualityReport)

// 删除单个报告
router.delete('/:id', deleteQualityReport)

// 批量删除报告
router.post('/batch-delete', batchDeleteQualityReports)

export default router
