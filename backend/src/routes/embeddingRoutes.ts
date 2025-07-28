import { Router } from 'express';
import { generateEmbeddingsForDocument } from '../controllers/embeddingController';

const router = Router();

/**
 * POST /api/embedding/generate/:docId
 * Endpoint to trigger embedding generation for all pages of the specified document.
 * Useful for manually creating/updating embeddings after document upload.
 */
router.post('/generate/:docId', generateEmbeddingsForDocument);

export default router;
