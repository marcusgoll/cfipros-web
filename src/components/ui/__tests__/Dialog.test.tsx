import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { Button } from '../button';

describe('Dialog Component', () => {
  it('should render trigger content', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>This is a test dialog</DialogDescription>
          </DialogHeader>
          <div>Dialog Body Content</div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: /Open Dialog/i })).toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>This is a test dialog</DialogDescription>
          </DialogHeader>
          <div>Dialog Body Content</div>
        </DialogContent>
      </Dialog>
    );

    // Click the trigger button
    fireEvent.click(screen.getByRole('button', { name: /Open Dialog/i }));

    // Check if dialog content is now visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog Body Content')).toBeInTheDocument();
  });

  it('should render header components correctly', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog Title</DialogTitle>
            <DialogDescription>Test Dialog Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog Description')).toBeInTheDocument();
  });

  it('should close when the close button is clicked', () => {
    const { queryByRole } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>This is a test dialog</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    // Dialog should be open initially
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Find the close button by its type attribute and position (it's a button in the dialog)
    const closeButton = screen.getByRole('button', {
      name: 'Close'
    });
    
    // Click the close button
    fireEvent.click(closeButton);

    // Dialog should no longer be in the document
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
}); 