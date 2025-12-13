/**
 * Client principal du SDK Mira
 * Version publique - Routes publiques uniquement
 */

import type {
  HlmrClientOptions,
  HlmrClientConfig,
  Environment
} from '../types/common';
import { ENVIRONMENTS } from '../types/common';
import { HlmrApiError } from '../types/errors';
import { HttpClient } from '../utils/http';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { SystemModule } from '../modules/system';
import { AppsModule } from '../modules/apps';
import { EventsModule } from '../modules/events';
import type { EventsModuleConfig } from '../types/events';

/**
 * Client principal pour l'API Mira (routes publiques)
 */
export class HlmrClient {
  private httpClient: HttpClient;
  
  /** Module d'authentification */
  public readonly auth: AuthModule;
  
  /** Module utilisateur */
  public readonly user: UserModule;
  
  /** Module système */
  public readonly system: SystemModule;
  
  /** Module applications */
  public readonly apps: AppsModule;
  
  /** Module événements temps réel (WebSocket) */
  public readonly events: EventsModule;

  constructor(options: HlmrClientOptions & { eventsConfig?: EventsModuleConfig }) {
    const config = this.buildConfig(options);
    this.httpClient = new HttpClient(config);
    
    // Initialiser les modules
    this.auth = new AuthModule(this.httpClient);
    this.user = new UserModule(this.httpClient);
    this.system = new SystemModule(this.httpClient);
    this.apps = new AppsModule(this.httpClient);
    this.events = new EventsModule(this.httpClient, options.eventsConfig);
  }

  /**
   * Construire la configuration du client
   */
  private buildConfig(options: HlmrClientOptions): HlmrClientConfig {
    let baseUrl: string;

    // Déterminer l'URL de base
    if (typeof options.environment === 'string') {
      const env = (ENVIRONMENTS as any)[options.environment];
      if (!env) {
        throw HlmrApiError.configError(`Unknown environment: ${options.environment}`);
      }
      baseUrl = env.url;
    } else if (options.environment && typeof options.environment === 'object') {
      baseUrl = options.environment.url;
    } else {
      // Défaut: production
      baseUrl = (ENVIRONMENTS as any).production.url;
    }

    // Valider l'appId
    if (!options.appId || typeof options.appId !== 'string') {
      throw HlmrApiError.configError('appId is required and must be a string');
    }

    return {
      baseUrl,
      appId: options.appId,
      bearerToken: options.bearerToken,
      appSecret: options.appSecret,
      timeout: options.config?.timeout || 30000,
      customHeaders: options.config?.customHeaders || {},
      debug: options.config?.debug || false
    };
  }

  /**
   * Mettre à jour le token Bearer
   */
  setBearerToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw HlmrApiError.configError('Bearer token must be a non-empty string');
    }
    this.httpClient.setBearerToken(token);
  }

  /**
   * Supprimer le token Bearer
   */
  clearBearerToken(): void {
    this.httpClient.clearBearerToken();
  }

  /**
   * Mettre à jour le secret de l'application
   */
  setAppSecret(secret: string): void {
    if (!secret || typeof secret !== 'string') {
      throw HlmrApiError.configError('App secret must be a non-empty string');
    }
    this.httpClient.setAppSecret(secret);
  }

  /**
   * Supprimer le secret de l'application
   */
  clearAppSecret(): void {
    this.httpClient.clearAppSecret();
  }

  /**
   * Récupérer la configuration actuelle
   */
  getConfig(): Partial<HlmrClientConfig> {
    // Retourner une copie sans le token pour des raisons de sécurité
    return {
      baseUrl: this.httpClient['config'].baseUrl,
      appId: this.httpClient['config'].appId,
      timeout: this.httpClient['config'].timeout,
      customHeaders: { ...this.httpClient['config'].customHeaders },
      debug: this.httpClient['config'].debug
    };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(updates: Partial<Omit<HlmrClientConfig, 'baseUrl' | 'appId'>>): void {
    this.httpClient.updateConfig(updates);
  }

  /**
   * Activer/désactiver le mode debug
   */
  setDebug(enabled: boolean): void {
    this.httpClient.updateConfig({ debug: enabled });
  }

  /**
   * Créer une instance pour un environnement spécifique
   */
  static forEnvironment(
    environment: keyof typeof ENVIRONMENTS,
    appId: string,
    bearerToken?: string
  ): HlmrClient {
    return new HlmrClient({
      environment,
      appId,
      bearerToken
    });
  }

  /**
   * Créer une instance pour la production
   * @param appId ID de l'application (défaut: 'default' pour les composants système)
   * @param bearerToken Token d'authentification optionnel
   */
  static forProduction(appId: string = 'default', bearerToken?: string): HlmrClient {
    return HlmrClient.forEnvironment('production', appId, bearerToken);
  }

  /**
   * Créer une instance pour le développement
   * @param appId ID de l'application (défaut: 'default' pour les composants système)
   * @param bearerToken Token d'authentification optionnel
   */
  static forDevelopment(appId: string = 'default', bearerToken?: string): HlmrClient {
    return HlmrClient.forEnvironment('development', appId, bearerToken);
  }

  /**
   * Créer une instance pour le staging
   * @param appId ID de l'application (défaut: 'default' pour les composants système)
   * @param bearerToken Token d'authentification optionnel
   */
  static forStaging(appId: string = 'default', bearerToken?: string): HlmrClient {
    return HlmrClient.forEnvironment('staging', appId, bearerToken);
  }

  /**
   * Faire une requête directe vers une URL complète (pour appels externes)
   * Utile pour vérifier des services externes, health checks, etc.
   * 
   * @param url URL complète (ex: http://service:3000/ready)
   * @param method Méthode HTTP (défaut: GET)
   * @param body Corps de la requête (optionnel)
   * @param options Options de requête (timeout, headers, etc.)
   */
  async directRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: any,
    options?: { timeout?: number; headers?: Record<string, string> }
  ) {
    return this.httpClient.directRequest<T>(url, method, body, options);
  }

  /**
   * Faire une requête GET vers un endpoint de l'API
   * @param path Chemin relatif (ex: /chats/, /chats/{id})
   * @param options Options de requête (headers, timeout, apiVersion, etc.)
   */
  async get<T>(path: string, options?: import('../types/common').RequestOptions) {
    return this.httpClient.get<T>(path, options);
  }

  /**
   * Faire une requête POST vers un endpoint de l'API
   * @param path Chemin relatif (ex: /chats/)
   * @param body Corps de la requête
   * @param options Options de requête (headers, timeout, apiVersion, etc.)
   */
  async post<T>(path: string, body?: any, options?: import('../types/common').RequestOptions) {
    return this.httpClient.post<T>(path, body, options);
  }

  /**
   * Faire une requête PUT vers un endpoint de l'API
   * @param path Chemin relatif (ex: /chats/{id})
   * @param body Corps de la requête
   * @param options Options de requête (headers, timeout, apiVersion, etc.)
   */
  async put<T>(path: string, body?: any, options?: import('../types/common').RequestOptions) {
    return this.httpClient.put<T>(path, body, options);
  }

  /**
   * Faire une requête PATCH vers un endpoint de l'API
   * @param path Chemin relatif (ex: /chats/{id})
   * @param body Corps de la requête
   * @param options Options de requête (headers, timeout, apiVersion, etc.)
   */
  async patch<T>(path: string, body?: any, options?: import('../types/common').RequestOptions) {
    return this.httpClient.patch<T>(path, body, options);
  }

  /**
   * Faire une requête DELETE vers un endpoint de l'API
   * @param path Chemin relatif (ex: /chats/{id})
   * @param options Options de requête (headers, timeout, apiVersion, etc.)
   */
  async delete<T>(path: string, options?: import('../types/common').RequestOptions) {
    return this.httpClient.delete<T>(path, options);
  }
}
