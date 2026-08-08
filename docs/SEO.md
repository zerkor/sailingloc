# SEO SailingLoc

## État actuel

SailingLoc est une application React/Vite rendue côté client. Le code source HTML initial contient surtout le conteneur React, ce qui est normal pour une SPA mais moins performant pour un référencement naturel strict qu'un rendu serveur.

## Corrections mises en place

- Gestion dynamique des balises avec `react-helmet-async`.
- Titres et descriptions uniques pour les pages principales.
- Métadonnées Open Graph et Twitter Card.
- URL canoniques publiques.
- Pages admin, propriétaire et légales en `noindex`.
- Fiches bateaux avec titre, meta description, H1 et JSON-LD `Product`.
- Slugs bateaux sans accents ni caractères spéciaux.
- Anciennes URLs par identifiant conservées en fallback.

## Limite MVP

React Helmet améliore le DOM final vu par le navigateur, mais ne transforme pas la SPA en SSR. Pour un référencement production plus robuste, les pages publiques critiques devraient être migrées vers Next.js/SSR, Astro ou une stratégie de prerendering.

## Sitemap et robots

Le sitemap statique référence les pages publiques principales. En production complète, il faudrait générer dynamiquement les fiches bateaux approuvées avec leurs slugs.
