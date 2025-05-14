import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as fsPromises from 'node:fs/promises';
import type { User, AuthError } from '@supabase/supabase-js';

// Mock modules before importing the target file
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, options?: ResponseInit) => ({ data, options })),
  },
}));

// Mock createRouteHandlerClient
const mockAuthGetUser =
  jest.fn<() => Promise<{ data: { user: User | null }; error: AuthError | null }>>();
const mockSupabase = { auth: { getUser: mockAuthGetUser } };
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => mockSupabase),
}));

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ get: jest.fn() })),
}));

// Mock fs operations
jest.mock('node:fs/promises', () => ({
  mkdir: jest
    .fn<typeof fsPromises.mkdir>()
    .mockResolvedValue(undefined as unknown as string | undefined),
  writeFile: jest.fn<typeof fsPromises.writeFile>().mockResolvedValue(undefined),
}));

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-file-uuid'),
}));

// Mock the file validator
jest.mock('@/lib/validators/test-upload', () => ({
  validateFile: jest.fn().mockReturnValue({ valid: true, errors: [] }),
}));

// Mock the OCR service
interface MockOcrResult {
  fileId: string;
  status: string;
  rawText?: string;
  geminiModelUsed?: string;
  ocrErrorMessage?: string;
}
jest.mock('@/services/gemini-ocr-service', () => ({
  processDocumentWithRetry: jest.fn<() => Promise<MockOcrResult>>().mockResolvedValue({
    fileId: 'test-file-uuid',
    status: 'success',
    rawText: 'Extracted test content',
    geminiModelUsed: 'gemini-pro-vision',
  }),
}));

// Import the route handler after all mocks are set up
import { POST } from '../route';
import { validateFile } from '@/lib/validators/test-upload';
import { processDocumentWithRetry } from '@/services/gemini-ocr-service';

describe('Test Upload API Route', () => {
  let mockFormData: FormData;
  let mockRequest: Partial<NextRequest>;
  // Type definition for the arrayBuffer method
  let originalArrayBuffer: () => Promise<ArrayBuffer>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth response - authenticated user
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
    });

    // Set up mock FormData for each test
    mockFormData = new FormData();

    // Create a mock request
    mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    };

    // Mock File.prototype.arrayBuffer
    originalArrayBuffer = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(10));

    // Spy on console.log and console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original arrayBuffer method
    File.prototype.arrayBuffer = originalArrayBuffer;
  });

  it('should return 401 if user is not authenticated', async () => {
    // Override auth for this test
    mockAuthGetUser.mockResolvedValueOnce({
      data: { user: null },
    });

    await POST(mockRequest as NextRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Authentication required' },
      { status: 401 }
    );
  });

  it('should handle valid file uploads and trigger OCR processing', async () => {
    // Add a valid file to the form data
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    mockFormData.append('client-id-123', testFile);

    await POST(mockRequest as NextRequest);

    // Verify mkdir was called
    const mkdirMock = jest.mocked(fsPromises.mkdir);
    expect(mkdirMock).toHaveBeenCalled();

    // Verify writeFile was called
    const writeFileMock = jest.mocked(fsPromises.writeFile);
    expect(writeFileMock).toHaveBeenCalled();

    // Verify response
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          expect.objectContaining({
            success: true,
            fileId: 'test-file-uuid',
            originalName: 'client-id-123',
          }),
        ],
        overallSuccess: true,
      })
    );

    // Verify OCR processing was triggered
    // Note: In our implementation, processOcrInBackground is called but not awaited,
    // so we can't directly test the function but we can check if processDocumentWithRetry was called
    expect(processDocumentWithRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'test-file-uuid',
        fileType: 'application/pdf',
      })
    );
  });

  it('should handle invalid files', async () => {
    // Mock validator to return invalid
    jest.mocked(validateFile).mockReturnValueOnce({
      valid: false,
      errors: ['File type not supported'],
    });

    const testFile = new File(['test content'], 'invalid.txt', { type: 'text/plain' });
    mockFormData.append('client-id-456', testFile);

    await POST(mockRequest as NextRequest);

    // Verify writeFile was NOT called
    const writeFileMock = jest.mocked(fsPromises.writeFile);
    expect(writeFileMock).not.toHaveBeenCalled();

    // Verify response
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          expect.objectContaining({
            success: false,
            originalName: 'client-id-456',
            error: expect.stringContaining('File type not supported'),
          }),
        ],
        overallSuccess: false,
      })
    );

    // Verify OCR was NOT called for invalid files
    expect(processDocumentWithRetry).not.toHaveBeenCalled();
  });

  it('should handle mixed valid and invalid files', async () => {
    // Add a valid and an invalid file
    const validFile = new File(['valid content'], 'valid.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['invalid content'], 'invalid.txt', { type: 'text/plain' });

    mockFormData.append('valid-id', validFile);
    mockFormData.append('invalid-id', invalidFile);

    // Mock validator to validate based on file type
    jest.mocked(validateFile).mockImplementation((file) => {
      if (file.type === 'application/pdf') {
        return { valid: true, errors: [] };
      }
      return { valid: false, errors: ['Invalid file type'] };
    });

    await POST(mockRequest as NextRequest);

    // Should have only tried to write the valid file
    const writeFileMock = jest.mocked(fsPromises.writeFile);
    expect(writeFileMock).toHaveBeenCalledTimes(1);

    // Verify response contains both files with correct statuses
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        files: expect.arrayContaining([
          expect.objectContaining({
            success: true,
            originalName: 'valid-id',
          }),
          expect.objectContaining({
            success: false,
            originalName: 'invalid-id',
          }),
        ]),
        overallSuccess: false,
      })
    );

    // Verify OCR was called only for the valid file
    expect(processDocumentWithRetry).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when saving files', async () => {
    // Mock writeFile to fail
    const writeFileMock = jest.mocked(fsPromises.writeFile);
    writeFileMock.mockRejectedValueOnce(new Error('Disk full'));

    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    mockFormData.append('client-id', testFile);

    await POST(mockRequest as NextRequest);

    // Verify response
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          expect.objectContaining({
            success: false,
            originalName: 'client-id',
            error: expect.stringMatching(/Failed to save file/),
          }),
        ],
        overallSuccess: false,
      })
    );

    // OCR should not be called if file save fails
    expect(processDocumentWithRetry).not.toHaveBeenCalled();
  });
});
