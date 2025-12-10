/**
 * SDK JavaScript officiel pour l'API Mira
 * Routes publiques uniquement - Version publique
 * 
 * @version 1.0.0
 * @author CES Venture (Hello Mira)
 */

// Client principal
export { HlmrClient } from './client/HlmrClient';

// Types publics
export type {
  HlmrClientConfig,
  HlmrClientOptions,
  Environment
} from './types/common';

export type {
  AuthValidateRedirectRequest,
  AuthValidateRedirectResponse
} from './types/auth';

export type {
  UserProfile
} from './types/user';

export type {
  SystemPingResponse,
  SystemPingOptions,
  SystemVersionResponse
} from './types/system';

export type {
  LogSessionOptions,
  LogSessionResponse
} from './modules/apps';

export { AppsModule } from './modules/apps';

// Classes d'erreur (valeurs)
export { HlmrApiError } from './types/errors';

// Types d'erreur
export type {
  JSendResponse,
  JSendSuccessResponse,
  JSendFailResponse,
  JSendErrorResponse
} from './types/errors';

export type {
  HttpClient
} from './utils/http';

// Utilitaires publics
export { isJSendResponse, isJSendSuccess, isJSendFail, isJSendError } from './utils/jsend';

// Utilitaires d'authentification
export { clearAllCache, preventBackNavigation, performLogout } from './utils/auth';
export type { LogoutOptions } from './utils/auth';

// Version du SDK
export const SDK_VERSION = '1.0.0';
export const SDK_NAME = 'hlmr-sdk-js';
