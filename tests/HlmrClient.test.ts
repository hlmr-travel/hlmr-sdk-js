/**
 * Tests pour HlmrClient
 */

import { HlmrClient } from '../src/client/HlmrClient';
import { HlmrApiError } from '../src/types/errors';
import { ENVIRONMENTS } from '../src/types/common';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HlmrClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Construction', () => {
    it('should create client with environment string', () => {
      const client = new HlmrClient({
        environment: 'production',
        appId: 'test-app'
      });

      const config = client.getConfig();
      expect(config.baseUrl).toBe(ENVIRONMENTS.production.url);
      expect(config.appId).toBe('test-app');
    });

    it('should create client with custom environment', () => {
      const customEnv = {
        name: 'custom',
        url: 'https://api.custom.com'
      };

      const client = new HlmrClient({
        environment: customEnv,
        appId: 'test-app'
      });

      const config = client.getConfig();
      expect(config.baseUrl).toBe(customEnv.url);
    });

    it('should use production as default environment', () => {
      const client = new HlmrClient({
        appId: 'test-app'
      });

      const config = client.getConfig();
      expect(config.baseUrl).toBe(ENVIRONMENTS.production.url);
    });

    it('should throw error for invalid environment', () => {
      expect(() => {
        new HlmrClient({
          environment: 'invalid',
          appId: 'test-app'
        });
      }).toThrow(HlmrApiError);
    });

    it('should throw error for missing appId', () => {
      expect(() => {
        new HlmrClient({
          environment: 'production'
        } as any);
      }).toThrow(HlmrApiError);
    });
  });

  describe('Static factory methods', () => {
    it('should create production client', () => {
      const client = HlmrClient.forProduction('test-app', 'token');
      const config = client.getConfig();
      expect(config.baseUrl).toBe(ENVIRONMENTS.production.url);
    });

    it('should create development client', () => {
      const client = HlmrClient.forDevelopment('test-app');
      const config = client.getConfig();
      expect(config.baseUrl).toBe(ENVIRONMENTS.development.url);
    });

    it('should create staging client', () => {
      const client = HlmrClient.forStaging('test-app');
      const config = client.getConfig();
      expect(config.baseUrl).toBe(ENVIRONMENTS.staging.url);
    });
  });

  describe('Token management', () => {
    let client: HlmrClient;

    beforeEach(() => {
      client = new HlmrClient({
        environment: 'production',
        appId: 'test-app'
      });
    });

    it('should set bearer token', () => {
      expect(() => client.setBearerToken('new-token')).not.toThrow();
    });

    it('should throw error for invalid token', () => {
      expect(() => client.setBearerToken('')).toThrow(HlmrApiError);
      expect(() => client.setBearerToken(null as any)).toThrow(HlmrApiError);
    });

    it('should clear bearer token', () => {
      client.setBearerToken('token');
      expect(() => client.clearBearerToken()).not.toThrow();
    });
  });

  describe('Configuration', () => {
    let client: HlmrClient;

    beforeEach(() => {
      client = new HlmrClient({
        environment: 'production',
        appId: 'test-app',
        config: {
          timeout: 5000,
          debug: true
        }
      });
    });

    it('should return config without token', () => {
      client.setBearerToken('secret-token');
      const config = client.getConfig();
      
      expect(config).not.toHaveProperty('bearerToken');
      expect(config.timeout).toBe(5000);
      expect(config.debug).toBe(true);
    });

    it('should update config', () => {
      client.updateConfig({ timeout: 10000 });
      const config = client.getConfig();
      expect(config.timeout).toBe(10000);
    });

    it('should set debug mode', () => {
      client.setDebug(false);
      const config = client.getConfig();
      expect(config.debug).toBe(false);
    });
  });

  describe('Modules', () => {
    let client: HlmrClient;

    beforeEach(() => {
      client = new HlmrClient({
        environment: 'production',
        appId: 'test-app'
      });
    });

    it('should have auth module', () => {
      expect(client.auth).toBeDefined();
      expect(typeof client.auth.validateRedirect).toBe('function');
    });

    it('should have user module', () => {
      expect(client.user).toBeDefined();
      expect(typeof client.user.getProfile).toBe('function');
    });

    it('should have system module', () => {
      expect(client.system).toBeDefined();
      expect(typeof client.system.ping).toBe('function');
      expect(typeof client.system.version).toBe('function');
    });
  });
});




