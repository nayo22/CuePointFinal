import { useEffect } from 'react'
import { setInboxFeed } from '../features/inbox/inboxSlice'
import { fetchActivityFeed, fetchNotifications } from '../services/backend'
import { useAppDispatch } from '../store/hooks'

export function InboxRefresher() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    async function pull() {
      const [notifications, activity] = await Promise.all([
        fetchNotifications(),
        fetchActivityFeed(),
      ])
      if (!cancelled) {
        dispatch(setInboxFeed({ notifications, activity }))
      }
    }

    void pull()
    const intervalId = window.setInterval(() => void pull(), 40_000)

    function onVisibility() {
      if (document.visibilityState === 'visible') void pull()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [dispatch])

  return null
}
