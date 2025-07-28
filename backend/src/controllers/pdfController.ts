// File: backend/src/controllers/pdfController.ts

import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { saveDocument } from '../services/inMemoryDocumentStore'
import { parsePdfWithLlamaParse, LlamaParseChunk } from '../services/llamaParseService'

/**
 * Handles PDF upload request:
 * - Validates uploaded PDF.
 * - Calls LlamaParse microservice to parse file and get markdown chunks.
 * - Assigns fallback page numbers if missing in chunks.
 * - Saves chunks in-memory.
 * - Responds with file metadata and total pages.
 */
export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const filePath = path.join(process.cwd(), 'uploads', req.file.filename)

    // Log the file path being sent for parsing
    console.log("Calling LlamaParse microservice on:", filePath)

    // Call LlamaParse microservice to parse the PDF
    const parseResult = await parsePdfWithLlamaParse(filePath)

    // Log raw microservice response for debugging
    console.log("LlamaParse microservice response:", parseResult)

    // Defensive check: must have chunks array
    if (!parseResult || !Array.isArray(parseResult.chunks)) {
      return res.status(500).json({ error: 'Invalid response from LlamaParse microservice' })
    }

    // -------- Fallback: assign page numbers if missing ----------
    const chunksWithPageNumbers: LlamaParseChunk[] = parseResult.chunks.map((chunk: LlamaParseChunk, idx: number) => {
      const assignedPage = (chunk.page == null) ? idx + 1 : chunk.page
      return {
        ...chunk,
        page: assignedPage,
      }
    })

    // Save the page texts in-memory store with assured page numbering
    saveDocument(
      req.file.filename,
      req.file.originalname,
      chunksWithPageNumbers.map((chunk) => chunk.text)
    )

    const totalPages = chunksWithPageNumbers.length

    // Construct the file URL for frontend viewing
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    // Send response including metadata and total page count
    res.status(200).json({
      message: 'File uploaded & parsed successfully with fallback page numbering',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        totalPages,
        // optionally send chunks metadata for debugging or later frontend use:
        // chunks: chunksWithPageNumbers,
      },
    })
  } catch (error) {
    // Log error stack for debugging
    console.error('Error in uploadPdf controller:', error)
    next(error)
  }
}
