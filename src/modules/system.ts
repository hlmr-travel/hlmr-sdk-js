/**
 * Module système pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type {
  SystemPingResponse,
  SystemVersionResponse
} from '../types/system';

/**
 * Module système
 */
export class SystemModule {
  constructor(private http: HttpClient) {}

  /**
   * Ping authentifié du système
   * 
   * @returns Informations de ping avec détails utilisateur/app
   */
  async ping(): Promise<SystemPingResponse> {
    const response = await this.http.get<SystemPingResponse>('ping', {
      apiVersion: '' // Route sans version
    });
    return response.data;
  }

  /**
   * Récupérer la version de l'API
   * 
   * @returns Informations de version du système
   */
  async version(): Promise<SystemVersionResponse> {
    const response = await this.http.get<SystemVersionResponse>('version', {
      apiVersion: '', // Route sans version
      skipAuth: true // Route publique
    });
    return response.data;
  }
}
