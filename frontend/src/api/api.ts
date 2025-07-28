import axios from 'axios'
import type { AxiosProgressEvent } from 'axios'

// Base API URL is configurable via Vite environment variables or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * Upload a PDF file to the backend API.
 * Supports optional upload progress monitoring.
 *
 * @param file - PDF File object selected by user
 * @param onUploadProgress - Optional callback for progress events during upload
 * @returns Axios promise resolving with response data
 */
 
export const uploadPdf = (
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const formData = new FormData()
  formData.append('pdf', file)

  return axios.post(`${API_BASE_URL}/pdf/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  })
}
