
/**
 * Embedding plus metadata entry
 */
export interface VectorEntry {
  embedding: number[] // embedding vector
  pageNumber: number  // page number or chunk index
  text: string       // original chunk text
}

/**
 * Very simple in-memory vector store for demo.
 * Use cosine similarity for retrieval.
 */
const vectorStore: Record<string, VectorEntry[]> = {} // keyed by docId

// Cosine similarity helper function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0)
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0))
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0))
  if (magA === 0 || magB === 0) return 0
  return dotProduct / (magA * magB)
}

/**
 * Save all embeddings for a document.
 */
export function saveEmbeddings(docId: string, entries: VectorEntry[]): void {
  vectorStore[docId] = entries
}

/**
 * Retrieve top-k similar chunks given query embedding.
 */
export function querySimilarChunks(docId: string, queryEmbedding: number[], topK = 5): VectorEntry[] {
  const entries = vectorStore[docId] || []
  const scored = entries.map(entry => ({
    entry,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }))
  // Sort descending by similarity score
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).map(s => s.entry)
}
