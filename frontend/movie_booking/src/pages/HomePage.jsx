import React from "react";
import MovieCard from "../components/MovieCard";
import { useNavigate } from "react-router-dom";

function HomePage({ movies, onBook, onDetails, onTrailer, setCurrentPage, onSeatSelection }) {
  const navigate = useNavigate();

  // Handler for viewing details
  const handleViewDetails = (movie) => {
    onBook(movie); // set selected movie
    navigate(`/movie/${movie.name}`);
  };


  const handleBookSeats = () => {
    const movie = movies[1]; // Assuming the second movie is the featured one
    if(movie.currentshow && movie.currentshow.length > 0) {
      onBook(movie); // set selected movie in parent
      navigate(`/seat-selection/${movie.id}`);
    }else{
      alert("No showtimes available for this movie.");
    }
    
  };

  return (
    <section id="home-page" className="page active">
      <section className="hero">
        <div className="hero__content container">
          <div className="hero__text">
            <span className="hero__badge">NOW PLAYING</span>
            <h1 className="hero__title">{movies[1]?.name || "Loading..."}</h1>
            <p className="hero__description">{movies[1]?.description || "Loading..."}</p>
            <div className="hero__meta">
              <span className="hero__rating">⭐ {movies[1]?.rating}</span>
              <span className="hero__duration">{movies[1]?.duration}</span>
              <span className="hero__genre">{movies[1]?.genre}</span>
            </div>
            <div className="hero__actions">
              <button className="btn btn--primary btn--lg" onClick={handleBookSeats}>Book Tickets</button>
              <button className="btn btn--outline btn--lg" onClick={() => onTrailer(movies[1]?.name)}>▶ Watch Trailer</button>
            </div>
          </div>
          <div className="hero__poster">
            <img src={movies[1]?.image} alt={movies[1]?.image || "Loading..."} className="hero__image" />
          </div>
        </div>
      </section>
      <section className="trending">
        <div className="container">
          <h2 className="section__title">Trending Movies</h2>
          <div className="movies-grid">
            {movies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDetails={handleViewDetails}
                onBook={onBook}
                setCurrentPage={setCurrentPage}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

export default HomePage;