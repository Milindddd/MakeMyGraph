import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">📊</span>
          <span className="navbar-brand-name">MakeMyGraph</span>
        </Link>

        <button 
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Create Graph
          </Link>
          <Link 
            to="/savedgraphs" 
            className={`nav-link ${isActive('/savedgraphs')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Saved Graphs
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
