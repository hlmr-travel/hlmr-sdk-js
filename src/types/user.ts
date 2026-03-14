/**
 * Types pour le module utilisateur
 */

/**
 * Email dans le profil utilisateur
 */
export interface UserEmail {
  email: string;
  is_verified: boolean;
  is_primary: boolean;
  verified_at?: string;
}

/**
 * Téléphone dans le profil utilisateur
 */
export interface UserPhone {
  number: string;
  is_verified: boolean;
  is_primary: boolean;
  verified_at?: string;
}

/**
 * Identité de l'utilisateur (données personnelles)
 */
export interface UserIdentity {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  gender?: string;
}

/**
 * Profil utilisateur (routes publiques uniquement)
 */
export interface UserProfile {
  /** ID unique de l'utilisateur */
  id: string;

  /** Nom public (ex: "Cédric T.") */
  public_name: string;

  /** Nom d'affichage personnalisé */
  display_name?: string;

  /** Avatar URL */
  avatar_url?: string;

  /** Emails */
  emails: UserEmail[];

  /** Téléphones */
  phones: UserPhone[];

  /** Identité */
  identity: UserIdentity;

  /** Identité vérifiée */
  identity_verified: boolean;

  /** Identité verrouillée (non modifiable en self-service) */
  identity_locked: boolean;

  /** Rôle */
  role?: string;

  /** Badge fondateur */
  is_founder: boolean;

  /** Statut du compte */
  status?: string;

  /** Date de création du compte */
  created_at: string;

  /** Dernière mise à jour */
  updated_at: string;

  /** Suppression logique */
  deleted_at?: string;

  /** Dernier sync Supabase */
  synced_from_supabase_at?: string;
}

/**
 * Paramètres pour mettre à jour le profil utilisateur
 */
export interface ProfileUpdateParams {
  display_name?: string;
  identity?: Partial<UserIdentity>;
}

/**
 * Settings utilisateur pour une app
 */
export interface UserSettings {
  /** ID de l'utilisateur */
  user_id: string;
  
  /** ID de l'app */
  app_id: string;
  
  /** Settings de l'utilisateur */
  settings: {
    /** Code langue (ex: 'fr', 'en') */
    locale?: string;
    
    /** Timezone (ex: 'Europe/Paris') */
    defaultTimezone?: string;
    
    /** Code pays (ex: 'FR') */
    country_code?: string;
    
    /** Autres settings spécifiques à l'app */
    [key: string]: any;
  };
  
  /** Date de création */
  created_at?: string;
  
  /** Date de dernière mise à jour */
  updated_at?: string;
}









