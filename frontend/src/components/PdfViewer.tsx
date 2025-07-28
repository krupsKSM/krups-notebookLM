import { useState, useEffect } from 'react'
import { Document, Page} from 'react-pdf'

interface PdfViewerProps {
  /** URL or Blob URL of the PDF document to display */
  fileUrl: string | null
  /** Current page number to display */
  pageNumber: number
  /** Handler to update the current page */
  setPageNumber: (page: number) => void
  // Optional callback fired when PDF document loads successfully
  onDocumentLoadSuccess?: () => void
}
/**
 * PdfViewer component renders a PDF document and provides page navigation controls.
 * It dynamically adjusts rendering size according to window width for responsiveness.
 */
const PdfViewer = ({ fileUrl, pageNumber, setPageNumber, onDocumentLoadSuccess }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pageWidth, setPageWidth] = useState<number>(600)

  // Adjust page width on mount and window resize for responsiveness
  useEffect(() => {
    const updatePageWidth = () => {
      const padding = 48
      const maxWidth = 600
      const availableWidth = window.innerWidth - padding * 2
      setPageWidth(Math.min(maxWidth, availableWidth > 0 ? availableWidth : maxWidth))
    }
    updatePageWidth()
    window.addEventListener('resize', updatePageWidth)
    return () => window.removeEventListener('resize', updatePageWidth)
  }, [])

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoadError(null)
    if (onDocumentLoadSuccess) onDocumentLoadSuccess()
    setPageNumber(1) // reset to first page on new document load
  }

  const onLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setLoadError('Failed to load PDF. Please try again.')
    setNumPages(null)
  }

  // Simple next/prev with boundary checks
  const previousPage = () => setPageNumber(Math.max(pageNumber - 1, 1))
  const nextPage = () => setPageNumber(Math.min(pageNumber + 1, numPages ?? 1))

  if (!fileUrl) {
    return (
      <div className="max-w-xl mx-auto mt-6 p-6 border border-gray-300 rounded text-center text-gray-500 select-none">
        No PDF loaded yet. Upload a PDF to start viewing.
      </div>
    )
  }

  return (
    <div className="mx-auto p-4 border border-gray-300 rounded bg-white shadow w-full max-w-3xl">
      <div className="flex flex-col items-center">
        <Document
          file={fileUrl}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={<div className="text-center text-gray-500">Loading PDF…</div>}
          error={<div className="text-center text-red-500">Failed to load PDF</div>}
          noData={<div className="text-center text-gray-400">No PDF file specified</div>}
        >
          <Page pageNumber={pageNumber} width={pageWidth} />
        </Document>

        <div className="mt-4 flex flex-wrap justify-center items-center gap-3 select-none">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`px-3 py-2 rounded border border-gray-400 bg-gray-100 text-sm sm:text-base ${
              pageNumber <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
            } transition`}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm sm:text-base">
            Page <span className="font-semibold">{pageNumber}</span> of{' '}
            <span className="font-semibold">{numPages}</span>
          </span>
          <button
            onClick={nextPage}
            disabled={pageNumber >= (numPages ?? 1)}
            className={`px-3 py-2 rounded border border-gray-400 bg-gray-100 text-sm sm:text-base ${
              pageNumber >= (numPages ?? 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
            } transition`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mt-4 text-center text-red-600 font-medium">{loadError}</div>
      )}
    </div>
  )
}

export default PdfViewer
