/**
 * Client Supabase unifié pour tous les frontends Hello Mira.
 *
 * Permet d'uniformiser la configuration Supabase et d'activer
 * l'auto-refresh des tokens sur toutes les applications.
 *
 * @example
 * ```typescript
 * // Dans une app cliente (chat-web, mira-sign, etc.)
 * import { getSupabaseClient } from '@hlmr/sdk-js'
 *
 * const supabase = getSupabaseClient(
 *   import.meta.env.VITE_SUPABASE_URL,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY,
 *   { detectSessionInUrl: false } // Géré manuellement via redirect_token
 * )
 *
 * // Après échange du redirect_token
 * await supabase.auth.setSession({ access_token, refresh_token })
 * ```
 *
 * @example
 * ```typescript
 * // Dans idp-front
 * import { getSupabaseClient } from '@hlmr/sdk-js'
 *
 * const supabase = getSupabaseClient(
 *   import.meta.env.VITE_SUPABASE_URL,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY,
 *   { detectSessionInUrl: true } // Supabase gère le callback
 * )
 * ```
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Options pour la configuration du client Supabase.
 */
export interface SupabaseClientOptions {
  /**
   * Si true, Supabase détecte automatiquement la session dans l'URL.
   * - `true` pour idp-front (Supabase gère le callback)
   * - `false` pour les autres apps (géré manuellement via redirect_token)
   * @default false
   */
  detectSessionInUrl?: boolean

  /**
   * Si true, la session est persistée dans le storage.
   * @default true
   */
  persistSession?: boolean

  /**
   * Si true, le token est automatiquement rafraîchi avant expiration.
   * @default true
   */
  autoRefreshToken?: boolean
}

// Instance singleton du client Supabase
let globalSupabaseClient: SupabaseClient | null = null

// Configuration utilisée pour créer le client (pour debug)
let currentConfig: { url: string; options: Required<SupabaseClientOptions> } | null = null

/**
 * Retourne une instance singleton du client Supabase.
 *
 * Le client est créé une seule fois et réutilisé pour toutes les requêtes.
 * L'URL et la clé anonyme doivent être passées explicitement (depuis les
 * variables d'environnement de l'app appelante).
 *
 * @param supabaseUrl - URL du projet Supabase (ex: import.meta.env.VITE_SUPABASE_URL)
 * @param supabaseAnonKey - Clé anonyme Supabase (ex: import.meta.env.VITE_SUPABASE_ANON_KEY)
 * @param options - Options de configuration auth
 * @returns Instance du client Supabase
 * @throws Error si URL ou anon key manquants
 */
export function getSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: SupabaseClientOptions
): SupabaseClient {
  // Retourner l'instance existante si déjà créée
  if (globalSupabaseClient) {
    return globalSupabaseClient
  }

  // Valider les paramètres requis
  if (!supabaseUrl) {
    throw new Error('Supabase URL is required. Pass import.meta.env.VITE_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Supabase anon key is required. Pass import.meta.env.VITE_SUPABASE_ANON_KEY')
  }

  // Appliquer les options avec valeurs par défaut
  const resolvedOptions: Required<SupabaseClientOptions> = {
    detectSessionInUrl: options?.detectSessionInUrl ?? false,
    persistSession: options?.persistSession ?? true,
    autoRefreshToken: options?.autoRefreshToken ?? true,
  }

  // Créer le client
  globalSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: resolvedOptions.detectSessionInUrl,
      persistSession: resolvedOptions.persistSession,
      autoRefreshToken: resolvedOptions.autoRefreshToken,
    },
  })

  // Stocker la config pour debug
  currentConfig = { url: supabaseUrl, options: resolvedOptions }

  return globalSupabaseClient
}

/**
 * Réinitialise le client Supabase singleton.
 *
 * Utile pour les tests ou pour recréer le client avec une config différente.
 * Après appel, le prochain `getSupabaseClient()` créera une nouvelle instance.
 */
export function resetSupabaseClient(): void {
  globalSupabaseClient = null
  currentConfig = null
}

/**
 * Retourne la configuration actuelle du client Supabase.
 *
 * Utile pour le debug. Ne retourne pas la clé anonyme pour des raisons de sécurité.
 *
 * @returns Configuration actuelle ou null si pas de client créé
 */
export function getSupabaseClientConfig(): { url: string; options: Required<SupabaseClientOptions> } | null {
  return currentConfig ? { ...currentConfig } : null
}
