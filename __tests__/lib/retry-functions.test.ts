import { retry } from '@/lib/retry';

describe('Retry Utility Functions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('resolves immediately when the operation succeeds on first try', async () => {
    // Setup mock function that succeeds immediately
    const mockOperation = jest.fn().mockResolvedValue('success result');
    
    // Execute the retry function
    const promise = retry(mockOperation, 3, 100);
    
    // Verify that it resolves correctly
    await expect(promise).resolves.toBe('success result');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('retries until success when operation initially fails', async () => {
    // Setup mock function that fails twice then succeeds
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValue('eventual success');
    
    // Start the retry
    const promise = retry(mockOperation, 3, 50);
    
    // Initial call should have happened
    expect(mockOperation).toHaveBeenCalledTimes(1);
    
    // First retry after delay
    jest.advanceTimersByTime(50);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockOperation).toHaveBeenCalledTimes(2);
    
    // Second retry after doubled delay
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockOperation).toHaveBeenCalledTimes(3);
    
    // Function should resolve with success value
    await expect(promise).resolves.toBe('eventual success');
  });

  it('gives up and rejects after all retries fail', async () => {
    // Create persistent error
    const testError = new Error('persistent error');
    
    // Setup mock function that always fails
    const mockOperation = jest.fn().mockRejectedValue(testError);
    
    // Start retry with 2 retries (3 attempts total)
    const promise = retry(mockOperation, 2, 50);
    
    // Initial attempt
    expect(mockOperation).toHaveBeenCalledTimes(1);
    
    // First retry
    jest.advanceTimersByTime(50);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockOperation).toHaveBeenCalledTimes(2);
    
    // Second retry
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockOperation).toHaveBeenCalledTimes(3);
    
    // Should reject with the error
    await expect(promise).rejects.toThrow('persistent error');
  });

  it('uses exponential backoff for retry delays', async () => {
    // Spy on setTimeout to verify delay times
    jest.spyOn(global, 'setTimeout');
    
    // Setup mock that fails enough times to test all delays
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('failure 1'))
      .mockRejectedValueOnce(new Error('failure 2'))
      .mockRejectedValueOnce(new Error('failure 3'))
      .mockResolvedValue('success');
    
    // Start retry
    const promise = retry(mockOperation, 3, 100);
    
    // Check initial call
    expect(mockOperation).toHaveBeenCalledTimes(1);
    
    // First retry should use initial delay (100ms)
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    await Promise.resolve();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
    expect(mockOperation).toHaveBeenCalledTimes(2);
    
    // Second retry should use 2x delay (200ms)
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    await Promise.resolve();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    expect(mockOperation).toHaveBeenCalledTimes(3);
    
    // Third retry should use 4x delay (400ms)
    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 400);
    expect(mockOperation).toHaveBeenCalledTimes(4);
    
    // Should eventually resolve
    await expect(promise).resolves.toBe('success');
  });
});
