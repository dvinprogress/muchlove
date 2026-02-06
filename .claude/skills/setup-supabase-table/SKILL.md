---
name: setup-supabase-table
description: Cree une table Supabase avec schema, RLS, types et helpers CRUD
argument-hint: "[table-name] [description]"
user-invocable: true
---

# Workflow Creation Table Supabase

Creer table: **$ARGUMENTS**

## Phase 1: Design

### 1.1 Analyser les besoins

- Quelles donnees stocker?
- Relations avec autres tables existantes?
- Qui peut lire/ecrire (RLS)?
- Quels indexes necessaires?

### 1.2 Designer le schema

Consulter l'agent `supabase-expert` si le schema est complexe.

Elements a definir:
- Colonnes avec types PostgreSQL
- Constraints (NOT NULL, UNIQUE, CHECK, DEFAULT)
- Foreign keys et ON DELETE behavior
- Indexes (btree pour lookups, gin pour JSONB)

### 1.3 Definir les policies RLS

Patterns courants MuchLove:
- **company_isolation**: `company_id = auth.uid()`
- **public_read**: `FOR SELECT USING (true)`
- **owner_write**: `FOR INSERT WITH CHECK (user_id = auth.uid())`

## Phase 2: Implementation

### 2.1 Creer la migration SQL

Fichier: `supabase/migrations/YYYYMMDDHHMMSS_create_[table].sql`

```sql
-- Create table
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- colonnes specifiques...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[table]_[column] ON [table_name] ([column]);

-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "[table]_select_policy" ON [table_name]
  FOR SELECT USING (/* condition */);

CREATE POLICY "[table]_insert_policy" ON [table_name]
  FOR INSERT WITH CHECK (/* condition */);

CREATE POLICY "[table]_update_policy" ON [table_name]
  FOR UPDATE USING (/* condition */);

CREATE POLICY "[table]_delete_policy" ON [table_name]
  FOR DELETE USING (/* condition */);

-- Updated_at trigger
CREATE TRIGGER [table]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 2.2 Mettre a jour les types TypeScript

Option A: Regenerer automatiquement
```bash
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

Option B: Ajouter manuellement dans `src/types/database.ts`
```typescript
export interface [TableName] {
  id: string
  // colonnes...
  created_at: string
  updated_at: string
}

export interface [TableName]Insert {
  id?: string
  // colonnes requises...
}

export interface [TableName]Update {
  // tous optionnels...
}
```

### 2.3 Creer les helpers CRUD

Fichier: `src/lib/supabase/[table-name].ts`

```typescript
import { createClient } from './server'
import type { [TableName], [TableName]Insert } from '@/types/database'

export async function get[TableName]s(companyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as [TableName][]
}

export async function get[TableName]ById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as [TableName]
}

export async function create[TableName](input: [TableName]Insert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('[table_name]')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as [TableName]
}

export async function update[TableName](id: string, input: Partial<[TableName]>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('[table_name]')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as [TableName]
}

export async function delete[TableName](id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('[table_name]')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

## Phase 3: Verification

### 3.1 Tester les policies RLS

```sql
-- Dans Supabase SQL Editor

-- Test en tant qu'utilisateur authentifie
SET role authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- Verifier SELECT
SELECT * FROM [table_name];
-- Doit retourner seulement les rows autorisees

-- Verifier INSERT
INSERT INTO [table_name] (columns...) VALUES (values...);
-- Doit reussir si autorise, echouer sinon

-- Reset
RESET role;
```

### 3.2 Verifier les types

```bash
npm run type-check
```

### 3.3 Tester les helpers

Creer un test rapide ou verifier manuellement via l'UI.

## Phase 4: Documentation

### 4.1 Mettre a jour la knowledge base

Ajouter dans `knowledge/supabase-schema.md`:
- Description de la table
- Schema des colonnes
- Policies appliquees
- Relations

### 4.2 Commit

```bash
git add supabase/migrations/ src/types/ src/lib/supabase/
git commit -m "feat(db): add [table_name] table with RLS"
```

## Checklist Finale

- [ ] Migration SQL creee
- [ ] RLS activee et policies definies
- [ ] Types TypeScript mis a jour
- [ ] Helpers CRUD crees
- [ ] Policies testees
- [ ] Types verifies (`npm run type-check`)
- [ ] Documentation mise a jour
