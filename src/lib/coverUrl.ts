export function coverUrl(seed: string, size = 80): string {
  if (seed.startsWith('http://') || seed.startsWith('https://')) return seed
  const s = encodeURIComponent(seed)
  return `https://picsum.photos/seed/${s}/${size}/${size}`
}
