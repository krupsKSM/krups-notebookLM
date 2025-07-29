import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { saveDocument } from '../services/inMemoryDocumentStore'
import { parsePdfWithLlamaParse, LlamaParseChunk } from '../services/llamaParseService'

/**
 * Handles PDF upload request.
 * 
 * Workflow:
 * - Validates PDF file is attached.
 * - Saves file temporarily to disk.
 * - Calls LlamaParse microservice to parse PDF into markdown chunks.
 * - Assigns fallback page numbers if missing.
 * - Saves the extracted texts and page info in-memory for further use.
 * - Returns file metadata and total pages count to frontend.
 * 
 * @param req Express Request, expects 'file' in multipart form-data
 * @param res Express Response, responds with JSON metadata or error
 * @param next Express NextFunction for error handling
 */
export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate uploaded file presence
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    // Construct absolute path of the uploaded file on disk
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename)

    // Debug log for uploaded file path
    console.log('Calling LlamaParse microservice on:', filePath)

    // Call the microservice to parse the PDF and extract markdown chunks
    const parseResult = await parsePdfWithLlamaParse(filePath)

    // Log the response from the microservice (for debugging)
    console.log('LlamaParse microservice response:', parseResult)

    // Validate response structure contains 'chunks' array
    if (!parseResult || !Array.isArray(parseResult.chunks)) {
      return res.status(500).json({ error: 'Invalid response from LlamaParse microservice' })
    }

    // Assign fallback page numbers sequentially for chunks missing 'page' metadata
    const chunksWithPageNumbers = parseResult.chunks.map((chunk: LlamaParseChunk, idx: number) => ({
      ...chunk,
      page: chunk.page == null ? idx + 1 : chunk.page,
    }))

    // Save document chunks (texts) with page numbering in memory
    saveDocument(
      req.file.filename,
      req.file.originalname,
      chunksWithPageNumbers.map(chunk => chunk.text)
    )

    // Total number of pages/chunks parsed
    const totalPages = chunksWithPageNumbers.length

    // Generate HTTPS-safe URL of the uploaded PDF for frontend access,
    // respecting possible proxy headers setting 'x-forwarded-proto'
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https'
    const safeProtocol = protocol === 'http' ? 'https' : protocol

    console.log('x-forwarded-proto:', req.headers['x-forwarded-proto'], '| req.protocol:', req.protocol);

    const fileUrl = `${safeProtocol}://${req.get('host')}/uploads/${req.file.filename}`

    // Send success response to frontend with file metadata
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
    // Log detailed error stack for debugging purposes
    console.error('Error in uploadPdf controller:', error)

    // Pass error to Express error handler middleware
    next(error)
  }
}
