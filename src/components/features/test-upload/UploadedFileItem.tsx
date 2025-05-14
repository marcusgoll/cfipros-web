'use client';

import { useState } from 'react';
import { File, X, AlertCircle, CheckCircle2, Loader2, Image, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { UploadableFile } from '@/types/file-upload';

// Format file size for display (e.g., 2.5MB)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

// Get icon based on file type
function getFileIcon(fileType: string) {
  if (fileType.includes('image')) {
    return <Image className="h-5 w-5" aria-label="Image file" />;
  }
  if (fileType.includes('pdf')) {
    return <FileText className="h-5 w-5" aria-label="PDF file" />;
  }
  return <File className="h-5 w-5" aria-label="Document file" />;
}

interface UploadedFileItemProps {
  file: UploadableFile;
  onRemove: (clientId: string) => void;
  disabled?: boolean;
}

export function UploadedFileItem({ file, onRemove, disabled = false }: UploadedFileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle remove button click
  const handleRemove = () => {
    if (disabled) return;

    setIsDeleting(true);

    // Short timeout to show deleting state
    setTimeout(() => {
      onRemove(file.clientId);
    }, 300);
  };

  // Status indicator based on file status
  const renderStatusIndicator = () => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'uploaded_queued':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'error_upload':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  // Status text based on file status
  const getStatusText = () => {
    switch (file.status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return `Uploading (${file.progress}%)`;
      case 'uploaded_queued':
        return 'Uploaded - Queued for processing';
      case 'error_upload':
        return file.errorMessage || 'Error uploading file';
      default:
        return '';
    }
  };

  // Determine status text color
  const getStatusTextClass = () => {
    switch (file.status) {
      case 'uploaded_queued':
        return 'text-success';
      case 'error_upload':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`border ${file.status === 'error_upload' ? 'border-destructive/30' : ''}`}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4 overflow-hidden">
          <div className="flex-shrink-0">{getFileIcon(file.file.type)}</div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="truncate font-medium text-sm">{file.file.name}</p>
              <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                {formatFileSize(file.file.size)}
              </span>
            </div>

            {file.status === 'uploading' && <Progress value={file.progress} className="h-1 mb-1" />}

            <p className={`text-xs ${getStatusTextClass()}`}>{getStatusText()}</p>
          </div>
        </div>

        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
          {renderStatusIndicator()}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={disabled || file.status === 'uploading' || isDeleting}
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
