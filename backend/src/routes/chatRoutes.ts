import { Router } from 'express';
import { chatQuery } from '../controllers/chatController';

const router = Router();

/**
 * POST /api/chat/query
 * Endpoint to submit a user question for the given document.
 * Returns a conversational answer with citation references.
 */
router.post('/query', chatQuery);

export default router;
