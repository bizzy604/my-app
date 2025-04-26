import React from 'react';
import { render } from '@testing-library/react';
import { LoadingSpinner } from '@/components/loading-spinner';

describe('LoadingSpinner Component', () => {
  it('renders with default className', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveClass('h-4');
    expect(svg).toHaveClass('w-4');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<LoadingSpinner className="h-8 w-8 text-blue-500" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveClass('h-8');
    expect(svg).toHaveClass('w-8');
    expect(svg).toHaveClass('text-blue-500');
  });

  it('contains the correct SVG structure', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveClass('opacity-25');
    
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass('opacity-75');
    expect(path).toHaveAttribute('fill', 'currentColor');
  });
});
