'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileWarning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateFile, MAX_FILE_SIZE } from '@/lib/validators/test-upload';

interface TestUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function TestUploadArea({ onFilesSelected, disabled = false }: TestUploadAreaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Validate files
      const validatedFiles = acceptedFiles.filter(file => {
        const validation = validateFile(file);
        return validation.valid;
      });
      
      if (validatedFiles.length > 0) {
        onFilesSelected(validatedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  return (
    <Card className="border-dashed">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={`
            flex flex-col items-center justify-center p-8 text-center rounded-md cursor-pointer
            ${isDragActive ? 'bg-primary/10' : 'bg-muted/50'} 
            ${isDragReject ? 'border-red-500' : 'border-muted-foreground/20'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            transition-colors
          `}
        >
          <input {...getInputProps()} />
          
          {isDragActive ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Upload className="h-10 w-10 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Drop your files here...</p>
            </div>
          ) : isDragReject ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <FileWarning className="h-10 w-10 text-destructive" />
              <p className="text-sm text-destructive">Some files are not valid</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <Upload className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Accepted file types: PDF, JPG, PNG (Max {MAX_FILE_SIZE / 1024 / 1024}MB each)
                </p>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm"
                disabled={disabled}
              >
                Select Files
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 