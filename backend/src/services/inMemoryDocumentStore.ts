// File: backend/src/services/inMemoryDocumentStore.ts

/**
 * Service to maintain an in-memory store for uploaded documents and their extracted page text.
 * Each document is stored with page-wise text chunks and page numbers.
 */

export type PageText = {
  pageNumber: number
  text: string
}

export interface DocumentData {
  fileName: string
  pages: PageText[]
}

// Map keyed by docId (e.g., uploaded filename or UUID)
const documentStore = new Map<string, DocumentData>()

/**
 * Save a document's extracted page texts by document ID.
 * @param docId Unique string key to identify document
 * @param fileName Original uploaded file name
 * @param pages Array of page texts, each corresponding to a page
 */
export function saveDocument(docId: string, fileName: string, pages: string[]): void {
  const pageData: PageText[] = pages.map((text, index) => ({
    pageNumber: index + 1, // Clearly assign 1-based page numbers
    text,
  }))

  documentStore.set(docId, {
    fileName,
    pages: pageData,
  })
}

/**
 * Retrieve stored document data by document ID.
 * @param docId Document's unique ID string
 * @returns DocumentData or undefined if not found
 */
export function getDocument(docId: string): DocumentData | undefined {
  return documentStore.get(docId)
}
