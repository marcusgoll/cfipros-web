// Setup file for Jest tests
import '@testing-library/jest-dom';
import type { ReactNode } from 'react';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
  createSupabaseServerClient: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(),
  })),
}));

// Mock next/link without using JSX
jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: ReactNode; href: string }) {
    return {
      type: 'a',
      props: {
        href,
        children,
      },
    };
  }
  return MockLink;
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Global afterEach
afterEach(() => {
  jest.clearAllMocks();
});
