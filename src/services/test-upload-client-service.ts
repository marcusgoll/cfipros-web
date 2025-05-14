import type { UploadBatchResponse } from '@/types/file-upload';

// Type for progress callback function
type ProgressCallback = (clientId: string, progress: number) => void;

/**
 * Uploads multiple files to the test upload API endpoint
 * 
 * @param files - Record of clientId to File
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to UploadBatchResponse
 */
export const uploadFiles = async (
  files: Record<string, File>,
  onProgress?: ProgressCallback
): Promise<UploadBatchResponse> => {
  const formData = new FormData();
  
  // Add each file to the FormData
  // Using the clientId as the field name to identify files
  for (const [clientId, file] of Object.entries(files)) {
    formData.append(clientId, file);
  }
  
  try {
    // If no progress reporting needed, use regular fetch
    if (!onProgress) {
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }
      
      return await response.json();
    }
    
    // For progress reporting, use XMLHttpRequest
    return await new Promise<UploadBatchResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Listen for progress event on upload
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          // Since we can't track individual file progress with XHR,
          // we report the same progress for all files
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          
          for (const clientId of Object.keys(files)) {
            onProgress(clientId, percentComplete);
          }
        }
      });
      
      // Set up completion handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(xhr.statusText || 'Upload failed'));
        }
      });
      
      // Set up error handler
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      // Set up abort handler
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });
      
      // Open and send the request
      xhr.open('POST', '/api/test-upload');
      xhr.send(formData);
    });
  } catch (error) {
    // Convert all errors to UploadBatchResponse with failure status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      files: Object.keys(files).map(clientId => ({
        success: false,
        originalName: clientId,
        error: errorMessage
      })),
      overallSuccess: false
    };
  }
}; 