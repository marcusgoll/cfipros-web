import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CallToAction } from '../CallToAction';

// Mock the PostHog hook
jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: jest.fn(),
  }),
}));

describe('CallToAction', () => {
  it('renders pricing box with correct elements', () => {
    render(<CallToAction />);
    
    // Check for heading elements
    expect(screen.getByText(/Start for/i)).toBeInTheDocument();
    expect(screen.getByText(/free/i)).toBeInTheDocument();
    expect(screen.getByText(/upgrade when you're ready/i)).toBeInTheDocument();
    
    // Check for free tier highlights
    expect(screen.getByText(/Included in Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Up to 5 active students/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic knowledge test analysis/i)).toBeInTheDocument();
    
    // Check for premium features
    expect(screen.getByText(/Premium Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlimited students/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced analytics/i)).toBeInTheDocument();
    
    // Check for CTA buttons
    expect(screen.getByRole('button', { name: /Get Started – Free/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /See All Pricing/i })).toBeInTheDocument();
  });
  
  it('tracks Get Started CTA button click', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<CallToAction />);
    
    // Find and click the Get Started button
    const getStartedButton = screen.getByRole('button', { name: /Get Started – Free/i });
    fireEvent.click(getStartedButton);
    
    // Verify PostHog tracking was called with correct parameters
    expect(captureSpy).toHaveBeenCalledWith('landing_cta_clicked', {
      section: 'final',
      cta_type: 'get-started-free'
    });
  });
  
  it('tracks See All Pricing button click', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<CallToAction />);
    
    // Find and click the See All Pricing button
    const pricingButton = screen.getByRole('button', { name: /See All Pricing/i });
    fireEvent.click(pricingButton);
    
    // Verify PostHog tracking was called with correct parameters
    expect(captureSpy).toHaveBeenCalledWith('landing_cta_clicked', {
      section: 'final',
      cta_type: 'see-pricing'
    });
  });
  
  it('has a "Best Value" badge', () => {
    render(<CallToAction />);
    
    // This test is to ensure we've fixed the badge issue after hiding it
    // There should be a BEST VALUE text in the component even if it's hidden
    expect(screen.getByText(/BEST VALUE/i)).toBeInTheDocument();
  });
}); 