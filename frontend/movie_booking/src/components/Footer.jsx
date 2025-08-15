import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <h3>CinePlex Theater</h3>
            <p>Your premium movie experience destination</p>
          </div>
          <div className="footer__links">
            <div className="footer__section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/movies">Movies</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer__section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; 2025 CinePlex Theater. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;