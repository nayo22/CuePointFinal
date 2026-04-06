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

export type UserCuepointDoc = {
  crateIds: string[]
  draftTracks: Track[]
  displayName?: string
  photoUrl?: string
}

export function getUserCuepointDb() {
  return getFirestore(getFirebaseApp())
}

export function userCuepointDocRef(uid: string) {
  return doc(getUserCuepointDb(), COLLECTION, uid)
}

export function subscribeUserCuepoint(
  uid: string,
  getLocal: () => { ids: string[]; tracks: Track[] },
  onRemote: (data: UserCuepointDoc) => void,
): Unsubscribe {
  const ref = userCuepointDocRef(uid)
  return onSnapshot(ref, (snap) => {
    if (snap.metadata.hasPendingWrites) return
    if (!snap.exists()) {
      const { ids, tracks } = getLocal()
      void setDoc(ref, { crateIds: ids, draftTracks: tracks }, { merge: true })
      return
    }
    const data = snap.data() as Partial<UserCuepointDoc>
    const crateIds = Array.isArray(data.crateIds)
      ? data.crateIds.filter((x): x is string => typeof x === 'string')
      : []
    const draftTracks = Array.isArray(data.draftTracks)
      ? (data.draftTracks as Track[])
      : []
    const displayName =
      typeof data.displayName === 'string' ? data.displayName : undefined
    const photoUrl = typeof data.photoUrl === 'string' ? data.photoUrl : undefined
    onRemote({
      crateIds,
      draftTracks,
      displayName,
      photoUrl,
    })
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

export async function saveUserProfileFields(
  uid: string,
  profile: { displayName?: string; photoUrl?: string },
): Promise<void> {
  const ref = userCuepointDocRef(uid)
  await setDoc(ref, profile, { merge: true })
}
