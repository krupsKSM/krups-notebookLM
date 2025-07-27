import { useState } from 'react'
import './App.css'
import PdfUploadCard from './components/PdfUploadCard'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile)

    setUploading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          clearInterval(interval)
          setUploading(false)
          alert(`File ready to upload: ${selectedFile.name}`)
          return 100
        }
        return old + 10
      })
    }, 200)
  }
  return (
    <>
      <main className="min-h-screen bg-gray-200 flex items-center justify-center px-4 ">
        <div className='mt-auto mb-auto '>
          <PdfUploadCard
            onFileSelected={handleFileSelected} uploading={uploading} uploadProgress={progress}
            file={file} />
        </div>
      </main>
    </>
  )
}

export default App
