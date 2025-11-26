/**
 * Types et classes d'erreur pour le SDK Mira
 */

/**
 * Format JSend pour les réponses API
 * @see https://github.com/omniti-labs/jsend
 */
export interface JSendResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
  code?: number | string;
}

/**
 * Réponse JSend de succès (2xx)
 */
export interface JSendSuccessResponse<T = any> {
  status: 'success';
  data: T;
}

/**
 * Réponse JSend d'échec validation (4xx)
 */
export interface JSendFailResponse {
  status: 'fail';
  data: {
    detail: string;
    [key: string]: any;
  };
}

/**
 * Réponse JSend d'erreur serveur (5xx)
 */
export interface JSendErrorResponse {
  status: 'error';
  message: string;
  code?: number | string;
}

/**
 * Erreur API Mira personnalisée
 */
export class HlmrApiError extends Error {
  public override readonly name = 'HlmrApiError';
  public readonly statusCode: number;
  public readonly code?: string | number | undefined;
  public readonly response?: JSendResponse | undefined;
  public readonly originalError?: Error | undefined;

  constructor(
    message: string,
    statusCode: number,
    code?: string | number,
    response?: JSendResponse,
    originalError?: Error
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.response = response;
    this.originalError = originalError;

    // Maintenir la stack trace correcte
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HlmrApiError);
    }
  }

  /**
   * Créer une erreur à partir d'une réponse JSend
   */
  static fromJSendResponse(
    response: JSendResponse,
    statusCode: number
  ): HlmrApiError {
    if (response.status === 'fail') {
      const failResponse = response as JSendFailResponse;
      return new HlmrApiError(
        failResponse.data.detail || 'Validation failed',
        statusCode,
        'VALIDATION_ERROR',
        response
      );
    }

    if (response.status === 'error') {
      const errorResponse = response as JSendErrorResponse;
      return new HlmrApiError(
        errorResponse.message || 'Server error',
        statusCode,
        errorResponse.code || 'SERVER_ERROR',
        response
      );
    }

    return new HlmrApiError(
      'Unknown API error',
      statusCode,
      'UNKNOWN_ERROR',
      response
    );
  }

  /**
   * Créer une erreur réseau
   */
  static networkError(originalError: Error): HlmrApiError {
    return new HlmrApiError(
      `Network error: ${originalError.message}`,
      0,
      'NETWORK_ERROR',
      undefined,
      originalError
    );
  }

  /**
   * Créer une erreur de timeout
   */
  static timeoutError(timeout: number): HlmrApiError {
    return new HlmrApiError(
      `Request timeout after ${timeout}ms`,
      0,
      'TIMEOUT_ERROR'
    );
  }

  /**
   * Créer une erreur de configuration
   */
  static configError(message: string): HlmrApiError {
    return new HlmrApiError(
      `Configuration error: ${message}`,
      0,
      'CONFIG_ERROR'
    );
  }

  /**
   * Vérifier si c'est une erreur d'authentification
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Vérifier si c'est une erreur de permissions
   */
  isPermissionError(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Vérifier si c'est une erreur de validation
   */
  isValidationError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500 && this.code === 'VALIDATION_ERROR';
  }

  /**
   * Vérifier si c'est une erreur serveur
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Vérifier si c'est une erreur réseau
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  /**
   * Vérifier si c'est une erreur de timeout
   */
  isTimeoutError(): boolean {
    return this.code === 'TIMEOUT_ERROR';
  }
}
