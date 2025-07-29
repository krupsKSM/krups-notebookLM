
import express, { Application, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'

// Import route modules
import pdfRoutes from './routes/pdfRoutes'
import chatRoutes from './routes/chatRoutes'
import embeddingRoutes from './routes/embeddingRoutes'

// Import centralized error handler middleware
import errorMiddleware from './middlewares/errorMiddleware'

// Create Express application instance
const app: Application = express()

// Enable Cross-Origin Resource Sharing for frontend-backend communication
app.use(cors())

// Enable built-in middleware for parsing JSON body payloads
app.use(express.json())

// Serve static files (uploaded PDFs) from the /uploads URL path
// Files are physically read from 'uploads' directory in project root
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Root health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Backend service is running!');
})

// Routes related to PDF upload and processing
app.use('/api/pdf', pdfRoutes)

// Routes handling chat queries and responses
app.use('/api/chat', chatRoutes)

// Routes for embedding generation and management
app.use('/api/embedding', embeddingRoutes)

// Middleware to specifically handle errors from multer (multipart form-data file uploads)
// Catches multer-specific errors and sends a 400 Bad Request response with error message
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

// Global error handling middleware to catch all other errors thrown during request processing
// Ensures consistent error response format and logging
app.use(errorMiddleware)

// Export the Express app to be used by server entry point (e.g., server.ts)
export default app
