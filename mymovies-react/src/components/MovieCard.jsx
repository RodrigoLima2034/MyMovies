import './MovieCard.css'

function MovieCard({ movie, onSelect }) {
  const posterUrl = movie.Poster !== 'N/A' 
    ? movie.Poster 
    : 'https://via.placeholder.com/300x450?text=No+Image'

  return (
    <div className="movie-card" onClick={() => onSelect(movie)}>
      <div className="poster-container">
        <img src={posterUrl} alt={movie.Title} className="poster" />
        <div className="overlay">
          <span className="view-details">Ver Detalhes</span>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="title">{movie.Title}</h3>
        <div className="meta">
          <span className="year">{movie.Year}</span>
          <span className="type">{movie.Type}</span>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
