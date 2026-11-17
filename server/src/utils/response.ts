export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function successEnvelope<T>(data: T, meta?: Record<string, unknown>): SuccessEnvelope<T> {
  if (meta) {
    return { success: true, data, meta };
  }

  return { success: true, data };
}

export function errorEnvelope(
  code: string,
  message: string,
  details?: unknown,
  requestId?: string,
): ErrorEnvelope {
  const error: ErrorEnvelope['error'] = { code, message };

  if (details !== undefined) {
    error.details = details;
  }

  if (requestId) {
    error.requestId = requestId;
  }

  return { success: false, error };
}
