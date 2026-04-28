import { useState } from 'react'
import './Header.css'

function Header({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <h1>MyMovies</h1>
        </div>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Buscar filmes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </div>
    </header>
  )
}

export default Header
