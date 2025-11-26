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

  constructor(options: HlmrClientOptions) {
    const config = this.buildConfig(options);
    this.httpClient = new HttpClient(config);
    
    // Initialiser les modules
    this.auth = new AuthModule(this.httpClient);
    this.user = new UserModule(this.httpClient);
    this.system = new SystemModule(this.httpClient);
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
   */
  static forProduction(appId: string, bearerToken?: string): HlmrClient {
    return HlmrClient.forEnvironment('production', appId, bearerToken);
  }

  /**
   * Créer une instance pour le développement
   */
  static forDevelopment(appId: string, bearerToken?: string): HlmrClient {
    return HlmrClient.forEnvironment('development', appId, bearerToken);
  }

  /**
   * Créer une instance pour le staging
   */
  static forStaging(appId: string, bearerToken?: string): HlmrClient {
    return HlmrClient.forEnvironment('staging', appId, bearerToken);
  }
}
