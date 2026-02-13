# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MuchLove - SaaS B2B application built with the standard stack.

## Build & Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run test:coverage # Vitest with coverage
npm run e2e          # Playwright tests
npm run e2e:ui       # Playwright UI mode
```

## Tech Stack

- **Framework**: Next.js 16 / React 19 / TypeScript (strict)
- **Styling**: Tailwind CSS 4 / Framer Motion
- **Backend**: Supabase (Auth, DB, Storage, Realtime)
- **Validation**: Zod
- **Tests**: Vitest (unit) / Playwright (e2e)

## Architecture

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/
│   └── supabase/        # Supabase clients (client, server, middleware)
├── hooks/               # Custom React hooks
├── types/               # TypeScript types (database.ts for Supabase)
└── test/                # Test setup
e2e/                     # Playwright e2e tests
```

## Brand Voice & Copy Guidelines

**OBLIGATOIRE** : Tout texte visible par l'utilisateur doit respecter les guidelines de marque MuchLove.

- **Regles (auto-chargees)** : `.claude/rules/brand-voice.md` — 5 piliers, vocabulaire, blacklist, emojis
- **Reference complete** : `.claude/knowledge/ux-guidelines.md` — templates, exemples, contextes
- **Agent dedie** : `ux-copywriter` pour generation de copy

Principes cles :
- Voix = ami chaleureux et encourageant (jamais corporate)
- Emojis strategiques (1-2 max, signature = 💛)
- "You/your" toujours, "users" jamais
- Simplicite et chiffres concrets ("in 3 minutes", pas "streamlined")
- Couleurs : #FFBF00 (primary), #FF6B6B (secondary), #4ECDC4 (accent)

## Supabase Setup

1. Copy `.env.example` to `.env.local`
2. Add your Supabase URL and anon key
3. Generate types: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`

## Status

Scaffolding complet. Prochaine etape : configurer `.env.local` Supabase puis definir les features produit.
Voir `.claude/PROGRESS.md` pour le suivi detaille.
