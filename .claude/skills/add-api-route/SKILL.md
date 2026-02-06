---
name: add-api-route
description: Cree une API Route Next.js avec validation Zod et error handling
argument-hint: "[path] [method] [description]"
user-invocable: true
---

# Workflow Creation API Route

Creer route: **$ARGUMENTS**

## Phase 1: Design

### 1.1 Definir le contrat API

```typescript
// Input schema
const inputSchema = z.object({
  // Champs requis et optionnels
})

// Output schema
const outputSchema = z.object({
  success: z.boolean(),
  data: z.object({/* ... */}).optional(),
  error: z.string().optional()
})

// Codes HTTP utilises
// 200 - Success
// 201 - Created
// 400 - Bad Request (validation)
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 500 - Internal Server Error
```

### 1.2 Determiner les requirements

| Question | Impact |
|----------|--------|
| Auth requise? | Verifier session |
| Rate limiting? | Headers, middleware |
| CORS? | Headers response |
| Idempotent? | PUT vs POST |

### 1.3 Consulter agents si necessaire

- `security-auditor` si donnees sensibles
- `supabase-expert` si operations DB complexes

## Phase 2: Implementation

### 2.1 Creer le fichier route

Fichier: `src/app/api/[path]/route.ts`

### 2.2 Template GET

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check (si necessaire)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse query params
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    // 3. Fetch data
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    // 4. Return response
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2.3 Template POST

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const inputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  // autres champs...
})

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate body
    const body = await request.json()
    const validated = inputSchema.parse(body)

    // 2. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3. Business logic
    const { data, error } = await supabase
      .from('table')
      .insert({
        ...validated,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    // 4. Return response
    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )

  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2.4 Template PUT/PATCH

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  // Tous les champs optionnels pour PATCH
  name: z.string().min(1).optional(),
  // ...
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateSchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifier ownership
    const { data: existing } = await supabase
      .from('table')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Update
    const { data, error } = await supabase
      .from('table')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 2.5 Template DELETE

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifier ownership et supprimer
    const { error } = await supabase
      .from('table')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)  // RLS additionnel

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Phase 3: Route Dynamique

### 3.1 Structure pour ID dynamique

```
src/app/api/[resource]/
├── route.ts           # GET (list), POST (create)
└── [id]/
    └── route.ts       # GET (single), PATCH, DELETE
```

### 3.2 Parametres dynamiques

```typescript
// src/app/api/contacts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  // ...
}
```

## Phase 4: Securite

### 4.1 Validation stricte

- Toujours valider avec Zod
- Ne jamais faire confiance aux inputs
- Sanitizer si necessaire (HTML, SQL)

### 4.2 Auth systematique

```typescript
// Pattern auth standard
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 4.3 Rate limiting (optionnel)

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

// Dans la route
const ip = request.ip ?? '127.0.0.1'
const { success } = await ratelimit.limit(ip)

if (!success) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

## Phase 5: Verification

### 5.1 Test avec curl

```bash
# GET
curl http://localhost:3000/api/[path]

# POST
curl -X POST http://localhost:3000/api/[path] \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Avec auth (cookie de session)
curl http://localhost:3000/api/[path] \
  -H "Cookie: sb-access-token=..."
```

### 5.2 Quality checks

```bash
npm run lint
npm run type-check
```

### 5.3 Securite check

Si donnees sensibles, consulter `security-auditor`:
- [ ] Validation inputs complete
- [ ] Auth verifie
- [ ] Pas d'injection SQL possible
- [ ] Pas de secrets exposes

## Phase 6: Documentation

### 6.1 Documenter l'API

```typescript
/**
 * POST /api/contacts
 *
 * Create a new contact for the authenticated company.
 *
 * @body {string} firstName - Contact's first name
 * @body {string} email - Contact's email
 * @body {string} companyName - Contact's company
 *
 * @returns {201} Created contact
 * @returns {400} Validation error
 * @returns {401} Unauthorized
 */
```

### 6.2 Commit

```bash
git add src/app/api/[path]/
git commit -m "feat(api): add [METHOD] /api/[path] endpoint"
```

## Checklist Finale

- [ ] Route creee avec bon method handler
- [ ] Validation Zod sur tous les inputs
- [ ] Auth check si necessaire
- [ ] Error handling complet
- [ ] Codes HTTP corrects
- [ ] Types TypeScript
- [ ] Test curl OK
- [ ] Lint + Type-check OK
