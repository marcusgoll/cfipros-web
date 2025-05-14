import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UploadedFileItem } from '../UploadedFileItem';
import { UploadableFile } from '@/types/file-upload';

// Mock timers for testing setTimeout
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('UploadedFileItem Component', () => {
  // Create a test file for each status
  const createMockFile = (status: UploadableFile['status'], errorMessage?: string): UploadableFile => ({
    clientId: 'test-id-123',
    file: new File(['test'], 'test-document.pdf', { type: 'application/pdf' }),
    status,
    progress: status === 'uploading' ? 45 : 0,
    errorMessage
  });
  
  it('renders a pending file correctly', () => {
    const mockFile = createMockFile('pending');
    const onRemove = vi.fn();
    
    render(<UploadedFileItem file={mockFile} onRemove={onRemove} />);
    
    // Check file name is displayed
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    
    // Check status text
    expect(screen.getByText('Pending')).toBeInTheDocument();
    
    // Remove button should be present and enabled
    const removeButton = screen.getByRole('button');
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).not.toBeDisabled();
  });
  
  it('renders an uploading file with progress bar', () => {
    const mockFile = createMockFile('uploading');
    const onRemove = vi.fn();
    
    render(<UploadedFileItem file={mockFile} onRemove={onRemove} />);
    
    // Check status text shows progress
    expect(screen.getByText('Uploading (45%)')).toBeInTheDocument();
    
    // Progress bar should be visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Remove button should be disabled during upload
    const removeButton = screen.getByRole('button');
    expect(removeButton).toBeDisabled();
  });
  
  it('renders an uploaded and queued file correctly', () => {
    const mockFile = createMockFile('uploaded_queued');
    const onRemove = vi.fn();
    
    render(<UploadedFileItem file={mockFile} onRemove={onRemove} />);
    
    // Check status text
    expect(screen.getByText('Uploaded - Queued for processing')).toBeInTheDocument();
    
    // Success icon should be visible (by role we can't easily check, but we can check class)
    // If we have a specific test-id we could check that too
    const successStatus = screen.getByText('Uploaded - Queued for processing');
    expect(successStatus.className).toContain('text-success');
  });
  
  it('renders an error file with error message', () => {
    const errorMessage = 'File type not supported';
    const mockFile = createMockFile('error_upload', errorMessage);
    const onRemove = vi.fn();
    
    render(<UploadedFileItem file={mockFile} onRemove={onRemove} />);
    
    // Check error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Error text should have error styling
    const errorText = screen.getByText(errorMessage);
    expect(errorText.className).toContain('text-destructive');
  });
  
  it('calls onRemove when remove button is clicked', () => {
    const mockFile = createMockFile('pending');
    const onRemove = vi.fn();
    
    render(<UploadedFileItem file={mockFile} onRemove={onRemove} />);
    
    // Click the remove button
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    // Advance timers to trigger the callback after the setTimeout
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Check if onRemove was called with the correct client ID
    expect(onRemove).toHaveBeenCalledWith(mockFile.clientId);
  });
  
  it('disables remove button when component is disabled', () => {
    const mockFile = createMockFile('pending');
    const onRemove = vi.fn();
    
    render(<UploadedFileItem file={mockFile} onRemove={onRemove} disabled={true} />);
    
    // Remove button should be disabled
    const removeButton = screen.getByRole('button');
    expect(removeButton).toBeDisabled();
    
    // Click the remove button (should not trigger onRemove)
    fireEvent.click(removeButton);
    expect(onRemove).not.toHaveBeenCalled();
  });
}); 