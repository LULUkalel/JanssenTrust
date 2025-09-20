# JanssenTrust

## Structure
- `Janssen-ecosystem/` — Monorepo React (3 apps : crypto, superyachts, janssen-institute)
- `old_version/` — Ancien site statique (HTML + assets)

## Développement
- Lancer une app :  
  pnpm -C apps/superyachts dev  
  pnpm -C apps/crypto dev  
  pnpm -C apps/janssen-institute dev  

- Lancer toutes les apps en parallèle :  
  pnpm dev:all

## Build
- Individuel :  
  pnpm build:superyachts  
  pnpm build:crypto  
  pnpm build:institute  

- Build des 3 en une fois :  
  pnpm build:all

## Variables d’environnement
Chaque app a besoin d’un `.env.local` basé sur `.env.example` :

VITE_SUPABASE_URL=https://your-project.supabase.co  
VITE_SUPABASE_ANON_KEY=your-anon-key  

## Déploiement Netlify
- Base directory : repo root
- Build command :
  - Superyachts → pnpm install && pnpm build:superyachts
  - Crypto → pnpm install && pnpm build:crypto
  - Institute → pnpm install && pnpm build:institute
- Publish directory :
  - apps/superyachts/dist
  - apps/crypto/dist
  - apps/janssen-institute/dist
- Env variables :
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
