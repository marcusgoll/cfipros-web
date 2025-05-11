import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the HomePageV2 component that's imported in the page
jest.mock('@/app/home-v2', () => {
  return function MockHomePageV2() {
    return (
      <div data-testid="mock-home-v2">
        <h1>How flight schools build successful pilots</h1>
        <p>No products to buy or install</p>
        <p>These schools build pilots faster with us</p>
        <p>Solutions for every role</p>
        <p>APIs for customization</p>
        <a href="/signup">Get Started</a>
      </div>
    );
  };
});

// Import the page component after setting up the mock
import HomeV2Page from '../page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('HomeV2Page', () => {
  it('renders the page component without crashing', () => {
    render(<HomeV2Page />);

    // Test that the mocked component renders
    expect(screen.getByTestId('mock-home-v2')).toBeInTheDocument();

    // Test that key elements are present in our mock
    expect(screen.getByText(/How flight schools/i)).toBeInTheDocument();
    expect(screen.getByText(/build successful pilots/i)).toBeInTheDocument();
    expect(screen.getByText(/No products to buy or install/i)).toBeInTheDocument();

    // Test that navigation links exist
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();

    // Test section headings
    expect(screen.getByText(/These schools build pilots faster with us/i)).toBeInTheDocument();
    expect(screen.getByText(/Solutions for every role/i)).toBeInTheDocument();
    expect(screen.getByText(/APIs for customization/i)).toBeInTheDocument();
  });
});
