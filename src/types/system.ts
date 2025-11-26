/**
 * Types pour le module système
 */

/**
 * Réponse du ping système
 */
export interface SystemPingResponse {
  /** Message de confirmation */
  message: string;
  
  /** Timestamp du ping */
  timestamp: string;
  
  /** Informations sur l'utilisateur authentifié */
  user?: {
    id: string;
    email: string;
  };
  
  /** Informations sur l'application */
  app?: {
    id: string;
    name: string;
  };
}

/**
 * Réponse de version système
 */
export interface SystemVersionResponse {
  /** Version de l'API */
  version: string;
  
  /** SHA du build */
  build_sha?: string;
  
  /** Date du build */
  build_date?: string;
  
  /** Environnement */
  environment?: string;
  
  /** Services disponibles */
  services?: string[];
}
