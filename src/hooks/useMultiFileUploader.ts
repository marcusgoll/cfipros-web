import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { validateFile } from '@/lib/validators/test-upload';
import type { UploadableFile, UploadBatchResponse } from '@/types/file-upload';
import { uploadFiles } from '@/services/test-upload-client-service';

interface UseMultiFileUploaderReturn {
  files: UploadableFile[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (clientId: string) => void;
  clearFiles: () => void;
  uploadAllFiles: () => Promise<UploadBatchResponse>;
  isUploading: boolean;
  overallProgress: number;
}

export const useMultiFileUploader = (): UseMultiFileUploaderReturn => {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Add files to the queue
  const addFiles = useCallback((newFiles: File[]) => {
    const validatedFiles = newFiles.map((file) => {
      const validation = validateFile(file);
      return {
        clientId: uuidv4(),
        file,
        status: validation.valid ? 'pending' : 'error_upload',
        progress: 0,
        errorMessage: validation.valid ? undefined : validation.errors.join(', '),
      } as UploadableFile;
    });

    setFiles((currentFiles) => [...currentFiles, ...validatedFiles]);
  }, []);

  // Remove a file from the queue
  const removeFile = useCallback((clientId: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.clientId !== clientId));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // Calculate overall progress
  const overallProgress = files.length
    ? Math.round(files.reduce((sum, file) => sum + file.progress, 0) / files.length)
    : 0;

  // Update progress for a specific file
  const updateFileProgress = useCallback((clientId: string, progress: number) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.clientId === clientId ? { ...file, progress } : file))
    );
  }, []);

  // Update file status
  const updateFileStatus = useCallback(
    (clientId: string, status: UploadableFile['status'], errorMessage?: string) => {
      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.clientId === clientId ? { ...file, status, errorMessage } : file
        )
      );
    },
    []
  );

  // Upload all pending files
  const uploadAllFiles = useCallback(async () => {
    const filesToUpload = files.filter((file) => file.status === 'pending');

    if (filesToUpload.length === 0) {
      return { files: [], overallSuccess: false };
    }

    setIsUploading(true);

    // Mark all files as uploading
    for (const file of filesToUpload) {
      updateFileStatus(file.clientId, 'uploading');
    }

    try {
      // Map files to a format suitable for upload service
      const uploadFilesMap = filesToUpload.reduce<Record<string, File>>((acc, fileItem) => {
        acc[fileItem.clientId] = fileItem.file;
        return acc;
      }, {});

      // Set up progress callback
      const onProgress = (clientId: string, progress: number) => {
        updateFileProgress(clientId, progress);
      };

      // Upload files
      const response = await uploadFiles(uploadFilesMap, onProgress);

      // Update file statuses based on response
      for (const fileResult of response.files) {
        const clientId = fileResult.originalName; // Using originalName as clientId based on how we structured the request
        if (fileResult.success) {
          updateFileStatus(clientId, 'uploaded_queued');
        } else {
          updateFileStatus(clientId, 'error_upload', fileResult.error);
        }
      }

      return response;
    } catch (error) {
      // Handle global upload error
      for (const file of filesToUpload) {
        updateFileStatus(
          file.clientId,
          'error_upload',
          error instanceof Error ? error.message : 'Unknown upload error'
        );
      }

      return {
        files: filesToUpload.map((file) => ({
          success: false,
          originalName: file.clientId,
          error: error instanceof Error ? error.message : 'Unknown upload error',
        })),
        overallSuccess: false,
      };
    } finally {
      setIsUploading(false);
    }
  }, [files, updateFileProgress, updateFileStatus]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    uploadAllFiles,
    isUploading,
    overallProgress,
  };
};

export default useMultiFileUploader;
