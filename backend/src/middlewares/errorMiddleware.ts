import { Request, Response, NextFunction } from 'express'

// Improved error handler middleware
const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log full error stack or message
  console.error(err.stack || err.message || err)

  // If response headers were already sent, delegate to default handler
  if (res.headersSent) {
    return next(err)
  }

  // If error has a statusCode (like 400, 404, 429, etc), use it, else default to 500
  const statusCode = err.statusCode || err.status || 500

  // Send JSON error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  })
}

export default errorMiddleware
