---
name: create-page
description: Cree une page Next.js App Router avec layout, loading, error et composants
argument-hint: "[route] [description]"
user-invocable: true
---

# Workflow Creation Page Next.js

Creer page: **$ARGUMENTS**

## Phase 1: Analyse

### 1.1 Determiner le type de page

| Question | Impact |
|----------|--------|
| Page publique ou protegee? | Middleware auth |
| Data fetching necessaire? | Server Component vs Client |
| Interactions utilisateur? | 'use client' directive |
| SEO important? | generateMetadata() |

### 1.2 Identifier les composants

- Composants existants reutilisables?
- Nouveaux composants a creer?
- Composants locaux (`_components/`) vs partages (`components/`)?

### 1.3 Consulter agents si necessaire

- `ux-copywriter` pour le copy de la page
- `supabase-expert` si data fetching complexe

## Phase 2: Structure

### 2.1 Creer la structure de fichiers

```
src/app/[route]/
├── page.tsx           # Page principale
├── layout.tsx         # Layout (optionnel, si nested)
├── loading.tsx        # Loading skeleton
├── error.tsx          # Error boundary
├── not-found.tsx      # 404 (optionnel)
└── _components/       # Composants locaux
    ├── ComponentA.tsx
    └── ComponentB.tsx
```

### 2.2 Template page.tsx (Server Component)

```typescript
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
// Import composants...

export const metadata: Metadata = {
  title: '[Page Title] | MuchLove',
  description: '[Description SEO]'
}

export default async function [PageName]Page() {
  // Data fetching (server-side)
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">[Title]</h1>
      {/* Content */}
    </main>
  )
}
```

### 2.3 Template page.tsx (Client Component)

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// Import composants...

export default function [PageName]Page() {
  const [state, setState] = useState()

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8">[Title]</h1>
      {/* Content */}
    </motion.main>
  )
}
```

### 2.4 Template loading.tsx

```typescript
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skeleton matching page structure */}
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  )
}
```

### 2.5 Template error.tsx

```typescript
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">
        We're sorry, but something unexpected happened.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
      >
        Try again
      </button>
    </div>
  )
}
```

## Phase 3: Implementation

### 3.1 Page principale

1. Implementer la structure de base
2. Ajouter le data fetching si necessaire
3. Implementer les interactions utilisateur

### 3.2 Composants locaux

Pour chaque composant dans `_components/`:

```typescript
// _components/ComponentName.tsx
interface ComponentNameProps {
  // Props typees
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    // JSX
  )
}
```

### 3.3 Styles avec Tailwind

- Mobile-first (`sm:`, `md:`, `lg:`)
- Classes utilitaires groupees logiquement
- Extraire en composants si repetition

### 3.4 Animations avec Framer Motion

```typescript
import { motion } from 'framer-motion'

// Page transition
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

## Phase 4: Protection (si page privee)

### 4.1 Verifier auth dans page

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ... rest of page
}
```

### 4.2 Ou via middleware (recommande)

```typescript
// src/middleware.ts
const protectedRoutes = ['/dashboard', '/settings']

export async function middleware(request: NextRequest) {
  // ... existing code

  const { data: { user } } = await supabase.auth.getUser()

  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}
```

## Phase 5: Verification

### 5.1 Quality checks

```bash
npm run lint
npm run type-check
npm run build
```

### 5.2 Test manuel

- [ ] Page s'affiche correctement
- [ ] Loading skeleton visible pendant chargement
- [ ] Error boundary fonctionne
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Animations fluides

### 5.3 Accessibilite

- [ ] Headings hierarchiques (h1 > h2 > h3)
- [ ] Alt text sur images
- [ ] Focus visible sur elements interactifs
- [ ] Contraste suffisant

## Phase 6: Commit

```bash
git add src/app/[route]/
git commit -m "feat(pages): add [route] page"
```

## Checklist Finale

- [ ] page.tsx cree avec metadata SEO
- [ ] loading.tsx avec skeleton adapte
- [ ] error.tsx avec message user-friendly
- [ ] Composants locaux dans _components/
- [ ] Protection auth si necessaire
- [ ] Responsive design
- [ ] Animations Framer Motion
- [ ] Lint + Type-check OK
- [ ] Test manuel effectue
