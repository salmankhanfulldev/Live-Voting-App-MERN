
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          LivePoll
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/create"
            className={`nav-link nav-link-cta ${location.pathname === '/create' ? 'active' : ''}`}
          >
            + Create Poll
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;