import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProductMatrix } from '../ProductMatrix';

// Mock the PostHog hook
jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: jest.fn(),
  }),
}));

// Mock file upload behavior
const createMockFile = (name: string, type: string, size: number) => {
  const file = new File(['test'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('ProductMatrix', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders product matrix with features', () => {
    render(<ProductMatrix />);
    
    // Check for section header
    expect(screen.getByText(/Everything you need to/i)).toBeInTheDocument();
    expect(screen.getByText(/analyze test results/i)).toBeInTheDocument();
    
    // Check for feature cards using role + name instead of just text
    const extractQuestionsButton = screen.getByRole('button', { name: /Learn more about Extract Questions/i });
    expect(extractQuestionsButton).toBeInTheDocument();
    
    const acsButton = screen.getByRole('button', { name: /Learn more about ACS Mapping/i });
    expect(acsButton).toBeInTheDocument();
    
    const performanceButton = screen.getByRole('button', { name: /Learn more about Performance Analysis/i });
    expect(performanceButton).toBeInTheDocument();
  });
  
  it('tracks feature card clicks', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<ProductMatrix />);
    
    // Find and click a feature card using aria-label
    const featureCard = screen.getByRole('button', { name: /Learn more about Extract Questions/i });
    expect(featureCard).toBeInTheDocument();
    
    fireEvent.click(featureCard);
    
    // Verify PostHog tracking was called
    expect(captureSpy).toHaveBeenCalledWith('landing_feature_clicked', {
      feature_id: 'extract-questions'
    });
  });
  
  it('shows file upload UI in idle state', () => {
    render(<ProductMatrix />);
    
    // Check for upload section title
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    
    // Check for upload component in idle state
    expect(screen.getByText(/Try it now!/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload your FAA Knowledge Test results \(PDF\) or drop it here/i)).toBeInTheDocument();
    
    // Check for file upload button
    expect(screen.getByText(/Select File/i)).toBeInTheDocument();
  });
  
  it('shows uploading state when file is selected', async () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<ProductMatrix />);
    
    // Find file input and simulate file selection
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);
    
    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [mockFile] }
      });
    });
    
    // Check that we're in uploading state
    expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();
    
    // Verify PostHog tracking was called
    expect(captureSpy).toHaveBeenCalledWith('landing_file_upload_attempt', {
      file_type: 'application/pdf',
      file_size: 1024
    });
  });
  
  it('shows success state for PDF files', async () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<ProductMatrix />);
    
    // Find file input and simulate file selection
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);
    
    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [mockFile] }
      });
      
      // Fast-forward to finish the upload simulation
      jest.advanceTimersByTime(2000);
    });
    
    // Check that we're in success state
    expect(screen.getByText(/Upload Successful!/i)).toBeInTheDocument();
    
    // Verify PostHog success tracking was called
    expect(captureSpy).toHaveBeenCalledWith('landing_file_upload_success', {
      file_type: 'application/pdf'
    });
  });
  
  it('shows error state for non-PDF files', async () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<ProductMatrix />);
    
    // Find file input and simulate file selection
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const mockFile = createMockFile('test.txt', 'text/plain', 1024);
    
    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [mockFile] }
      });
      
      // Fast-forward to finish the upload simulation
      jest.advanceTimersByTime(2000);
    });
    
    // Check that we're in error state
    expect(screen.getByText(/Upload Failed/i)).toBeInTheDocument();
    
    // Verify PostHog error tracking was called
    expect(captureSpy).toHaveBeenCalledWith('landing_file_upload_error', {
      file_type: 'text/plain',
      error_reason: 'invalid_file_type'
    });
  });
}); 