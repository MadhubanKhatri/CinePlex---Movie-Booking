import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const isLoggedIn = !!localStorage.getItem("authToken");
  const loggedInUsername = localStorage.getItem("username");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    setDropdownOpen(false);
    navigate("/login");    
  };

  return (
    <header className="header">
      <nav className="nav container">
        <div className="nav__brand">
          <h2 className="nav__logo">CinePlex</h2>
        </div>
        <ul className="nav__menu" id="nav-menu">
          <li className="nav__item">
            <Link
              to="/home"
              className={`nav__link${
                location.pathname === "/home" ? " active" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li className="nav__item">
            <Link
              to="/movies"
              className={`nav__link${
                location.pathname === "/movies" ? " active" : ""
              }`}
            >
              Movies
            </Link>
          </li>
          <li className="nav__item">
            <Link
              to="/contact"
              className={`nav__link${
                location.pathname === "/contact" ? " active" : ""
              }`}
            >
              Contact
            </Link>
          </li>
        </ul>
        <div className="nav__actions">
          {!isLoggedIn && (
            <>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          )}
          {isLoggedIn && (
            <div
              className="profile-dropdown"
              ref={dropdownRef}
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <button
                className="btn btn--profile"
                onClick={() => setDropdownOpen((open) => !open)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                <span role="img" aria-label="profile">
                  👤
                </span>
                <span>{loggedInUsername}</span>
                <span style={{ fontSize: "12px" }}>
                  {dropdownOpen ? "▲" : "▼"}
                </span>
              </button>
              {dropdownOpen && (
                <div
                  className="profile-dropdown__menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    minWidth: "180px",
                    zIndex: 1000,
                    marginTop: "8px",
                  }}
                >
                  
                  <button
                    className="profile-dropdown__item"
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "black"
                    }}
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate && onNavigate("booking-history");
                      window.location.href = "/booking-history";
                    }}
                  >
                    Booking History
                  </button>
                  <button
                    className="profile-dropdown__item"
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      color: "#b30000",
                      cursor: "pointer",
                    }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <button className="nav__toggle" id="nav-toggle">
            ☰
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;