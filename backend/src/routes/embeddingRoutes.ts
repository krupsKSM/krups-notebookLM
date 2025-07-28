import { Router } from 'express';
import { generateEmbeddingsForDocument } from '../controllers/embeddingController';

const router = Router();

router.post('/generate/:docId', generateEmbeddingsForDocument);

export default router;
