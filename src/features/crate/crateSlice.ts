import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const CRATE_LS = 'cuepoint-crate-v1'

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(CRATE_LS)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
        return parsed
      }
    }
  } catch {
    return ['c2', 't1', 'd2']
  }
  return ['c2', 't1', 'd2']
}

type CrateState = {
  ids: string[]
}

const initialState: CrateState = {
  ids: readStoredIds(),
}

const crateSlice = createSlice({
  name: 'crate',
  initialState,
  reducers: {
    addToCrate(state, action: PayloadAction<string>) {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload)
      }
    },
    removeFromCrate(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload)
    },
    replaceCrateIds(state, action: PayloadAction<string[]>) {
      state.ids = action.payload
    },
  },
})

export const { addToCrate, removeFromCrate, replaceCrateIds } = crateSlice.actions
export default crateSlice.reducer

export function persistCrateIds(ids: string[]) {
  try {
    localStorage.setItem(CRATE_LS, JSON.stringify(ids))
  } catch {
    return
  }
}
