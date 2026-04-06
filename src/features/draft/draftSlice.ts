import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { INITIAL_DRAFT_TRACKS } from '../../data/seed'
import type { Energy, Track } from '../../types/models'

const DRAFT_LS = 'cuepoint-draft-tracks-v1'

function loadTracksFromStorage(): Track[] {
  try {
    const raw = localStorage.getItem(DRAFT_LS)
    if (!raw) return [...INITIAL_DRAFT_TRACKS]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [...INITIAL_DRAFT_TRACKS]
    return parsed as Track[]
  } catch {
    return [...INITIAL_DRAFT_TRACKS]
  }
}

type DraftState = {
  tracks: Track[]
}

const initialState: DraftState = {
  tracks: loadTracksFromStorage(),
}

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    addDraftTrack(state, action: PayloadAction<Track>) {
      state.tracks.push(action.payload)
    },
    replaceDraftTracks(state, action: PayloadAction<Track[]>) {
      state.tracks = action.payload
    },
  },
})

export const { addDraftTrack, replaceDraftTracks } = draftSlice.actions
export default draftSlice.reducer

export function persistDraftTracks(tracks: Track[]) {
  try {
    localStorage.setItem(DRAFT_LS, JSON.stringify(tracks))
  } catch {
    return
  }
}

export function makeDraftTrack(input: {
  title: string
  artist: string
  bpm: number
  key: string
  energy: Energy
}): Track {
  const id = `local-${Date.now()}`
  return {
    id,
    title: input.title.trim() || 'Untitled',
    artist: input.artist.trim() || 'Unknown artist',
    bpm: Number.isFinite(input.bpm) && input.bpm > 0 ? input.bpm : 126,
    key: input.key.trim() || '8A',
    energy: input.energy,
    cueIn: '',
    cueOut: '',
    danceability: 0.75,
    spotifyEnergy: 0.7,
    acousticness: 0.1,
    label: 'TBD',
    year: new Date().getFullYear(),
    coverSeed: id,
  }
}
