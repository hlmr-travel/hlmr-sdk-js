/**
 * Types pour le module système
 */

/**
 * Options pour le ping système
 */
export interface SystemPingOptions {
  /** Temps d'inactivité en secondes */
  idle?: string | number;
  
  /** ID de l'application */
  app?: string;
  
  /** Latitude GPS */
  lat?: string | number;
  
  /** Longitude GPS */
  lng?: string | number;
  
  /** Type d'appareil */
  device?: string;
}

/**
 * Réponse du ping système
 */
export interface SystemPingResponse {
  /** Statut d'authentification */
  authenticated: boolean;
  
  /** ID de l'utilisateur */
  user_id: string;
  
  /** ID de l'application */
  app_id: string;
  
  /** ID de session Supabase (depuis JWT) */
  session_id?: string;
  
  /** Scopes disponibles pour l'utilisateur */
  scopes: string[];
  
  /** Timestamp du ping */
  timestamp: string;
  
  /** Temps d'inactivité en secondes (si fourni) */
  idle_seconds?: number;
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



