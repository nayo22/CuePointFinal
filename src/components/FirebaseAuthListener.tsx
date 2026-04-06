import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useRef } from 'react'
import {
  clearFirebaseUser,
  setAuthReady,
  setFirebaseUser,
  setUserProfile,
} from '../features/auth/authSlice'
import { replaceCrateIds } from '../features/crate/crateSlice'
import { replaceDraftTracks } from '../features/draft/draftSlice'
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase'
import { subscribeUserCuepoint } from '../services/userCuepointFirestore'
import { useAppDispatch } from '../store/hooks'
import { store } from '../store/store'

export function FirebaseAuthListener() {
  const dispatch = useAppDispatch()
  const firestoreUnsub = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      dispatch(setAuthReady(true))
      return
    }
    const auth = getAuth(getFirebaseApp())
    let first = true
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (first) {
        dispatch(setAuthReady(true))
        first = false
      }
      firestoreUnsub.current?.()
      firestoreUnsub.current = null
      if (!user) {
        dispatch(clearFirebaseUser())
        return
      }
      dispatch(setFirebaseUser({ uid: user.uid, email: user.email }))
      dispatch(
        setUserProfile({
          displayName: user.displayName ?? null,
          photoUrl: user.photoURL ?? null,
        }),
      )
      firestoreUnsub.current = subscribeUserCuepoint(
        user.uid,
        () => ({
          ids: store.getState().crate.ids,
          tracks: store.getState().draft.tracks,
        }),
        (data) => {
          const prev = store.getState().auth
          dispatch(
            setUserProfile({
              displayName:
                typeof data.displayName === 'string'
                  ? data.displayName
                  : prev.displayName,
              photoUrl:
                typeof data.photoUrl === 'string'
                  ? data.photoUrl
                  : prev.photoUrl,
            }),
          )
          const local = store.getState()
          const ids = local.crate.ids
          const tracks = local.draft.tracks
          if (
            JSON.stringify(data.crateIds) !== JSON.stringify(ids) ||
            JSON.stringify(data.draftTracks) !== JSON.stringify(tracks)
          ) {
            dispatch(replaceCrateIds(data.crateIds))
            dispatch(replaceDraftTracks(data.draftTracks))
          }
        },
      )
    })
    return () => {
      unsubAuth()
      firestoreUnsub.current?.()
    }
  }, [dispatch])

  return null
}
