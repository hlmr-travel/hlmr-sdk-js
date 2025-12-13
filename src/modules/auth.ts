/**
 * Module d'authentification pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type {
  AuthValidateRedirectRequest,
  AuthValidateRedirectResponse
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
}









