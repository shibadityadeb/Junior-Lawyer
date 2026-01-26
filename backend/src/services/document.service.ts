import * as fs from 'fs'
import * as path from 'path'
import { pipeline } from 'stream/promises'

interface ExtractedDocument {
  filename: string
  content: string
  type: 'pdf' | 'image' | 'text' | 'docx'
  extractedAt: Date
}

/**
 * Extract text from PDF files
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Dynamic import to handle pdf-parse
    const pdfParse = require('pdf-parse')
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)

    // Extract text and limit to 10,000 characters
    let text = data.text || ''
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '\n...[content truncated]'
    }

    return text.trim()
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ path: filePath })

    // Extract text and limit to 10,000 characters
    let text = result.value || ''
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '\n...[content truncated]'
    }

    return text.trim()
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('Failed to extract text from Word document')
  }
}

/**
 * Extract text from plain text files
 */
export async function extractTextFromTXT(filePath: string): Promise<string> {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')

    // Limit to 10,000 characters
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '\n...[content truncated]'
    }

    return content.trim()
  } catch (error) {
    console.error('Text file extraction error:', error)
    throw new Error('Failed to extract text from file')
  }
}

/**
 * Extract text from images using OCR
 */
export async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const Tesseract = require('tesseract.js')

    const {
      data: { text },
    } = await Tesseract.recognize(filePath, 'eng')

    // Limit to 10,000 characters
    let result = text || ''
    if (result.length > 10000) {
      result = result.substring(0, 10000) + '\n...[content truncated]'
    }

    return result.trim()
  } catch (error) {
    console.error('OCR extraction error:', error)
    throw new Error('Failed to extract text from image using OCR')
  }
}

/**
 * Generic document extraction based on file type
 */
export async function extractDocumentContent(
  filePath: string,
  fileType: string
): Promise<string> {
  const ext = path.extname(fileType).toLowerCase()

  console.log(`[DocumentService] Extracting ${ext} from ${filePath}`)

  switch (ext) {
    case '.pdf':
      return extractTextFromPDF(filePath)

    case '.docx':
      return extractTextFromDOCX(filePath)

    case '.txt':
      return extractTextFromTXT(filePath)

    case '.png':
    case '.jpg':
    case '.jpeg':
      return extractTextFromImage(filePath)

    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }
}

/**
 * Process multiple documents
 */
export async function processDocuments(
  files: Array<{ path: string; originalName: string }>
): Promise<ExtractedDocument[]> {
  const results: ExtractedDocument[] = []

  for (const file of files) {
    try {
      const content = await extractDocumentContent(file.path, file.originalName)
      const ext = path.extname(file.originalName).toLowerCase().replace('.', '')

      results.push({
        filename: file.originalName,
        content,
        type: (ext as 'pdf' | 'image' | 'text' | 'docx') || 'text',
        extractedAt: new Date(),
      })
    } catch (error) {
      console.error(`Error processing ${file.originalName}:`, error)
      // Continue with other files, but track errors
      results.push({
        filename: file.originalName,
        content: `[ERROR: Failed to extract content from this file]`,
        type: 'text',
        extractedAt: new Date(),
      })
    }
  }

  return results
}

/**
 * Format extracted documents for Claude context
 */
export function formatDocumentsForContext(documents: ExtractedDocument[]): string {
  if (documents.length === 0) {
    return ''
  }

  const formatted = documents
    .map((doc, idx) => {
      return `[Document ${idx + 1}: ${doc.filename}]\n${doc.content}\n`
    })
    .join('\n---\n\n')

  return `
## User-Provided Documents:

${formatted}

## Instructions:
- Answer based on the content of these documents and the user's question
- If the documents don't contain relevant information, inform the user
- Cite document sections when providing answers
- If you need clarification, ask the user
`
}

/**
 * Cleanup temporary file
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`[DocumentService] Cleaned up temporary file: ${filePath}`)
    }
  } catch (error) {
    console.error(`[DocumentService] Error cleaning up file ${filePath}:`, error)
  }
}

/**
 * Cleanup multiple temporary files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    await cleanupTempFile(filePath)
  }
}
