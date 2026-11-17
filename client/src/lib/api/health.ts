import { apiClient } from './client';

export type HealthDatabaseStatus = 'connected' | 'disconnected' | 'connecting';

export interface HealthData {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  environment: string;
  database: {
    status: HealthDatabaseStatus;
    name: string;
  };
}

interface HealthEnvelope {
  success: true;
  data: HealthData;
}

export async function getHealth(signal?: AbortSignal): Promise<HealthData> {
  const response = await apiClient.get<HealthEnvelope>('/health', { signal });
  return response.data.data;
}
