# hlmr-sdk-js

SDK JavaScript/TypeScript public pour l'API Mira. Point d'acces unique pour tous les frontends.

## Stack
- TypeScript 5, Rollup (build), Jest (tests)
- Outputs : ESM, CJS, UMD + types
- Publie sur npm : `@hlmr/sdk-js`

## Entry points
- `src/index.ts` → exports publics
- `src/modules/` → un module par service (events, apps, chats, users, terms...)
- `src/types/` → types partages
- `src/utils/` → utilitaires

## Modules cles
- **EventsModule** : WebSocket, subscriptions par domaine/resource, `system_notification`, auto-reconnect
- **AppsModule** : install/uninstall apps, scopes
- **AuthModule** : bearerToken, refresh
- Chaque module correspond a un microservice backend

## Types importants
- `SystemNotification.domain` est `string` (pas seulement `'system'`) car les targeted notifications peuvent venir de n'importe quel domaine (ex: `'apps'`)

## IMPORTANT
- Ce SDK est utilise par chat-web, mira-sign, console-dev, idp-front
- AVANT d'ajouter un `fetch` direct dans un frontend, VERIFIER si un module/methode existe ici
- Peer dependency sur `@supabase/supabase-js`
- `hlmr-sdk-js-internal` etend ce SDK avec les routes admin

## Build
```
npm ci && npm run build
```
Outputs dans `dist/` (cjs/, esm/, umd/, types/)
