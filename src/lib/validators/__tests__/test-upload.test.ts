import { describe, test, expect } from 'vitest';
import { validateFile, fileValidator, MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from '../test-upload';

// Mock File for testing
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

describe('Test Upload Validators', () => {
  describe('fileValidator', () => {
    test('should validate valid files', () => {
      // Test each accepted file type
      for (const type of ACCEPTED_FILE_TYPES) {
        const result = fileValidator.safeParse({
          size: 1024, // 1KB
          type
        });
        expect(result.success).toBe(true);
      }

      // Test max file size
      const result = fileValidator.safeParse({
        size: MAX_FILE_SIZE,
        type: 'application/pdf'
      });
      expect(result.success).toBe(true);
    });

    test('should reject files that are too large', () => {
      const result = fileValidator.safeParse({
        size: MAX_FILE_SIZE + 1,
        type: 'application/pdf'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('File size must be less than');
      }
    });

    test('should reject files with invalid types', () => {
      const invalidTypes = [
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'audio/mpeg'
      ];

      for (const type of invalidTypes) {
        const result = fileValidator.safeParse({
          size: 1024, // 1KB
          type
        });
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain('File type must be one of');
        }
      }
    });
  });

  describe('validateFile', () => {
    test('should validate valid files', () => {
      // Test each accepted file type
      for (const type of ACCEPTED_FILE_TYPES) {
        const mockFile = { size: 1024, type } as File;
        const result = validateFile(mockFile);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    test('should reject files that are too large', () => {
      const mockFile = { size: MAX_FILE_SIZE + 1, type: 'application/pdf' } as File;
      const result = validateFile(mockFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('File size must be less than');
    });

    test('should reject files with invalid types', () => {
      const mockFile = { size: 1024, type: 'text/plain' } as File;
      const result = validateFile(mockFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('File type must be one of');
    });

    test('should handle multiple validation errors', () => {
      const mockFile = { size: MAX_FILE_SIZE + 1, type: 'text/plain' } as File;
      const result = validateFile(mockFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
}); 