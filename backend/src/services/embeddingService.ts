
import OpenAI from 'openai'

// Log the partial OpenAI API key on startup for confirmation (remove before production)
console.log("Loaded OpenAI key:", process.env.OPENAI_API_KEY?.slice(0, 10))

// Initialize OpenAI client using the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate embeddings for a batch of texts in a single OpenAI API call.
 * This improves efficiency by reducing multiple calls to one.
 *
 * @param texts Array of string inputs to embed
 * @returns Promise resolving to an array of embedding vectors (arrays of numbers)
 * @throws Throws an error if OpenAI call fails or returns unexpected response
 */
export async function getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Defensive: Handle empty input gracefully
  if (!texts || texts.length === 0) {
    console.warn('Empty texts array passed to embedding service, returning empty array.')
    return []
  }

  try {
    // Log start of batch embedding call
    console.log(`Requesting batch embeddings for ${texts.length} texts.`)

    // Call OpenAI embeddings API with batch input
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002', // Efficient and effective embedding model
      input: texts,
    })

    // Validate response structure
    if (!response || !response.data || response.data.length === 0) {
      throw new Error('Empty embedding response from OpenAI.')
    }

    // Extract embeddings from response data
    return response.data.map((entry: { embedding: number[] }) => entry.embedding)

  } catch (err: any) {
    // Handle rate limiting/quota exceeded errors explicitly
    if (err.status === 429) {
      console.error('OpenAI API quota exceeded.')
      throw new Error('OpenAI API quota exceeded. Please check your billing or usage limits.')
    }
    // Log unexpected errors and rethrow for upstream handling
    console.error('Error during batch embedding:', err)
    throw err
  }
}
