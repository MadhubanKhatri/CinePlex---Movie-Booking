import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import ContactPage from "./pages/ContactPage";
import TrailerModal from "./components/TrailerModal";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import "./style.css";
import axios from "axios";
import BookingHistory from "./pages/BookingHistory";

function AppContent() {
  // Global state
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerTitle, setTrailerTitle] = useState("");
  const [moviesData, setMovies] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Theme initialization
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;  
    document.documentElement.setAttribute("data-color-scheme", prefersDark ? "dark" : "light");

    axios.get('http://127.0.0.1:8000/api/movies/')
      .then(response => {
        console.log("Movies fetched successfully:", response.data);
        setMovies(response.data);
        
      })
      .catch(error => {
        console.error("Error fetching movies:", error)
      })

  }, []);

  // Modal control
  const openTrailer = (title) => {
    setTrailerTitle(title);
    setShowTrailer(true);
  };
  const closeTrailer = () => setShowTrailer(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  }

  // Handler to set selected movie (for details)
  const handleSelectMovie = (movie) => setSelectedMovie(movie);
  

  // Auth wrapper
  // function RequireAuth({ children }) {
  //   const token = localStorage.getItem("authToken");
  //   if (!token) {
  //     return <Navigate to="/login" replace />;
  //   }
  //   return children;
  // }

  const handleLogin = (form) => {
    console.log(form);
    
    if(form.isLogin){
      axios.post('http://127.0.0.1:8000/api/api-token-auth/', {
        username: form.username,  // Use 'username' since DRF expects username field
        password: form.password,
        })
        .then(response => {
          console.log("Login successful:", response.data);
          
        const token = response.data.token;
        const user_email = response.data.email;
        const user_name = response.data.username
        

        localStorage.setItem("authToken", token); // Store token in localStorage
        localStorage.setItem("email", user_email);
        localStorage.setItem("username", user_name);
        navigate("/home"); // Redirect to home after login
    
        })
        .catch(error => {
        // Handle login errors
        setError(error.response.data.error);
        
        });
    }
    else{
      if(form){
        axios.post("http://127.0.0.1:8000/api/register/", form)
        .then(response => {
            console.log("Registration successful:", response.data);
            alert("Registration successful!");        
        })
        .catch(error => {
            console.error("Error booking seats:", error);
            alert("Failed to book seats. Please try again.");
        });
    }else{
        alert("Please fill in all fields.");
    }
    }
    
  }


  return (
    <>
      <Header onNavigate={handleNavigate} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route
            path="/home"
            element={
              // <RequireAuth>
                <HomePage
                  movies={moviesData}
                  onBook={setSelectedMovie}
                  onDetails={handleSelectMovie}
                  onTrailer={openTrailer}
                  setCurrentPage={setCurrentPage}
                />
              // </RequireAuth>
            }
          />
          <Route
            path="/movies"
            element={
              <MoviesPage
                movies={moviesData}
                onDetails={handleSelectMovie}
                onBook={setSelectedMovie}
                setCurrentPage={setCurrentPage}
              />
            }
          />
          <Route
            path="/movie/:title"
            element={
              <MovieDetailsPage
                movies={moviesData}
                onBook={setSelectedMovie}
                onTrailer={openTrailer}
                setCurrentPage={setCurrentPage}
              />
            }
          />
          <Route
            path="/seat-selection/:id"
            element={
              <SeatSelectionPage
                movie={selectedMovie}
                showtime={selectedShowtime}
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
                setSelectedShowtime={setSelectedShowtime}
                setCurrentPage={setCurrentPage}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm onRegister={handleLogin}/>
            }
          />
          <Route
            path="/login"
            element={<LoginForm onLogin={handleLogin} error={error}/>}
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking-history" element={<BookingHistory />} />
        </Routes>
      </main>
      <Footer />
      <TrailerModal
        open={showTrailer}
        title={trailerTitle}
        onClose={closeTrailer}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;