import type { UploadBatchResponse } from '@/types/file-upload';

// Type for progress callback function
type ProgressCallback = (clientId: string, progress: number) => void;

/**
 * Uploads files to the server
 * @param files Object containing files to upload with their clientIds as keys
 * @param onProgress Optional callback for progress updates
 * @returns Promise with upload response
 */
export async function uploadFiles(
  files: Record<string, File>,
  onProgress?: ProgressCallback
): Promise<UploadBatchResponse> {
  try {
    // If no files to upload, return early
    if (Object.keys(files).length === 0) {
      return {
        files: [],
        overallSuccess: false,
      };
    }

    // Create FormData for uploading
    const formData = new FormData();

    // Add each file to the FormData
    // Use the clientId as the key for each file, so we can identify it later
    for (const [clientId, file] of Object.entries(files)) {
      formData.append(clientId, file);
    }

    // Upload the files
    const response = await fetch('/api/test-upload', {
      method: 'POST',
      body: formData,
      // Use custom XMLHttpRequest to track upload progress
      ...(onProgress && {
        uploadProgress: (progress: number, clientId: string) => {
          if (onProgress) {
            onProgress(clientId, progress);
          }
        },
      }),
    });

    // If fetch is used and doesn't support progress, simulate progress
    if (!('uploadProgress' in window.fetch) && onProgress) {
      // Simulate progress for each file
      for (const clientId of Object.keys(files)) {
        // Simulate 50% progress after a short delay
        setTimeout(() => {
          onProgress(clientId, 30);
        }, 500);

        // Simulate 100% progress after a longer delay
        setTimeout(() => {
          onProgress(clientId, 100);
        }, 1000);
      }
    }

    // Handle error response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload files');
    }

    // Parse and return the response data
    const data: UploadBatchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading files:', error);

    // Create an error response for each file
    const errorResponse: UploadBatchResponse = {
      files: Object.keys(files).map((clientId) => ({
        success: false,
        originalName: clientId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      })),
      overallSuccess: false,
    };

    return errorResponse;
  }
}
