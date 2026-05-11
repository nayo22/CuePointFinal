import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ActivityItem, NotificationItem } from '../../types/models'

type InboxState = {
  notifications: NotificationItem[]
  activity: ActivityItem[]
}

const initialState: InboxState = {
  notifications: [],
  activity: [],
}

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    setInboxFeed(
      state,
      action: PayloadAction<{
        notifications: NotificationItem[]
        activity: ActivityItem[]
      }>,
    ) {
      state.notifications = action.payload.notifications
      state.activity = action.payload.activity
    },
  },
})

export const { setInboxFeed } = inboxSlice.actions
export default inboxSlice.reducer
