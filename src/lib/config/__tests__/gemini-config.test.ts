import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { getGeminiApiKey, getGeminiConfig, GEMINI_MODEL_NAME } from '../gemini-config';

describe('Gemini Config', () => {
  // Save original process.env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Mock console.error to prevent actual logs during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('getGeminiApiKey', () => {
    it('should return the API key when it is set in the environment', () => {
      // Arrange
      process.env.GEMINI_API_KEY = 'test-api-key';

      // Act
      const apiKey = getGeminiApiKey();

      // Assert
      expect(apiKey).toBe('test-api-key');
    });

    it('should throw an error when API key is not set', () => {
      // Arrange - set to undefined instead of using delete
      process.env.GEMINI_API_KEY = undefined;

      // Act & Assert
      expect(() => getGeminiApiKey()).toThrow('Gemini API key not configured');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('GEMINI_API_KEY environment variable is not set')
      );
    });
  });

  describe('getGeminiConfig', () => {
    it('should return a configuration object with the API key and default values', () => {
      // Arrange
      process.env.GEMINI_API_KEY = 'test-api-key';

      // Act
      const config = getGeminiConfig();

      // Assert
      expect(config).toEqual({
        apiKey: 'test-api-key',
        modelName: GEMINI_MODEL_NAME,
        maxRetries: 2,
        timeoutMs: 30000,
      });
    });

    it('should throw an error when API key is not set', () => {
      // Arrange - set to undefined instead of using delete
      process.env.GEMINI_API_KEY = undefined;

      // Act & Assert
      expect(() => getGeminiConfig()).toThrow('Gemini API key not configured');
    });
  });

  describe('GEMINI_MODEL_NAME', () => {
    it('should be defined with the vision-capable model', () => {
      expect(GEMINI_MODEL_NAME).toBe('gemini-1.5-flash');
    });
  });
});
