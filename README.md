# Mira SDK JavaScript (Public)

[![npm version](https://badge.fury.io/js/hlmr-sdk-js.svg)](https://badge.fury.io/js/hlmr-sdk-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SDK JavaScript officiel pour l'API Mira - Version publique avec routes sécurisées uniquement.

## 🚀 Installation

```bash
npm install hlmr-sdk-js
```

## 📖 Usage rapide

```typescript
import { HlmrClient } from 'hlmr-sdk-js';

// Créer un client pour la production
const mira = HlmrClient.forProduction('your-app-id', 'your-bearer-token');

// Ou avec configuration personnalisée
const mira = new HlmrClient({
  environment: 'production',
  appId: 'your-app-id',
  bearerToken: 'your-bearer-token'
});

// Utiliser les modules
try {
  // Validation OAuth
  const validation = await mira.auth.validateRedirect('app-id', 'https://app.com/callback');
  
  // Profil utilisateur
  const profile = await mira.user.getProfile();
  
  // Health check
  const ping = await mira.system.ping();
  
  console.log('User:', profile.email);
} catch (error) {
  if (error instanceof HlmrApiError) {
    console.error('API Error:', error.message, error.statusCode);
  }
}
```

## 🏗️ Architecture

### Modules disponibles

- **`auth`** - Authentification et validation OAuth
- **`user`** - Gestion du profil utilisateur
- **`system`** - Informations système et health checks

### Routes supportées (publiques uniquement)

| Module | Méthode | Route | Description |
|--------|---------|-------|-------------|
| `auth` | `validateRedirect()` | `POST /v1/apps/{app_id}/validate-redirect` | Validation OAuth redirect URI |
| `user` | `getProfile()` | `GET /v1/users/profile` | Profil utilisateur authentifié |
| `system` | `ping()` | `GET /ping` | Health check authentifié |
| `system` | `version()` | `GET /version` | Version de l'API |

## 🔧 Configuration

### Environnements prédéfinis

```typescript
// Production (défaut)
const client = HlmrClient.forProduction('app-id', 'token');

// Développement
const client = HlmrClient.forDevelopment('app-id', 'token');

// Staging
const client = HlmrClient.forStaging('app-id', 'token');
```

### Configuration personnalisée

```typescript
const client = new HlmrClient({
  environment: {
    name: 'custom',
    url: 'https://api.custom.com'
  },
  appId: 'your-app-id',
  bearerToken: 'your-token',
  config: {
    timeout: 30000,
    debug: true,
    customHeaders: {
      'X-Custom-Header': 'value'
    }
  }
});
```

## 🔐 Authentification

### Gestion du token Bearer

```typescript
// Définir le token
client.setBearerToken('new-token');

// Supprimer le token
client.clearBearerToken();

// Le token est automatiquement ajouté aux requêtes authentifiées
```

### Validation OAuth

```typescript
// Valider un redirect URI pour une application
const validation = await mira.auth.validateRedirect(
  'client-app-id',
  'https://app.com/oauth/callback'
);

if (validation.valid) {
  console.log('App:', validation.app?.name);
} else {
  console.error('Invalid redirect:', validation.error);
}
```

## 👤 Gestion utilisateur

```typescript
// Récupérer le profil utilisateur
const profile = await mira.user.getProfile();

console.log({
  id: profile.id,
  email: profile.email,
  fullName: profile.full_name,
  createdAt: profile.created_at
});
```

## 🔍 Monitoring système

```typescript
// Health check authentifié
const ping = await mira.system.ping();
console.log('Ping:', ping.message, ping.timestamp);

// Version de l'API (public)
const version = await mira.system.version();
console.log('API Version:', version.version);
```

## 🚨 Gestion d'erreurs

```typescript
import { HlmrApiError } from 'hlmr-sdk-js';

try {
  const profile = await mira.user.getProfile();
} catch (error) {
  if (error instanceof HlmrApiError) {
    // Erreur API structurée
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    // Vérifications spécifiques
    if (error.isAuthError()) {
      // Rediriger vers login
    } else if (error.isPermissionError()) {
      // Afficher message d'accès refusé
    } else if (error.isNetworkError()) {
      // Problème de connectivité
    }
  } else {
    // Erreur JavaScript standard
    console.error('Unexpected error:', error);
  }
}
```

### Types d'erreurs

- **`isAuthError()`** - Erreur d'authentification (401)
- **`isPermissionError()`** - Erreur de permissions (403)
- **`isValidationError()`** - Erreur de validation (4xx)
- **`isServerError()`** - Erreur serveur (5xx)
- **`isNetworkError()`** - Erreur réseau/connectivité
- **`isTimeoutError()`** - Timeout de requête

## 📦 Formats supportés

Le SDK est disponible dans plusieurs formats :

- **ESM** : `import { HlmrClient } from 'hlmr-sdk-js'`
- **CommonJS** : `const { HlmrClient } = require('hlmr-sdk-js')`
- **UMD** : `<script src="hlmr-sdk.min.js"></script>`

## 🔧 Configuration avancée

### Debug et logging

```typescript
const client = new HlmrClient({
  appId: 'app-id',
  config: {
    debug: true // Active les logs de debug
  }
});

// Ou dynamiquement
client.setDebug(true);
```

### Timeout personnalisé

```typescript
const client = new HlmrClient({
  appId: 'app-id',
  config: {
    timeout: 60000 // 60 secondes
  }
});

// Ou pour une requête spécifique
await mira.user.getProfile({ timeout: 10000 });
```

### Headers personnalisés

```typescript
const client = new HlmrClient({
  appId: 'app-id',
  config: {
    customHeaders: {
      'X-Client-Version': '1.0.0',
      'X-Feature-Flag': 'beta'
    }
  }
});
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🏗️ Build

```bash
# Build complet (ESM + CommonJS + UMD + Types)
npm run build

# Build en mode développement
npm run dev
```

## 📋 Prérequis

- **Node.js** >= 16.0.0
- **TypeScript** >= 5.0.0 (pour le développement)
- Support des **Promises/async-await**
- Support de **fetch** (natif dans les navigateurs modernes et Node.js 18+)

## 🔗 Liens utiles

- [Portail d'identité](https://id.hello-mira.com)

## 📄 Licence

MIT © CES Venture (Hello Mira)

## 🤝 Contribution

Ce SDK est maintenu par CES Venture (Hello Mira). Pour signaler des bugs ou proposer des améliorations, veuillez ouvrir une issue sur le repository GitHub.

---

**Note** : Ce SDK contient uniquement les routes publiques et sécurisées de l'API Mira.