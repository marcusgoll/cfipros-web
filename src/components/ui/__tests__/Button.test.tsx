import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

import Link from 'next/link';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...rest }: React.ComponentPropsWithoutRef<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockNextLink';
  return MockLink;
});

describe('Button Component', () => {
  it('should render a button with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
  });

  it('should apply different variants correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    let button = screen.getByRole('button', { name: /Default/i });
    expect(button).toHaveClass('bg-primary');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /Outline/i });
    expect(button).toHaveClass('border');

    rerender(<Button variant="destructive">Destructive</Button>);
    button = screen.getByRole('button', { name: /Destructive/i });
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant="brand">Brand</Button>);
    button = screen.getByRole('button', { name: /Brand/i });
    expect(button).toHaveClass('bg-[#F47C20]');
  });

  it('should apply different size classes', () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    let button = screen.getByRole('button', { name: /Default Size/i });
    expect(button).toHaveClass('h-9');

    rerender(<Button size="sm">Small</Button>);
    button = screen.getByRole('button', { name: /Small/i });
    expect(button).toHaveClass('h-8');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /Large/i });
    expect(button).toHaveClass('h-11');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /Icon/i });
    expect(button).toHaveClass('size-9');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole('button', { name: /Click Me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should pass additional props correctly', () => {
    render(
      <Button data-testid="test-button" disabled>
        Disabled
      </Button>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toBeDisabled();
  });

  it('should render correctly as asChild', () => {
    render(
      <Button asChild>
        <Link href="/">Link Button</Link>
      </Button>
    );

    const link = screen.getByRole('link', { name: /Link Button/i });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveClass('inline-flex');
  });
});
