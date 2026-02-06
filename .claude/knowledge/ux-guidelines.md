# UX Guidelines MuchLove

Reference pour le ton, le copy et la gamification.

---

## Brand Voice

### Les 5 Piliers

| Pilier | Description | Exemple |
|--------|-------------|---------|
| **WARM** | Ami qui sourit | "You just made someone's day brighter" |
| **ENCOURAGING** | Celebre chaque win | "Almost there! One more tap" |
| **HUMAN** | Parle a "you", pas "users" | "We know talking to a camera feels weird" |
| **PLAYFUL** | Emojis strategiques (1-2 max) | "High five! You're spreading the love" |
| **CLEAR** | Simple, sans jargon | "Record your video in under 1 minute" |

### Mots a Utiliser vs Eviter

| Concept | Utiliser ✓ | Eviter ✗ |
|---------|------------|----------|
| Temoignage | "your story", "your experience" | "testimonial content", "UGC" |
| Client | "someone you've delighted" | "end-user", "stakeholder" |
| Simple | "effortless", "in 3 minutes" | "streamlined", "optimized" |
| Confiance | "chain of love" | "network effect", "viral loop" |
| Produit | "tool", "app" | "solution", "platform", "ecosystem" |

---

## Emojis

### Autorises (1-2 par message max)

- 💛 Yellow heart (signature MuchLove)
- 🎉 Celebration
- ✨ Sparkle/magic
- 🙌 High five
- ⭐ Star
- 😊 Warm smile
- 🚀 Launch/growth
- 🎥 Video (contexte recording)

### Interdits

- 🔥 (trop agressif)
- 💯 (trop slang)
- 👍 (trop basic)
- 😎 (trop cool/arrogant)
- 🤝 (trop transactionnel)
- ❤️ (trop intense, preferer 💛)

---

## Copy Templates

### Headlines

**Recording:**
- "Ready to share your story?"
- "Your experience matters"
- "Let's capture something special"

**Success:**
- "You did it!"
- "Nice! 1 down, 2 to go"
- "You're on fire!"
- "You're officially an ambassador!"

**Errors:**
- "Oops! That didn't work"
- "Hmm, we lost you for a second"
- "We need camera access"

### CTAs (Buttons)

**Primaires:**
- "Let's do this 🎬"
- "I'm ready!"
- "Continue"
- "Perfect, let's continue"

**Secondaires:**
- "Skip this step"
- "Try again"
- "Maybe later"

**A eviter:**
- "Submit"
- "Proceed"
- "Click here"
- "OK"

---

## Gamification

### Progress Bar

Etapes MuchLove:
1. **0%** - Start
2. **25%** - Video complete
3. **50%** - Trustpilot shared
4. **75%** - Google shared
5. **100%** - LinkedIn shared (Ambassador!)

### Status Badges

| Status | Label | Couleur | Animation |
|--------|-------|---------|-----------|
| created | Created | Gray | - |
| invited | Invited | Blue | - |
| link_opened | Opened | Indigo | - |
| video_started | Recording | Purple | - |
| video_completed | Video Ready | Green | - |
| shared_1 | Shared 1/3 | Orange | - |
| shared_2 | Shared 2/3 | Orange | - |
| shared_3 | Ambassador | Yellow/Gold | Sparkle ✨ |

### Celebrations

| Moment | Type | Intensite |
|--------|------|-----------|
| Apres recording | Medium confetti | 100 particles |
| Apres share 1 | Light confetti | 50 particles |
| Apres share 2 | Light confetti | 50 particles |
| Ambassador (3/3) | Intense confetti | 5s continuous |

---

## Messages d'Erreur

### Pattern

```
Headline: [Emoji optionnel] Message empathique
Body: Explication simple + ce qu'on peut faire
CTA: Action claire
```

### Exemples

**Camera refusee:**
```
We need camera access 📷

To record your video testimonial, please allow camera
access in your browser settings.

[Try again]
```

**Upload echoue:**
```
Oops! That didn't work

Your video couldn't be uploaded. Check your connection
and give it another shot.

[Retry]
```

**Video trop courte:**
```
A bit more, please! 😊

Try recording for at least 30 seconds.
Your story deserves to be heard!

[Record again]
```

---

## Empty States

### Dashboard vide

```
Your testimonial collection starts here 💛

Ready to hear from your happy customers?
Create your first request and watch the love roll in.

[Request a testimonial]
```

### Pas de contacts

```
No contacts yet

Add your first happy customer and start collecting
testimonials that make a difference.

[Add contact]
```

---

## Animations

### Page transitions

```typescript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -20 }
duration: 0.3s
```

### Micro-interactions

```typescript
// Boutons
whileTap: { scale: 0.95 }
whileHover: { scale: 1.02 }

// Cards
whileHover: { y: -4, boxShadow: '...' }

// Success
animate: { scale: [1, 1.05, 1] }
```

---

## Checklist Qualite Copy

Avant de valider un texte:

- [ ] **Warm** - Sonne comme un ami?
- [ ] **Clear** - Un enfant de 12 ans comprendrait?
- [ ] **Encouraging** - Donne envie d'avancer?
- [ ] **Human** - Un robot aurait ecrit ca? (si oui → rewrite)
- [ ] **Concise** - Minimum de mots?
- [ ] **Actionable** - Action suivante evidente?
- [ ] **Authentic** - Je dirais ca a un ami?

**7/7 = GO | <5/7 = REWRITE**

---

*Derniere MAJ: 2026-02-02*
