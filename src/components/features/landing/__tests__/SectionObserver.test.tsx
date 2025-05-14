import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionObserver } from '../SectionObserver';

// Mock the PostHog hook
jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: jest.fn(),
  }),
}));

// Mock the Intersection Observer API
const mockIntersectionObserver = jest.fn();

describe('SectionObserver', () => {
  beforeEach(() => {
    // Mock IntersectionObserver implementation
    mockIntersectionObserver.mockImplementation((callback) => {
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
        // Simulate the callback being called with an entry in view
        simulateInView: () => callback([{ isIntersecting: true }], {} as IntersectionObserver),
        // Simulate the callback being called with an entry out of view
        simulateOutOfView: () => callback([{ isIntersecting: false }], {} as IntersectionObserver),
      };
    });

    // Assign mock to global
    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders children properly', () => {
    render(
      <SectionObserver sectionId="test-section" sectionName="Test Section">
        <div data-testid="section-content">Test Content</div>
      </SectionObserver>
    );

    // Check that children are rendered
    expect(screen.getByTestId('section-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('tracks when section comes into view', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();

    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });

    render(
      <SectionObserver sectionId="test-section" sectionName="Test Section">
        <div data-testid="section-content">Test Content</div>
      </SectionObserver>
    );

    // Get the mock observer instance
    const observerInstance = mockIntersectionObserver.mock.results[0].value;

    // Simulate section coming into view
    observerInstance.simulateInView();

    // Verify PostHog tracking was called
    expect(captureSpy).toHaveBeenCalledWith('landing_section_viewed', {
      section_id: 'test-section',
      section_name: 'Test Section',
    });
  });

  it('does not track when section is not in view', () => {
    const posthogMock = jest.requireMock('posthog-js/react');
    const captureSpy = jest.fn();

    posthogMock.usePostHog = () => ({
      capture: captureSpy,
    });

    render(
      <SectionObserver sectionId="test-section" sectionName="Test Section">
        <div data-testid="section-content">Test Content</div>
      </SectionObserver>
    );

    // Get the mock observer instance
    const observerInstance = mockIntersectionObserver.mock.results[0].value;

    // Simulate section out of view
    observerInstance.simulateOutOfView();

    // Verify PostHog tracking was not called
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it('cleans up observer on unmount', () => {
    const { unmount } = render(
      <SectionObserver sectionId="test-section" sectionName="Test Section">
        <div data-testid="section-content">Test Content</div>
      </SectionObserver>
    );

    // Get the mock observer instance
    const observerInstance = mockIntersectionObserver.mock.results[0].value;

    // Unmount the component
    unmount();

    // Verify disconnect was called
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });
});
