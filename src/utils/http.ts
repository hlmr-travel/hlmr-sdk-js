/**
 * Client HTTP avec gestion JSend pour le SDK Mira
 */

import type {
  HlmrClientConfig,
  RequestOptions,
  HttpResponse
} from '../types/common';
import type {
  JSendResponse,
  JSendSuccessResponse
} from '../types/errors';
import { HlmrApiError } from '../types/errors';
import { isJSendResponse, isJSendSuccess } from './jsend';

/**
 * Client HTTP pour les appels API Mira
 */
export class HttpClient {
  private config: HlmrClientConfig;

  constructor(config: HlmrClientConfig) {
    this.config = config;
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(updates: Partial<HlmrClientConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Mettre à jour le token Bearer
   */
  setBearerToken(token: string): void {
    this.config.bearerToken = token;
  }

  /**
   * Supprimer le token Bearer
   */
  clearBearerToken(): void {
    delete this.config.bearerToken;
  }

  /**
   * Construire l'URL complète pour une requête
   */
  private buildUrl(path: string, apiVersion = 'v1'): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    
    // Si le path commence déjà par une version, ne pas ajouter de version
    if (cleanPath.match(/^v\d+\//)) {
      return `${baseUrl}/${cleanPath}`;
    }
    
    return `${baseUrl}/${apiVersion}/${cleanPath}`;
  }

  /**
   * Construire les headers pour une requête
   */
  private buildHeaders(options: RequestOptions = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-ID': this.config.appId,
      ...this.config.customHeaders,
      ...options.headers
    };

    // Ajouter le token Bearer si disponible et non désactivé
    if (this.config.bearerToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
    }

    return headers;
  }

  /**
   * Créer un AbortController pour le timeout
   */
  private createTimeoutController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * Traiter la réponse HTTP et extraire les données JSend
   */
  private async processResponse<T>(response: Response): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    // Vérifier si c'est une réponse JSend
    if (isJSendResponse(data)) {
      if (!response.ok) {
        throw HlmrApiError.fromJSendResponse(data, response.status);
      }
      
      if (isJSendSuccess(data)) {
        return {
          status: response.status,
          statusText: response.statusText,
          headers,
          data: data.data
        };
      }
    }

    // Si ce n'est pas du JSend ou si la réponse n'est pas ok
    if (!response.ok) {
      throw new HlmrApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        'HTTP_ERROR'
      );
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      data
    };
  }

  /**
   * Exécuter une requête HTTP
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path, options.apiVersion);
    const headers = this.buildHeaders(options);
    const timeout = options.timeout || this.config.timeout || 30000;

    if (this.config.debug) {
      console.log(`[HlmrSDK] ${method} ${url}`, { headers, body });
    }

    const controller = this.createTimeoutController(timeout);

    const requestInit: RequestInit = {
      method,
      headers,
      signal: controller.signal
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);
      const result = await this.processResponse<T>(response);
      
      if (this.config.debug) {
        console.log(`[HlmrSDK] Response:`, result);
      }
      
      return result;
    } catch (error) {
      if (error instanceof HlmrApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw HlmrApiError.timeoutError(timeout);
        }
        throw HlmrApiError.networkError(error);
      }

      throw new HlmrApiError('Unknown error occurred', 0, 'UNKNOWN_ERROR');
    }
  }

  /**
   * Requête GET
   */
  async get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Requête POST
   */
  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * Requête PUT
   */
  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * Requête PATCH
   */
  async patch<T>(path: string, body?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * Requête DELETE
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}
