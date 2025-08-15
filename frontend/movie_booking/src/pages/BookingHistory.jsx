import { useEffect, useState } from "react";
import axios from "axios";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    if (!userEmail) {
      setBookings([]);
      setLoading(false);
      return;
    }
    axios.get(`http://127.0.0.1:8000/api/booking-history/?email=${userEmail}`)
      .then(res => {       
        setBookings(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userEmail]);

  if (!userEmail) {
    return <div style={{padding: 24}}>Please login to view your booking history.</div>;
  }

  return (
    <section className="page active">
      <div className="container" style={{maxWidth: 800, margin: "0 auto", padding: 24}}>
        <h2 style={{marginBottom: 24}}>My Booking History</h2>
        {loading ? (
          <div>Loading...</div>
        ) : bookings.length === 0 ? (
          <div>No bookings found.</div>
        ) : (
          <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
              <tr>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Booking ID</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Movie</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Theatre</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Date</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Time</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Seats</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Amount</th>
                <th style={{borderBottom: "1px solid #ccc", padding: 8}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={{padding: 8}}>{b.id}</td>
                  <td style={{padding: 8}}>{b.movie_name || b.movie}</td>
                  <td style={{padding: 8}}>{b.theatre_name || b.theatre}</td>
                  <td style={{padding: 8}}>{b.date}</td>
                  <td style={{padding: 8}}>{b.time}</td>
                  <td style={{padding: 8}}>{b.seats}</td>
                  <td style={{padding: 8}}>₹{b.amount}</td>
                  <td style={{padding: 8}}>{b.status ? "Paid": "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default BookingHistory;
