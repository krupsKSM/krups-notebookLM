import { useEffect, useState } from 'react'
import './App.css'
import PdfUploadCard from './components/PdfUploadCard'
import PdfViewer from './components/PdfViewer'
import { uploadPdf } from './api/api'
import { pdfjs } from 'react-pdf'

// Setup PDF.js worker from CDN for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // Clean up blob URL when component unmounts or fileUrl changes (not used in current flow but safe)
  useEffect(() => {
    return () => {
      if (fileUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [fileUrl])

  // Handler for upload card for frontend testing before backend integration
  // const handleFileSelected = (selectedFile: File) => {
  //   setFile(selectedFile)

  //   setUploading(true)
  //   setProgress(0)

  //   const interval = setInterval(() => {
  //     setProgress(old => {
  //       if (old >= 100) {
  //         clearInterval(interval)
  //         setUploading(false)

  //         const blobUrl = URL.createObjectURL(selectedFile) // Create URL
  //         setFileUrl(blobUrl) // Set for PdfViewer

  //         return 100
  //       }
  //       return old + 10
  //     })
  //   }, 200)
  // -----------------------------------------

  // Upload selected PDF file to backend API
  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile)
    setUploading(true)
    setProgress(0)
    setFileUrl(null)

    try {
      const response = await uploadPdf(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setProgress(percentCompleted)
        }
      })

      // On success, set URL of uploaded PDF for viewing
      setFileUrl(response.data.file.url)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Upload failed. Please try again.')
      setFile(null)
      setFileUrl(null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <main className="min-h-screen bg-gray-200 px-4 py-10 flex items-center justify-center">
      <div className="mt-auto mb-auto ">
        <PdfUploadCard
          onFileSelected={handleFileSelected}
          uploading={uploading}
          uploadProgress={progress}
          file={file}
        />
        <div className="mt-10">
          {/* Show PDF viewer only if fileUrl is set */}
          {fileUrl && <PdfViewer fileUrl={fileUrl} />}
        </div>
      </div>
    </main>
  )
}

export default App
