import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useRef } from 'react'
import { clearFirebaseUser, setFirebaseUser } from '../features/auth/authSlice'
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
    if (!isFirebaseConfigured()) return
    const auth = getAuth(getFirebaseApp())
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      firestoreUnsub.current?.()
      firestoreUnsub.current = null
      if (!user) {
        dispatch(clearFirebaseUser())
        return
      }
      dispatch(setFirebaseUser({ uid: user.uid, email: user.email }))
      firestoreUnsub.current = subscribeUserCuepoint(
        user.uid,
        () => ({
          ids: store.getState().crate.ids,
          tracks: store.getState().draft.tracks,
        }),
        (data) => {
          dispatch(replaceCrateIds(data.crateIds))
          dispatch(replaceDraftTracks(data.draftTracks))
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
