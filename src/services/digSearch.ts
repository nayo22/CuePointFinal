import { searchDiscoveryTracks } from './backend'
import { getValidSpotifyAccessToken, searchSpotifyTracks } from './spotifyApi'
import type { Track } from '../types/models'

export async function searchDigTracks(query: string): Promise<Track[]> {
  const q = query.trim()
  if (q.length === 0) return searchDiscoveryTracks('')
  const token = await getValidSpotifyAccessToken()
  if (token) {
    try {
      const spotifyRows = await searchSpotifyTracks(q, token)
      if (spotifyRows.length > 0) return spotifyRows
    } catch {
      return searchDiscoveryTracks(q)
    }
  }
  return searchDiscoveryTracks(q)
}
