import { useParams,useNavigate } from "react-router-dom";

function MovieDetailsPage({ movies, onBook, onTrailer, setCurrentPage }) {
  const { title } = useParams();
  const movie = movies?.find(m => String(m.name) === String(title));
  console.log("Selected movie:", movies);

  const navigate = useNavigate();

  const handleBookSeats = () => {
    console.log("movieeee: ",movie);
    if(movie.currentshow && movie.currentshow.length > 0) {
      onBook(movie); // set selected movie in parent
      navigate(`/seat-selection/${movie.id}`);
    }else{
      alert("No showtimes available for this movie.");
    }
    
  };

  // Group shows by theatre name and date
  const groupedShows = {};
  if (Array.isArray(movie?.currentshow)) {
    movie.currentshow.forEach(show => {
      const key = `${show.theatre?.name}||${show.date}`;
      if (!groupedShows[key]) {
        groupedShows[key] = {
          theatre: show.theatre,
          date: show.date,
          shows: []
        };
      }
      groupedShows[key].shows.push(show);
    });
  }

  if (!movie) return <div>Movie not found.</div>;

  return (
    <section id="movie-details-page" className="page active">
      <div className="container">
        <div className="movie-details">
          <div className="movie-details__poster">
            <img src={movie.image} alt={movie.name} />
          </div>
          <div className="movie-details__info">
            <h1>{movie.name}</h1>
            <p>{movie.description}</p>
            {/* ...meta info... */}
            <div className="movie-details__meta">
              <div class="meta-item">
                <strong>Rating</strong>
                <p>⭐ 8/10</p>
              </div>
              <div class="meta-item">
                <strong>Duration</strong>
                <p>{movie.duration}</p>
              </div>
              <div class="meta-item">
                <strong>Genre</strong>
                <p>{movie.genre}</p>
              </div>
              <div class="meta-item">
                <strong>Language</strong>
                <p>{movie.langauge}</p>
              </div>
              <div class="meta-item">
                <strong>Director</strong>
                <p>{movie.director}</p>
              </div>
              <div class="meta-item">
                <strong>Cast</strong>
                <p>{movie.cast}</p>
              </div>
            </div>
            <div className="showtimes">
              <h3>Available Shows</h3>
              <div className="showtimes-list" style={{ flexDirection: "column", gap: 24 }}>
                {Object.keys(groupedShows).length > 0 ? (
                  Object.values(groupedShows).map((group, idx) => (
                    <div key={idx} style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {group.theatre?.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
                        {group.theatre?.address}
                      </div>
                      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
                        Contact: {group.theatre?.contact}
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 500 }}>Date:</span>
                        <span>{group.date}</span>
                        <span style={{ fontWeight: 500 }}>Times:</span>
                        {group.shows.map((show, i) => (
                          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
                            <button
                              className="showtime-btn"
                              style={{ position: "relative" }}
                              title={`Price: ₹${show.price}`}
                            >
                              {show.time}
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No shows available.</div>
                )}
              </div>
            </div>
            <div className="movie-actions" style={{ marginTop: 24, display: "flex", gap: 16 }}>
              <button className="btn btn--primary btn--lg" onClick={handleBookSeats}>
                Book Tickets
              </button>
              <button className="btn btn--outline btn--lg" onClick={() => onTrailer(movie.name)}>
                ▶ Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MovieDetailsPage;