import { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white shadow-md">
      <h1 className="text-2xl font-bold">MakeMyGraph</h1>

      {/* Navigation Links */}
      <ul className="flex space-x-6">
        <li>
          <Link to="/" className="hover:text-gray-200">Home</Link>
        </li>
        <li>
          <Link to="/create" className="hover:text-gray-200">Create Graph</Link>
        </li>
        <li>
          <Link to="/saved" className="hover:text-gray-200">Saved Graphs</Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-gray-200">About</Link>
        </li>
      </ul>

      {/* Dark Mode Toggle */}
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="p-2 bg-gray-800 rounded-full"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
};

export default Navbar;
