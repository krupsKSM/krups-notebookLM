import { Router } from 'express'
import upload from '../middlewares/uploadMiddleware'
import { uploadPdf } from '../controllers/pdfController'

const router = Router()

// POST /api/pdf/upload
router.post('/upload', upload.single('pdf'), uploadPdf)

export default router
