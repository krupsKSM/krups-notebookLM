import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import React, { useRef, useState } from 'react'

interface PdfUploadCardProps {
  onFileSelected: (file: File) => void
  uploading: boolean
  uploadProgress: number
  file: File | null
}

const PdfUploadCard = ({ onFileSelected, uploading, uploadProgress, file }: PdfUploadCardProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    if (uploading) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file')
        return
      }

      onFileSelected(file)
      e.dataTransfer.clearData()
    }
  }

  const handleClick = () => {
    if (uploading) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file')
        return
      }
      onFileSelected(file)
      e.target.value = ""   // for allowing user to reupload files

    }
  }

  return (
    <>
      <div
        className={`cursor-pointer rounded-xl shadow-md p-8 text-center z-10 w-full max-w-sm sm:w-80 mx-auto
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
          border-2 transition-colors duration-200`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <ArrowUpTrayIcon className="mx-auto rounded-full bg-gray-100 h-10 w-10 p-2 mb-4 text-violet-800" />
        <p className="font-semibold text-lg text-gray-800">Upload PDF to start chatting</p>
        <p className="text-sm text-gray-500 mt-2">Click or drag and drop your files here</p>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Uploading Status */}
      {uploading && (
        <div className="mt-6 max-w-sm mx-auto flex flex-col sm:flex-row items-center gap-4">
          {/* Spinner + Text */}
          <div className="flex items-center gap-2 w-40">
            <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-700">Uploading PDF...</span>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          {/* % Value */}
          <span className="text-sm font-medium text-gray-700 w-10 text-right">
            {uploadProgress}%
          </span>
        </div>
      )}
      {file && (
        <p
          className="mt-4 text-sm text-gray-700 truncate whitespace-nowrap overflow-hidden max-w-full  mx-auto text-center"
          title={file.name} // tooltip
        >
          <strong>Uploaded file</strong>: {file.name}
        </p>
      )}
    </>
  )
}

export default PdfUploadCard
