import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error;

    if (typeof body === 'string' && body.trim()) return body;
    if (body?.errorMessage) return body.errorMessage;
    if (body?.message) return body.message;
    if (error.status === 0) return 'Cannot reach the server. Check the API address and try again.';
    if (error.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 404) return 'The requested record could not be found.';
    if (error.status >= 500) return 'The server had a problem. Please try again shortly.';
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
