import { isSpotifyConfigured } from '../lib/spotifyConfig'
import {
  getEffectiveFirebaseUidForSpotify,
  readSpotifyTokens,
} from '../lib/spotifyTokens'
import { store } from '../store/store'
import { searchDiscoveryTracks } from './backend'
import { getValidSpotifyAccessToken, searchSpotifyTracks } from './spotifyApi'
import type { Track } from '../types/models'

export const DIG_SEARCH_FAILURE_MESSAGE =
  'Something went wrong with search. Please try again.'

export async function searchDigTracks(query: string): Promise<Track[]> {
  const q = query.trim()
  if (q.length === 0) return searchDiscoveryTracks('')

  const { role, uid } = store.getState().auth
  const effectiveUid = uid ?? getEffectiveFirebaseUidForSpotify()
  const isGuest = role === 'spectator' || effectiveUid == null

  const spotifyLinked =
    !isGuest && isSpotifyConfigured() && readSpotifyTokens() != null
  const token = await getValidSpotifyAccessToken()

  if (spotifyLinked && !token) {
    throw new Error(DIG_SEARCH_FAILURE_MESSAGE)
  }
  if (token) {
    return await searchSpotifyTracks(q, token)
  }
  return searchDiscoveryTracks(q)
}
