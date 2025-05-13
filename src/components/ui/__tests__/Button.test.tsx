import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../button'; // Adjust import path as necessary

describe('Button Component', () => {
  it('should render a button with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
  });
});
