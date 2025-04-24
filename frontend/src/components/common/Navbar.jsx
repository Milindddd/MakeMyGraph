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
    <nav className="navbar bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <span className="text-xl font-semibold">MakeMyGraph</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/')} text-lg hover:text-orange-500 transition-colors`}
            >
              Create Graph
            </Link>
            <Link 
              to="/savedgraphs" 
              className={`nav-link ${isActive('/savedgraphs')} text-lg hover:text-orange-500 transition-colors`}
            >
              Saved Graphs
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} py-4`}>
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/')} text-lg hover:text-orange-500 transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Create Graph
            </Link>
            <Link 
              to="/savedgraphs" 
              className={`nav-link ${isActive('/savedgraphs')} text-lg hover:text-orange-500 transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Saved Graphs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
