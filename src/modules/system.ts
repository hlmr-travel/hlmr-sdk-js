/**
 * Module système pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type {
  SystemPingResponse,
  SystemPingOptions,
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
   * @param options Options pour le ping (idle, app, lat, lng, device)
   * @returns Informations de ping avec détails utilisateur/app
   */
  async ping(options?: SystemPingOptions): Promise<SystemPingResponse> {
    let path = 'ping';
    
    // Construire query string avec les paramètres fournis
    if (options) {
      const params = new URLSearchParams();
      
      if (options.idle !== undefined) {
        params.append('idle', String(options.idle));
      }
      if (options.app !== undefined) {
        params.append('app', String(options.app));
      }
      if (options.lat !== undefined) {
        params.append('lat', String(options.lat));
      }
      if (options.lng !== undefined) {
        params.append('lng', String(options.lng));
      }
      if (options.device !== undefined) {
        params.append('device', String(options.device));
      }
      
      const queryString = params.toString();
      if (queryString) {
        path = `${path}?${queryString}`;
      }
    }
    
    const response = await this.http.get<SystemPingResponse>(path, {
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

  /**
   * Vérifier le statut ready d'un service
   * 
   * @param serviceName Nom du service (sans suffixe -api)
   * @returns Réponse du health check
   */
  async checkServiceReady(serviceName: string): Promise<{ status: string }> {
    const response = await this.http.get<{ status: string }>(`ready/${serviceName}`, {
      apiVersion: '', // Route sans version
      skipAuth: true // Route publique
    });
    return response.data;
  }
}

