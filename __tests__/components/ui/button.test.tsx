import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, buttonVariants } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /Click me/i });
    expect(button).toBeInTheDocument();
    
    // Default variant and size classes should be applied
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-4');
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Destructive</Button>);
    
    const button = screen.getByRole('button', { name: /Destructive/i });
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies size classes correctly', () => {
    render(<Button size="sm">Small Button</Button>);
    
    const button = screen.getByRole('button', { name: /Small Button/i });
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('px-3');
  });

  it('combines custom className with variant classes', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button', { name: /Custom Button/i });
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-primary'); // Should still have default variant
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.textContent).toBe('Ref Button');
  });

  it('renders as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link', { name: /Link Button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    
    // Should have button styling classes
    expect(link).toHaveClass('bg-primary');
  });

  it('passes additional button props correctly', () => {
    render(<Button disabled type="submit">Submit</Button>);
    
    const button = screen.getByRole('button', { name: /Submit/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('handles multiple variants and sizes through buttonVariants function', () => {
    // Test the buttonVariants function directly
    const classes = buttonVariants({
      variant: 'outline',
      size: 'lg',
      className: 'extra-class'
    });
    
    // Should contain classes for outline variant
    expect(classes).toContain('border');
    expect(classes).toContain('bg-background');
    
    // Should contain classes for lg size
    expect(classes).toContain('h-11');
    expect(classes).toContain('px-8');
    
    // Should include the extra class
    expect(classes).toContain('extra-class');
  });
});
