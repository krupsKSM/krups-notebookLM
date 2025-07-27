import { Request, Response, NextFunction } from 'express'

export const uploadPdf = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    })
  } catch (error) {
    next(error)
  }
}
