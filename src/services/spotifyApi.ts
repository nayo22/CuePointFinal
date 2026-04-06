import { getAuth } from 'firebase/auth'
import { getFirebaseApp } from '../lib/firebase'
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
      'La conexión expiró o ya se usó. Vuelve a pulsar Conectar con Spotify en Perfil.',
    )
  }
  const clientId = getSpotifyClientId()
  if (!clientId)
    throw new Error('Esta función no está disponible en este entorno.')
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
          'El enlace de Spotify ya no es válido. Intenta conectar de nuevo desde Perfil.',
        )
      }
      detail = j.error_description ?? j.error ?? ''
    } catch (e) {
      if (e instanceof Error && e.message.includes('Intenta conectar')) throw e
    }
    throw new Error(
      detail
        ? `Spotify: ${detail}`
        : 'No se pudo completar el acceso. Intenta de nuevo.',
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
    throw new Error('Respuesta inválida de Spotify. Intenta de nuevo.')
  }
  if (!data.access_token) {
    clearPkceVerifier()
    throw new Error('Spotify no devolvió un token. Intenta de nuevo.')
  }
  const firebaseUid = getAuth(getFirebaseApp()).currentUser?.uid ?? null
  const prev = firebaseUid
    ? readSpotifyTokensForFirebaseUid(firebaseUid)
    : readPendingSpotifyTokens()
  const refresh =
    typeof data.refresh_token === 'string' && data.refresh_token.length > 0
      ? data.refresh_token
      : prev?.refresh_token
  if (!refresh) {
    clearPkceVerifier()
    throw new Error('Spotify no devolvió sesión renovable. Intenta de nuevo.')
  }
  writeSpotifyTokensForSession(firebaseUid, {
    access_token: data.access_token,
    refresh_token: refresh,
    expires_at_ms: Date.now() + data.expires_in * 1000 - 60_000,
  })
  clearPkceVerifier()
}

/** Serializes refresh so concurrent callers (e.g. Strict Mode) never rotate the refresh token twice. */
let refreshInFlight: Promise<string | null> | null = null

async function refreshSpotifyAccessToken(): Promise<string | null> {
  const clientId = getSpotifyClientId()
  if (!clientId) return null
  const t = readSpotifyTokens()
  if (!t) return null
  if (Date.now() < t.expires_at_ms) return t.access_token

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: t.refresh_token,
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
          /* ignore */
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
    const next: SpotifyStoredTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? t.refresh_token,
      expires_at_ms: Date.now() + data.expires_in * 1000 - 60_000,
    }
    writeSpotifyTokens(next)
    return next.access_token
  } catch {
    return null
  }
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
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encoded}&type=track&limit=${limit}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (res.status === 401) {
    clearSpotifyTokens()
    throw new Error(
      'Tu sesión de Spotify caducó. Vuelve a conectar en Perfil.',
    )
  }
  if (!res.ok) {
    const body = await res.text()
    let msg = 'No se pudo buscar en Spotify.'
    try {
      const j = JSON.parse(body) as { error?: { message?: string } }
      if (j.error?.message) msg = j.error.message
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const data = (await res.json()) as {
    tracks?: { items?: SpotifySearchTrack[] }
  }
  const items = data.tracks?.items ?? []
  const ids = items.map((x) => x.id).filter(Boolean)
  if (ids.length === 0) return []
  const afRes = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
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
