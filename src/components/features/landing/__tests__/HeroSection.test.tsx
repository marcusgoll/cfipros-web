import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

// Mock the PostHog hook
jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: jest.fn(),
  }),
}));

describe('HeroSection', () => {
  it('renders hero section with correct elements', () => {
    render(<HeroSection />);
    
    // Check for heading element with correct text
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/ACS Extractor/i);
    expect(heading).toHaveTextContent(/Analyze FAA Knowledge Tests/i);
    
    // Check for highlight spans
    const highlightedText = heading.querySelector('.text-highlight');
    expect(highlightedText).toBeInTheDocument();
    
    // Check for description text
    const description = screen.getByText(/Automatically extract and/i);
    expect(description).toBeInTheDocument();
    
    // Check for button
    const ctaButton = screen.getByRole('button', { name: /Get Started – Free/i });
    expect(ctaButton).toBeInTheDocument();
    
    // Check for visualization section
    const visualization = screen.getByText(/Upload your FAA Knowledge Test results/i);
    expect(visualization).toBeInTheDocument();
  });
  
  it('tracks CTA button click', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    // Override the mock implementation for this test
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<HeroSection />);
    
    // Find and click the CTA button
    const ctaButton = screen.getByRole('button', { name: /Get Started – Free/i });
    fireEvent.click(ctaButton);
    
    // Verify PostHog tracking was called with correct parameters
    expect(captureSpy).toHaveBeenCalledWith('landing_cta_clicked', {
      section: 'hero',
      cta_type: 'get-started'
    });
  });
  
  it('applies correct styling to the CTA button', () => {
    render(<HeroSection />);
    
    const ctaButton = screen.getByRole('button', { name: /Get Started – Free/i });
    
    // Check that the button has the primary color class
    expect(ctaButton).toHaveClass('bg-primary');
    
    // Check for hover effect classes
    expect(ctaButton).toHaveClass('hover:bg-highlight/90');
    
    // Check for size and padding classes
    expect(ctaButton).toHaveClass('py-6');
    expect(ctaButton).toHaveClass('px-8');
  });
}); 