/**
 * Tests pour les utilitaires JSend
 */

import {
  isJSendResponse,
  isJSendSuccess,
  isJSendFail,
  isJSendError,
  extractJSendData,
  createJSendSuccess,
  createJSendFail,
  createJSendError
} from '../../src/utils/jsend';

describe('JSend utilities', () => {
  describe('isJSendResponse', () => {
    it('should identify valid JSend responses', () => {
      expect(isJSendResponse({ status: 'success', data: {} })).toBe(true);
      expect(isJSendResponse({ status: 'fail', data: {} })).toBe(true);
      expect(isJSendResponse({ status: 'error', message: 'Error' })).toBe(true);
    });

    it('should reject invalid responses', () => {
      expect(isJSendResponse(null)).toBe(false);
      expect(isJSendResponse({})).toBe(false);
      expect(isJSendResponse({ status: 'invalid' })).toBe(false);
      expect(isJSendResponse('string')).toBe(false);
    });
  });

  describe('isJSendSuccess', () => {
    it('should identify success responses', () => {
      const response = { status: 'success' as const, data: { test: true } };
      expect(isJSendSuccess(response)).toBe(true);
    });

    it('should reject non-success responses', () => {
      expect(isJSendSuccess({ status: 'fail' as const, data: {} })).toBe(false);
      expect(isJSendSuccess({ status: 'error' as const, message: 'Error' })).toBe(false);
    });
  });

  describe('isJSendFail', () => {
    it('should identify fail responses', () => {
      const response = { status: 'fail' as const, data: { detail: 'Validation error' } };
      expect(isJSendFail(response)).toBe(true);
    });

    it('should reject non-fail responses', () => {
      expect(isJSendFail({ status: 'success' as const, data: {} })).toBe(false);
      expect(isJSendFail({ status: 'error' as const, message: 'Error' })).toBe(false);
    });
  });

  describe('isJSendError', () => {
    it('should identify error responses', () => {
      const response = { status: 'error' as const, message: 'Server error' };
      expect(isJSendError(response)).toBe(true);
    });

    it('should reject non-error responses', () => {
      expect(isJSendError({ status: 'success' as const, data: {} })).toBe(false);
      expect(isJSendError({ status: 'fail' as const, data: {} })).toBe(false);
    });
  });

  describe('extractJSendData', () => {
    it('should extract data from success response', () => {
      const response = { status: 'success' as const, data: { test: true } };
      expect(extractJSendData(response)).toEqual({ test: true });
    });

    it('should throw error for non-success response', () => {
      const response = { status: 'fail' as const, data: {} };
      expect(() => extractJSendData(response)).toThrow();
    });
  });

  describe('Factory functions', () => {
    it('should create success response', () => {
      const data = { test: true };
      const response = createJSendSuccess(data);
      
      expect(response.status).toBe('success');
      expect(response.data).toEqual(data);
    });

    it('should create fail response', () => {
      const response = createJSendFail('Validation error', { field: 'email' });
      
      expect(response.status).toBe('fail');
      expect(response.data.detail).toBe('Validation error');
      expect(response.data.field).toBe('email');
    });

    it('should create error response', () => {
      const response = createJSendError('Server error', 'SERVER_ERROR');
      
      expect(response.status).toBe('error');
      expect(response.message).toBe('Server error');
      expect(response.code).toBe('SERVER_ERROR');
    });

    it('should create error response without code', () => {
      const response = createJSendError('Server error');
      
      expect(response.status).toBe('error');
      expect(response.message).toBe('Server error');
      expect(response.code).toBeUndefined();
    });
  });
});

