import {
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseApp } from '../lib/firebase'
import type { Track } from '../types/models'

const COLLECTION = 'userCuepoint'

export function getUserCuepointDb() {
  return getFirestore(getFirebaseApp())
}

export function userCuepointDocRef(uid: string) {
  return doc(getUserCuepointDb(), COLLECTION, uid)
}

type CuepointDoc = {
  crateIds: string[]
  draftTracks: Track[]
}

function sameData(a: CuepointDoc, ids: string[], tracks: Track[]): boolean {
  return (
    JSON.stringify(a.crateIds) === JSON.stringify(ids) &&
    JSON.stringify(a.draftTracks) === JSON.stringify(tracks)
  )
}

export function subscribeUserCuepoint(
  uid: string,
  getLocal: () => { ids: string[]; tracks: Track[] },
  onRemote: (data: CuepointDoc) => void,
): Unsubscribe {
  const ref = userCuepointDocRef(uid)
  return onSnapshot(ref, (snap) => {
    if (snap.metadata.hasPendingWrites) return
    if (!snap.exists()) {
      const { ids, tracks } = getLocal()
      void setDoc(ref, { crateIds: ids, draftTracks: tracks })
      return
    }
    const data = snap.data() as Partial<CuepointDoc>
    const crateIds = Array.isArray(data.crateIds)
      ? data.crateIds.filter((x): x is string => typeof x === 'string')
      : []
    const draftTracks = Array.isArray(data.draftTracks)
      ? (data.draftTracks as Track[])
      : []
    const payload: CuepointDoc = { crateIds, draftTracks }
    const local = getLocal()
    if (sameData(payload, local.ids, local.tracks)) return
    onRemote(payload)
  })
}

export async function saveUserCuepoint(
  uid: string,
  ids: string[],
  tracks: Track[],
): Promise<void> {
  const ref = userCuepointDocRef(uid)
  await setDoc(ref, { crateIds: ids, draftTracks: tracks }, { merge: true })
}
