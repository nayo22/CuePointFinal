import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DjRole = "editor" | "spectator";

type AuthState = {
  role: DjRole;
  uid: string | null;
  email: string | null;
};

const initialState: AuthState = {
  role: "editor",
  uid: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEditor(state) {
      state.role = "editor";
    },
    setSpectator(state) {
      state.role = "spectator";
    },
    setFirebaseUser(
      state,
      action: PayloadAction<{ uid: string; email: string | null }>,
    ) {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.role = "editor";
    },
    clearFirebaseUser(state) {
      state.uid = null;
      state.email = null;
    },
  },
});

export const { setEditor, setSpectator, setFirebaseUser, clearFirebaseUser } =
  authSlice.actions;
export default authSlice.reducer;
