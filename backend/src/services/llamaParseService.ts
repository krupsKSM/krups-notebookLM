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
export async function parsePdfWithLlamaParse(
  filePath: string
): Promise<{ chunks: LlamaParseChunk[]; total_chunks: number }> {
  // Create a readable stream of the PDF file to upload
  const fileStream = fs.createReadStream(filePath)

  // Extract just the filename from the full path
  const fileName = path.basename(filePath)

  // Prepare multipart/form-data payload
  const formData = new FormData()
  formData.append('file', fileStream, fileName)

  // Use 'LLAMA_PARSE_API_URL' env variable or fallback to localhost for development
  const baseUrl = process.env.LLAMA_PARSE_API_URL || 'http://localhost:8000'

  // POST the PDF file to the microservice parse endpoint
  const response = await axios.post(`${baseUrl}/parse_pdf/`, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity, // handle large PDFs
  })

  // Return the parsed chunks and their total count
  return response.data // Expected: { chunks: [...], total_chunks: number }
}
