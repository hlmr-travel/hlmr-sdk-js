/**
 * Types communs pour le SDK Mira
 */

/**
 * Configuration d'environnement
 */
export interface Environment {
  name: string;
  url: string;
  description?: string;
}

/**
 * Environnements prédéfinis
 */
export const ENVIRONMENTS: Record<string, Environment> = {
  production: {
    name: 'production',
    url: 'https://api.hlmr.io',
    description: 'Environnement de production'
  },
  development: {
    name: 'development', 
    url: 'https://api.dev.hlmr.io',
    description: 'Environnement de développement'
  },
  staging: {
    name: 'staging',
    url: 'https://api.stg.hlmr.io', 
    description: 'Environnement de staging'
  }
};

/**
 * Configuration du client Mira
 */
export interface HlmrClientConfig {
  /** URL de base de l'API (ex: https://api.hlmr.io) */
  baseUrl: string;
  
  /** ID de l'application (requis pour X-App-ID header) */
  appId: string;
  
  /** Token d'authentification Bearer (optionnel, peut être défini plus tard) */
  bearerToken?: string | undefined;
  
  /** Timeout pour les requêtes en millisecondes (défaut: 30000) */
  timeout?: number | undefined;
  
  /** Headers personnalisés à ajouter à toutes les requêtes */
  customHeaders?: Record<string, string>;
  
  /** Activer les logs de debug (défaut: false) */
  debug?: boolean | undefined;
}

/**
 * Options pour créer un client Mira
 */
export interface HlmrClientOptions {
  /** Environnement prédéfini ou configuration personnalisée */
  environment?: string | Environment;
  
  /** ID de l'application */
  appId: string;
  
  /** Token d'authentification Bearer */
  bearerToken?: string | undefined;
  
  /** Configuration avancée */
  config?: Partial<Omit<HlmrClientConfig, 'baseUrl' | 'appId'>>;
}

/**
 * Options pour les requêtes HTTP
 */
export interface RequestOptions {
  /** Headers supplémentaires pour cette requête */
  headers?: Record<string, string>;
  
  /** Timeout spécifique pour cette requête */
  timeout?: number;
  
  /** Désactiver l'authentification pour cette requête */
  skipAuth?: boolean;
  
  /** Version de l'API à utiliser (défaut: v1) */
  apiVersion?: string;
}

/**
 * Réponse HTTP brute
 */
export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}
