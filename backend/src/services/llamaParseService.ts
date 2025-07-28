
import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import path from 'path'

export interface LlamaParseChunk {
  page: number | null
  text: string
}

/**
 * Sends uploaded PDF to LlamaParse microservice for markdown parsing.
 * @param filePath Absolute path to the uploaded PDF
 * @returns Parsed chunks and metadata
 */
export async function parsePdfWithLlamaParse(filePath: string): Promise<{ chunks: LlamaParseChunk[]; total_chunks: number }> {
  const fileStream = fs.createReadStream(filePath)
  const fileName = path.basename(filePath)
  const formData = new FormData()
  formData.append('file', fileStream, fileName)

  const response = await axios.post('http://localhost:8000/parse_pdf/', formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
  })

  return response.data // Expected: { chunks: [...], total_chunks: number }
}