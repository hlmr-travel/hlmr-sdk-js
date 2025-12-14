/**
 * Module utilisateur pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type { UserProfile, UserSettings } from '../types/user';

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
    const response = await this.http.get<{ user: any }>('users/me');
    const userData = response.data.user;
    
    // Mapper les champs du backend vers le format SDK
    return {
      id: userData.user_id,
      email: userData.email || '',
      full_name: userData.display_name || userData.public_name,
      avatar_url: userData.avatar_url,
      user_metadata: userData.user_metadata || {},
      created_at: userData.created_at || '',
      updated_at: userData.updated_at || '',
      last_sign_in_at: userData.last_sign_in_at,
      email_confirmed_at: userData.email_verified ? userData.email_confirmed_at || userData.updated_at : undefined
    };
  }

  /**
   * Récupère les settings utilisateur pour une app (avec fallback sur "default")
   * 
   * @param appId ID de l'app (optionnel, utilise "default" si non fourni)
   * @returns Settings utilisateur ou null si non trouvés
   */
  async getSettings(appId?: string): Promise<UserSettings | null> {
    const targetAppId = appId || 'default';
    
    try {
      // Essayer d'abord avec l'appId fourni
      const response = await this.http.get<UserSettings>(`users/me/settings/${targetAppId}`);
      if (response.data && response.data.settings) {
        return response.data;
      }
    } catch (error: any) {
      // Si 404 et appId fourni, essayer avec "default"
      if (error.status === 404 && appId) {
        try {
          const defaultResponse = await this.http.get<UserSettings>('users/me/settings/default');
          if (defaultResponse.data && defaultResponse.data.settings) {
            return defaultResponse.data;
          }
        } catch {
          // Ignorer l'erreur, retourner null
        }
      }
    }
    
    return null;
  }

  /**
   * Met à jour les settings utilisateur
   * 
   * @param appId ID de l'app (ex: 'default', 'chat')
   * @param settings Settings à mettre à jour
   * @param options Options supplémentaires (applyAll pour propager à toutes les apps si appId='default')
   * @returns Résultat de la mise à jour
   */
  async updateSettings(
    appId: string,
    settings: Partial<UserSettings['settings']>,
    options?: { applyAll?: boolean }
  ): Promise<{ success: boolean; updated_apps?: string[] }> {
    const body: any = { ...settings };
    
    // Si appId est "default" et applyAll est true, ajouter le flag
    if (appId === 'default' && options?.applyAll) {
      body.apply_all = true;
    }
    
    const response = await this.http.patch<UserSettings & { updated_apps?: string[] }>(
      `users/me/settings/${appId}`,
      body
    );
    
    const result: { success: boolean; updated_apps?: string[] } = {
      success: true
    };
    
    if (response.data.updated_apps !== undefined) {
      result.updated_apps = response.data.updated_apps;
    }
    
    return result;
  }

  /**
   * Récupère la locale de l'utilisateur pour une app (avec fallback)
   * 
   * @param appId ID de l'app (optionnel, utilise "default" si non fourni)
   * @returns Code langue ou null si non trouvé
   */
  async getLocale(appId?: string): Promise<string | null> {
    const settings = await this.getSettings(appId);
    return settings?.settings?.locale || null;
  }
}









