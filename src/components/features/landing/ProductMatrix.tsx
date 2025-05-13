'use client';

import { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import {
  FileText,
  BarChart,
  Users,
  UploadCloud,
  Search,
  PieChart,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define the key features of the ACS Extractor
const features = [
  {
    id: 'extract-questions',
    name: 'Extract Questions',
    icon: <FileText className="h-5 w-5" />,
    description: 'Automatically extract questions from FAA Knowledge Test results.',
  },
  {
    id: 'acs-mapping',
    name: 'ACS Mapping',
    icon: <Search className="h-5 w-5" />,
    description: 'Map each question to the corresponding ACS code and area of knowledge.',
  },
  {
    id: 'performance-analysis',
    name: 'Performance Analysis',
    icon: <BarChart className="h-5 w-5" />,
    description: 'Analyze performance by ACS code to identify strengths and weaknesses.',
  },
  {
    id: 'student-tracking',
    name: 'Student Tracking',
    icon: <Users className="h-5 w-5" />,
    description: 'Track progress for multiple students over time.',
  },
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    icon: <PieChart className="h-5 w-5" />,
    description: 'Visualize performance data with intuitive charts and graphs.',
  },
  {
    id: 'easy-upload',
    name: 'Easy Upload',
    icon: <UploadCloud className="h-5 w-5" />,
    description: 'Simply upload your PDF test results and get instant analysis.',
  },
];

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function ProductMatrix() {
  const posthog = usePostHog();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [filename, setFilename] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const trackFeatureClick = (featureId: string) => {
    posthog?.capture('landing_feature_clicked', {
      feature_id: featureId,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    // Track file upload attempt
    posthog?.capture('landing_file_upload_attempt', {
      file_type: file.type,
      file_size: file.size,
    });

    // Mock upload process
    setFilename(file.name);
    setUploadState('uploading');

    // Simulate upload process with random success/failure
    setTimeout(() => {
      // For demo purposes, let's pretend PDF files succeed and other types fail
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPDF) {
        setUploadState('success');
        posthog?.capture('landing_file_upload_success', {
          file_type: file.type,
        });
      } else {
        setUploadState('error');
        posthog?.capture('landing_file_upload_error', {
          file_type: file.type,
          error_reason: 'invalid_file_type',
        });
      }
    }, 2000);
  };

  const resetUpload = () => {
    setUploadState('idle');
    setFilename('');
  };

  return (
    <section id="features" className="py-20 border-b border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to <span className="text-highlight">analyze test results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-[600px]">
            Our ACS Extractor tool provides comprehensive analysis of FAA Knowledge Test results to
            improve training outcomes.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className="bg-card rounded-lg border border-border p-6 hover:border-highlight/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-highlight/10 hover:-translate-y-1 text-left"
              onClick={() => trackFeatureClick(feature.id)}
              aria-label={`Learn more about ${feature.name}`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-muted p-2 rounded-md transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold mb-2 transition-colors hover:text-highlight">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Demo section */}
        <div className="mt-16 p-8 bg-muted/20 border border-border rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 space-y-4">
              <h3 className="text-2xl font-bold">How it works</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-2">
                  <div className="bg-highlight rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5 text-white font-medium text-sm">
                    1
                  </div>
                  <div>
                    <span className="font-medium">Upload your FAA Knowledge Test results PDF</span>
                    <p className="text-sm text-muted-foreground">
                      Simply drag and drop your test results or upload from your device.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-highlight rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5 text-white font-medium text-sm">
                    2
                  </div>
                  <div>
                    <span className="font-medium">Our system extracts and analyzes the data</span>
                    <p className="text-sm text-muted-foreground">
                      Advanced algorithms map each question to ACS codes and analyze performance.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-highlight rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5 text-white font-medium text-sm">
                    3
                  </div>
                  <div>
                    <span className="font-medium">Review comprehensive analytics</span>
                    <p className="text-sm text-muted-foreground">
                      View detailed breakdowns by ACS area and identify weak points to focus
                      training.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="md:w-1/2 bg-card border border-border rounded-lg p-4">
              {uploadState === 'idle' && (
                <div
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg ${dragActive ? 'border-highlight bg-highlight/5' : 'border-border'} transition-colors`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadCloud className="h-12 w-12 text-highlight mb-4" />
                  <h4 className="text-lg font-bold mb-2">Try it now!</h4>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Upload your FAA Knowledge Test results (PDF) or drop it here
                  </p>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="bg-highlight hover:bg-highlight/90 text-white font-medium py-2 px-4 rounded-md transition-colors">
                      Select File
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: PDF, JPG, PNG
                  </p>
                </div>
              )}

              {uploadState === 'uploading' && (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 border-4 border-highlight/30 border-t-highlight rounded-full animate-spin mb-4" />
                  <h4 className="text-lg font-bold mb-2">Uploading...</h4>
                  <p className="text-sm text-muted-foreground">{filename}</p>
                </div>
              )}

              {uploadState === 'success' && (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Upload Successful!</h4>
                  <p className="text-sm text-muted-foreground mb-4">{filename}</p>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    We&apos;re analyzing your test results. You&apos;ll receive a comprehensive
                    report shortly.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={resetUpload}>
                    Upload Another File
                  </Button>
                </div>
              )}

              {uploadState === 'error' && (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Upload Failed</h4>
                  <p className="text-sm text-muted-foreground mb-4">{filename}</p>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    We couldn&apos;t process your file. Please ensure it&apos;s a valid FAA
                    Knowledge Test PDF.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={resetUpload}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
