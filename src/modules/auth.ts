/**
 * Module d'authentification pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type {
  AuthValidateRedirectRequest,
  AuthValidateRedirectResponse,
  ExchangeRedirectTokenResponse
} from '../types/auth';

/**
 * Module d'authentification
 */
export class AuthModule {
  constructor(private http: HttpClient) {}

  /**
   * Valider un redirect URI OAuth pour une application
   *
   * @param appId ID de l'application cliente
   * @param redirectUri URI de redirection à valider
   * @returns Résultat de la validation
   */
  async validateRedirect(
    appId: string,
    redirectUri: string
  ): Promise<AuthValidateRedirectResponse> {
    const request: AuthValidateRedirectRequest = {
      app_id: appId,
      redirect_uri: redirectUri
    };

    const response = await this.http.post<AuthValidateRedirectResponse>(
      `apps/${appId}/validate-redirect`,
      request,
      { skipAuth: true } // Cette route est publique
    );

    return response.data;
  }

  /**
   * Échanger un redirect_token contre les vrais tokens (access_token + refresh_token).
   *
   * Après l'appel, le front doit :
   * 1. `await supabase.auth.setSession({ access_token, refresh_token })`
   * 2. Si `scopes_refreshed === true` : `await supabase.auth.refreshSession()`
   *    (les scopes ont été recalculés côté serveur, le JWT initial est stale)
   *
   * @param redirectToken Le redirect_token reçu dans le fragment de l'URL callback
   * @returns Tokens + flag scopes_refreshed
   */
  async exchangeRedirectToken(
    redirectToken: string
  ): Promise<ExchangeRedirectTokenResponse> {
    const response = await this.http.post<ExchangeRedirectTokenResponse>(
      'auth/exchange',
      { redirect_token: redirectToken },
      { skipAuth: true } // Pas de JWT avant l'échange
    );

    return {
      ...response.data,
      scopes_refreshed: response.data.scopes_refreshed === true,
    };
  }
}
