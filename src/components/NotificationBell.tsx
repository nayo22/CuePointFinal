import { useId, useState } from 'react'
import { useAppSelector } from '../store/hooks'

export function NotificationBell() {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const items = useAppSelector((s) => s.inbox.notifications)

  const unread = items.filter((n) => !n.read).length

  return (
    <div className="notif-wrap">
      <button
        type="button"
        className="notif-bell btn btn-ghost btn--sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Alerts
        {unread > 0 ? (
          <span className="notif-badge" aria-hidden>
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={panelId}
          className="notif-panel panel"
          role="dialog"
          aria-label="Notifications"
        >
          <h2 className="notif-panel-title">Live inbox</h2>
          <p className="notif-panel-hint mono">
            Crate saves and comments from the server layer.
          </p>
          <ul className="notif-list">
            {items.map((n) => (
              <li
                key={n.id}
                className={n.read ? 'notif-item' : 'notif-item notif-item--new'}
              >
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-detail">{n.detail}</div>
                <div className="notif-item-time mono">{n.time}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
