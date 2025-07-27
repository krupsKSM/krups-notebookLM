import fs from 'fs'
import pdfParse from 'pdf-parse'

// Extracts text (by page) from a PDF file

export async function extractPdfTextByPage(filePath: string): Promise<string[]> {
    const dataBuffer = fs.readFileSync(filePath)
    const pdfData = await pdfParse(dataBuffer)
    // Optional: Split text by page using the form feed delimiter used by pdf-parse
    const pages: string[] = pdfData.text.split('\f').map(s => s.trim()).filter(Boolean)
    return pages
}
