import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type DjRole = 'editor' | 'spectator'

type AuthState = {
  /** True after first auth resolution (or immediately if backend is off). */
  authReady: boolean
  role: DjRole
  uid: string | null
  email: string | null
  displayName: string | null
  photoUrl: string | null
}

const initialState: AuthState = {
  authReady: false,
  role: 'editor',
  uid: null,
  email: null,
  displayName: null,
  photoUrl: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthReady(state, action: PayloadAction<boolean>) {
      state.authReady = action.payload
    },
    setEditor(state) {
      state.role = 'editor'
    },
    setSpectator(state) {
      state.role = 'spectator'
    },
    setFirebaseUser(
      state,
      action: PayloadAction<{ uid: string; email: string | null }>,
    ) {
      state.uid = action.payload.uid
      state.email = action.payload.email
      state.role = 'editor'
    },
    setUserProfile(
      state,
      action: PayloadAction<{ displayName: string | null; photoUrl: string | null }>,
    ) {
      state.displayName = action.payload.displayName
      state.photoUrl = action.payload.photoUrl
    },
    clearFirebaseUser(state) {
      state.uid = null
      state.email = null
      state.displayName = null
      state.photoUrl = null
    },
  },
})

export const {
  setAuthReady,
  setEditor,
  setSpectator,
  setFirebaseUser,
  setUserProfile,
  clearFirebaseUser,
} = authSlice.actions
export default authSlice.reducer
