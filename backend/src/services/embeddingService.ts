import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getEmbeddingForText(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    console.warn('Empty text input to embedding service, returning empty vector.');
    return [];
  }
  console.log('Generating embedding for text snippet:', text.slice(0, 60) + '...');
  const resp = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })

  return resp.data[0].embedding
}
