/**
 * Types pour le module utilisateur
 */

/**
 * Profil utilisateur basique (routes publiques uniquement)
 */
export interface UserProfile {
  /** ID unique de l'utilisateur */
  id: string;
  
  /** Adresse email */
  email: string;
  
  /** Nom complet (optionnel) */
  full_name?: string;
  
  /** Avatar URL (optionnel) */
  avatar_url?: string;
  
  /** Métadonnées publiques */
  user_metadata?: {
    [key: string]: any;
  };
  
  /** Date de création du compte */
  created_at: string;
  
  /** Dernière mise à jour */
  updated_at: string;
  
  /** Dernière connexion */
  last_sign_in_at?: string;
  
  /** Email confirmé */
  email_confirmed_at?: string;
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









