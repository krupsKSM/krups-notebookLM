// src/controllers/pdfController.ts

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
    // Ensure a file was uploaded by multer
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    // Construct absolute file path to uploaded PDF
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename)

    // Extract array of texts, one per PDF page
    const pages = await extractPdfTextByPage(filePath)

    // Save extracted texts in an in-memory store for further processing (embedding, chat)
    saveDocument(req.file.filename, req.file.originalname, pages)

    // Construct public URL for frontend to access uploaded PDF
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    // Respond with metadata and total pages count (do not expose extracted raw text)
    return res.status(200).json({
      message: 'File uploaded & text extracted successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        totalPages: pages.length, // Share total pages info
      },
    })
  } catch (error) {
    // Pass any errors to global error handling middleware
    next(error)
  }
}
