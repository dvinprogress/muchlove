/**
 * Generate a URL-safe slug from a company name
 * Examples: "Acme Corp" -> "acme-corp", "L'Atelier du Web" -> "latelier-du-web"
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
    .slice(0, 50) // Max 50 chars
}

/**
 * Generate a unique slug by appending a random suffix if needed
 * @param baseName - The company name to slugify
 * @param checkExists - Async function that returns true if slug already exists in DB
 */
export async function generateUniqueSlug(
  baseName: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = generateSlug(baseName)

  if (!base) return `company-${Math.random().toString(36).slice(2, 6)}`

  const exists = await checkExists(base)
  if (!exists) return base

  // Append random 4-char suffix
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).slice(2, 6)
    const candidate = `${base}-${suffix}`
    const candidateExists = await checkExists(candidate)
    if (!candidateExists) return candidate
  }

  // Fallback: base + timestamp
  return `${base}-${Date.now().toString(36)}`
}
