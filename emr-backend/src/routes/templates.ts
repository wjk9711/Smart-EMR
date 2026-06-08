import { Router } from 'express'
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getTemplates)
router.get('/:id', authenticate, getTemplate)
router.post('/', authenticate, createTemplate)
router.put('/:id', authenticate, updateTemplate)
router.delete('/:id', authenticate, deleteTemplate)

export default router
