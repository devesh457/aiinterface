// Import PDF parsing library
let pdfParse: any = null
try {
  pdfParse = require('pdf-parse')
} catch (error) {
  console.warn('pdf-parse not available:', error)
}

// Import Tesseract for OCR
let Tesseract: any = null
try {
  Tesseract = require('tesseract.js')
} catch (error) {
  console.warn('tesseract.js not available:', error)
}

// Import Gemini service
import { geminiService, detectDocumentType } from './gemini'

// Document processing interfaces
export interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  content: string
  uploadDate: Date
  status: 'processing' | 'analyzing' | 'ready' | 'error'
  processingProgress?: number
  errorMessage?: string
  documentType?: string
  geminiAnalysis?: {
    success: boolean
    analysis?: string
    complianceScore?: number
    issues?: string[]
    recommendations?: string[]
    summary?: string
  }
  complianceScore?: number
  issues?: string[]
  recommendations?: string[]
  aiSummary?: string
}

export interface DocumentProcessorResult {
  success: boolean
  content?: string
  error?: string
  documentType?: string
}

export interface ProcessingProgress {
  progress: number
  status: string
}

class DocumentProcessor {
  private progressCallbacks: Map<string, (progress: ProcessingProgress) => void> = new Map()

  setProgressCallback(documentId: string, callback: (progress: ProcessingProgress) => void) {
    this.progressCallbacks.set(documentId, callback)
  }

  removeProgressCallback(documentId: string) {
    this.progressCallbacks.delete(documentId)
  }

  private updateProgress(documentId: string, progress: number, status: string) {
    const callback = this.progressCallbacks.get(documentId)
    if (callback) {
      callback({ progress, status })
    }
  }

  async processFile(file: File, documentId: string): Promise<DocumentProcessorResult> {
    try {
      this.updateProgress(documentId, 10, 'Starting document processing...')

      // Only support PDF files for Schedule B & C documents
      if (file.type === 'application/pdf') {
        const result = await this.processFileWithAnalysis(file, documentId)
        return {
          success: result.processingResult.success,
          content: result.analysisResult?.extractedText || '',
          error: result.processingResult.error,
          documentType: result.analysisResult?.documentType || 'unknown'
        }
      } else {
        throw new Error('Only PDF files are supported for Schedule B & C documents')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async processFileWithAnalysis(file: File, documentId: string): Promise<{
    processingResult: { success: boolean; error?: string };
    analysisResult?: any;
  }> {
    try {
      this.updateProgress(documentId, 30, 'Preparing PDF upload...');
      
      // Convert PDF to Base64
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result?.toString();
          if (result) {
            resolve(result.split(',')[1]); // Extract base64 data
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      this.updateProgress(documentId, 60, 'Uploading to Gemini...');
      
      // Send directly to Gemini
      const analysisResult = await geminiService.analyzePDF(base64Content, file.name);
      
      this.updateProgress(documentId, 100, 'Analysis complete');
      return {
        processingResult: { success: true },
        analysisResult
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        processingResult: { 
          success: false, 
          error: error instanceof Error ? error.message : 'PDF upload failed' 
        }
      };
    }
  }

  getSupportedFileTypes(): string[] {
    return ['.pdf'] // Only PDFs for Schedule B & C documents
  }

  getMaxFileSize(): number {
    return 50 * 1024 * 1024 // 50MB
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 2 * 1024 * 1024;
    // Check file type - only PDFs allowed
    if (file.type !== 'application/pdf') {
      return {
        valid: false,
        error: 'Only PDF files are supported for highway engineering documents'
      }
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File size too large. Maximum size is ${this.formatFileSize(MAX_SIZE)}`
      }
    }

    // Check if filename suggests it's a highway engineering document
    const fileName = file.name.toLowerCase()
    const isEngineeringDocument = fileName.includes('highway') || fileName.includes('schedule') || fileName.includes('road') || fileName.includes('engineering')
    
    if (!isEngineeringDocument) {
      console.warn('File name does not suggest highway engineering document, but processing anyway')
    }

    return { valid: true }
  }

  getSupportedFormatsText(): string {
    return 'PDF highway engineering documents (Schedule B & C sections)'
  }

  formatFileSize(bytes: number): string {
    return formatFileSize(bytes)
  }
}

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(fileName: string, fileType: string): string {
  if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return '📄' // PDF icon
  }
  return '📄' // Default to PDF since we only support PDFs
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor()