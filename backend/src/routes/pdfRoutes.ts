import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware';
import { uploadPdf } from '../controllers/pdfController';

const router = Router();

/**
 * POST /api/pdf/upload
 * Accepts a single PDF file upload with key 'pdf' in form-data.
 * Parses the PDF and returns metadata including page counts.
 */
router.post('/upload', upload.single('pdf'), uploadPdf);

export default router;
