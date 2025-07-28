import { Request, Response, NextFunction } from 'express';
import { getDocument } from '../services/inMemoryDocumentStore';
import { getEmbeddingsBatch } from '../services/embeddingService';
import { saveEmbeddings, VectorEntry } from '../services/vectorStore';

/**
 * Controller to generate and save embeddings for all pages of a document.
 * Receives docId as route param.
 * Calls batch embedding to reduce API calls.
 */
export const generateEmbeddingsForDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.docId;
    const doc = getDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Prepare array of texts for batch embedding
    const texts = doc.pages.map(page => page.text);

    console.log(`Generating embeddings for document ID: ${docId}, total pages: ${texts.length}`);

    // Get batch embeddings
    const embeddingsArray = await getEmbeddingsBatch(texts);

    if (!embeddingsArray || embeddingsArray.length !== texts.length) {
      throw new Error('Mismatch between embeddings and number of pages.');
    }

    // Create array of VectorEntry for each page
    const embeddings: VectorEntry[] = embeddingsArray.map((embedding, idx) => ({
      embedding,
      pageNumber: doc.pages[idx].pageNumber,
      text: doc.pages[idx].text,
    }));

    // Save embeddings to in-memory store
    saveEmbeddings(docId, embeddings);

    res.json({ message: `Generated and saved embeddings for ${embeddings.length} pages.`, docId });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    next(error);
  }
};
