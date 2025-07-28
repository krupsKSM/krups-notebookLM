// src/App.tsx

import { useEffect, useState } from 'react'
import PdfUploadCard from './components/PdfUploadCard'
import PdfViewer from './components/PdfViewer'
import ChatPanel from './components/ChatPanel'
import { uploadPdf } from './api/api'
import './App.css'

/**
 * Main App component orchestrating PDF upload, PDF viewing, and chat interaction.
 */
function App() {
  // State: currently selected File object
  const [file, setFile] = useState<File | null>(null)

  // State: uploading flag for UI blocking and progress display
  const [uploading, setUploading] = useState(false)

  // State: upload progress percentage (0-100)
  const [progress, setProgress] = useState(0)

  // State: URL to load PDF in viewer (provided from backend)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  // State: document identifier (typically backend filename or UUID)
  const [fileId, setFileId] = useState<string | null>(null)

  // State: currently displayed PDF page number (for viewer control)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // State: track if PDF has fully loaded to switch UI from upload to chat+viewer
  const [pdfIsLoaded, setPdfIsLoaded] = useState(false)

  /**
   * Clean up any object URLs on unmount or fileUrl change to avoid memory leaks.
   */
  useEffect(() => {
    return () => {
      if (fileUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [fileUrl])

  /**
   * Handles when a new file is selected for upload.
   * Uploads file through the backend with progress, and updates states.
   */
  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile)
    setUploading(true)
    setProgress(0)
    setFileUrl(null)
    setFileId(null)
    setCurrentPage(1)
    setPdfIsLoaded(false)

    try {
      const response = await uploadPdf(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          setProgress(percentCompleted)
        }
      })

      setFileUrl(response.data.file.url)
      setFileId(response.data.file.filename)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Upload failed. Please try again.')
      setFile(null)
      setFileUrl(null)
      setFileId(null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  /**
   * Callback invoked by PdfViewer when PDF document has fully loaded.
   * Triggers UI transition to display the chat panel.
   */
  const handlePdfLoadSuccess = () => {
    setPdfIsLoaded(true)
  }

  /**
   * Updates the current page in the PdfViewer based on chat citation clicks.
   */
  const handleCitationClick = (page: number) => {
    setCurrentPage(page)
  }

  /**
   * Resets app state to initial to allow uploading a new file, clearing PDF and chat.
   */
  const handleNewUpload = () => {
    setFile(null)
    setFileUrl(null)
    setFileId(null)
    setCurrentPage(1)
    setPdfIsLoaded(false)
  }

  /**
   * Conditional rendering: show upload UI until PDF fully loaded,
   * then show chat + PDF viewer split layout.
   */
  if (!pdfIsLoaded) {
    return (
      <main className="min-h-screen bg-gray-200 px-4 py-10 flex items-center justify-center">
        <div className="mt-auto mb-auto">
          <PdfUploadCard
            onFileSelected={handleFileSelected}
            uploading={uploading}
            uploadProgress={progress}
            file={file}
          />
          <div className="mt-10 max-w-3xl mx-auto">
            {fileUrl && (
              <PdfViewer
                fileUrl={fileUrl}
                pageNumber={currentPage}
                setPageNumber={setCurrentPage}
                onDocumentLoadSuccess={handlePdfLoadSuccess}
              />
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col sm:flex-row items-stretch justify-center">
      {/* Left chat panel */}
      <section className="w-full sm:w-[430px] border-r border-gray-200 bg-white flex flex-col p-2 overflow-auto max-h-screen">
        <ChatPanel docId={fileId!} onCitationClick={handleCitationClick} />
      </section>

      {/* Right PDF viewer panel with upload new file button */}
      <section className="flex-1 bg-gray-50 flex flex-col items-center justify-start p-4 overflow-auto max-h-screen">
        <div className="sticky top-0 z-10 py-3 px-1 w-full flex justify-end bg-gradient-to-b from-white/80 to-transparent mb-2">
          <button
            onClick={handleNewUpload}
            className="rounded bg-gray-100 border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 shadow transition"
          >
            Upload new file
          </button>
        </div>

        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <PdfViewer
              fileUrl={fileUrl}
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
