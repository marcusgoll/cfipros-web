// Setup file for Jest tests
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from '@jest/globals';

expect.extend(matchers.default || matchers);

// Mock Supabase client and server utilities
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: { user: { id: 'mock-user-id' } } } })
      ),
    },
    from: jest.fn(() => ({
      // Ensure .from() returns an object with chainable methods
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
      eq: jest.fn().mockReturnThis(), // for chaining .eq()
      is: jest.fn().mockReturnThis(), // for chaining .is()
      single: jest.fn(() => Promise.resolve({ data: null, error: null })), // for .single()
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })), // for .maybeSingle()
    })),
  })),
}));

jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(() => ({
    auth: {
      signInWithOtp: jest.fn(() => Promise.resolve({ error: null })),
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'mock-user-id', email: 'mock@example.com' } },
          error: null,
        })
      ),
    },
    from: jest.fn(() => ({
      // Ensure .from() returns an object with chainable methods
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
      eq: jest.fn().mockReturnThis(), // for chaining .eq()
      is: jest.fn().mockReturnThis(), // for chaining .is()
      single: jest.fn(() => Promise.resolve({ data: null, error: null })), // for .single()
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })), // for .maybeSingle()
    })),
  })),
}));

// Mock next-navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue('/test-path'),
  redirect: jest.fn(),
}));

// Mock next/link without using JSX
jest.mock('next/link', () => {
  // Using ReactNode type correctly requires React import, but this is a .ts file for jest setup
  // For simplicity, we'll use a basic structure for the mock without JSX.
  function MockLink({ children, href }: { children: unknown; href: string }) {
    // Using unknown for children for simplicity in non-JSX context
    // This structure mimics a basic React element object to avoid JSX here.
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
