import express, { Application, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import pdfRoutes from './routes/pdfRoutes'
import errorMiddleware from './middlewares/errorMiddleware'
import path from 'path'
import multer from 'multer' 

const app: Application = express()

app.use(cors())
app.use(express.json())

// Serve uploaded PDF files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// PDF routes (upload and others)
app.use('/api/pdf', pdfRoutes)

// Multer error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

// Global error handler 
app.use(errorMiddleware)

export default app
