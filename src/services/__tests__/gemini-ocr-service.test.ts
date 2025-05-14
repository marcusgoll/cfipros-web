import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { processDocumentWithOcr, processDocumentWithRetry } from '../gemini-ocr-service';
import type { GeminiOcrRequest } from '@/types/ocr-types';
import * as fsExtra from 'fs-extra';
import * as googleAI from '@google/generative-ai';

// Mock the fs-extra module
jest.mock('fs-extra', () => ({
  pathExists: jest.fn().mockResolvedValue(true),
}));

// Mock the fs/promises module
jest.mock('node:fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(Buffer.from('mock-file-content')),
}));

// Mock the Google Generative AI SDK
jest.mock('@google/generative-ai', () => {
  // Mock response text method
  const textMock = jest.fn().mockReturnValue('Extracted text from document');

  // Mock response object
  const responseMock = {
    text: textMock,
  };

  // Mock generateContent method
  const generateContentMock = jest.fn().mockResolvedValue({
    response: responseMock,
  });

  // Mock model object
  const modelMock = {
    generateContent: generateContentMock,
  };

  // Mock getGenerativeModel method
  const getGenerativeModelMock = jest.fn().mockReturnValue(modelMock);

  // Mock the main class
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: getGenerativeModelMock,
    })),
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
      HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
      BLOCK_NONE: 'BLOCK_NONE',
    },
  };
});

// Mock getGeminiConfig
jest.mock('@/lib/config/gemini-config', () => ({
  getGeminiConfig: jest.fn().mockReturnValue({
    apiKey: 'mock-api-key',
    modelName: 'mock-model-name',
    maxRetries: 2,
    timeoutMs: 30000,
  }),
}));

describe('Gemini OCR Service', () => {
  // Test setup
  const mockRequest: GeminiOcrRequest = {
    fileId: 'test-file-123',
    filePath: '/path/to/test/file.pdf',
    fileType: 'application/pdf',
  };

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test the main OCR processing function
  describe('processDocumentWithOcr', () => {
    it('should successfully process a document and extract text', async () => {
      // Act
      const result = await processDocumentWithOcr(mockRequest);

      // Assert
      expect(result.status).toBe('success');
      expect(result.rawText).toBe('Extracted text from document');
      expect(result.fileId).toBe(mockRequest.fileId);
      expect(result.geminiModelUsed).toBeDefined();
    });

    it('should handle file not found errors', async () => {
      // Arrange
      const pathExistsMock = jest.mocked(fsExtra.pathExists);
      pathExistsMock.mockResolvedValueOnce(false);

      // Act
      const result = await processDocumentWithOcr(mockRequest);

      // Assert
      expect(result.status).toBe('error_ocr_processing');
      expect(result.ocrErrorMessage).toBe('File not found');
      expect(result.fileId).toBe(mockRequest.fileId);
    });

    it('should handle Gemini API errors', async () => {
      // Arrange
      const mockError = new Error('Gemini API error');

      // Get the mocked implementation
      const generateContentMock = jest.fn().mockRejectedValueOnce(mockError);
      const getGenerativeModelMock = jest
        .fn()
        .mockReturnValue({ generateContent: generateContentMock });
      const GoogleGenerativeAIMock = jest.mocked(googleAI.GoogleGenerativeAI);
      GoogleGenerativeAIMock.mockImplementationOnce(() => ({
        getGenerativeModel: getGenerativeModelMock,
      }));

      // Act
      const result = await processDocumentWithOcr(mockRequest);

      // Assert
      expect(result.status).toBe('error_ocr_processing');
      expect(result.ocrErrorMessage).toBe('Gemini API error');
      expect(result.fileId).toBe(mockRequest.fileId);
    });

    it('should handle network availability errors specifically', async () => {
      // Arrange
      const mockNetworkError = new Error('Network error: unable to connect');

      // Get the mocked implementation
      const generateContentMock = jest.fn().mockRejectedValueOnce(mockNetworkError);
      const getGenerativeModelMock = jest
        .fn()
        .mockReturnValue({ generateContent: generateContentMock });
      const GoogleGenerativeAIMock = jest.mocked(googleAI.GoogleGenerativeAI);
      GoogleGenerativeAIMock.mockImplementationOnce(() => ({
        getGenerativeModel: getGenerativeModelMock,
      }));

      // Act
      const result = await processDocumentWithOcr(mockRequest);

      // Assert
      expect(result.status).toBe('error_api_unavailable');
      expect(result.ocrErrorMessage).toContain('Network error');
      expect(result.fileId).toBe(mockRequest.fileId);
    });

    it('should handle non-Error objects thrown by the API', async () => {
      // Arrange
      // Get the mocked implementation
      const generateContentMock = jest.fn().mockRejectedValueOnce('String error');
      const getGenerativeModelMock = jest
        .fn()
        .mockReturnValue({ generateContent: generateContentMock });
      const GoogleGenerativeAIMock = jest.mocked(googleAI.GoogleGenerativeAI);
      GoogleGenerativeAIMock.mockImplementationOnce(() => ({
        getGenerativeModel: getGenerativeModelMock,
      }));

      // Act
      const result = await processDocumentWithOcr(mockRequest);

      // Assert
      expect(result.status).toBe('error_ocr_processing');
      expect(result.ocrErrorMessage).toBe('String error');
    });
  });

  // Test the retry mechanism
  describe('processDocumentWithRetry', () => {
    it('should return successful result without retries when successful on first attempt', async () => {
      // Act
      const result = await processDocumentWithRetry(mockRequest);

      // Assert
      expect(result.status).toBe('success');

      // Get the mocked generateContent and check it was called once
      const generateContentMock = jest.mocked(
        googleAI.GoogleGenerativeAI().getGenerativeModel().generateContent
      );
      expect(generateContentMock).toHaveBeenCalledTimes(1);
    });

    it('should retry on API unavailability errors', async () => {
      // Arrange
      const mockNetworkError = new Error('Network error: connection reset');

      // Mock the implementation for this test
      const textMock = jest.fn().mockReturnValue('Retry succeeded');
      const responseMock = { text: textMock };

      // First call fails with network error, second call succeeds
      const generateContentMock = jest
        .fn()
        .mockRejectedValueOnce(mockNetworkError)
        .mockResolvedValueOnce({ response: responseMock });

      const getGenerativeModelMock = jest
        .fn()
        .mockReturnValue({ generateContent: generateContentMock });
      const GoogleGenerativeAIMock = jest.mocked(googleAI.GoogleGenerativeAI);
      GoogleGenerativeAIMock.mockImplementation(() => ({
        getGenerativeModel: getGenerativeModelMock,
      }));

      // Setup setTimeout spy
      jest.spyOn(global, 'setTimeout');

      // Act
      const result = await processDocumentWithRetry(mockRequest);

      // Assert
      expect(result.status).toBe('success');
      expect(result.rawText).toBe('Retry succeeded');

      // Called twice (initial + 1 retry)
      expect(generateContentMock).toHaveBeenCalledTimes(2);

      // Verify setTimeout was called for backoff
      expect(setTimeout).toHaveBeenCalled();
    });

    it('should not retry on non-retriable errors', async () => {
      // Arrange
      const mockProcessingError = new Error('Document format not supported');

      // Mock implementation to track calls and return an error status
      const generateContentMock = jest.fn().mockRejectedValueOnce(mockProcessingError);
      const getGenerativeModelMock = jest
        .fn()
        .mockReturnValue({ generateContent: generateContentMock });
      const GoogleGenerativeAIMock = jest.mocked(googleAI.GoogleGenerativeAI);
      GoogleGenerativeAIMock.mockImplementation(() => ({
        getGenerativeModel: getGenerativeModelMock,
      }));

      // Act
      const result = await processDocumentWithRetry(mockRequest);

      // Assert
      expect(result.status).toBe('error_ocr_processing');

      // Only called once - no retries for processing errors
      expect(generateContentMock).toHaveBeenCalledTimes(1);
    });

    it('should give up after maximum retries', async () => {
      // Arrange
      const mockNetworkError = new Error('Network error: timeout');

      // All attempts fail with network errors
      const generateContentMock = jest.fn().mockRejectedValue(mockNetworkError);
      const getGenerativeModelMock = jest
        .fn()
        .mockReturnValue({ generateContent: generateContentMock });
      const GoogleGenerativeAIMock = jest.mocked(googleAI.GoogleGenerativeAI);
      GoogleGenerativeAIMock.mockImplementation(() => ({
        getGenerativeModel: getGenerativeModelMock,
      }));

      // Spy on console.log
      jest.spyOn(console, 'log');
      jest.spyOn(console, 'error');

      // Act
      const result = await processDocumentWithRetry(mockRequest, 2);

      // Assert
      expect(result.status).toBe('error_api_unavailable');

      // Called 3 times (initial + 2 retries)
      expect(generateContentMock).toHaveBeenCalledTimes(3);

      // Verify retry logs
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Retry attempt 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Retry attempt 2'));
    });
  });
});
