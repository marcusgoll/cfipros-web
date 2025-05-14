/**
 * Configuration for the Google Gemini API used for OCR processing.
 * Provides secure access to the API key and configuration options.
 */

// Default Gemini model for OCR processing - using the vision-capable model
export const GEMINI_MODEL_NAME = 'gemini-pro-vision';

/**
 * Get the Gemini API key from environment variables
 * @returns The API key or throws an error if not configured
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Log the error and throw a descriptive error
    console.error('GEMINI_API_KEY environment variable is not set');
    throw new Error('Gemini API key not configured. Please set the GEMINI_API_KEY environment variable.');
  }
  
  return apiKey;
}

/**
 * Configuration options for the Gemini API client
 */
export interface GeminiConfig {
  apiKey: string;
  modelName: string;
  maxRetries?: number;
  timeoutMs?: number;
}

/**
 * Get the default Gemini configuration
 * @returns The configuration object with API key and default settings
 */
export function getGeminiConfig(): GeminiConfig {
  return {
    apiKey: getGeminiApiKey(),
    modelName: GEMINI_MODEL_NAME,
    maxRetries: 2,
    timeoutMs: 30000, // 30 second timeout
  };
} 