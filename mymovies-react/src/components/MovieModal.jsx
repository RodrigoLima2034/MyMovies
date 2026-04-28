import { useEffect } from 'react'
import './MovieModal.css'

function MovieModal({ movie, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  if (!movie) return null

  const posterUrl = movie.Poster !== 'N/A' 
    ? movie.Poster 
    : 'https://via.placeholder.com/300x450?text=No+Image'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="modal-body">
          <div className="modal-poster">
            <img src={posterUrl} alt={movie.Title} />
          </div>
          <div className="modal-details">
            <h2>{movie.Title}</h2>
            <div className="modal-meta">
              <span>{movie.Year}</span>
              <span>{movie.Rated}</span>
              <span>{movie.Runtime}</span>
            </div>
            <p className="plot">{movie.Plot}</p>
            <div className="info-grid">
              <div><strong>Diretor:</strong> {movie.Director}</div>
              <div><strong>Atores:</strong> {movie.Actors}</div>
              <div><strong>Gênero:</strong> {movie.Genre}</div>
              <div><strong>Avaliação:</strong> ⭐ {movie.imdbRating}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieModal
