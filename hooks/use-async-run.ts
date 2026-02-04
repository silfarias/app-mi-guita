import { useState } from 'react';

const DEFAULT_ERROR_MESSAGE = 'Ha ocurrido un error';

export function getErrorMessage(err: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  return err instanceof Error ? err.message : fallback;
}

export function useAsyncRun() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T>(fn: () => Promise<T>, options?: { errorFallback?: string; logLabel?: string }): Promise<T | undefined> => {
    setError(null);
    setLoading(true);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const message = getErrorMessage(err, options?.errorFallback);
      setError(message);
      if (options?.logLabel) console.error(`Error en ${options.logLabel}:`, err);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, setError, run, getErrorMessage };
}
