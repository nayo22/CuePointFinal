import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GlobalSearchBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    navigate(`/dig?q=${encodeURIComponent(q.trim() || '')}`)
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
