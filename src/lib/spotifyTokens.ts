import { getAuth } from 'firebase/auth'
import { getFirebaseApp, isFirebaseConfigured } from './firebase'
import { store } from '../store/store'

const LEGACY_LS_KEY = 'cuepoint-spotify-tokens-v1'
const USER_KEY_PREFIX = 'cuepoint-spotify-tokens-v1__'
const PENDING_SESSION_KEY = 'cuepoint-spotify-pending'
const PKCE_KEY = 'cuepoint-spotify-pkce-verifier'

export type SpotifyStoredTokens = {
  access_token: string
  refresh_token: string
  expires_at_ms: number
}

function userStorageKey(uid: string) {
  return `${USER_KEY_PREFIX}${uid}`
}

export function getEffectiveFirebaseUidForSpotify(): string | null {
  const fromStore = store.getState().auth.uid
  if (fromStore) return fromStore
  if (!isFirebaseConfigured()) return null
  try {
    return getAuth(getFirebaseApp()).currentUser?.uid ?? null
  } catch {
    return null
  }
}

function notifySpotifyAuth() {
  window.dispatchEvent(new Event('cuepoint-spotify-auth'))
}

export function scrubLegacySpotifyKeys() {
  localStorage.removeItem(LEGACY_LS_KEY)
}

export function promotePendingSpotifyTokens(uid: string) {
  try {
    const raw = sessionStorage.getItem(PENDING_SESSION_KEY)
    if (!raw) return
    sessionStorage.removeItem(PENDING_SESSION_KEY)
    localStorage.setItem(userStorageKey(uid), raw)
    notifySpotifyAuth()
  } catch {
    sessionStorage.removeItem(PENDING_SESSION_KEY)
  }
}

export function writeSpotifyTokensForSession(
  firebaseUid: string | null,
  t: SpotifyStoredTokens,
) {
  try {
    if (firebaseUid) {
      localStorage.setItem(userStorageKey(firebaseUid), JSON.stringify(t))
      sessionStorage.removeItem(PENDING_SESSION_KEY)
    } else {
      sessionStorage.setItem(PENDING_SESSION_KEY, JSON.stringify(t))
    }
    notifySpotifyAuth()
  } catch {
    void 0
  }
}

export function readSpotifyTokensForFirebaseUid(
  uid: string,
): SpotifyStoredTokens | null {
  try {
    const raw = localStorage.getItem(userStorageKey(uid))
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

export function readPendingSpotifyTokens(): SpotifyStoredTokens | null {
  try {
    const raw = sessionStorage.getItem(PENDING_SESSION_KEY)
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

export function readSpotifyTokens(): SpotifyStoredTokens | null {
  const uid = getEffectiveFirebaseUidForSpotify()
  if (!uid) return null
  try {
    const raw = localStorage.getItem(userStorageKey(uid))
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

export function writeSpotifyTokens(t: SpotifyStoredTokens) {
  const uid = getEffectiveFirebaseUidForSpotify()
  if (!uid) return
  try {
    localStorage.setItem(userStorageKey(uid), JSON.stringify(t))
    notifySpotifyAuth()
  } catch {
    void 0
  }
}

export function clearSpotifyTokens() {
  const uid = getEffectiveFirebaseUidForSpotify()
  scrubLegacySpotifyKeys()
  try {
    sessionStorage.removeItem(PENDING_SESSION_KEY)
  } catch {
    void 0
  }
  if (uid) localStorage.removeItem(userStorageKey(uid))
  notifySpotifyAuth()
}

export function clearSpotifyTokensForFirebaseUid(
  uid: string | null | undefined,
) {
  scrubLegacySpotifyKeys()
  try {
    sessionStorage.removeItem(PENDING_SESSION_KEY)
  } catch {
    void 0
  }
  if (uid) localStorage.removeItem(userStorageKey(uid))
  notifySpotifyAuth()
}

export function storePkceVerifier(v: string) {
  sessionStorage.setItem(PKCE_KEY, v)
}

export function peekPkceVerifier(): string | null {
  return sessionStorage.getItem(PKCE_KEY)
}

export function clearPkceVerifier() {
  sessionStorage.removeItem(PKCE_KEY)
}

export function takePkceVerifier(): string | null {
  const v = sessionStorage.getItem(PKCE_KEY)
  sessionStorage.removeItem(PKCE_KEY)
  return v
}
