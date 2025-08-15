import axios from "axios";
import React, { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"

const ROWS = 10;
const COLS = 12;

// All seats are available and have the same price
const seatTypes = {
  available: { className: "available", price: 10 }
};


// Generate seat map: all seats are available
function generateSeatMap() {
  const map = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push({ type: "available", id: `${String.fromCharCode(65 + r)}${c + 1}` });
    }
    map.push(row);
  }
  return map;
}

function SeatSelectionPage({ movie, showtime, selectedSeats, setSelectedSeats, setSelectedShowtime, setCurrentPage }) {
  const [seatMap, setSeatMap] = useState(generateSeatMap());
  const [selected, setSelected] = useState([]);
  const [selectedShow, setSelectedShow] = useState(showtime || null);
  const [bookedSeats, setBookedSeats] = useState([]); // Add state for booked seats
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  const { id } = useParams(); // movie ID from URL
  const [movieData, setMovie] = useState(null);
  const userEmail = localStorage.getItem("email");
  const [userId, setUserID] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    setSelectedShow(null)
    axios.get(`http://127.0.0.1:8000/api/movies/${id}/`)
      .then(res => setMovie(res.data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/show_users/${localStorage.getItem("email")}/`)
        .then(response => {
          setUserID(response.data.id);    
        })
        .catch(error => {
          console.error("Error fetching movies:", error)
        })

  })


  if (!movie && !movieData){
    return <div>Please select a movie first.</div>;
  }else if(!movie) {
    movie = movieData;
  }

  
  // Unique showtimes for tiles (group by time+date+theatre)
  const showTiles = Array.isArray(movie.currentshow)
    ? movie.currentshow.map((show, idx) => ({
        key: `${show.theatre?.name}-${show.date}-${show.time}`,
        label: `${show.time} (${show.theatre?.name}) - ₹${show.price}`,
        show
      }))
    : [];

  // Handle seat click
  const handleSeatClick = (rowIdx, colIdx) => {
    const seat = seatMap[rowIdx][colIdx];
    const seatId = seat.id;
    // Prevent selecting booked seats
    if (bookedSeats.includes(seatId)) return;
    if (selected.includes(seatId)) {
      setSelected(selected.filter(s => s !== seatId));
    } else {
      setSelected([...selected, seatId]);
    }
  };

  // Calculate total
  const getSeatPrice = (rowIdx, colIdx) => seatTypes["available"].price;
  const selectedSeatObjs = selected.map(seatId => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (seatMap[r][c].id === seatId) return { ...seatMap[r][c], row: r, col: c };
      }
    }
    return null;
  }).filter(Boolean);


  const totalAmount = selectedShow && selectedShow.price ? selectedShow.price * selectedSeatObjs.length : 0;
  

  function handleSelectedShow(show){
    setSelectedShow(show);
    setSelected([]); // Clear selected seats when switching shows
    if (setSelectedShowtime) {
      setSelectedShowtime(show)
    };

    
    axios.get(`http://127.0.0.1:8000/api/booked-seats/?movie_id=${movie?.id}&theatre_id=${show.theatre.id}&date=${show.date}&time=${show.time}`)
        .then(response => {
          // Store booked seats from response
          console.log("Booked seats:", response.data.booked_seats);
          setBookedSeats(response.data.booked_seats || []);
        })
        .catch(error => {
          console.error("Error fetching movies:", error)
        })

  }

  // Razorpay script loader
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Razorpay payment handler
  const handlePaymentProceed = async () => {
    if (!selectedShow) return;
    if(userEmail === null || userEmail === undefined){
      alert("Please login to proceed with booking.");
    }
    else{
      const loaded = await loadRazorpayScript();
      if (!loaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }
    }
    
    
    
    // 1. Create order on backend
    axios.post("http://127.0.0.1:8000/api/create-razorpay-order/", {
      amount: totalAmount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Math.floor(Math.random()*1000000)}`,
      notes: {
        movie: movie.name,
        show: selectedShow.id,
        seats: selected.join(", "),
        user: userEmail
      }
    })
    .then(res => {
      const order = res.data;
      
      // 2. Open Razorpay checkout
      const options = {
        key: "rzp_test_ARV6EVJQoaSor3", // replace with your Razorpay key id
        currency: res.data.order.currency,
        amount: res.data.order.amount,
        name: movie.name,
        description: `Booking for ${selectedShow.date} ${selectedShow.time}`,
        order_id: res.data.order.id,
        handler: function (response) {
          // 3. On payment success, confirm booking in backend
          axios.post("http://127.0.0.1:8000/api/seat-booking/", {
            user: userId,
            movie: movie.id,
            show: selectedShow.id,
            date: selectedShow.date,
            time: selectedShow.time,
            seats: selected.join(", "),
            amount: totalAmount,
            status: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          })
          .then(response2 => {
            setBookingSuccess(true);
            setBookingDetails({
              movieName: movie.name,
              theatre: selectedShow.theatre?.name,
              date: selectedShow.date,
              time: selectedShow.time,
              seats: selected.join(", "),
              amount: totalAmount,
              email: userEmail,
              bookingId: response2.data?.id || Math.floor(Math.random()*1000000)
            });
          })
          .catch(() => {
            alert("Booking failed after payment. Please contact support.");
          });
        },
        prefill: {
          email: userEmail
        },
        theme: { color: "#3399cc" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    })
    .catch(() => {
      alert("Failed to initiate payment. Please try again.");
    });
  };

  // E-ticket template
  if (bookingSuccess && bookingDetails) {
    return (
      <section id="e-ticket" className="page active">
        <div className="container" style={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh"}}>
          <div className="card" style={{maxWidth: 400, width: "100%", padding: 24, textAlign: "center"}}>
            <h2 style={{marginBottom: 16}}>🎟️ E-Ticket</h2>
            <div style={{marginBottom: 8}}><strong>Booking ID:</strong> {bookingDetails.bookingId}</div>
            <div style={{marginBottom: 8}}><strong>Movie:</strong> {bookingDetails.movieName}</div>
            <div style={{marginBottom: 8}}><strong>Theatre:</strong> {bookingDetails.theatre}</div>
            <div style={{marginBottom: 8}}><strong>Date:</strong> {bookingDetails.date}</div>
            <div style={{marginBottom: 8}}><strong>Time:</strong> {bookingDetails.time}</div>
            <div style={{marginBottom: 8}}><strong>Seats:</strong> {bookingDetails.seats}</div>
            <div style={{marginBottom: 8}}><strong>Total Paid:</strong> ₹{bookingDetails.amount}</div>
            <div style={{marginBottom: 16}}><strong>User:</strong> {bookingDetails.email}</div>
            <button
              className="btn btn--primary btn--full-width"
              onClick={() => navigate('/home')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="seat-selection-page" className="page active">
      <div className="container">
        <div className="seat-selection">
          <div className="seat-selection__header">
            <h2 className="seat-selection__title" id="selected-movie-title">
              {movie.name} - Select Your Seats
            </h2>
            {/* Show time tiles */}
            <div style={{ margin: "16px 0", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {showTiles.length > 0 ? (
                showTiles.map(({ key, label, show }) => (
                  <button
                    key={key}
                    className={`showtime-btn${selectedShow && selectedShow.time === show.time && selectedShow.date === show.date && selectedShow.theatre?.name === show.theatre?.name ? " selected" : ""}`}
                    style={{ minWidth: 100 }}
                    onClick={() => handleSelectedShow(show)}
                  >
                    {label}
                  </button>
                ))
              ) : (
                <span>No showtimes available</span>
              )}
            </div>
            <div className="seat-selection__info">
              <span id="selected-showtime">
                {selectedShow
                  ? `${selectedShow.date} - ${selectedShow.time} (${selectedShow.theatre?.name})`
                  : "Select a showtime"}
              </span>
            </div>
          </div>
          <div className="seat-selection__content">
            <div className="seat-map-container">
              <div className="screen">
                <div className="screen__label">SCREEN</div>
              </div>
              <div className="seat-map" id="seat-map">
                {seatMap.map((row, rowIdx) => (
                  <div className="seat-row" key={rowIdx}>
                    <span className="row-label">{String.fromCharCode(65 + rowIdx)}</span>
                    {row.map((seat, colIdx) => {
                      const isSelected = selected.includes(seat.id);
                      const isBooked = bookedSeats.includes(seat.id);
                      return (
                        <div
                          key={seat.id}
                          className={`seat available${isSelected ? " selected" : ""}${isBooked ? " occupied" : ""}`}
                          onClick={() => handleSeatClick(rowIdx, colIdx)}
                          title={
                            isBooked
                              ? "Booked"
                              : `Row ${String.fromCharCode(65 + rowIdx)}, Seat ${colIdx + 1}`
                          }
                          style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                        ></div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="seat-legend">
                <div className="legend-item">
                  <div className="seat-sample available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="seat-sample selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="seat-sample occupied"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
            <div className="booking-summary">
              <div className="card">
                <div className="card__body">
                  <h3>Booking Summary</h3>
                  <div className="summary-item">
                    <span>Selected Seats:</span>
                    <span id="selected-seats-display">
                      {selected.length > 0 ? selected.join(", ") : "None"}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Total Amount:</span>
                    <span id="total-amount">₹{totalAmount}</span>
                  </div>
                  <button
                    className="btn btn--primary btn--full-width"
                    id="proceed-payment"
                    disabled={selected.length === 0 || !selectedShow}
                    onClick={() => handlePaymentProceed()}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeatSelectionPage;