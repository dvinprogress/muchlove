---
paths:
  - "src/lib/supabase/**/*"
  - "supabase/**/*"
  - "**/*supabase*"
---

# Conventions Supabase MuchLove

## Clients SSR

### Client-side (Browser)

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server-side (Server Components, Route Handlers)

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(/* ... */)
}
```

### JAMAIS

- Service role key cote client
- Requetes sans RLS sur donnees sensibles
- Stockage tokens en localStorage (utiliser cookies SSR)

## Patterns RLS

### Multi-tenant (Company isolation)

```sql
-- Chaque company ne voit que ses donnees
CREATE POLICY "company_isolation" ON contacts
  FOR ALL USING (company_id = auth.uid());
```

### Public avec condition

```sql
-- Lecture publique si approuve, sinon owner seulement
CREATE POLICY "public_if_approved" ON testimonials
  FOR SELECT USING (
    status = 'approved' OR company_id = auth.uid()
  );
```

### Acces via lien unique (contacts)

```sql
-- Pas de RLS stricte car filtre par unique_link dans la query
-- La securite est dans l'unicite du lien (12 chars alphanumeriques)
```

## Storage Buckets

### Naming Convention

```
{bucket}/{company_id}/{resource_id}/{filename}

Exemples:
videos/abc123/def456/raw.webm
logos/abc123/logo.png
thumbnails/abc123/def456/thumb.jpg
```

### Buckets MuchLove

| Bucket | Public | Usage |
|--------|--------|-------|
| `videos` | Non | Videos raw et processed (signed URLs) |
| `thumbnails` | Oui | Vignettes videos |
| `logos` | Oui | Logos companies |

### Signed URLs

```typescript
// Toujours utiliser signed URLs pour videos privees
const { data } = await supabase.storage
  .from('videos')
  .createSignedUrl(path, 3600) // 1h expiry
```

## Queries Types

### Toujours typer les queries

```typescript
import { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']
type ContactInsert = Database['public']['Tables']['contacts']['Insert']

// Query typee
const { data } = await supabase
  .from('contacts')
  .select('*')
  .eq('company_id', companyId)
  .returns<Contact[]>()
```

### Regenerer les types

```bash
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

## Server Actions

### Pattern standard

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().email()
})

export async function createContact(formData: FormData) {
  // 1. Validation
  const validated = schema.parse(Object.fromEntries(formData))

  // 2. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 3. Operation
  const { error } = await supabase.from('contacts').insert({
    company_id: user.id,
    ...validated
  })

  if (error) throw error

  // 4. Revalidate
  revalidatePath('/dashboard')
}
```

## Error Handling

### Codes Supabase courants

| Code | Signification | Action |
|------|---------------|--------|
| `PGRST301` | RLS violation | Verifier auth et policies |
| `23505` | Unique constraint | Doublon (email, link) |
| `23503` | FK violation | Parent n'existe pas |
| `42501` | Permission denied | RLS manquante |

### Pattern error handling

```typescript
const { data, error } = await supabase.from('table').select()

if (error) {
  if (error.code === '23505') {
    return { error: 'Email already exists' }
  }
  console.error('Supabase error:', error)
  return { error: 'Something went wrong' }
}
```
