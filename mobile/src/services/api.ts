import { Platform } from 'react-native';
import Constants from 'expo-constants';

/** Requests are aborted after this many milliseconds. */
const DEFAULT_TIMEOUT_MS = 12000;

const DEFAULT_PORT = 8005;

/** Simple in-memory cache for offline / network blip fallback (PRD-017). */
const apiCache = new Map<string, { timestamp: number; data: any }>();

/**
 * Resolve the API origin.
 */
const resolveBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const fromConfig = (Constants.expoConfig?.extra as any)?.apiBaseUrl;
  // If an explicit non-localhost remote URL is provided (e.g. production https endpoint), use it.
  if (fromConfig && !String(fromConfig).includes('localhost') && !String(fromConfig).includes('127.0.0.1')) {
    return String(fromConfig).replace(/\/+$/, '');
  }

  if (Platform.OS === 'web') {
    return fromConfig ? String(fromConfig).replace(/\/+$/, '') : `http://localhost:${DEFAULT_PORT}`;
  }

  // In Expo Go on a physical device, the host PC's IP is exposed via hostUri.
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).experienceUrl;

  if (hostUri) {
    const cleaned = String(hostUri).replace(/^[a-zA-Z]+:\/\//, '');
    const hostIp = cleaned.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:${DEFAULT_PORT}`;
    }
  }

  if (Platform.OS === 'android') {
    // Android emulator maps the host machine to 10.0.2.2.
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }

  return `http://localhost:${DEFAULT_PORT}`;
};

const API_BASE_URL = resolveBaseUrl();

/** True when the resolved origin is cleartext HTTP. */
export const isInsecureTransport = API_BASE_URL.startsWith('http://');

/** Error type thrown by `fetchJson`, carrying a display-safe message. */
export class ApiError extends Error {
  readonly status: number | null;
  readonly endpoint: string;
  readonly isTimeout: boolean;
  readonly isNetworkFailure: boolean;

  constructor(
    message: string,
    opts: {
      status?: number | null;
      endpoint: string;
      isTimeout?: boolean;
      isNetworkFailure?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status ?? null;
    this.endpoint = opts.endpoint;
    this.isTimeout = opts.isTimeout ?? false;
    this.isNetworkFailure = opts.isNetworkFailure ?? false;
  }
}

/**
 * Convert any thrown value into a short sentence suitable for `ErrorState`.
 */
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isTimeout) return 'The request timed out. Check your connection and try again.';
    if (err.isNetworkFailure) return 'Cannot reach the TrafficIQ server. Check that the backend is running.';
    if (err.status === 404) return 'That endpoint is not available on the server.';
    if (err.status !== null && err.status >= 500) return 'The server reported an internal error. Try again shortly.';
    return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return 'An unexpected error occurred.';
}

export interface FetchOptions extends RequestInit {
  /** Override the default timeout for a single call. */
  timeoutMs?: number;
  /** Caller-supplied signal; composed with the internal timeout signal. */
  signal?: AbortSignal;
  /** Number of retries on transient network errors. Defaults to 1 for GET/POST. */
  retries?: number;
  /** Whether to return stale cache on complete offline failure. */
  useStaleCacheOnError?: boolean;
}

export async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { 
    timeoutMs = DEFAULT_TIMEOUT_MS, 
    signal: callerSignal, 
    retries = 1,
    useStaleCacheOnError = true,
    ...rest 
  } = options;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;
  const cacheKey = `${rest.method || 'GET'}:${path}:${rest.body ? String(rest.body) : ''}`;

  let attempt = 0;
  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const onCallerAbort = () => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener('abort', onCallerAbort);
    }

    try {
      const response = await fetch(url, {
        ...rest,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'trafficiq-dev-key',
          ...(rest.headers || {})
        }
      });

      if (!response.ok) {
        throw new ApiError(`Request failed with status ${response.status}.`, {
          status: response.status,
          endpoint: path
        });
      }

      const data = (await response.json()) as T;
      apiCache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort);

      if (attempt < retries && !callerSignal?.aborted) {
        attempt++;
        // Jittered backoff (300ms, 600ms...)
        await new Promise((r) => setTimeout(r, attempt * 300));
        continue;
      }

      // Check stale cache fallback if network failed (PRD-017)
      if (useStaleCacheOnError && apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey)!;
        return cached.data as T;
      }

      if (error instanceof ApiError) throw error;

      const timedOut = error?.name === 'AbortError' && !callerSignal?.aborted;
      if (error?.name === 'AbortError') {
        throw new ApiError(timedOut ? 'Request timed out.' : 'Request cancelled.', {
          endpoint: path,
          isTimeout: timedOut
        });
      }

      throw new ApiError('Network request failed.', {
        endpoint: path,
        isNetworkFailure: true
      });
    } finally {
      clearTimeout(timeoutId);
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort);
    }
  }

  throw new ApiError('Network request failed after retries.', {
    endpoint: path,
    isNetworkFailure: true
  });
}

export { API_BASE_URL };
