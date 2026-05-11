import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import crateReducer from '../features/crate/crateSlice'
import inboxReducer from '../features/inbox/inboxSlice'
import { persistCrateIds } from '../features/crate/crateSlice'
import draftReducer from '../features/draft/draftSlice'
import { persistDraftTracks } from '../features/draft/draftSlice'
import { isFirebaseConfigured } from '../lib/firebase'
import { saveUserCuepoint } from '../services/userCuepointFirestore'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crate: crateReducer,
    draft: draftReducer,
    inbox: inboxReducer,
  },
})

let firestoreSaveTimer: ReturnType<typeof setTimeout> | undefined

export function flushPendingCuepointSave(): Promise<void> {
  if (firestoreSaveTimer) {
    clearTimeout(firestoreSaveTimer)
    firestoreSaveTimer = undefined
  }
  const s = store.getState()
  if (!s.auth.uid || !isFirebaseConfigured()) return Promise.resolve()
  return saveUserCuepoint(s.auth.uid, s.crate.ids, s.draft.tracks).catch(
    () => undefined,
  )
}

store.subscribe(() => {
  const s = store.getState()
  persistCrateIds(s.crate.ids)
  persistDraftTracks(s.draft.tracks)
  if (!s.auth.uid || !isFirebaseConfigured()) return
  if (firestoreSaveTimer) clearTimeout(firestoreSaveTimer)
  firestoreSaveTimer = setTimeout(() => {
    firestoreSaveTimer = undefined
    const st = store.getState()
    if (!st.auth.uid || !isFirebaseConfigured()) return
    void saveUserCuepoint(st.auth.uid, st.crate.ids, st.draft.tracks).catch(
      () => undefined,
    )
  }, 400)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
