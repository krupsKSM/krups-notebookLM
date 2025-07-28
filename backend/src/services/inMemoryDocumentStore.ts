
/**
 * Service to maintain an in-memory store for uploaded documents and their extracted page text.
 * This is a simple storage solution for development and prototyping.
 * For production,we acn consider database or vector DB storage.
 */

export type PageText = {
  pageNumber: number
  text: string
}

export interface DocumentData {
  fileName: string
  pages: PageText[]
}

// Map keyed by docId (e.g. filename or UUID)
const documentStore = new Map<string, DocumentData>()

/**
 * Save a document's extracted text pages by document ID.
 * @param docId unique string key to identify doc (e.g., filename or generated UUID)
 * @param fileName original file name
 * @param pages array of text extracted from each page
 */
export function saveDocument(docId: string, fileName: string, pages: string[]): void {
  const pageData: PageText[] = pages.map((text, index) => ({
    pageNumber: index + 1,
    text,
  }))
  documentStore.set(docId, {
    fileName,
    pages: pageData,
  })
}

/**
 * Retrieve document data by document ID.
 * @param docId document's unique ID string
 * @returns DocumentData | undefined if not found
 */
export function getDocument(docId: string): DocumentData | undefined {
  return documentStore.get(docId)
}
