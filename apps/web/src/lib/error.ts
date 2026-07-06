import { ApiError } from './api/client';

/**
 * Extracts a human-readable message from an unknown error.
 * Use this in all catch blocks instead of `catch (err: any)`.
 *
 * @example
 * } catch (err: unknown) {
 *   setError(getErrorMessage(err));
 * }
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}
