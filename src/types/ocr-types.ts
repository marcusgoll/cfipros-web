export interface OcrResult {
  fileId: string; // Relates back to the uploaded file
  status: 'success' | 'error_ocr_processing' | 'error_api_unavailable';
  rawText?: string;
  ocrErrorMessage?: string;
  geminiModelUsed?: string;
}

export interface GeminiOcrRequest {
  fileId: string;
  filePath: string;
  fileType: string;
  originalName?: string;
}

export interface GeminiApiResponse {
  candidates?: {
    content: {
      parts: {
        text?: string;
      }[];
    };
  }[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}
