
import { Router } from 'express'
import { chatQuery } from '../controllers/chatController'

const router = Router()

// POST /api/chat/query
router.post('/query', chatQuery)

export default router
