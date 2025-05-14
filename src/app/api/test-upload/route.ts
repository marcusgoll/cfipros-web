import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateFile } from '@/lib/validators/test-upload';
import type { UploadResponse, UploadBatchResponse } from '@/types/file-upload';
import { processDocumentWithRetry } from '@/services/gemini-ocr-service';
import type { GeminiOcrRequest } from '@/types/ocr-types';

// This is where temporary files will be stored
const TEMP_UPLOAD_DIR = join(tmpdir(), 'cfi-knowledge-test-uploads');

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing from environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const cookieStore = await cookies(); // Await here to get the actual store for Route Handler

  // Initialize Supabase client using createServerClient from @supabase/ssr
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Not async, operates on resolved cookieStore
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Not async
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Errors are expected here in Route Handlers if middleware is not setup for writes
          // or if trying to set a cookie in a read-only context without proper response manipulation.
        }
      },
      remove(name: string, options: CookieOptions) {
        // Not async
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // Errors are expected here in Route Handlers if middleware is not setup for writes
          // or if trying to delete a cookie in a read-only context without proper response manipulation.
        }
      },
    },
  });

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Ensure the temp directory exists
    try {
      await mkdir(TEMP_UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
      return NextResponse.json(
        { error: 'Server error: Could not prepare storage' },
        { status: 500 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();

    // Process each file in the form
    const fileResults: UploadResponse[] = [];
    let overallSuccess = true;

    const uploadPromises = Array.from(formData.entries()).map(async ([clientId, value]) => {
      // Each entry should be a file
      if (!(value instanceof File)) {
        const result: UploadResponse = {
          success: false,
          originalName: clientId,
          error: 'Invalid form data: expected file',
        };
        fileResults.push(result);
        overallSuccess = false;
        return;
      }

      const file = value;

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        const result: UploadResponse = {
          success: false,
          originalName: clientId,
          error: validation.errors.join(', '),
        };
        fileResults.push(result);
        overallSuccess = false;
        return;
      }

      try {
        // Generate a unique filename for storage
        const fileId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const tempFilePath = join(TEMP_UPLOAD_DIR, `${fileId}.${fileExtension}`);

        // Convert file to buffer and save it
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(tempFilePath, buffer);

        // Successfully saved file
        fileResults.push({
          success: true,
          fileId,
          originalName: clientId,
          message: 'File uploaded and queued for processing',
        });

        // Begin OCR processing in the background
        // Note: We're deliberately not awaiting this to allow the upload response to return quickly
        // The OCR result will be stored separately
        processOcrInBackground(fileId, tempFilePath, file.type);
      } catch (error) {
        console.error(`Error saving file ${file.name}:`, error);

        fileResults.push({
          success: false,
          originalName: clientId,
          error: 'Server error: Failed to save file',
        });

        overallSuccess = false;
      }
    });

    // Wait for all file upload operations to complete
    await Promise.all(uploadPromises);

    // Return the results of the upload operations
    const response: UploadBatchResponse = {
      files: fileResults,
      overallSuccess,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in test-upload API route:', error);

    return NextResponse.json({ error: 'Server error processing upload' }, { status: 500 });
  }
}

/**
 * Process OCR for an uploaded file in the background
 * This function is deliberately not awaited in the main request handler
 * to allow quick response to the client while OCR happens asynchronously
 */
async function processOcrInBackground(
  fileId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  try {
    console.log(`Starting background OCR processing for file ${fileId}`);

    // Prepare the OCR request
    const ocrRequest: GeminiOcrRequest = {
      fileId,
      filePath,
      fileType,
    };

    // Process the document with retry logic
    const ocrResult = await processDocumentWithRetry(ocrRequest);

    // Log the result
    if (ocrResult.status === 'success') {
      console.log(
        `OCR processing successful for file ${fileId}, extracted ${ocrResult.rawText?.length || 0} characters`
      );
    } else {
      console.error(`OCR processing failed for file ${fileId}: ${ocrResult.ocrErrorMessage}`);
    }

    // Store the OCR result in the database
    // Note: This will be expanded in a future story (currently just a placeholder)
    // For now we're just storing the OCR result in memory and logging it

    // In the future this would update a database record, for example:
    // await supabase
    //   .from('knowledge_test_uploads')
    //   .update({
    //     ocr_status: ocrResult.status,
    //     raw_text: ocrResult.rawText,
    //     ocr_error: ocrResult.ocrErrorMessage,
    //     processed_at: new Date().toISOString()
    //   })
    //   .eq('file_id', fileId);
  } catch (error) {
    console.error(`Unexpected error during background OCR processing for file ${fileId}:`, error);
  }
}
