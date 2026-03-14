/**
 * Module utilisateur pour le SDK Mira
 * Routes publiques uniquement
 */

import type { HttpClient } from '../utils/http';
import type { UserProfile, UserSettings, ProfileUpdateParams } from '../types/user';

/**
 * Map raw backend user response to UserProfile.
 */
function mapUserProfile(data: any): UserProfile {
  return {
    id: data._id || data.id,
    public_name: data.public_name || '',
    display_name: data.display_name,
    avatar_url: data.avatar_url,
    emails: data.emails || [],
    phones: data.phones || [],
    identity: data.identity || {},
    identity_verified: data.identity_verified ?? false,
    identity_locked: data.identity_locked ?? false,
    role: data.role,
    is_founder: data.is_founder ?? false,
    status: data.status,
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    deleted_at: data.deleted_at,
    synced_from_supabase_at: data.synced_from_supabase_at,
  };
}

/**
 * Module utilisateur
 */
export class UserModule {
  constructor(private http: HttpClient) {}

  /**
   * Récupérer le profil de l'utilisateur authentifié
   *
   * @returns Profil utilisateur
   */
  async getProfile(): Promise<UserProfile> {
    const response = await this.http.get<{ user: any }>('users/me');
    return mapUserProfile(response.data.user);
  }

  /**
   * Mettre à jour le profil de l'utilisateur authentifié (partial update)
   *
   * @param params Champs à mettre à jour (display_name, identity)
   * @returns Profil utilisateur mis à jour
   */
  async updateProfile(params: ProfileUpdateParams): Promise<UserProfile> {
    const response = await this.http.patch<{ user: any }>('users/me/profile', params);
    return mapUserProfile(response.data.user);
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









