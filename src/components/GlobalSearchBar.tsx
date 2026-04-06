import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function GlobalSearchBarFields({
  initialQ,
  onNavigate,
}: {
  initialQ: string
  onNavigate: (path: string) => void
}) {
  const [q, setQ] = useState(initialQ)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    onNavigate(`/dig?q=${encodeURIComponent(q.trim() || '')}`)
  }

  return (
    <form className="shell-search" onSubmit={onSubmit} role="search">
      <label htmlFor="global-search-q" className="visually-hidden">
        Search catalog
      </label>
      <input
        id="global-search-q"
        type="search"
        name="q"
        autoComplete="off"
        placeholder="Search tracks and artists"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="btn btn-secondary btn--sm">
        Search
      </button>
    </form>
  )
}

export function GlobalSearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const onDig = location.pathname === '/dig'
  const initialQ = onDig
    ? new URLSearchParams(location.search).get('q') ?? ''
    : ''
  const syncKey = onDig ? `dig:${location.search}` : 'shell'

  return (
    <GlobalSearchBarFields
      key={syncKey}
      initialQ={initialQ}
      onNavigate={(path) => navigate(path)}
    />
  )
}
