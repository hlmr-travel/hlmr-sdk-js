/**
 * Utilitaires d'authentification pour les applications frontend
 * 
 * Fournit des fonctions pour gérer le logout avec nettoyage du cache
 * et blocage du retour arrière.
 */

/**
 * Options pour la fonction performLogout
 */
export interface LogoutOptions {
  /**
   * URL de redirection après logout
   * Si fournie, cette URL sera utilisée directement
   */
  redirectUrl?: string;
  
  /**
   * Callback pour nettoyer le cache spécifique à l'app (ex: React Query)
   * Sera appelé avant le nettoyage standard (localStorage, sessionStorage, cookies)
   */
  onClearCache?: () => void;
  
  /**
   * URL de base pour le logout IDP (ex: 'https://id.hello-mira.com')
   * Utilisé pour construire l'URL de logout OAuth si redirectUrl n'est pas fourni
   */
  idpBaseUrl?: string;
  
  /**
   * Client ID pour la redirection OAuth (ex: 'console')
   * Utilisé pour construire l'URL de logout OAuth si redirectUrl n'est pas fourni
   */
  clientId?: string;
  
  /**
   * Chemin du callback après login (ex: '/callback')
   * Utilisé pour construire l'URL de logout OAuth si redirectUrl n'est pas fourni
   */
  callbackPath?: string;
}

/**
 * Nettoie tout le cache (localStorage, sessionStorage, cookies)
 * 
 * @param onClearCache - Callback optionnel pour nettoyer le cache spécifique à l'app (ex: React Query)
 */
export function clearAllCache(onClearCache?: () => void): void {
  // Nettoyer le cache spécifique à l'app (ex: React Query)
  if (onClearCache) {
    try {
      onClearCache();
    } catch (e) {
      console.warn('[AuthUtils] Error clearing app-specific cache:', e);
    }
  }
  
  // Nettoyer localStorage
  try {
    localStorage.clear();
  } catch (e) {
    // Ignorer les erreurs (peut échouer en mode privé)
  }
  
  // Nettoyer sessionStorage
  try {
    sessionStorage.clear();
  } catch (e) {
    // Ignorer les erreurs (peut échouer en mode privé)
  }
  
  // Nettoyer tous les cookies
  try {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      // Supprimer le cookie pour tous les chemins et domaines possibles
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });
  } catch (e) {
    // Ignorer les erreurs
  }
}

/**
 * Bloque le retour arrière après logout
 * Utilise window.history.pushState et écoute popstate pour empêcher le retour
 */
export function preventBackNavigation(): void {
  // Ajouter une entrée dans l'historique pour empêcher le retour
  window.history.pushState(null, '', window.location.href);
  
  // Écouter les tentatives de retour arrière
  const handlePopState = () => {
    // Empêcher le retour en ajoutant à nouveau une entrée
    window.history.pushState(null, '', window.location.href);
  };
  
  window.addEventListener('popstate', handlePopState);
  
  // Nettoyer l'écouteur après 5 secondes (sécurité)
  setTimeout(() => {
    window.removeEventListener('popstate', handlePopState);
  }, 5000);
}

/**
 * Fonction complète de logout avec nettoyage du cache et blocage du retour arrière
 * 
 * @param options - Options de logout (redirection, callback cache, OAuth params)
 */
export function performLogout(options: LogoutOptions = {}): void {
  const {
    redirectUrl,
    onClearCache,
    idpBaseUrl,
    clientId,
    callbackPath
  } = options;

  // 1. Nettoyer tout le cache
  clearAllCache(onClearCache);
  
  // 2. Bloquer le retour arrière
  preventBackNavigation();
  
  // 3. Déterminer l'URL de redirection
  let finalRedirectUrl: string;
  
  if (redirectUrl) {
    // URL explicite fournie
    finalRedirectUrl = redirectUrl;
  } else if (idpBaseUrl && clientId && callbackPath) {
    // Flow OAuth : rediriger vers idp/logout qui redirigera vers login
    const finalLoginUrl = `${idpBaseUrl}/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.origin + callbackPath)}`;
    finalRedirectUrl = `${idpBaseUrl}/logout?redirect_uri=${encodeURIComponent(finalLoginUrl)}`;
  } else {
    // Fallback : rediriger vers /login
    finalRedirectUrl = '/login';
  }
  
  // 4. Rediriger
  window.location.replace(finalRedirectUrl);
}

