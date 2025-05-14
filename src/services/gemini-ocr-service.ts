/**
 * Service for processing images and PDFs with Google Gemini API for OCR.
 * Extracts text content from various document types.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { readFile } from 'node:fs/promises';
import * as fs from 'fs-extra';
import { extname } from 'node:path';
import { getGeminiConfig } from '@/lib/config/gemini-config';
import type { GeminiOcrRequest, OcrResult } from '@/types/ocr-types';

// Helper function to convert file to base64
async function fileToGenerativePart(path: string, mimeType: string): Promise<{data: string, mimeType: string}> {
  const fileData = await readFile(path);
  return {
    data: fileData.toString('base64'),
    mimeType
  };
}

// Map file extensions to MIME types for common document types
function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Process a document with Gemini OCR to extract text
 * @param request Details of the file to process
 * @returns OCR processing result with extracted text or error information
 */
export async function processDocumentWithOcr(request: GeminiOcrRequest): Promise<OcrResult> {
  const { fileId, filePath, fileType } = request;
  const fileExtension = extname(filePath);
  
  // Check if file exists
  if (!await fs.pathExists(filePath)) {
    console.error(`File not found for OCR processing: ${filePath}`);
    return {
      fileId,
      status: 'error_ocr_processing',
      ocrErrorMessage: 'File not found'
    };
  }
  
  try {
    // Get configuration for Gemini API
    const config = getGeminiConfig();
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({
      model: config.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    // Determine the MIME type
    const mimeType = getMimeTypeFromExtension(fileExtension) || fileType;
    
    // Prepare the file for API request
    const imagePart = await fileToGenerativePart(filePath, mimeType);
    
    console.log(`Sending ${fileId} (${mimeType}) to Gemini for OCR processing`);
    
    // Basic prompt to extract text content from the document
    const prompt = "Extract all text content from this document. Return only the raw extracted text, preserving the original formatting as much as possible.";
    
    // Make the API call to Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: imagePart
      }
    ]);
    
    const response = result.response;
    const text = response.text();
    
    console.log(`OCR processing completed for file ${fileId}`);
    
    // Return successful result with extracted text
    return {
      fileId,
      status: 'success',
      rawText: text,
      geminiModelUsed: config.modelName
    };
    
  } catch (error) {
    // Handle various error scenarios
    console.error(`Error in Gemini OCR processing for file ${fileId}:`, error);
    
    // Cast to unknown then string to safely access message
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's an API availability issue
    const isApiUnavailable = errorMessage.includes('Network error') || 
                            errorMessage.includes('ECONNREFUSED') ||
                            errorMessage.includes('timeout') ||
                            errorMessage.includes('503') ||
                            errorMessage.includes('429');
    
    return {
      fileId,
      status: isApiUnavailable ? 'error_api_unavailable' : 'error_ocr_processing',
      ocrErrorMessage: errorMessage || 'Unknown error during OCR processing'
    };
  }
}

/**
 * Process a document with retry logic
 * @param request Details of the file to process
 * @param maxRetries Maximum number of retry attempts
 * @returns OCR processing result with extracted text or error information
 */
export async function processDocumentWithRetry(
  request: GeminiOcrRequest, 
  maxRetries = 2
): Promise<OcrResult> {
  let lastError: OcrResult | null = null;
  
  // Try processing with retries for transient errors
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`Retry attempt ${attempt} for file ${request.fileId}`);
      // Exponential backoff for retries
      await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** (attempt - 1))));
    }
    
    const result = await processDocumentWithOcr(request);
    
    // If successful or non-retriable error, return immediately
    if (result.status === 'success' || result.status === 'error_ocr_processing') {
      return result;
    }
    
    // Store the error and retry for API availability issues
    lastError = result;
  }
  
  // All retries failed
  return lastError || {
    fileId: request.fileId,
    status: 'error_ocr_processing',
    ocrErrorMessage: 'Maximum retry attempts reached'
  };
} 