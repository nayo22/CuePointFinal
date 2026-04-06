const LS_KEY = 'cuepoint-spotify-tokens-v1'
const PKCE_KEY = 'cuepoint-spotify-pkce-verifier'

export type SpotifyStoredTokens = {
  access_token: string
  refresh_token: string
  expires_at_ms: number
}

export function readSpotifyTokens(): SpotifyStoredTokens | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as SpotifyStoredTokens
    if (
      typeof o.access_token === 'string' &&
      typeof o.refresh_token === 'string' &&
      typeof o.expires_at_ms === 'number'
    ) {
      return o
    }
  } catch {
    return null
  }
  return null
}

function notifySpotifyAuth() {
  window.dispatchEvent(new Event('cuepoint-spotify-auth'))
}

export function writeSpotifyTokens(t: SpotifyStoredTokens) {
  localStorage.setItem(LS_KEY, JSON.stringify(t))
  notifySpotifyAuth()
}

export function clearSpotifyTokens() {
  localStorage.removeItem(LS_KEY)
  notifySpotifyAuth()
}

export function storePkceVerifier(v: string) {
  sessionStorage.setItem(PKCE_KEY, v)
}

export function takePkceVerifier(): string | null {
  const v = sessionStorage.getItem(PKCE_KEY)
  sessionStorage.removeItem(PKCE_KEY)
  return v
}
