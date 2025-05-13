import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { RoadmapSection } from '../RoadmapSection';

// Mock the PostHog hook
jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: jest.fn(),
  }),
}));

// Define interface for the MockLink props
interface MockLinkProps {
  children: React.ReactNode;
  href: string;
  onClick?: () => void;
}

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick }: MockLinkProps) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  };
});

describe('RoadmapSection', () => {
  it('renders roadmap section with two columns', () => {
    render(<RoadmapSection />);
    
    // Check for heading
    expect(screen.getByText(/The future of CFIPros/i)).toBeInTheDocument();
    expect(screen.getByText(/depends on you/i)).toBeInTheDocument();
    
    // Check for columns
    expect(screen.getByText(/Under consideration/i)).toBeInTheDocument();
    expect(screen.getByText(/In progress/i)).toBeInTheDocument();
    
    // Check for specific roadmap items with more specific selectors
    const underConsiderationColumn = screen.getByText(/Under consideration/i).closest('div')?.parentElement;
    expect(within(underConsiderationColumn!).getByText(/Product tours/i)).toBeInTheDocument();
    
    const inProgressColumn = screen.getByText(/In progress/i).closest('div')?.parentElement;
    expect(within(inProgressColumn!).getByText(/Messaging/i)).toBeInTheDocument();
    expect(within(inProgressColumn!).getByText(/No-code A\/B testing/i)).toBeInTheDocument();
    
    // Check for explore button
    expect(screen.getByText(/Explore our roadmap/i)).toBeInTheDocument();
  });
  
  it('tracks roadmap item clicks', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<RoadmapSection />);
    
    // Find and click a roadmap item button more specifically
    const buttons = screen.getAllByRole('button');
    // Product tours is the first button in the first list
    const productToursButton = buttons.find(button => 
      button.textContent?.includes('Product tours'));
    
    expect(productToursButton).not.toBeUndefined();
    
    if (productToursButton) {
      fireEvent.click(productToursButton);
      
      // Verify PostHog tracking was called
      expect(captureSpy).toHaveBeenCalledWith('landing_roadmap_item_clicked', {
        item_id: 'product-tours',
        status: 'under-consideration'
      });
    }
  });
  
  it('tracks explore roadmap click', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();
    
    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });
    
    render(<RoadmapSection />);
    
    // Find and click the explore button
    const exploreLink = screen.getByText(/Explore our roadmap/i);
    fireEvent.click(exploreLink);
    
    // Verify PostHog tracking was called
    expect(captureSpy).toHaveBeenCalledWith('landing_explore_roadmap_clicked');
  });
  
  it('renders with correct background class for theme support', () => {
    render(<RoadmapSection />);
    
    // Check that the section has the correct background class
    const section = screen.getByText(/The future of CFIPros/i).closest('section');
    expect(section).toHaveClass('bg-card');
    expect(section).not.toHaveClass('bg-[#1c1c24]');
  });
}); 