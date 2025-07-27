import { useEffect, useState } from 'react'
import './App.css'
import PdfUploadCard from './components/PdfUploadCard'
import PdfViewer from './components/PdfViewer'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // Clean up blob URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (fileUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [fileUrl])

  // Handler for upload card
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile)

    setUploading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          clearInterval(interval)
          setUploading(false)

          const blobUrl = URL.createObjectURL(selectedFile) // Create URL
          setFileUrl(blobUrl) // Set for PdfViewer

          return 100
        }
        return old + 10
      })
    }, 200)
  }
  return (
    <>
      <main className="min-h-screen bg-gray-200  px-4 py-10">
        <div className='mt-auto mb-auto '>
          <PdfUploadCard
            onFileSelected={handleFileSelected} uploading={uploading} uploadProgress={progress}
            file={file} />
          <div className='mt-10'>
            {/* PDF Viewer only shown if a file is loaded */}
            {fileUrl && <PdfViewer fileUrl={fileUrl} />}
          </div>
        </div>
      </main>
    </>
  )
}

export default App
