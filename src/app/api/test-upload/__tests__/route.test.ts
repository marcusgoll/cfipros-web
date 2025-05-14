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

// Correctly mock @supabase/ssr and its createServerClient function
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabase),
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

let originalArrayBuffer: typeof File.prototype.arrayBuffer;

describe('Test Upload API Route', () => {
  let mockFormData: FormData;
  let mockRequest: Partial<NextRequest>;
  const originalEnv = process.env; // Store original env

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv }; // Restore and make a copy
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    originalArrayBuffer = File.prototype.arrayBuffer;

    mockAuthGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { name: 'Test User' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User,
      },
      error: null,
    });

    mockFormData = new FormData();

    mockRequest = {
      headers: new Headers(),
      method: 'POST',
      url: 'http://localhost/api/test-upload',
      json: jest.fn(),
      formData: jest.fn<() => Promise<FormData>>().mockResolvedValue(mockFormData),
      text: jest.fn(),
      blob: jest.fn(),
      arrayBuffer: jest.fn(),
    } as Partial<NextRequest>;

    File.prototype.arrayBuffer = jest
      .fn<() => Promise<ArrayBuffer>>()
      .mockResolvedValue(new ArrayBuffer(10));

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    File.prototype.arrayBuffer = originalArrayBuffer;
    process.env = originalEnv; // Fully restore original env
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await POST(mockRequest as NextRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Authentication required' },
      { status: 401 }
    );
  });

  it('should handle valid file uploads and trigger OCR processing', async () => {
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    mockFormData.append('client-id-123', testFile);

    await POST(mockRequest as NextRequest);

    const mkdirMock = jest.mocked(fsPromises.mkdir);
    expect(mkdirMock).toHaveBeenCalled();

    const writeFileMock = jest.mocked(fsPromises.writeFile);
    expect(writeFileMock).toHaveBeenCalled();

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

    expect(processDocumentWithRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'test-file-uuid',
        fileType: 'application/pdf',
      })
    );
  });

  it('should handle invalid files', async () => {
    jest.mocked(validateFile).mockReturnValueOnce({
      valid: false,
      errors: ['File type not supported'],
    });

    const testFile = new File(['test content'], 'invalid.txt', { type: 'text/plain' });
    mockFormData.append('client-id-456', testFile);

    await POST(mockRequest as NextRequest);

    const writeFileMock = jest.mocked(fsPromises.writeFile);
    expect(writeFileMock).not.toHaveBeenCalled();

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

    expect(processDocumentWithRetry).not.toHaveBeenCalled();
  });

  it('should handle mixed valid and invalid files', async () => {
    const validFile = new File(['valid content'], 'valid.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['invalid content'], 'invalid.txt', { type: 'text/plain' });

    mockFormData.append('valid-id', validFile);
    mockFormData.append('invalid-id', invalidFile);

    jest.mocked(validateFile).mockImplementation((file) => {
      if (file.type === 'application/pdf') {
        return { valid: true, errors: [] };
      }
      return { valid: false, errors: ['Invalid file type'] };
    });

    await POST(mockRequest as NextRequest);

    const writeFileMock = jest.mocked(fsPromises.writeFile);
    expect(writeFileMock).toHaveBeenCalledTimes(1);

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

    expect(processDocumentWithRetry).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when saving files', async () => {
    const writeFileMock = jest.mocked(fsPromises.writeFile);
    writeFileMock.mockRejectedValueOnce(new Error('Disk full'));

    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    mockFormData.append('client-id', testFile);

    await POST(mockRequest as NextRequest);

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

    expect(processDocumentWithRetry).not.toHaveBeenCalled();
  });
});
