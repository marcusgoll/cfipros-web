export interface UploadableFile {
  clientId: string; // Unique client-side ID (e.g., generated with uuid)
  file: File;
  status: 'pending' | 'uploading' | 'uploaded_queued' | 'error_upload'; // 'uploaded_queued' means backend received it and it's awaiting processing
  progress: number; // 0-100 for upload progress to backend
  errorMessage?: string; // For upload-specific errors (e.g., network, validation)
}

export interface UploadResponse {
  success: boolean;
  fileId?: string; // Temporary ID for the file on backend
  originalName: string;
  message?: string;
  error?: string;
}

export interface UploadBatchResponse {
  files: UploadResponse[];
  overallSuccess: boolean;
}
