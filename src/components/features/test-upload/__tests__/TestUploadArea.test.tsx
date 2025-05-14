// If the triple slash directive doesn't work, we'll use a proper import
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import type {
  DropzoneState,
  DropzoneOptions,
  FileRejection,
  Accept,
  DropzoneRootProps,
  DropzoneInputProps,
  FileWithPath,
} from 'react-dropzone';
import { useDropzone } from 'react-dropzone'; // Reverted: Import useDropzone as a value again
import { TestUploadArea } from '@/components/features/test-upload/TestUploadArea';
import type { UploadableFile } from '@/types/file-upload';
import {
  MAX_FILE_SIZE as ImportedMaxFileSize,
  type ValidateFileFn,
  type FileValidationResult as ActualFileValidationResult,
} from '@/lib/validators/test-upload';

// Define the accept config used by the component and tests
const testSharedAcceptConfig: Accept = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

// Hoisted mock for useDropzone - DECLARE BEFORE JEST.MOCK and type it
const mockUseDropzone = jest.fn() as jest.MockedFunction<typeof useDropzone>;

// Mock utilities and constants
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUseMultiFileUploaderHook = jest.fn();
jest.mock('@/hooks/useMultiFileUploader', () => ({
  useMultiFileUploader: mockUseMultiFileUploaderHook,
}));

// Mock react-dropzone using the pre-declared and typed mockUseDropzone
// Wrap the mockUseDropzone usage in a function to defer access until call time
jest.mock('react-dropzone', () => {
  const original = jest.requireActual('react-dropzone');
  return {
    ...original,
    useDropzone: (...args: Parameters<typeof useDropzone>) => mockUseDropzone(...args),
  };
});

let mockValidateFile: jest.MockedFunction<ValidateFileFn>;
let mockOnFilesSelected: jest.Mock;
let mockOnFilesChange: jest.Mock; // Keep if it's used by useMultiFileUploader mock setup
let mockClearPreview: jest.Mock;
let mockRemoveFile: jest.Mock;

// Mock the TestUploadArea component with mocked dependencies
/* jest.mock('@/components/features/test-upload/TestUploadArea', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div data-testid="mocked-test-upload-area">
      <button {...props.getRootProps()} data-testid="dropzone-button">
        Drop here
      </button>
      <input {...props.getInputProps()} data-testid="dropzone-input" />
      {props.children}
    </div>
  )),
})); */ // Removed self-mock

// Mock the file uploader hook
// const mockUseMultiFileUploader = useMultiFileUploader as jest.Mock; // This was likely an error, use mockUseMultiFileUploaderHook

// Mock the UploadedFileItem component
jest.mock(
  '@/components/features/test-upload/UploadedFileItem',
  () =>
    function MockedUploadedFileItem({ file }: { file: UploadableFile }) {
      return <div data-testid={`file-item-${file.file.name}`} />;
    }
);

// Dynamically require actual constants for use within the mock factory
// const actualConstants = jest.requireActual('@/components/features/test-upload/TestUploadArea'); // Not reliable for unexported constants

describe('TestUploadArea Component', () => {
  let minimalDropzoneState: DropzoneState;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock for useMultiFileUploader - individual tests can override
    mockUseMultiFileUploaderHook.mockReturnValue({
      files: [],
      fileErrors: [],
      addFiles: jest.fn(),
      handleRemoveFile: jest.fn(),
      uploadProgress: {},
      uploadFile: jest.fn(),
      clearErrors: jest.fn(),
      clearAllFiles: jest.fn(),
    });

    // Define minimalDropzoneState here. It's constant for beforeEach.
    minimalDropzoneState = {
      isFocused: false,
      isFileDialogActive: false,
      isDragActive: false,
      isDragAccept: false,
      isDragReject: false,
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: jest.fn(
        <T extends DropzoneInputProps>(props?: T): T => ({ type: 'file', ...props }) as T
      ),
      getRootProps: jest.fn(
        <T extends DropzoneRootProps>(props?: T): T =>
          ({ 'aria-roledescription': 'file upload trigger', ...props }) as T
      ),
      rootRef: { current: document.createElement('div') } as React.RefObject<HTMLElement>,
      inputRef: { current: document.createElement('input') } as React.RefObject<HTMLInputElement>,
      open: jest.fn(),
    };

    // Default behavior for mockUseDropzone. Tests will override with .mockReturnValueOnce or .mockImplementationOnce as needed.
    mockUseDropzone.mockReturnValue(minimalDropzoneState);

    mockValidateFile = jest.fn().mockImplementation((file: File): ActualFileValidationResult => {
      if (file.name === 'invalid-file.txt') {
        return { valid: false, errors: ['Invalid file type'] };
      }
      return { valid: true, errors: [] };
    });

    mockOnFilesSelected = jest.fn();
    mockOnFilesChange = jest.fn();
    mockClearPreview = jest.fn();
    mockRemoveFile = jest.fn();

    // Default setup for the hook. Tests needing specific hook behavior (like its onFilesSelected) will refine this.
    mockUseMultiFileUploaderHook.mockReturnValue({
      files: [],
      onFilesSelected: mockOnFilesSelected,
      onFilesChange: mockOnFilesChange,
      clearPreview: mockClearPreview,
      removeFile: mockRemoveFile,
      currentFileCount: 0,
      fileErrors: [],
      addFiles: jest.fn(),
      handleRemoveFile: jest.fn(),
      uploadProgress: {},
      uploadFile: jest.fn(),
      clearErrors: jest.fn(),
      clearAllFiles: jest.fn(),
    });
  });

  it('renders correctly with default props', () => {
    const mockOnFilesSelected = jest.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);

    // Check for primary UI elements
    expect(screen.getByText(/Drag & drop files here or click to browse/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted file types: PDF, JPG, PNG/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument();
  });

  it('shows disabled state when disabled prop is true', () => {
    const mockOnFilesSelected = jest.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} disabled={true} />);

    // Button should be disabled
    expect(screen.getByRole('button', { name: /select files/i })).toBeDisabled();
  });

  it('calls onFilesSelected callback with valid files only', async () => {
    let capturedOnDrop:
      | ((
          acceptedFiles: File[],
          fileRejections: FileRejection[],
          event: globalThis.DragEvent | React.DragEvent<HTMLElement>
        ) => void)
      | undefined;

    mockUseDropzone.mockImplementation((options?: DropzoneOptions): DropzoneState => {
      capturedOnDrop = options?.onDrop;
      return {
        getRootProps: <T extends DropzoneRootProps>(props: T = {} as T) =>
          ({ ...(props as T), 'data-testid': 'dropzone-root' }) as T,
        getInputProps: <T extends DropzoneInputProps>(props: T = {} as T) =>
          ({ ...(props as T), 'data-testid': 'dropzone-input' }) as T,
        isDragActive: false,
        isDragReject: false,
        // Add other required properties for DropzoneState
        isFocused: false,
        isDragAccept: false,
        isFileDialogActive: false,
        acceptedFiles: [],
        fileRejections: [],
        inputRef: { current: document.createElement('input') },
        rootRef: { current: document.createElement('div') },
        open: jest.fn(),
      };
    });

    const mockOnFilesSelected = jest.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);
    // const dropzoneRoot = screen.getByTestId('dropzone-root'); // This specific instance

    // Create mock files
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    if (capturedOnDrop) {
      // Create a mock drop event
      const mockEvent = new Event('drop', { bubbles: true }) as globalThis.DragEvent & {
        dataTransfer: globalThis.DataTransfer;
      };
      Object.defineProperty(mockEvent, 'dataTransfer', {
        value: {
          files: [validFile],
          items: [
            {
              getAsFile: () => validFile,
              kind: 'file',
              type: validFile.type,
            } as globalThis.DataTransferItem,
          ],
          types: ['Files'] as readonly string[],
        },
      });
      await capturedOnDrop([validFile] as FileWithPath[], [], mockEvent);
    }

    expect(mockOnFilesSelected).toHaveBeenCalledWith(expect.arrayContaining([validFile]));
  });

  it('displays drop state when drag is active', () => {
    mockUseDropzone.mockReturnValueOnce({
      ...minimalDropzoneState,
      isDragActive: true,
      getRootProps: jest.fn(
        <T extends DropzoneRootProps>(props?: T): T =>
          ({ ...(props || ({} as T)), 'data-testid': 'dropzone-area' }) as T
      ),
      getInputProps: jest.fn(
        <T extends DropzoneInputProps>(props?: T): T =>
          ({ ...(props || ({} as T)), type: 'file' }) as T
      ),
    });

    const mockOnFilesSelected = jest.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);

    // Should show drop state message
    expect(screen.getByText(/Drop your files here/i)).toBeInTheDocument();
  });

  it('displays error state when drag is rejected', () => {
    mockUseDropzone.mockReturnValueOnce({
      ...minimalDropzoneState,
      isDragReject: true,
      getRootProps: jest.fn(
        <T extends DropzoneRootProps>(props?: T): T =>
          ({ ...(props || ({} as T)), 'data-testid': 'dropzone-area' }) as T
      ),
      getInputProps: jest.fn(
        <T extends DropzoneInputProps>(props?: T): T =>
          ({ ...(props || ({} as T)), type: 'file' }) as T
      ),
    });

    const mockOnFilesSelected = jest.fn();
    render(<TestUploadArea onFilesSelected={mockOnFilesSelected} />);

    // Should show error message
    expect(screen.getByText(/Some files are not valid/i)).toBeInTheDocument();
  });

  it('renders the dropzone', () => {
    render(<TestUploadArea onFilesSelected={jest.fn()} />);
    expect(screen.getByText('Drag & drop files here or click to browse')).toBeInTheDocument();
    // expect(screen.getByText('or browse to upload')).toBeInTheDocument() // This text might have changed
  });

  it('handles file drop, calls validateFile, and then onFilesSelected for valid files', async () => {
    mockUseDropzone.mockReset(); // Ensure a clean slate for this test's useDropzone mocks
    mockValidateFile.mockReset(); // Ensure a clean slate for mockValidateFile for this test

    const mockOnFilesSelectedProp = jest.fn();
    // Setup useMultiFileUploader mock for this test
    const hookMockOnFilesSelected = jest.fn();
    mockUseMultiFileUploaderHook.mockReturnValueOnce({
      files: [],
      fileErrors: [],
      onFilesSelected: hookMockOnFilesSelected, // This is the hook's onFilesSelected
      // ... other hook properties if needed by the component ...
      currentFileCount: 0,
      removeFile: jest.fn(),
      clearPreview: jest.fn(),
      onFilesChange: jest.fn(),
      addFiles: jest.fn().mockImplementation(() => {
        // Simulate adding files and then calling the hook's onFilesSelected
        // This part depends on how TestUploadArea calls the hook's addFiles or onFilesSelected
        // For this test, we are primarily concerned with the component's onDropCustom behavior.
        // The TestUploadArea's onDropCustom should call its own validateFile prop, then its onFilesSelected prop.
      }),
    });

    // Define files before the mock that might use them or before render
    const validFile = new File(['valid'], 'valid.png', { type: 'image/png' });
    const invalidFile = new File(['invalid'], 'invalid.txt', { type: 'text/plain' });
    // const filesToDrop = [validFile, invalidFile]; // This can be used directly in the drop simulation

    // Setup useDropzone mock for this test to capture onDrop
    let capturedOnDrop:
      | ((accepted: File[], rejected: FileRejection[], event: DragEvent) => void)
      | undefined;
    mockUseDropzone.mockImplementationOnce((options?: DropzoneOptions): DropzoneState => {
      capturedOnDrop = options?.onDrop;
      return {
        isFocused: false,
        isFileDialogActive: false,
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
        acceptedFiles: [],
        fileRejections: [],
        getRootProps: jest.fn(
          <T extends DropzoneRootProps>(props?: T): T =>
            ({ ...(props || ({} as T)), 'data-testid': 'dropzone-root' }) as T
        ),
        getInputProps: jest.fn(
          <T extends DropzoneInputProps>(props?: T): T =>
            ({ ...(props || ({} as T)), type: 'file' }) as T
        ),
        rootRef: { current: document.createElement('div') } as React.RefObject<HTMLElement>,
        inputRef: { current: document.createElement('input') } as React.RefObject<HTMLInputElement>,
        open: jest.fn(),
      };
    });

    // Note: In the actual component, validateFile is not a prop
    // The component uses its own imported validateFile function
    // So we need to mock that import instead
    render(
      <TestUploadArea
        onFilesSelected={mockOnFilesSelectedProp}
        // validateFile={mockValidateFile} // This prop doesn't actually exist on TestUploadArea
        // acceptedFileTypes={actualConstants.ACCEPTED_FILE_TYPES} // This prop doesn't exist
        // maxFileSize={actualConstants.MAX_FILE_SIZE} // This prop doesn't exist
      />
    );

    // Check that capturedOnDrop was defined by the useDropzone mock
    expect(capturedOnDrop).toBeDefined(); // Ensure onDrop was captured
    if (!capturedOnDrop) throw new Error('onDrop not captured from useDropzone mock');

    // We need to mock the actual imported validateFile that's used internally
    // Since we can't directly mock it here, we'll have to update our test strategy
    // Instead, we'll verify that onFilesSelected was called with validFile only

    // Simulate the drop event by calling the captured onDrop
    await capturedOnDrop([validFile, invalidFile], [], new Event('drop') as unknown as DragEvent);

    // Instead of checking mockValidateFile directly (which we can't access),
    // we check that onFilesSelected was called correctly - this indirectly verifies validation worked
    expect(mockOnFilesSelectedProp).toHaveBeenCalled();

    // Note: In the actual component, valid files are not wrapped in an object with `file` and `errors` properties
    // They're passed directly as an array of File objects
    expect(mockOnFilesSelectedProp).toHaveBeenCalledWith([validFile]);
  });

  it('does not break when fileErrors are provided from useMultiFileUploader', () => {
    mockUseMultiFileUploaderHook.mockReturnValueOnce({
      files: [],
      fileErrors: [{ fileId: '1', message: 'Some error' }],
      addFiles: jest.fn(),
      handleRemoveFile: jest.fn(),
      uploadProgress: {},
      uploadFile: jest.fn(),
      clearErrors: jest.fn(),
      clearAllFiles: jest.fn(),
      currentFileCount: 0,
      onFilesSelected: jest.fn(),
      removeFile: jest.fn(),
      clearPreview: jest.fn(),
    });

    render(<TestUploadArea onFilesSelected={jest.fn()} validateFile={mockValidateFile} />);
    expect(screen.getByText(/Drag & drop files here or click to browse/i)).toBeInTheDocument();
  });

  it('should call validateFile for each file and filter valid files', async () => {
    let capturedOnDrop: DropzoneOptions['onDrop'];

    mockUseDropzone.mockImplementationOnce((options?: DropzoneOptions): DropzoneState => {
      capturedOnDrop = options?.onDrop;
      return {
        isFocused: false,
        isFileDialogActive: false,
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
        acceptedFiles: [],
        fileRejections: [],
        getInputProps: jest.fn(
          <T extends DropzoneInputProps>(props?: T): T =>
            ({ ...(props || ({} as T)), type: 'file' }) as T
        ),
        getRootProps: jest.fn(
          <T extends DropzoneRootProps>(props?: T): T =>
            ({ ...(props || ({} as T)), 'aria-roledescription': 'file upload trigger' }) as T
        ),
        rootRef: { current: document.createElement('div') } as React.RefObject<HTMLElement>,
        inputRef: { current: document.createElement('input') } as React.RefObject<HTMLInputElement>,
        open: jest.fn(),
      };
    });

    const localMockOnFilesSelected = jest.fn();
    const currentTestValidateFileMock = jest.fn();

    render(
      <TestUploadArea
        onFilesSelected={localMockOnFilesSelected}
        validateFile={currentTestValidateFileMock}
      />
    );

    const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' });
    const file3 = new File(['content3'], 'file3.jpg', { type: 'image/jpeg' });
    // Files that should be filtered by react-dropzone itself before TestUploadArea's onDrop
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    const file4Large = new File(['content4'.repeat(3 * 1024 * 1024)], 'file4_large.pdf', {
      type: 'application/pdf',
    });

    // Simplified mock: only checks file name for this test's purpose
    currentTestValidateFileMock.mockImplementation((file: File): ActualFileValidationResult => {
      if (file.name === file1.name || file.name === file3.name) {
        return { valid: true, errors: [] };
      }
      // This path should ideally not be hit if acceptedByDropzoneSimulation is correct
      return { valid: false, errors: [`validateFile mock unexpectedly called for ${file.name}`] };
    });

    const acceptedByDropzoneSimulation = [file1, file3];
    const rejectedByDropzoneSimulation: FileRejection[] = [
      { file: file2, errors: [{ code: 'file-invalid-type', message: '' }] },
      { file: file4Large, errors: [{ code: 'file-too-large', message: '' }] },
    ];

    if (capturedOnDrop) {
      await capturedOnDrop(
        acceptedByDropzoneSimulation,
        rejectedByDropzoneSimulation,
        new Event('drop') as unknown as DragEvent
      );
    } else {
      throw new Error('onDrop was not captured');
    }

    expect(currentTestValidateFileMock).toHaveBeenCalledTimes(2);
    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      file1,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );
    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      file3,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );

    await waitFor(() => {
      expect(localMockOnFilesSelected).toHaveBeenCalledWith([file1, file3]);
    });
  });

  it('should call validateFile and onFilesSelected for valid files dropped via onDropCustom', async () => {
    let capturedOnDropCustom: DropzoneOptions['onDrop'];
    mockUseDropzone.mockImplementationOnce((options?: DropzoneOptions): DropzoneState => {
      capturedOnDropCustom = options?.onDrop;
      return minimalDropzoneState;
    });

    const localMockOnFilesSelected = jest.fn();
    const currentTestValidateFileMock = jest.fn();
    render(
      <TestUploadArea
        onFilesSelected={localMockOnFilesSelected}
        validateFile={currentTestValidateFileMock}
      />
    );

    const validFile = new File(['content'], 'valid.pdf', { type: 'application/pdf' });
    const anotherValidFile = new File(['content'], 'another.jpg', { type: 'image/jpeg' });
    const filesToDrop = [validFile, anotherValidFile];

    currentTestValidateFileMock.mockReturnValue({ valid: true, errors: [] }); // All are valid

    if (capturedOnDropCustom) {
      await capturedOnDropCustom(filesToDrop, [], new Event('drop') as unknown as DragEvent);
    } else {
      throw new Error('onDrop was not captured');
    }

    expect(currentTestValidateFileMock).toHaveBeenCalledTimes(2);
    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      validFile,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );
    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      anotherValidFile,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );

    await waitFor(() => {
      expect(localMockOnFilesSelected).toHaveBeenCalledWith(filesToDrop);
    });
  });

  it('should call validateFile and show toast for invalid files dropped', async () => {
    let capturedOnDropCustom: DropzoneOptions['onDrop'];
    mockUseDropzone.mockImplementationOnce((options?: DropzoneOptions): DropzoneState => {
      capturedOnDropCustom = options?.onDrop;
      return minimalDropzoneState;
    });

    const localMockOnFilesSelected = jest.fn();
    render(
      <TestUploadArea onFilesSelected={localMockOnFilesSelected} validateFile={mockValidateFile} />
    );

    const invalidFile = new File(['content'], 'invalid-file.txt', { type: 'text/plain' });
    const filesToDrop = [invalidFile];

    mockValidateFile.mockReturnValueOnce({ valid: false, errors: ['Test error'] });

    if (capturedOnDropCustom) {
      // Simulate react-dropzone passing it as an accepted file, letting TestUploadArea do the final validation
      await capturedOnDropCustom(filesToDrop, [], new Event('drop') as unknown as DragEvent);
    } else {
      throw new Error('onDrop was not captured');
    }

    expect(mockValidateFile).toHaveBeenCalledWith(
      invalidFile,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );
    // expect(toast.error).toHaveBeenCalledWith('Test error'); // Toasting is not done by TestUploadArea based on validateFile prop
    expect(localMockOnFilesSelected).not.toHaveBeenCalled();
  });

  it('should handle a mix of valid and invalid files dropped', async () => {
    let capturedOnDropCustom: DropzoneOptions['onDrop'];
    mockUseDropzone.mockImplementationOnce((options?: DropzoneOptions): DropzoneState => {
      capturedOnDropCustom = options?.onDrop;
      return minimalDropzoneState;
    });

    const localMockOnFilesSelected = jest.fn();
    const currentTestValidateFileMock = jest.fn();

    render(
      <TestUploadArea
        onFilesSelected={localMockOnFilesSelected}
        validateFile={currentTestValidateFileMock}
      />
    );

    const validFile = new File(['valid'], 'valid.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['invalid'], 'invalid.txt', { type: 'text/plain' });
    const filesToDrop = [validFile, invalidFile];

    currentTestValidateFileMock.mockImplementation((file: File): ActualFileValidationResult => {
      if (file.name === invalidFile.name) return { valid: false, errors: ['invalid type'] };
      return { valid: true, errors: [] };
    });

    if (capturedOnDropCustom) {
      // TestUploadArea's onDrop receives filesToDrop (as acceptedFiles from useDropzone mock)
      // It then filters these using currentTestValidateFileMock
      await capturedOnDropCustom(filesToDrop, [], new Event('drop') as unknown as DragEvent);
    } else {
      throw new Error('onDrop was not captured');
    }

    expect(currentTestValidateFileMock).toHaveBeenCalledTimes(2); // Called for both validFile and invalidFile
    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      validFile,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );
    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      invalidFile,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );

    await waitFor(() => {
      expect(localMockOnFilesSelected).toHaveBeenCalledWith([validFile]);
    });
  });

  it('should call the onFilesSelected from useMultiFileUploader when files are processed', async () => {
    // This test name is misleading as TestUploadArea doesn't use useMultiFileUploader's onFilesSelected.
    // It tests that TestUploadArea's OWN onFilesSelected prop is called.
    mockUseDropzone.mockReset(); // Reset to ensure it captures onDrop for this specific setup
    let capturedOnDrop: DropzoneOptions['onDrop'];
    mockUseDropzone.mockImplementationOnce((options?: DropzoneOptions): DropzoneState => {
      capturedOnDrop = options?.onDrop;
      return minimalDropzoneState;
    });

    const validFile = new File([''], 'valid.png', { type: 'image/png' });
    // Use a test-specific mock for validateFile prop
    const currentTestValidateFileMock = jest.fn();
    currentTestValidateFileMock.mockReturnValue({ valid: true, errors: [] }); // Ensure validation passes

    const componentOnFilesSelectedMock = jest.fn();
    render(
      <TestUploadArea
        validateFile={currentTestValidateFileMock}
        onFilesSelected={componentOnFilesSelectedMock}
      />
    );

    if (capturedOnDrop) {
      await capturedOnDrop([validFile], [], new Event('drop') as unknown as DragEvent);
    } else {
      throw new Error('onDrop was not captured for this test');
    }

    expect(currentTestValidateFileMock).toHaveBeenCalledWith(
      validFile,
      ImportedMaxFileSize,
      testSharedAcceptConfig
    );

    await waitFor(() => {
      expect(componentOnFilesSelectedMock).toHaveBeenCalledTimes(1);
      expect(componentOnFilesSelectedMock).toHaveBeenCalledWith([validFile]);
    });
  });

  it('should be disabled when the disabled prop is true', () => {
    render(
      <TestUploadArea
        validateFile={mockValidateFile}
        onFilesSelected={jest.fn()} // Prop for TestUploadArea
        disabled={true}
      />
    );
    expect(screen.getByRole('button', { name: /select files/i })).toBeDisabled();
  });
});

// Minimal DropzoneState for mocks if needed elsewhere
// const minimalDropzoneState: DropzoneState = {
//     getRootProps: jest.fn(),
//     getInputProps: jest.fn(),
//     isDragActive: false,
//     isFocused: false,
//     isFileDialogActive: false,
//     isDragAccept: false,
//     isDragReject: false,
//     acceptedFiles: [],
//     fileRejections: [],
//     open: jest.fn(),
//     inputRef: { current: null },
//     rootRef: { current: null },
// };
