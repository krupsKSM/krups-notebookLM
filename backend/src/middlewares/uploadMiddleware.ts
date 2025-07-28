import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Define the absolute path to the 'uploads' directory inside your backend project
// This directory will store uploaded PDF files
const uploadDir = path.join(process.cwd(), 'uploads') // e.g., /absolute/path/to/backend/uploads

// Check if the upload directory exists, if not create it recursively
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log(`Created upload directory at: ${uploadDir}`)
}

// Configure multer disk storage engine
// Controls where to store uploaded files and how to name them
const storage = multer.diskStorage({
  // Destination folder to save uploaded files
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  // Define a custom filename to avoid collisions
  // Format: timestamp-randomNumber.extension (e.g., 1686117842891-123456789.pdf)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) // Extract original file extension (should be .pdf)
    // Create unique filename using current timestamp + random number to reduce conflicts
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, filename)
  }
})

// File filter to accept only PDF files and reject others
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept file only if MIME type is 'application/pdf'
  if (file.mimetype === 'application/pdf') {
    cb(null, true) // Accept the file
  } else {
    // Reject file with error message
    cb(new Error('Only PDF files are allowed'))
  }
}

// Create the multer upload middleware instance with configuration
const upload = multer({
  storage,       // Storage settings (destination, filename)
  fileFilter,    // File type filter callback
  limits: {
    fileSize: 100 * 1024 * 1024, // Maximum allowed file size: 100MB
  }
})

// Export multer middleware to be used in Express routes
// Example usage in route:
// app.post('/api/pdf/upload', upload.single('file'), yourControllerFunction)
export default upload
