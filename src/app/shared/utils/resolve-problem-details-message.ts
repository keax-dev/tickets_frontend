export function resolveProblemDetailsMessage(error: unknown, fallbackMessage: string): string {
  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  if ('error' in error) {
    return resolveProblemDetailsMessage(error.error, fallbackMessage);
  }

  if ('detail' in error && typeof error.detail === 'string') {
    return error.detail;
  }

  return fallbackMessage;
}
