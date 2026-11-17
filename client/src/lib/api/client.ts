import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { ApiError } from './errors';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : '/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      error?: { code?: string; message?: string; details?: unknown; requestId?: string };
      message?: string;
    }>,
  ) => {
    throw ApiError.fromAxiosError(error);
  },
);
