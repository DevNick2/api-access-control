import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Injectable } from '@nestjs/common';

export const AXIOS_BASE_URL = 'AXIOS_BASE_URL';

@Injectable()
export class AxiosService {
  private axios: AxiosInstance;

  constructor() {}

  async setup (baseURL: string): Promise<AxiosInstance> {
    this.axios = axios.create({ baseURL })

    await this.setupInterceptors()

    return this.axios
  }

  private async setupInterceptors() {
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => Promise.reject(error),
    );
  }
}