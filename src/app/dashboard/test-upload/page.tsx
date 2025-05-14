'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertCircle, Trash2 } from 'lucide-react';
import { TestUploadArea } from '@/components/features/test-upload/TestUploadArea';
import { UploadedFileItem } from '@/components/features/test-upload/UploadedFileItem';
import { useMultiFileUploader } from '@/hooks/useMultiFileUploader';

export default function TestUploadPage() {
  const [uploadComplete, setUploadComplete] = useState(false);

  const { files, addFiles, removeFile, clearFiles, uploadAllFiles, isUploading, overallProgress } =
    useMultiFileUploader();

  // Handle file selection from TestUploadArea
  const handleFilesSelected = (newFiles: File[]) => {
    addFiles(newFiles);

    // Reset upload complete state when new files are added
    if (uploadComplete) {
      setUploadComplete(false);
    }
  };

  // Handle the upload process
  const handleUpload = async () => {
    const pendingFiles = files.filter((file) => file.status === 'pending');

    if (pendingFiles.length === 0) {
      toast.error('No files to upload. Please add files to upload.');
      return;
    }

    try {
      const result = await uploadAllFiles();

      if (result.overallSuccess) {
        toast.success('All files have been uploaded and queued for processing.');
        setUploadComplete(true);
      } else {
        // Some files failed
        const failedCount = result.files.filter((file) => !file.success).length;

        toast.error(`${failedCount} files failed to upload. Please check the list for details.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  // Clear all files
  const handleClearAll = () => {
    clearFiles();
    setUploadComplete(false);
  };

  // Count files by status
  const pendingFiles = files.filter((file) => file.status === 'pending');
  const errorFiles = files.filter((file) => file.status === 'error_upload');
  const successFiles = files.filter((file) => file.status === 'uploaded_queued');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Upload FAA Knowledge Test Results</h1>
        <p className="text-muted-foreground">
          Upload your FAA Knowledge Test results for processing. Accepted file types: PDF, JPG, PNG
          (Max 10MB per file).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload area and controls */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Select one or more FAA Knowledge Test result documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestUploadArea onFilesSelected={handleFilesSelected} disabled={isUploading} />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {files.length > 0 && (
                <>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      className="w-full"
                      onClick={handleUpload}
                      disabled={isUploading || pendingFiles.length === 0}
                    >
                      {isUploading ? 'Uploading...' : 'Upload All Files'}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleClearAll}
                      disabled={isUploading || files.length === 0}
                      title="Clear all files"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Clear all</span>
                    </Button>
                  </div>
                </>
              )}

              {/* File statistics */}
              {files.length > 0 && (
                <div className="w-full pt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{files.length}</span> files
                  </div>

                  {pendingFiles.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">{pendingFiles.length}</span> pending
                    </div>
                  )}

                  {errorFiles.length > 0 && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">{errorFiles.length}</span> errors
                    </div>
                  )}

                  {successFiles.length > 0 && (
                    <div className="flex items-center gap-1 text-success">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">{successFiles.length}</span> uploaded
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Info when upload is complete */}
          {uploadComplete && successFiles.length > 0 && (
            <Alert variant="default" className="bg-success/20 border-success">
              <Upload className="h-4 w-4 text-success" />
              <AlertTitle>Upload Complete</AlertTitle>
              <AlertDescription>
                Your files have been uploaded and are now queued for processing. You will be
                notified when processing is complete.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* File list */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Selected Files</CardTitle>
              <CardDescription>
                {files.length === 0
                  ? 'No files selected'
                  : `${files.length} file${files.length !== 1 ? 's' : ''} selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No files selected for upload.</p>
                  <p className="text-sm">Use the upload area to select files.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto p-1">
                  {files.map((file) => (
                    <UploadedFileItem
                      key={file.clientId}
                      file={file}
                      onRemove={removeFile}
                      disabled={isUploading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
