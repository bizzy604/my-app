import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardCard } from '@/components/dashboard-card';
import { Home } from 'lucide-react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('DashboardCard Component', () => {
  const mockProps = {
    title: 'Test Title',
    description: 'Test Description',
    href: '/test-link',
    icon: Home
  };

  it('renders with correct title and description', () => {
    render(<DashboardCard {...mockProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with the correct link href', () => {
    render(<DashboardCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test-link');
  });

  it('renders the icon component', () => {
    const { container } = render(<DashboardCard {...mockProps} />);
    
    // Check if the SVG icon is rendered (Home icon)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-8');
    expect(svg).toHaveClass('w-8');
  });

  it('applies the correct styling classes', () => {
    render(<DashboardCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('flex');
    expect(link).toHaveClass('flex-col');
    expect(link).toHaveClass('items-center');
    expect(link).toHaveClass('rounded-lg');
    expect(link).toHaveClass('bg-gray-50');
    expect(link).toHaveClass('hover:bg-gray-100');
  });
});
