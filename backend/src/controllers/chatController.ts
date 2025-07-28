// src/controllers/chatController.ts

import { Request, Response, NextFunction } from 'express'
import { getEmbeddingForText } from '../services/embeddingService'
import { getDocument } from '../services/inMemoryDocumentStore'
import { saveEmbeddings, querySimilarChunks, VectorEntry } from '../services/vectorStore'
import OpenAI from 'openai'

// ✅ Initialize OpenAI client for v4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateEmbeddingsForDoc = async (docId: string) => {
  const doc = getDocument(docId)
  if (!doc) throw new Error('Document not found')

  const embeddings: VectorEntry[] = []

  for (const page of doc.pages) {
    const vector = await getEmbeddingForText(page.text)
    embeddings.push({
      embedding: vector,
      pageNumber: page.pageNumber,
      text: page.text,
    })
  }

  saveEmbeddings(docId, embeddings)
  return embeddings.length
}

/**
 * Chat query controller for user's question on a given document.
 * Expected POST body: { docId: string, question: string }
 */
export const chatQuery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { docId, question } = req.body

    if (!docId || !question) {
      return res.status(400).json({ error: 'docId and question are required' })
    }

    if (!querySimilarChunks(docId, [1])) {
      await generateEmbeddingsForDoc(docId)
    }

    const queryEmbedding = await getEmbeddingForText(question)

    const relevantChunks = querySimilarChunks(docId, queryEmbedding, 5)

    const contextText = relevantChunks.map(chunk => `Page ${chunk.pageNumber}: ${chunk.text}`).join('\n---\n')

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI assistant that answers questions based on the following document content.\n${contextText}`,
      },
      {
        role: 'user',
        content: question,
      },
    ]

    // ✅ v4 method to create a chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 512,
    })

    const answer = completion.choices[0]?.message?.content || 'No answer generated.'

    const uniquePages = Array.from(new Set(relevantChunks.map(c => c.pageNumber)))

    res.json({
      answer,
      citations: uniquePages.map(pageNum => ({ page: pageNum })),
    })
  } catch (error) {
    next(error)
  }
}
