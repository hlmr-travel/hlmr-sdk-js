/**
 * Tests pour le module Auth
 */

import { AuthModule } from '../../src/modules/auth';
import { HttpClient } from '../../src/utils/http';
import type { AuthValidateRedirectResponse } from '../../src/types/auth';

// Mock HttpClient
jest.mock('../../src/utils/http');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('AuthModule', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let authModule: AuthModule;

  beforeEach(() => {
    httpClient = new MockHttpClient({} as any) as jest.Mocked<HttpClient>;
    authModule = new AuthModule(httpClient);
  });

  describe('validateRedirect', () => {
    it('should validate redirect URI successfully', async () => {
      const mockResponse: AuthValidateRedirectResponse = {
        valid: true,
        app: {
          id: 'test-app',
          name: 'Test App',
          base_url: 'https://test.com',
          hosts: ['test.com']
        }
      };

      httpClient.post.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: mockResponse
      });

      const result = await authModule.validateRedirect('test-app', 'https://test.com/callback');

      expect(httpClient.post).toHaveBeenCalledWith(
        'apps/test-app/validate-redirect',
        {
          app_id: 'test-app',
          redirect_uri: 'https://test.com/callback'
        },
        { skipAuth: true }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle validation failure', async () => {
      const mockResponse: AuthValidateRedirectResponse = {
        valid: false,
        error: 'Invalid redirect URI'
      };

      httpClient.post.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: mockResponse
      });

      const result = await authModule.validateRedirect('test-app', 'https://malicious.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid redirect URI');
    });
  });
});









