export function getSpotifyClientId(): string | undefined {
  const id = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim()
  return id && id.length > 0 ? id : undefined
}

export function isSpotifyConfigured(): boolean {
  return getSpotifyClientId() != null
}

export function getSpotifyRedirectUri(): string {
  return `${window.location.origin}/spotify-callback`
}
