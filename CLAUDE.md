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

## Supabase Setup

1. Copy `.env.example` to `.env.local`
2. Add your Supabase URL and anon key
3. Generate types: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`

## Setup Status

**Completed:**
- Next.js 16 + React 19 + TypeScript strict
- Tailwind CSS 4 + Framer Motion
- Supabase SSR client setup
- Vitest + Playwright configured
- Zod installed
- Project structure created
- ESLint + Testing Library configured

**Next step:** Configure `.env.local` with Supabase credentials, then define product features.
