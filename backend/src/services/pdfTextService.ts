import fs from 'fs'
import pdfParse from 'pdf-parse'

/**
 * Extracts text split into pages and returns the total physical page count.
 * @param filePath Absolute PDF file path
 * @returns Object with pages (text array) and numPages (physical page count)
 */
export async function extractPdfTextByPage(filePath: string): Promise<{ pages: string[], numPages: number }> {
  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdfParse(dataBuffer)

  // Split extracted text by form feed delimiter into pages (may be approximate)
  const pages = data.text.split('\f').map(p => p.trim()).filter(Boolean)

  // pdfParse's numpages is physical page count
  return {
    pages,
    numPages: data.numpages
  }
}
