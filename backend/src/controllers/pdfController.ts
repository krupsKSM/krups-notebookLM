import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { extractPdfTextByPage } from '../services/pdfTextService'

export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'PDF file is required' })
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        const filePath = path.join(process.cwd(), 'uploads', req.file.filename)

        // Extract text from PDF by pages
        const pages = await extractPdfTextByPage(filePath)

        // For debugging, return extracted pages as well 
        res.status(200).json({
            message: 'File uploaded & text extracted successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                url: fileUrl,
                totalPages: pages.length,
                extractedPages: pages
            }
        })
    } catch (error) {
        next(error)
    }
}
