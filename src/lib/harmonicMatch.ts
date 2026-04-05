import type { Track } from '../types/models'

export function isHarmonicMatch(track: Track, anchor?: Track): boolean {
  if (!anchor) return false
  const sameLetter = track.key.slice(-1) === anchor.key.slice(-1)
  const bpmOk = Math.abs(track.bpm - anchor.bpm) <= 4
  return sameLetter && bpmOk
}
