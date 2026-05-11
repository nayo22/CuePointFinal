import type { ThreadComment } from '../types/models'

type Props = {
  threads: ThreadComment[]
}

export function TechnicalThread({ threads }: Props) {
  if (threads.length === 0) {
    return <p className="empty-hint">No comments in this thread yet.</p>
  }
  return (
    <ul className="thread-list">
      {threads.map((t) => (
        <li key={t.id} className="thread-top">
          <div className="thread-author mono">{t.author}</div>
          <p className="thread-body">{t.body}</p>
          {t.replies && t.replies.length > 0 ? (
            <ul className="thread-replies">
              {t.replies.map((r) => (
                <li key={r.id}>
                  <span className="thread-author mono">{r.author}</span>
                  <span className="thread-body">{r.body}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
