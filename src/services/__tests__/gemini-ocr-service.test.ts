import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { processDocumentWithOcr, processDocumentWithRetry } from '../gemini-ocr-service';
import type { GeminiOcrRequest /*, OcrResult*/ } from '@/types/ocr-types';
import * as fsExtra from 'fs-extra';
// import * as fs from 'node:fs/promises';
// import type * as googleAI from '@google/generative-ai';

// Define the types for the mock implementation
interface MockResponse {
  text: () => string;
}

interface GenerateContentResponse {
  response: MockResponse;
}

// Define a type for the mock GoogleAI module
interface MockGoogleAI {
  GoogleGenerativeAI: jest.Mock<(apiKey: string, ...rest: unknown[]) => MockGoogleAIInstance>;
  HarmCategory: Record<string, string>;
  HarmBlockThreshold: Record<string, string>;
}

interface MockGenerativeModel {
  generateContent: jest.Mock<() => Promise<GenerateContentResponse>>;
}

interface MockGoogleAIInstance {
  getGenerativeModel: jest.Mock<(config?: { model: string }) => MockGenerativeModel>;
}

// Mock the fs-extra module
jest.mock('fs-extra', () => ({
  pathExists: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

// Mock the fs/promises module
jest.mock('node:fs/promises', () => ({
  readFile: jest.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from('mock-file-content')),
}));

// Mock the Google Generative AI SDK
jest.mock('@google/generative-ai', () => {
  // Mock response text method
  const textMock = jest.fn<() => string>().mockReturnValue('Extracted text from document');

  // Mock response object
  const responseMock: MockResponse = {
    text: textMock,
  };

  // Mock generateContent method
  const generateContentMock = jest.fn<() => Promise<GenerateContentResponse>>().mockResolvedValue({
    response: responseMock,
  });

  // Mock model object
  const modelMock = {
    generateContent: generateContentMock,
  };

  // Mock getGenerativeModel method
  const getGenerativeModelMock = jest
    .fn<(config?: { model: string }) => MockGenerativeModel>()
    .mockReturnValue(modelMock);

  // Mock the main class constructor

  const mockGoogleGenerativeAIConstructor = jest
    .fn<(apiKey: string, ...rest: unknown[]) => MockGoogleAIInstance>()
    .mockImplementation(() => ({
      getGenerativeModel: getGenerativeModelMock,
    }));

  return {
    GoogleGenerativeAI: mockGoogleGenerativeAIConstructor,
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
      // Use type assertion to make TypeScript happy with the boolean parameter
      (
        pathExistsMock.mockResolvedValueOnce as unknown as (value: boolean) => typeof pathExistsMock
      )(false);

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

      // Mock implementation in a type-safe way
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai') as MockGoogleAI;
      const mockGetGenerativeModel = jest.fn<() => MockGenerativeModel>().mockReturnValue({
        generateContent: jest
          .fn<() => Promise<GenerateContentResponse>>()
          .mockRejectedValueOnce(mockError),
      } as MockGenerativeModel);

      // Override the mock implementation for this test
      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: mockGetGenerativeModel as jest.Mock<() => MockGenerativeModel>,
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

      // Mock implementation in a type-safe way
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai') as MockGoogleAI;
      const mockGetGenerativeModelForNetworkError = jest
        .fn<() => MockGenerativeModel>()
        .mockReturnValue({
          generateContent: jest
            .fn<() => Promise<GenerateContentResponse>>()
            .mockRejectedValueOnce(mockNetworkError),
        } as MockGenerativeModel);

      // Override the mock implementation for this test
      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: mockGetGenerativeModelForNetworkError as jest.Mock<
          () => MockGenerativeModel
        >,
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
      // Mock implementation in a type-safe way
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai') as MockGoogleAI;
      const mockGetGenerativeModelForStringError = jest
        .fn<() => MockGenerativeModel>()
        .mockReturnValue({
          generateContent: jest
            .fn<() => Promise<GenerateContentResponse>>()
            .mockRejectedValueOnce('String error'),
        } as MockGenerativeModel);

      // Override the mock implementation for this test
      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: mockGetGenerativeModelForStringError as jest.Mock<
          () => MockGenerativeModel
        >,
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

      // Check it was called once (using the implementation from the mock)
      const MockedGoogleSDKForSuccess = jest.requireMock('@google/generative-ai') as MockGoogleAI;
      const mockInstance = new MockedGoogleSDKForSuccess.GoogleGenerativeAI('mock-api-key');
      const model = mockInstance.getGenerativeModel({ model: 'test-model' });
      expect(model.generateContent).toHaveBeenCalledTimes(1); // Check on the specific mock
    });

    it('should retry on API unavailability errors', async () => {
      // Arrange
      const mockNetworkError = new Error('Network error: connection reset');

      // Mock the text success response
      const textMockSuccess = jest.fn<() => string>().mockReturnValue('Retry succeeded');
      const responseMockSuccess: MockResponse = { text: textMockSuccess };

      // Setup mock implementation that fails first, then succeeds
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai') as MockGoogleAI;

      const specificGenerateContentMock = jest
        .fn<() => Promise<GenerateContentResponse>>()
        .mockRejectedValueOnce(mockNetworkError) // Fails first
        .mockResolvedValueOnce({ response: responseMockSuccess }); // Succeeds second

      // This mockGetGenerativeModel will be returned by ALL GoogleGenerativeAI instances in this test
      const testSpecificGetGenerativeModel = jest.fn<() => MockGenerativeModel>().mockReturnValue({
        generateContent: specificGenerateContentMock,
      } as MockGenerativeModel);

      // Mock all instances of GoogleGenerativeAI created during this test
      GoogleGenerativeAI.mockImplementation(() => ({
        // Changed from .mockImplementationOnce
        getGenerativeModel: testSpecificGetGenerativeModel,
      }));

      // Setup setTimeout spy
      jest.spyOn(global, 'setTimeout');

      // Act
      const result = await processDocumentWithRetry(mockRequest);

      // Assert
      expect(result.status).toBe('success');
      expect(result.rawText).toBe('Retry succeeded');

      // Called twice (initial + 1 retry)
      expect(specificGenerateContentMock).toHaveBeenCalledTimes(2);

      // Verify setTimeout was called for backoff
      expect(setTimeout).toHaveBeenCalled();
    });

    it('should not retry on non-retriable errors', async () => {
      // Arrange
      const mockProcessingError = new Error('Document format not supported');

      // Setup mock implementation for this test
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai') as MockGoogleAI;
      const generateContentMockForNonRetriable = jest
        .fn<() => Promise<GenerateContentResponse>>()
        .mockRejectedValueOnce(mockProcessingError);

      const mockGetGenerativeModelForNonRetriable = jest
        .fn<() => MockGenerativeModel>()
        .mockReturnValue({
          generateContent: generateContentMockForNonRetriable,
        } as MockGenerativeModel);

      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: mockGetGenerativeModelForNonRetriable as jest.Mock<
          () => MockGenerativeModel
        >,
      }));

      // Act
      const result = await processDocumentWithRetry(mockRequest);

      // Assert
      expect(result.status).toBe('error_ocr_processing');

      // Only called once - no retries for processing errors
      expect(generateContentMockForNonRetriable).toHaveBeenCalledTimes(1);
    });

    it('should give up after maximum retries', async () => {
      // Arrange
      // Ensure the error message WILL trigger 'error_api_unavailable' for retries
      const mockRetriableError = new Error('Network error: API always unavailable');

      // Clear mocks to ensure we are dealing with the global mock state for generateContent
      jest.clearAllMocks();

      // Get the globally mocked SDK
      const MockedGoogleSDK = jest.requireMock('@google/generative-ai') as MockGoogleAI;
      // Get an instance from the mocked constructor
      const genAIInstance = new MockedGoogleSDK.GoogleGenerativeAI('mock-api-key');
      // Get the model from that instance
      const modelInstance = genAIInstance.getGenerativeModel({ model: 'test-model' });
      // Now, modelInstance.generateContent is THE mock function defined in the global jest.mock scope.
      // Make it always reject for this test.
      (
        modelInstance.generateContent as jest.Mock<() => Promise<GenerateContentResponse>>
      ).mockRejectedValue(mockRetriableError);

      // Setup setTimeout spy if not already spied globally or in beforeEach
      // jest.spyOn(global, 'setTimeout'); // Assuming it might be cleared by jest.clearAllMocks()

      // Act: processDocumentWithRetry uses its default maxRetries = 2 (1 initial + 2 retries = 3 attempts)
      const result = await processDocumentWithRetry(mockRequest);

      // Assert
      expect(result.status).toBe('error_api_unavailable');
      expect(result.ocrErrorMessage).toBe(mockRetriableError.message);
      expect(modelInstance.generateContent).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
