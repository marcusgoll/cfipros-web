import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestUploadArea } from '../TestUploadArea';

// Setup mocked modules
const mockReactDropzone = vi.hoisted(() => ({
  useDropzone: vi.fn()
}));

vi.mock('react-dropzone', () => mockReactDropzone);

vi.mock('@/lib/validators/test-upload', () => ({
  validateFile: vi.fn().mockImplementation((file) => {
    return { valid: file.type === 'image/jpeg', errors: [] };
  }),
  ACCEPTED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILE_SIZE: 10 * 1024 * 1024,
}));

describe('TestUploadArea Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockReactDropzone.useDropzone.mockImplementation(({ onDrop, disabled }) => ({
      getRootProps: () => ({
        onClick: !disabled ? vi.fn() : undefined,
        onDrop: !disabled ? onDrop : undefined,
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      isDragReject: false,
    }));
  });

  it('renders correctly with default props', () => {
    const mockOnFilesSelected = vi.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);
    
    // Check for primary UI elements
    expect(screen.getByText(/Drag & drop files here or click to browse/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted file types: PDF, JPG, PNG/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument();
  });
  
  it('shows disabled state when disabled prop is true', () => {
    const mockOnFilesSelected = vi.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} disabled={true} />);
    
    // Button should be disabled
    expect(screen.getByRole('button', { name: /select files/i })).toBeDisabled();
  });
  
  it('calls onFilesSelected callback with valid files only', () => {
    let onDropCallback: (files: File[]) => void = () => {};
    
    // Capture the onDrop callback for testing
    mockReactDropzone.useDropzone.mockImplementation(({ onDrop }) => {
      onDropCallback = onDrop;
      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        isDragActive: false,
        isDragReject: false,
      };
    });
    
    const mockOnFilesSelected = vi.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);
    
    // Create mock files
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Simulate dropping files by calling onDrop directly
    onDropCallback([validFile]);
    
    // Check if onFilesSelected was called with the valid file
    expect(mockOnFilesSelected).toHaveBeenCalledWith(expect.arrayContaining([validFile]));
  });
  
  it('displays drop state when drag is active', () => {
    // Mock drag active state
    mockReactDropzone.useDropzone.mockImplementation(() => ({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: true,
      isDragReject: false,
    }));
    
    const mockOnFilesSelected = vi.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);
    
    // Should show drop state message
    expect(screen.getByText(/Drop your files here/i)).toBeInTheDocument();
  });
  
  it('displays error state when drag is rejected', () => {
    // Mock drag reject state
    mockReactDropzone.useDropzone.mockImplementation(() => ({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
      isDragReject: true,
    }));
    
    const mockOnFilesSelected = vi.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);
    
    // Should show error message
    expect(screen.getByText(/Some files are not valid/i)).toBeInTheDocument();
  });
}); 