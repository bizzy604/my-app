import { cn, formatDate, formatCurrency } from '@/lib/utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const condition = true;
    const result = cn('base', condition ? 'true-class' : 'false-class');
    expect(result).toBe('base true-class');
  });

  it('correctly merges tailwind classes', () => {
    const result = cn('px-2 py-1', 'px-4');
    // Tailwind merge should override px-2 with px-4
    expect(result).toBe('py-1 px-4');
  });
});

describe('formatDate utility function', () => {
  it('formats a date string correctly', () => {
    // Mock Date to ensure consistent test results
    const mockDate = new Date(2023, 0, 15, 10, 30); // Jan 15, 2023, 10:30
    
    const result = formatDate(mockDate.toISOString());
    
    // Instead of checking exact string which depends on locale and timezone,
    // check that it contains expected parts
    expect(result).toContain('2023');
    expect(result).toContain('January');
    expect(result).toContain('15');
  });

  it('handles Date object input', () => {
    const mockDate = new Date(2023, 0, 15, 10, 30);
    const result = formatDate(mockDate);
    
    expect(result).toContain('2023');
    expect(result).toContain('January');
    expect(result).toContain('15');
  });
});

describe('formatCurrency utility function', () => {
  it('formats numbers as USD currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('handles zero values', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  it('formats negative values correctly', () => {
    const result = formatCurrency(-99.99);
    expect(result).toBe('-$99.99');
  });
});
