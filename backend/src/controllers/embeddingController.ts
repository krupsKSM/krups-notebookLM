import { Request, Response, NextFunction } from 'express';
import { getDocument } from '../services/inMemoryDocumentStore';
import { getEmbeddingForText } from '../services/embeddingService';
import { saveEmbeddings, VectorEntry } from '../services/vectorStore';

export const generateEmbeddingsForDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.docId;
    const doc = getDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const embeddings: VectorEntry[] = [];

    for (const page of doc.pages) {
      const embedding = await getEmbeddingForText(page.text);
      console.log(`Generated embedding for page ${page.pageNumber} with text snippet: ${page.text.slice(0, 50)}...`);
      embeddings.push({
        embedding,
        pageNumber: page.pageNumber,
        text: page.text,
      });
    }

    saveEmbeddings(docId, embeddings);

    res.json({ message: `Generated and saved embeddings for ${embeddings.length} pages.`, docId });
  } catch (error) {
    next(error);
  }
};
