/**
 * Types pour le module d'authentification
 */

/**
 * Requête de validation de redirect URI OAuth
 */
export interface AuthValidateRedirectRequest {
  /** ID de l'application cliente */
  app_id: string;
  
  /** URI de redirection à valider */
  redirect_uri: string;
}

/**
 * Réponse de validation de redirect URI OAuth
 */
export interface AuthValidateRedirectResponse {
  /** Indique si la validation a réussi */
  valid: boolean;
  
  /** Détails de l'application si valide */
  app?: {
    id: string;
    name: string;
    base_url: string;
    hosts: string[];
  };
  
  /** Message d'erreur si invalide */
  error?: string;
}









