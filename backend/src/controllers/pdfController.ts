import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { saveDocument } from '../services/inMemoryDocumentStore'
import { parsePdfWithLlamaParse, LlamaParseChunk } from '../services/llamaParseService'

/**
 * Handles PDF upload request.
 * Steps:
 * - Validate uploaded PDF file present.
 * - Calls LlamaParse microservice to parse PDF into markdown chunks.
 * - Assign fallback page numbers if missing.
 * - Saves chunks text in-memory associated with filename.
 * - Returns metadata + total pages for frontend to render and use.
 */
export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const filePath = path.join(process.cwd(), 'uploads', req.file.filename)

    // Debug Logging
    console.log("Calling LlamaParse microservice on:", filePath)

    // Call LlamaParse to parse file into chunks
    const parseResult = await parsePdfWithLlamaParse(filePath)

    console.log("LlamaParse microservice response:", parseResult)

    // Defensive check for valid chunks array
    if (!parseResult || !Array.isArray(parseResult.chunks)) {
      return res.status(500).json({ error: 'Invalid response from LlamaParse microservice' })
    }

    // Fallback page assignment for chunks missing page numbers
    const chunksWithPageNumbers: LlamaParseChunk[] = parseResult.chunks.map((chunk: LlamaParseChunk, idx: number) => ({
      ...chunk,
      page: chunk.page == null ? idx + 1 : chunk.page,
    }))

    // Save the text chunks and page numbers in-memory store (document store)
    saveDocument(
      req.file.filename,
      req.file.originalname,
      chunksWithPageNumbers.map(chunk => chunk.text)
    )

    const totalPages = chunksWithPageNumbers.length

    // Construct file URL for frontend PDF viewer
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    // Respond with success and file metadata
    res.status(200).json({
      message: 'File uploaded & parsed successfully with fallback page numbering',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error in uploadPdf controller:', error)
    next(error)
  }
}
