import { retry } from '@/lib/retry';

describe('retry utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the result when the operation succeeds on first try', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const resultPromise = retry(mockFn, 3, 100);
    
    await expect(resultPromise).resolves.toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('retries the specified number of times on failure and succeeds', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');
    const retries = 2;
    const initialDelay = 100;

    // Start the retry
    const promise = retry(mockFn, retries, initialDelay);

    // Run all timers to completion
    jest.runAllTimers();
    // Flush microtasks
    await Promise.resolve();

    // Now the promise should resolve with success
    await expect(promise).resolves.toBe('success');

    // Check final call count (initial call + 2 retries)
    expect(mockFn).toHaveBeenCalledTimes(retries + 1);
  });

  it('rejects if all retries fail', async () => {
    const mockError = new Error('Always fails');
    const mockFn = jest.fn().mockRejectedValue(mockError);
    const retries = 2;
    const initialDelay = 50;

    const promise = retry(mockFn, retries, initialDelay);

    jest.runAllTimers();
    // Flush microtasks
    await Promise.resolve();

    // The promise should reject with the last error
    await expect(promise).rejects.toThrow(mockError);

    // Check final call count (initial call + 2 retries)
    expect(mockFn).toHaveBeenCalledTimes(retries + 1);
  });

  it('uses default retry count and delay if not provided', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockRejectedValueOnce(new Error('fail3'))
      .mockResolvedValue('success');
    const defaultRetries = 3;

    // Start the retry with defaults
    const promise = retry(mockFn);

    // Run all timers
    jest.runAllTimers();
    // Flush microtasks
    await Promise.resolve();

    // Promise should resolve
    await expect(promise).resolves.toBe('success');

    // Check final call count (initial call + 3 default retries)
    expect(mockFn).toHaveBeenCalledTimes(defaultRetries + 1);
  });

  it('calculates delay exponentially', async () => {
    const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockResolvedValue('success');
    const retries = 1;
    const initialDelay = 100;

    const promise = retry(mockFn, retries, initialDelay);

    // Before running timers, only initial call
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Run timers just enough for the first delay
    jest.advanceTimersByTime(initialDelay);
    // Await microtasks (important after advancing timers)
    await Promise.resolve(); 

    // Retry should have happened
    await expect(promise).resolves.toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Verify setTimeout was called with the correct initial delay
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), initialDelay);
  });

   it('should handle immediate success without delay', async () => {
    const mockFn = jest.fn().mockResolvedValue('Immediate Success');
    const result = await retry(mockFn, 3, 100);
    expect(result).toBe('Immediate Success');
    expect(mockFn).toHaveBeenCalledTimes(1);
    // Ensure setTimeout was never called if the first attempt succeeded
    expect(setTimeout).not.toHaveBeenCalled();
  });
});
