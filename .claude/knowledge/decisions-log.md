# Decisions Log MuchLove

Journal des decisions architecturales du projet.

---

## 2026-02-02 - Stack Technique

### Contexte

Choix du stack technique pour MuchLove MVP.

### Options Considerees

1. **Prisma + NextAuth + Cloudflare R2**
   - Plus de flexibilite
   - Setup plus complexe
   - Couts separes

2. **Supabase tout-en-un** ✓
   - Auth + DB + Storage integres
   - Gratuit jusqu'a 500MB
   - Deja configure dans le projet
   - RLS natif

### Decision

**Supabase tout-en-un** pour:
- Simplicite de setup
- Contrainte budget freemium
- RLS natif pour securite
- Realtime inclus (futur)

### Consequences

- Dependance a Supabase
- Types generes automatiquement
- Patterns SSR specifiques a suivre

---

## 2026-02-02 - Video Processing

### Contexte

Ou executer le processing video (FFmpeg, transcription)?

### Options Considerees

1. **Vercel Functions** ✓
   - Simple, integre
   - Limite 60s execution
   - Gratuit en hobby

2. **Service externe (Replicate/Modal)**
   - Plus puissant
   - ~0.01$/video
   - Setup additionnel

3. **Supabase Edge Functions**
   - Gratuit
   - Limite, experimental pour FFmpeg

### Decision

**Vercel Functions** pour MVP car:
- Simplicite
- Suffisant pour videos < 2min
- Pas de cout additionnel

### Consequences

- Processing leger seulement
- Transcription Whisper OK (rapide)
- FFmpeg complexe a eviter (faire cote client si possible)
- Prevoir migration si besoin scale

---

## 2026-02-02 - Architecture Agents

### Contexte

Organisation des agents Claude Code pour le projet.

### Decision

**3 agents specialises projet:**

1. **video-expert**
   - MediaRecorder API
   - Processing video
   - YouTube API

2. **supabase-expert**
   - Auth SSR
   - Schema DB + RLS
   - Storage

3. **ux-copywriter**
   - Copywriting MuchLove
   - Gamification
   - Microcopy

**7 skills projet:**
- Infrastructure: setup-supabase-table, create-page, add-api-route
- Feature: create-video-recorder, setup-gamification
- Workflow: implement-video-flow, implement-sharing-flow

### Consequences

- Agents reutilisables pour features similaires
- Skills accelerent le dev repetitif
- Knowledge base enrichie au fil du temps

---

## Template pour futures decisions

```markdown
## YYYY-MM-DD - [Titre]

### Contexte
[Probleme ou besoin]

### Options Considerees
1. **Option A**
   - Avantages
   - Inconvenients

2. **Option B** ✓
   - Avantages
   - Inconvenients

### Decision
[Option choisie et pourquoi]

### Consequences
[Impact sur le projet]
```

---

*Derniere MAJ: 2026-02-02*
