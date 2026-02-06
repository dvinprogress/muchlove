# Supabase Schema MuchLove

Documentation du schema de base de donnees.

---

## Tables

### companies

Table des entreprises clientes (B2B).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| email | TEXT | UNIQUE, NOT NULL | Email de connexion |
| name | TEXT | NOT NULL | Nom de l'entreprise |
| logo_url | TEXT | - | URL du logo (Storage) |
| default_scripts | JSONB | DEFAULT '[]' | Questions suggerees |
| music_choice | TEXT | DEFAULT 'upbeat' | Musique de fond |
| google_place_id | TEXT | - | Pour Google Reviews |
| trustpilot_url | TEXT | - | URL Trustpilot |
| plan | TEXT | DEFAULT 'free' | free/starter/growth/pro |
| videos_used | INT | DEFAULT 0 | Compteur videos |
| videos_limit | INT | DEFAULT 5 | Limite selon plan |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | - |

**RLS:**
- SELECT/UPDATE: `auth.uid() = id`

---

### contacts

Personnes a qui demander un temoignage.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | - |
| company_id | UUID | FK companies, NOT NULL | - |
| first_name | TEXT | NOT NULL | Prenom |
| company_name | TEXT | NOT NULL | Entreprise du contact |
| email | TEXT | NOT NULL | Email du contact |
| unique_link | TEXT | UNIQUE, NOT NULL | Lien 12 chars |
| status | TEXT | DEFAULT 'created' | Progression |
| created_at | TIMESTAMPTZ | - | - |
| updated_at | TIMESTAMPTZ | - | - |
| link_opened_at | TIMESTAMPTZ | - | Tracking |
| video_started_at | TIMESTAMPTZ | - | Tracking |

**Status possibles:**
- created → invited → link_opened → video_started → video_completed → shared_1 → shared_2 → shared_3

**RLS:**
- Company: CRUD sur ses contacts (`company_id = auth.uid()`)
- Public: SELECT via unique_link

---

### testimonials

Temoignages video.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | - |
| company_id | UUID | FK companies | - |
| contact_id | UUID | FK contacts, UNIQUE | 1 testimonial/contact |
| raw_video_url | TEXT | - | Path Storage video brute |
| processed_video_url | TEXT | - | Path video traitee |
| youtube_url | TEXT | - | URL YouTube finale |
| youtube_video_id | TEXT | - | ID YouTube |
| thumbnail_url | TEXT | - | Vignette |
| transcription | TEXT | - | Texte Whisper |
| transcription_edited | TEXT | - | Si modifie par user |
| whisper_words | JSONB | - | Timestamps mots |
| duration_seconds | INT | - | Duree video |
| attempt_number | INT | DEFAULT 1, CHECK 1-3 | Tentative |
| processing_status | TEXT | DEFAULT 'pending' | pending/processing/completed/failed |
| shared_trustpilot | BOOLEAN | DEFAULT FALSE | - |
| shared_google | BOOLEAN | DEFAULT FALSE | - |
| shared_linkedin | BOOLEAN | DEFAULT FALSE | - |
| linkedin_post_text | TEXT | - | Post AI genere |
| created_at | TIMESTAMPTZ | - | - |
| updated_at | TIMESTAMPTZ | - | - |
| completed_at | TIMESTAMPTZ | - | Quand 3/3 |

**RLS:**
- Company: SELECT sur ses testimonials
- Public: INSERT/UPDATE (contact qui soumet)

---

## Storage Buckets

### videos (prive)

- **Usage:** Videos brutes et traitees
- **Public:** Non (signed URLs)
- **Size limit:** 50MB
- **Structure:** `{company_id}/{contact_id}/{filename}`

### thumbnails (public)

- **Usage:** Vignettes des videos
- **Public:** Oui (CDN)
- **Structure:** `{company_id}/{testimonial_id}/thumb.jpg`

### logos (public)

- **Usage:** Logos des entreprises
- **Public:** Oui
- **Structure:** `{company_id}/logo.{ext}`

---

## Indexes

```sql
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_unique_link ON contacts(unique_link);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_testimonials_company_id ON testimonials(company_id);
CREATE INDEX idx_testimonials_contact_id ON testimonials(contact_id);
CREATE INDEX idx_testimonials_processing_status ON testimonials(processing_status);
```

---

## Triggers

### updated_at automatique

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applique sur chaque table
CREATE TRIGGER [table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## Relations

```
companies
    │
    ├── contacts (1:N)
    │       │
    │       └── testimonials (1:1)
    │
    └── testimonials (1:N, via contact)
```

---

*Derniere MAJ: 2026-02-02*
