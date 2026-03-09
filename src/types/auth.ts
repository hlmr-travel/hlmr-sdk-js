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

/**
 * Réponse de l'échange d'un redirect_token contre les vrais tokens
 */
export interface ExchangeRedirectTokenResponse {
  /** JWT access token */
  access_token: string;
  /** Refresh token pour renouveler la session */
  refresh_token: string;
  /** Type de token (toujours "Bearer") */
  token_type: string;
  /** Durée de validité en secondes */
  expires_in: number;
  /** Si true, les scopes ont été recalculés côté serveur — le client doit refreshSession() après setSession() */
  scopes_refreshed: boolean;
}









