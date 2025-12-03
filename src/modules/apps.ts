/**
 * Module de gestion des applications pour le SDK public
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';

/**
 * Options pour le log de session
 */
export interface LogSessionOptions {
  /** ID de session Supabase (depuis JWT) */
  session_id?: string;
  
  /** Temps d'inactivité en secondes */
  idle_seconds?: number;
  
  /** Plateforme (web, mobile, etc.) */
  platform?: string;
  
  /** Version de l'app */
  app_version?: string;
  
  /** Autres métadonnées */
  [key: string]: any;
}

/**
 * Réponse du log de session
 */
export interface LogSessionResponse {
  /** ID de l'application */
  app_id: string;
  
  /** Indique si la session a été loggée */
  session_logged: boolean;
}

/**
 * Module de gestion des applications
 */
export class AppsModule {
  protected http: HttpClient;
  
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Logger une session d'utilisation d'une app
   * 
   * @param appId ID de l'application
   * @param extras Métadonnées supplémentaires (session_id, idle_seconds, platform, etc.)
   * @returns Confirmation du log de session
   */
  async logSession(appId: string, extras?: LogSessionOptions): Promise<LogSessionResponse> {
    const response = await this.http.post<LogSessionResponse>(`apps/${appId}/sessions`, extras || {});
    return response.data;
  }
}

