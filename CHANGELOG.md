# Changelog

## [1.0.0] - 2025-11-26

### Added
- SDK JavaScript officiel pour l'API Mira
- Support des routes publiques sécurisées uniquement
- Modules `auth`, `user`, et `system`
- Gestion d'erreurs robuste avec `HlmrApiError`
- Support multi-format : ESM, CommonJS, UMD
- Types TypeScript complets
- Tests unitaires avec Jest
- Documentation complète

### Features
- **Module Auth** : Validation OAuth redirect URI
- **Module User** : Récupération du profil utilisateur authentifié
- **Module System** : Health checks et version de l'API
- **Client HTTP** : Gestion automatique du format JSend
- **Environnements** : Support production, développement, staging
- **Configuration** : Timeout, headers personnalisés, mode debug

### Security
- Accès uniquement aux routes publiques et sécurisées
- Validation stricte des paramètres
- Gestion sécurisée des tokens Bearer

### Documentation
- README complet avec exemples
- Guide d'implémentation
- Documentation des types TypeScript
- Exemples d'usage pour chaque module
