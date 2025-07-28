import { Request, Response, NextFunction } from 'express'
import { getDocument } from '../services/inMemoryDocumentStore'
import { saveEmbeddings, querySimilarChunks, VectorEntry } from '../services/vectorStore'
import { getEmbeddingsBatch } from '../services/embeddingService'
import OpenAI from 'openai'

// Initialize OpenAI client for GPT-4 and embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate embeddings for all pages of a document using batch embedding API.
 * @param docId Document ID (usually filename or UUID)
 * @returns Number of embeddings generated
 * @throws Throws an error if document not found or embedding fails
 */
export const generateEmbeddingsForDoc = async (docId: string): Promise<number> => {
  const doc = getDocument(docId)
  if (!doc) throw new Error('Document not found')

  // Extract texts from all pages for batch embedding
  const texts = doc.pages.map(page => page.text)

  // Call batch embedding API to reduce API calls and improve performance
  const embeddings = await getEmbeddingsBatch(texts)

  if (embeddings.length !== texts.length) {
    throw new Error('Mismatch between embeddings batch size and number of pages')
  }

  // Prepare embeddings with metadata for in-memory vector store
  const vectorEntries: VectorEntry[] = embeddings.map((embedding, idx) => ({
    embedding,
    pageNumber: doc.pages[idx].pageNumber,
    text: doc.pages[idx].text,
  }))

  // Save all embeddings for the document
  saveEmbeddings(docId, vectorEntries)

  return vectorEntries.length
}

/**
 * Chat query endpoint handler.
 * Expects POST JSON body: { docId: string, question: string }
 * Returns AI-generated answer with page citations.
 */
export const chatQuery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { docId, question } = req.body

    if (!docId || !question) {
      return res.status(400).json({ error: 'docId and question are required' })
    }

    // Generate embeddings if not yet created for this document
    if (!querySimilarChunks(docId, [1]).length) {
      await generateEmbeddingsForDoc(docId)
    }

    // Embed user's question (single text)
    const queryEmbeddingResp = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question,
    })

    const queryEmbedding = queryEmbeddingResp.data[0]?.embedding
    if (!queryEmbedding) {
      throw new Error('Failed to generate embedding for the question')
    }

    // Retrieve top 5 relevant chunks from vector store based on similarity to query embedding
    const relevantChunks = querySimilarChunks(docId, queryEmbedding, 5)

    // Concatenate chunk texts with page info as context for chat completion
    const contextText = relevantChunks
      .map(chunk => `Page ${chunk.pageNumber}: ${chunk.text}`)
      .join('\n---\n')

    // Prepare messages for GPT-4 chat completion
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI assistant that answers questions based on the following document content:\n${contextText}`,
      },
      {
        role: 'user',
        content: question,
      },
    ]

    // Call GPT-4 chat completion endpoint
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 512,
    })

    const answer = completion.choices[0]?.message?.content || 'No answer generated.'

    // Extract unique page numbers from relevant chunks for citations
    const uniquePages = Array.from(new Set(relevantChunks.map(c => c.pageNumber)))

    // Send back the answer and citation page numbers
    res.json({
      answer,
      citations: uniquePages.map(pageNum => ({ page: pageNum })),
    })
  } catch (error: any) {
    console.error('Chat API error:', error)

    // Handle OpenAI quota exceeded errors gracefully
    if (error.response?.status === 429 || error.status === 429) {
      return res.status(429).json({
        error: 'OpenAI quota exceeded. Please check your billing or usage limits.',
      })
    }

    // Forward other OpenAI errors transparently
    if (error.response?.status) {
      return res.status(error.response.status).json({
        error: error.response.data?.error?.message || 'OpenAI API error',
      })
    }

    // Generic fallback for other errors
    return res.status(500).json({
      error: error.message || 'Internal server error',
    })
  }
}
