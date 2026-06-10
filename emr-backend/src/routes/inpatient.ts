import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getInpatientPatients,
  getInpatientPatient,
  createInpatientPatient,
  updateInpatientPatient,
  deleteInpatientPatient,
  getInpatientRecords,
  getInpatientRecord,
  createInpatientRecord,
  updateInpatientRecord,
  deleteInpatientRecord,
  // 新增：提交流程相关
  submitRecord,
  getPendingReviewRecords,
  reviewRecord,
  getTeacherList,
  // 新增：患者下发功能
  assignPatientsToAllUsers,
  togglePatientTemplate,
} from '../controllers/inpatientController'
import { checkICDCode } from '../controllers/icdCodeController'

const router = Router()

// 住院患者相关路由
router.get('/patients', authenticate, getInpatientPatients)
router.get('/patients/:id', authenticate, getInpatientPatient)
router.post('/patients', authenticate, createInpatientPatient)
router.put('/patients/:id', authenticate, updateInpatientPatient)
router.delete('/patients/:id', authenticate, deleteInpatientPatient)

// 患者下发功能路由
router.post('/patients/assign', authenticate, assignPatientsToAllUsers)
router.put('/patients/:patientId/toggle-template', authenticate, togglePatientTemplate)

// 住院病案相关路由
router.get('/records', authenticate, getInpatientRecords)
router.post('/records', authenticate, createInpatientRecord)

// ==================== 病历提交流程路由（必须在 :id 之前）====================
// 教师获取待质控的病历列表
router.get('/records/pending-review', authenticate, getPendingReviewRecords)

// 学生提交病历给教师
router.post('/records/:id/submit', authenticate, submitRecord)

// 教师提交质控结果
router.post('/records/:id/review', authenticate, reviewRecord)

// 获取教师列表（供学生选择）
router.get('/teachers', authenticate, getTeacherList)

// ICD-10编码检查
router.post('/check-icd-code', authenticate, checkICDCode)

// 注意：这些带:id的路由必须放在最后
router.get('/records/:id', authenticate, getInpatientRecord)
router.put('/records/:id', authenticate, updateInpatientRecord)
router.delete('/records/:id', authenticate, deleteInpatientRecord)

export default router
