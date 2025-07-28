import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';

/**
 * Props for PdfUploadCard component.
 */
interface PdfUploadCardProps {
  /** Callback when a valid PDF file is selected */
  onFileSelected: (file: File) => void;
  /** Whether an upload is in progress */
  uploading: boolean;
  /** Upload progress percentage (0-100) */
  uploadProgress: number;
  /** The currently uploaded file, if any */
  file: File | null;
}

/**
 * PdfUploadCard component enables user to upload a PDF file by clicking or drag-drop.
 * Shows upload progress and disables interactions while uploading.
 */
const PdfUploadCard = ({ onFileSelected, uploading, uploadProgress, file }: PdfUploadCardProps) => {
  // Track if drag is active over drop zone for styling
  const [isDragOver, setIsDragOver] = useState(false);

  // Ref to the hidden file input element to trigger click programmatically
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag over event - prevent default to allow drop and update state
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave event - reset state
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle dropped files - validate PDF and trigger upload callback
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (uploading) return; // ignore drops during upload

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      if (droppedFile.type !== 'application/pdf') {
        alert('Please upload a valid PDF file');
        return;
      }

      onFileSelected(droppedFile);
      e.dataTransfer.clearData();
    }
  };

  // Click handler to open file picker if not uploading
  const handleClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // File input change handler - validate file and trigger upload callback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please upload a valid PDF file');
        return;
      }
      onFileSelected(selectedFile);

      // Reset input to allow same file re-selection
      e.target.value = "";
    }
  };


  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF file, click or drag-and-drop"
        className={`cursor-pointer rounded-xl shadow-md p-8 text-center z-10 w-full max-w-sm sm:w-80 mx-auto
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
          border-2 transition-colors duration-200`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <ArrowUpTrayIcon className="mx-auto rounded-full bg-gray-100 h-10 w-10 p-2 mb-4 text-violet-800" />
        <p className="font-semibold text-lg text-gray-800">Upload PDF to start</p>
        <p className="text-sm text-gray-500 mt-2">Click or drag and drop your files</p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {/* Upload progress UI */}
      {uploading && (
        <div className="mt-6 max-w-sm mx-auto flex flex-col sm:flex-row items-center gap-4">
          {/* Spinner and text */}
          <div className="flex items-center gap-2 w-40">
            <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-700">Uploading PDF...</span>
          </div>
          {/* Progress bar */}
          <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          {/* Percent value */}
          <span className="text-sm font-medium text-gray-700 w-10 text-right">{uploadProgress}%</span>
        </div>
      )}

      {/* Currently uploaded file info */}
      {file && (
        <p
          className="mt-4 text-sm truncate max-w-full mx-auto text-center"
          title={file.name}
        >
          <strong>Uploaded file:</strong> {file.name}
        </p>
      )}
    </>
  );
};

export default PdfUploadCard;
