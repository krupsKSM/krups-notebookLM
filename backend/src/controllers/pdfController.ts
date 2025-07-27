import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { extractPdfTextByPage } from '../services/pdfTextService'
import { saveDocument } from '../services/inMemoryDocumentStore'

/**
 * Handles PDF upload request.
 * - Validates presence of uploaded file.
 * - Reads PDF from disk using absolute path.
 * - Extracts text content by page.
 * - Stores the extracted page texts in-memory keyed by filename.
 * - Constructs public URL to the uploaded PDF.
 * - Returns upload metadata and total page count (no raw text in response).
 */
export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const filePath = path.join(process.cwd(), 'uploads', req.file.filename)
    const { pages, numPages } = await extractPdfTextByPage(filePath)

    // Save extracted text pages in memory keyed by filename
    saveDocument(req.file.filename, req.file.originalname, pages)

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    res.status(200).json({
      message: 'File uploaded & text extracted successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl,

        // Return the accurate physical page count to frontend
        totalPages: numPages,

        // Optional: count of extracted text pages (approximate)
        extractedPagesCount: pages.length
      }
    })
  } catch (error) {
    next(error)
  }
}
