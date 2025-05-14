import { z } from 'zod';

// Constants for validation
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

// Validate a single file (for client-side checks)
export const fileValidator = z.object({
  size: z.number().max(MAX_FILE_SIZE, {
    message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  }),
  type: z.string().refine((type) => ACCEPTED_FILE_TYPES.includes(type), {
    message: `File type must be one of: ${ACCEPTED_FILE_TYPES.map((t) => t.split('/')[1]).join(', ')}`,
  }),
});

// Type for file validation
export type FileValidationResult = {
  valid: boolean;
  errors: string[];
};

// Helper function to validate file (usable on client)
export const validateFile = (file: File): FileValidationResult => {
  const result = fileValidator.safeParse({ size: file.size, type: file.type });

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((err) => err.message),
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

// For API routes validating FormData with files (server-side)
export const testUploadApiSchema = z.object({
  files: z
    .array(
      z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string().refine((type) => ACCEPTED_FILE_TYPES.includes(type), {
          message: `File type must be one of: ${ACCEPTED_FILE_TYPES.map((t) => t.split('/')[1]).join(', ')}`,
        }),
        size: z.number().max(MAX_FILE_SIZE, {
          message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        }),
        buffer: z.instanceof(Buffer).optional(),
        path: z.string().optional(),
      })
    )
    .nonempty({ message: 'At least one file must be uploaded' }),
});
