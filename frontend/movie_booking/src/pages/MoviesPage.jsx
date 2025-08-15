import React, { useState } from "react";
import MovieCard from "../components/MovieCard";

function MoviesPage({ movies, onDetails, onBook, setCurrentPage }) {
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [year, setYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = movies.filter(movie =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //overwrite the movies from filteredMovies
  movies = filteredMovies;
   
  return (
    <section id="movies-page" className="page active">
      <div className="container">
        <div className="movies-header">
          <h1 className="page-title">Movies</h1>

        </div>
        <div className="search-bar-container" style={{ marginBottom: "1rem", textAlign: "center", border: "1px solid var(--color-border)", padding: "1rem", borderRadius: "8px" }}>
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: "0.5rem", width: "100%", fontSize: "1rem", border: "none" }}
          />
        </div>
        <div className="movies-grid">
          {movies.length === 0 ? (
            <p className="no-results" style={{ textAlign: "center", color: "var(--color-text-secondary)", margin: "2rem" }}>
              No movies found matching your criteria.
            </p>
          ) : (
            movies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDetails={onDetails}
                onBook={onBook}
                setCurrentPage={setCurrentPage}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default MoviesPage;