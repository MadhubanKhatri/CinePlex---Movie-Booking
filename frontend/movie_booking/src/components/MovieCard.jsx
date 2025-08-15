import { useNavigate } from "react-router-dom";

function MovieCard({ movie, onDetails, onBook }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {   
    onDetails(movie); // set selected movie in parent
    navigate(`/movie/${movie.name}`);
  };

  const handleBookSeats = () => {
    if(movie.currentshow && movie.currentshow.length > 0) {
      onBook(movie); // set selected movie in parent
      navigate(`/seat-selection/${movie.id}`);
    }else{
      alert("No showtimes available for this movie.");
    }
    
  };
  

  return (
    <div className="movie-card">
      <div className="movie-card__poster" style={{ height: "320px", display: "flex", 
        alignItems: "center", justifyContent: "center", background: "#181818" }}>
        <img
          src={movie.image}
          alt={movie.name}
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            width: "100%",
            height: "100%",
            display: "block"
          }}
        />
        <div className="movie-card__rating">⭐ {movie.rating}</div>
      </div>
      <div className="movie-card__content">
        <h3 className="movie-card__title">{movie.name}</h3>
        <div className="movie-card__meta">
          <span className="movie-card__genre">{movie.genre}</span>
          <span>{movie.release_date}</span>
        </div>
        <div className="movie-card__actions">
          <button
            className="btn btn--primary btn--sm"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          <button
            className="btn btn--outline btn--sm"
            onClick={handleBookSeats}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;