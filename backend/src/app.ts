import express, { Application, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import pdfRoutes from './routes/pdfRoutes'
import errorMiddleware from './middlewares/errorMiddleware'
import path from 'path'
import multer from 'multer' 
import chatRoutes from './routes/chatRoutes'
import embeddingRoutes from './routes/embeddingRoutes';

const app: Application = express()

app.use(cors())
app.use(express.json())

// Serve uploaded PDF files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// PDF routes 
app.use('/api/pdf', pdfRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/embedding', embeddingRoutes);

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
