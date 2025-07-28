// src/main.tsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url'
import './index.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

/**
 * Configure PDF.js worker globally before any PDF component loads.
 * This is required by react-pdf for proper PDF processing in a Web Worker thread.
 */
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

// Create root and render the main App component wrapped in React.StrictMode
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
