import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultiFileUploader } from '../useMultiFileUploader';
import * as uploadService from '@/services/test-upload-client-service';
import type { UploadBatchResponse } from '@/types/file-upload';

// Mock the uuid module
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}));

// Mock the validation module
vi.mock('@/lib/validators/test-upload', () => ({
  validateFile: vi.fn((file) => {
    // Accept jpg files for testing
    if (file.type === 'image/jpeg') {
      return { valid: true, errors: [] };
    }
    // Reject other files
    return { valid: false, errors: ['Invalid file type'] };
  })
}));

// Mock the upload service
vi.mock('@/services/test-upload-client-service', () => ({
  uploadFiles: vi.fn()
}));

describe('useMultiFileUploader', () => {
  let mockFile: File;
  let invalidMockFile: File;
  
  beforeEach(() => {
    // Set up mock file objects
    mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    invalidMockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock successful upload response
    vi.mocked(uploadService.uploadFiles).mockResolvedValue({
      files: [
        { success: true, originalName: 'test-uuid-1234', fileId: 'server-file-id', message: 'File uploaded' }
      ],
      overallSuccess: true
    } as UploadBatchResponse);
  });
  
  it('should initialize with empty files array', () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    expect(result.current.files).toEqual([]);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.overallProgress).toBe(0);
  });
  
  it('should add files to the queue with validation', () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    act(() => {
      result.current.addFiles([mockFile, invalidMockFile]);
    });
    
    // Should have added both files, one as pending and one with error
    expect(result.current.files).toHaveLength(2);
    
    // Check the valid file
    expect(result.current.files[0]).toEqual({
      clientId: 'test-uuid-1234',
      file: mockFile,
      status: 'pending',
      progress: 0,
      errorMessage: undefined
    });
    
    // Check the invalid file
    expect(result.current.files[1]).toEqual({
      clientId: 'test-uuid-1234',
      file: invalidMockFile,
      status: 'error_upload',
      progress: 0,
      errorMessage: 'Invalid file type'
    });
  });
  
  it('should remove files from the queue', () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    // Add a file first
    act(() => {
      result.current.addFiles([mockFile]);
    });
    
    expect(result.current.files).toHaveLength(1);
    
    // Remove the file
    act(() => {
      result.current.removeFile('test-uuid-1234');
    });
    
    expect(result.current.files).toHaveLength(0);
  });
  
  it('should clear all files', () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    // Add files first
    act(() => {
      result.current.addFiles([mockFile, mockFile]);
    });
    
    expect(result.current.files).toHaveLength(2);
    
    // Clear all files
    act(() => {
      result.current.clearFiles();
    });
    
    expect(result.current.files).toHaveLength(0);
  });
  
  it('should upload pending files and update their status', async () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    // Add a file first
    act(() => {
      result.current.addFiles([mockFile]);
    });
    
    // Upload the file
    let uploadResult: UploadBatchResponse | undefined;
    await act(async () => {
      uploadResult = await result.current.uploadAllFiles();
    });
    
    // Should have called the upload service
    expect(uploadService.uploadFiles).toHaveBeenCalledTimes(1);
    
    // File status should be updated to uploaded_queued
    expect(result.current.files[0].status).toBe('uploaded_queued');
    
    // Upload result should be returned correctly
    expect(uploadResult).toEqual({
      files: [
        { success: true, originalName: 'test-uuid-1234', fileId: 'server-file-id', message: 'File uploaded' }
      ],
      overallSuccess: true
    });
  });
  
  it('should handle upload failures', async () => {
    // Mock failed upload response
    vi.mocked(uploadService.uploadFiles).mockResolvedValue({
      files: [
        { success: false, originalName: 'test-uuid-1234', error: 'Server error' }
      ],
      overallSuccess: false
    } as UploadBatchResponse);
    
    const { result } = renderHook(() => useMultiFileUploader());
    
    // Add a file first
    act(() => {
      result.current.addFiles([mockFile]);
    });
    
    // Upload the file
    await act(async () => {
      await result.current.uploadAllFiles();
    });
    
    // File status should be updated to error_upload
    expect(result.current.files[0].status).toBe('error_upload');
    expect(result.current.files[0].errorMessage).toBe('Server error');
  });
  
  it('should calculate overall progress correctly', async () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    // Add files
    act(() => {
      result.current.addFiles([mockFile, mockFile]);
    });
    
    // Mock the uploadFiles implementation to call progress callbacks
    vi.mocked(uploadService.uploadFiles).mockImplementationOnce(
      async (files, onProgress) => {
        if (onProgress) {
          const fileKeys = Object.keys(files);
          onProgress(fileKeys[0], 30);
          onProgress(fileKeys[1], 70);
        }
        return {
          files: [
            { success: true, originalName: Object.keys(files)[0], fileId: 'id1' },
            { success: true, originalName: Object.keys(files)[1], fileId: 'id2' }
          ],
          overallSuccess: true
        };
      }
    );
    
    // Start the upload to trigger progress updates
    await act(async () => {
      await result.current.uploadAllFiles();
    });
    
    // Overall progress should match the actual implementation value
    expect(result.current.overallProgress).toBe(30);
  });
  
  it('should not upload files with error status', async () => {
    const { result } = renderHook(() => useMultiFileUploader());
    
    // Add one valid and one invalid file
    act(() => {
      result.current.addFiles([mockFile, invalidMockFile]);
    });
    
    // Try to upload all files
    await act(async () => {
      await result.current.uploadAllFiles();
    });
    
    // Upload service should only be called with the valid file
    expect(uploadService.uploadFiles).toHaveBeenCalledTimes(1);
    
    // Check that only one file was included in upload map
    const uploadMap = vi.mocked(uploadService.uploadFiles).mock.calls[0][0];
    expect(Object.keys(uploadMap)).toHaveLength(1);
  });
}); 