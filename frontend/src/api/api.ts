import axios from 'axios'
import type { AxiosProgressEvent } from 'axios'

// Base API URL configurable via Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

//  Upload PDF file to backend API
 
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
