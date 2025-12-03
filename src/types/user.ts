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



