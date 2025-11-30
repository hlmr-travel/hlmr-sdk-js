/**
 * Module utilisateur pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type { UserProfile } from '../types/user';

/**
 * Module utilisateur
 */
export class UserModule {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer le profil de l'utilisateur authentifié
   * 
   * @returns Profil utilisateur basique
   */
  async getProfile(): Promise<UserProfile> {
    const response = await this.http.get<UserProfile>('users/profile');
    return response.data;
  }
}

