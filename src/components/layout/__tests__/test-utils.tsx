import type { ReactElement } from 'react';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';

// Create a custom render method that wraps components with necessary providers
export function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
