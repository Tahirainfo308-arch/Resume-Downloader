import type { AxiosError } from 'axios';

interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
  requestId?: string;
}

interface ApiErrorResponse {
  success?: boolean;
  error?: ApiErrorBody;
  message?: string;
}

interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId?: string;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const code = body?.error?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR');
    const message = body?.error?.message ?? body?.message ?? 'Unable to complete the request.';

    return new ApiError({
      status,
      code,
      message,
      details: body?.error?.details,
      requestId: body?.error?.requestId,
    });
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    return new ApiError({
      status: 0,
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
      details: error,
    });
  }
}
