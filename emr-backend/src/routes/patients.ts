import { Router } from 'express'
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  getVisits,
  createVisit,
} from '../controllers/patientController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getPatients)
router.post('/visits', authenticate, createVisit) // 移到 :id 之前
router.get('/:id', authenticate, getPatient)
router.post('/', authenticate, createPatient)
router.put('/:id', authenticate, updatePatient)
router.get('/:patientId/visits', authenticate, getVisits)

export default router