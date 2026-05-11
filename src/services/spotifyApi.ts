import { getAuth } from 'firebase/auth'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { getSpotifyClientId, getSpotifyRedirectUri } from '../lib/spotifyConfig'
import type { Energy, Track } from '../types/models'
import {
  clearPkceVerifier,
  clearSpotifyTokens,
  peekPkceVerifier,
  readPendingSpotifyTokens,
  readSpotifyTokens,
  readSpotifyTokensForFirebaseUid,
  writeSpotifyTokens,
  writeSpotifyTokensForSession,
  type SpotifyStoredTokens,
} from '../lib/spotifyTokens'

const codeExchangeInflight = new Map<string, Promise<void>>()
const spotifyAuthCodesCompletedOk = new Set<string>()

export function exchangeAuthorizationCodeOnce(code: string): Promise<void> {
  if (spotifyAuthCodesCompletedOk.has(code)) return Promise.resolve()
  const hit = codeExchangeInflight.get(code)
  if (hit) return hit
  const p = exchangeAuthorizationCode(code)
    .then(() => {
      spotifyAuthCodesCompletedOk.add(code)
    })
    .finally(() => {
      codeExchangeInflight.delete(code)
    })
  codeExchangeInflight.set(code, p)
  return p
}

export async function exchangeAuthorizationCode(code: string): Promise<void> {
  const verifier = peekPkceVerifier()
  if (!verifier) {
    throw new Error(
      'That sign-in session expired or was already used. Tap Connect Spotify in Profile again.',
    )
  }
  const clientId = getSpotifyClientId()
  if (!clientId)
    throw new Error('This action is not available in this environment.')
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getSpotifyRedirectUri(),
    client_id: clientId,
    code_verifier: verifier,
  })
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const raw = await res.text()
  if (!res.ok) {
    clearPkceVerifier()
    let detail = ''
    try {
      const j = JSON.parse(raw) as { error?: string; error_description?: string }
      if (j.error === 'invalid_grant') {
        throw new Error(
          'That Spotify sign-in link is no longer valid. Connect again from Profile.',
        )
      }
      detail = j.error_description ?? j.error ?? ''
    } catch (e) {
      if (e instanceof Error && e.message.includes('sign-in link')) throw e
    }
    throw new Error(
      detail
        ? `Spotify: ${detail}`
        : 'Could not complete Spotify access. Try again.',
    )
  }
  let data: {
    access_token: string
    refresh_token?: string
    expires_in: number
  }
  try {
    data = JSON.parse(raw) as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }
  } catch {
    clearPkceVerifier()
    throw new Error('Spotify returned an invalid response. Try again.')
  }
  if (!data.access_token) {
    clearPkceVerifier()
    throw new Error('Spotify did not return an access token. Try again.')
  }
  let firebaseUid: string | null = null
  if (isFirebaseConfigured()) {
    firebaseUid = getAuth(getFirebaseApp()).currentUser?.uid ?? null
  }
  const prev = firebaseUid
    ? readSpotifyTokensForFirebaseUid(firebaseUid)
    : readPendingSpotifyTokens()
  const refresh =
    typeof data.refresh_token === 'string' && data.refresh_token.length > 0
      ? data.refresh_token
      : prev?.refresh_token
  if (!refresh) {
    clearPkceVerifier()
    throw new Error('Spotify did not return a renewable session. Try again.')
  }
  writeSpotifyTokensForSession(firebaseUid, {
    access_token: data.access_token,
    refresh_token: refresh,
    expires_at_ms: Date.now() + data.expires_in * 1000 - 60_000,
  })
  clearPkceVerifier()
}

let refreshInFlight: Promise<string | null> | null = null

async function requestSpotifyTokenRefresh(
  refreshToken: string,
): Promise<SpotifyStoredTokens | null> {
  const clientId = getSpotifyClientId()
  if (!clientId) return null
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  })
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const rawText = await res.text()
    if (!res.ok) {
      let invalidGrant = rawText.includes('invalid_grant')
      if (!invalidGrant) {
        try {
          invalidGrant =
            (JSON.parse(rawText) as { error?: string }).error === 'invalid_grant'
        } catch {
          void 0
        }
      }
      if (invalidGrant) clearSpotifyTokens()
      return null
    }
    const data = JSON.parse(rawText) as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }
    const prev = readSpotifyTokens()
    const next: SpotifyStoredTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? prev?.refresh_token ?? refreshToken,
      expires_at_ms: Date.now() + data.expires_in * 1000 - 60_000,
    }
    return next
  } catch {
    return null
  }
}

async function refreshSpotifyAccessToken(): Promise<string | null> {
  const t = readSpotifyTokens()
  if (!t) return null
  if (Date.now() < t.expires_at_ms) return t.access_token

  const next = await requestSpotifyTokenRefresh(t.refresh_token)
  if (!next) return null
  writeSpotifyTokens(next)
  return next.access_token
}

export async function getValidSpotifyAccessToken(): Promise<string | null> {
  const clientId = getSpotifyClientId()
  if (!clientId) return null
  const t = readSpotifyTokens()
  if (!t) return null
  if (Date.now() < t.expires_at_ms) return t.access_token

  if (!refreshInFlight) {
    refreshInFlight = refreshSpotifyAccessToken().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function refreshSpotifyAccessTokenForced(): Promise<string | null> {
  const t = readSpotifyTokens()
  if (!t?.refresh_token) return null
  const next = await requestSpotifyTokenRefresh(t.refresh_token)
  if (!next) return null
  writeSpotifyTokens(next)
  return next.access_token
}

function parseSpotifyWebApiErrorMessage(body: string): string | null {
  try {
    const j = JSON.parse(body) as {
      error?: { message?: string; status?: number } | string
    }
    if (typeof j.error === 'string' && j.error.length > 0) return j.error
    if (
      j.error &&
      typeof j.error === 'object' &&
      typeof j.error.message === 'string' &&
      j.error.message.length > 0
    ) {
      return j.error.message
    }
  } catch {
    void 0
  }
  return null
}

type SpotifySearchTrack = {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; height?: number }[]
    release_date: string
    label?: string
  }
  preview_url: string | null
  external_urls: { spotify: string }
}

type SpotifyAudioFeature = {
  tempo: number
  key: number
  mode: number
  danceability: number
  energy: number
  acousticness: number
}

const KEY_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

function keyLabel(key: number, mode: number): string {
  if (key < 0) return '—'
  const k = KEY_NAMES[key] ?? '—'
  return mode === 1 ? `${k} maj` : `${k} min`
}

function energyTag(e: number): Energy {
  if (e < 0.38) return 'low'
  if (e < 0.72) return 'mid'
  return 'high'
}

function mapToTrack(
  t: SpotifySearchTrack,
  af: SpotifyAudioFeature | null | undefined,
): Track {
  const tempo = af?.tempo ?? 120
  const keyStr = af ? keyLabel(af.key, af.mode) : '—'
  const img = t.album.images[0]?.url ?? ''
  const y =
    parseInt(t.album.release_date.slice(0, 4), 10) || new Date().getFullYear()
  return {
    id: t.id,
    title: t.name,
    artist: t.artists[0]?.name ?? 'Unknown',
    bpm: Math.round(tempo) || 120,
    key: keyStr,
    energy: energyTag(af?.energy ?? 0.5),
    cueIn: '',
    cueOut: '',
    danceability: af?.danceability ?? 0.7,
    spotifyEnergy: af?.energy ?? 0.7,
    acousticness: af?.acousticness ?? 0.1,
    label: t.album.label ?? t.album.name,
    year: y,
    coverSeed: img || `spotify-${t.id}`,
    previewUrl: t.preview_url ?? undefined,
    spotifyOpenUrl: t.external_urls?.spotify,
  }
}

export async function searchSpotifyTracks(
  query: string,
  accessToken: string,
  limit = 15,
): Promise<Track[]> {
  const encoded = encodeURIComponent(query.trim())
  const url = `https://api.spotify.com/v1/search?q=${encoded}&type=track&limit=${limit}`

  async function runSearch(token: string) {
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  let tokenUsed = accessToken
  let res = await runSearch(tokenUsed)
  if (res.status === 401) {
    const recovered = await refreshSpotifyAccessTokenForced()
    if (recovered) {
      tokenUsed = recovered
      res = await runSearch(tokenUsed)
    }
  }
  if (res.status === 401) {
    clearSpotifyTokens()
    throw new Error(
      'Your Spotify session expired. Connect again from Profile.',
    )
  }
  if (!res.ok) {
    const body = await res.text()
    const parsed = parseSpotifyWebApiErrorMessage(body)
    const hint =
      parsed ??
      (body.trim().length > 0
        ? body.trim().slice(0, 160)
        : `HTTP ${res.status}`)
    throw new Error(
      `Spotify search failed (${hint}). If it keeps happening, disconnect and reconnect from Profile.`,
    )
  }
  const data = (await res.json()) as {
    tracks?: { items?: SpotifySearchTrack[] }
  }
  const items = data.tracks?.items ?? []
  const ids = items.map((x) => x.id).filter(Boolean)
  if (ids.length === 0) return []
  const afRes = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`,
    { headers: { Authorization: `Bearer ${tokenUsed}` } },
  )
  let features: (SpotifyAudioFeature | null)[] = []
  if (afRes.ok) {
    const afJson = (await afRes.json()) as {
      audio_features?: (SpotifyAudioFeature | null)[]
    }
    features = afJson.audio_features ?? []
  }
  return items.map((t, i) => mapToTrack(t, features[i] ?? undefined))
}
