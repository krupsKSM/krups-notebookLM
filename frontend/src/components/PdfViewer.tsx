import { useState, useEffect } from 'react'
import { Document, Page } from 'react-pdf'

interface PdfViewerProps {
  fileUrl: string | null // The uploaded PDF's blob or URL
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pageWidth, setPageWidth] = useState<number>(600)

  // Adjust width on mount and window resize for responsiveness
  useEffect(() => {
    const updatePageWidth = () => {
      const padding = 48 // Account for padding/margin from container
      const maxWidth = 600 // Max page width

      const availableWidth = window.innerWidth - padding * 2
      // Cap width to maxWidth but don't exceed available width on small screens
      setPageWidth(Math.min(maxWidth, availableWidth > 0 ? availableWidth : maxWidth))
    }

    updatePageWidth()
    window.addEventListener('resize', updatePageWidth)
    return () => window.removeEventListener('resize', updatePageWidth)
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setLoadError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setLoadError('Failed to load PDF. Please try again.')
    setNumPages(null)
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages ?? 1))
  }

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
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="text-center text-gray-500">Loading PDF…</div>}
          error={<div className="text-center text-red-500">Failed to load PDF</div>}
          noData={<div className="text-center text-gray-400">No PDF file specified</div>}
        >
          <Page pageNumber={pageNumber} width={pageWidth} />
        </Document>

        <div className="mt-4 flex flex-wrap justify-center items-center gap-3 select-none">
          <button
            onClick={() => changePage(-1)}
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
            onClick={() => changePage(1)}
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
