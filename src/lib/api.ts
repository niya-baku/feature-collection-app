import axios from 'axios';
import type { APIResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: '/api/v2',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export { apiClient };

export const createFetcher = <T>(url: string) => {
  return async (): Promise<T> => {
    const response = await apiClient.get<APIResponse<T>>(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message);
  };
};