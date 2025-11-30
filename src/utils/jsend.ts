/**
 * Utilitaires pour le format JSend
 */

import type {
  JSendResponse,
  JSendSuccessResponse,
  JSendFailResponse,
  JSendErrorResponse
} from '../types/errors';

/**
 * Vérifier si une réponse suit le format JSend
 */
export function isJSendResponse(response: any): response is JSendResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.status === 'string' &&
    ['success', 'fail', 'error'].includes(response.status)
  );
}

/**
 * Vérifier si c'est une réponse JSend de succès
 */
export function isJSendSuccess<T = any>(
  response: JSendResponse
): response is JSendSuccessResponse<T> {
  return response.status === 'success' && 'data' in response;
}

/**
 * Vérifier si c'est une réponse JSend d'échec
 */
export function isJSendFail(
  response: JSendResponse
): response is JSendFailResponse {
  return response.status === 'fail' && 'data' in response;
}

/**
 * Vérifier si c'est une réponse JSend d'erreur
 */
export function isJSendError(
  response: JSendResponse
): response is JSendErrorResponse {
  return response.status === 'error' && 'message' in response;
}

/**
 * Extraire les données d'une réponse JSend de succès
 */
export function extractJSendData<T>(response: JSendResponse): T {
  if (isJSendSuccess<T>(response)) {
    return response.data;
  }
  
  throw new Error('Response is not a JSend success response');
}

/**
 * Créer une réponse JSend de succès
 */
export function createJSendSuccess<T>(data: T): JSendSuccessResponse<T> {
  return {
    status: 'success',
    data
  };
}

/**
 * Créer une réponse JSend d'échec
 */
export function createJSendFail(detail: string, additionalData?: Record<string, any>): JSendFailResponse {
  return {
    status: 'fail',
    data: {
      detail,
      ...additionalData
    }
  };
}

/**
 * Créer une réponse JSend d'erreur
 */
export function createJSendError(message: string, code?: string | number): JSendErrorResponse {
  return {
    status: 'error',
    message,
    ...(code && { code })
  };
}

