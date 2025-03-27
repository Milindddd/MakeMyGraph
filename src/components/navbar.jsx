import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white shadow-md dark:bg-gray-900 transition-colors duration-300">
      {/* Logo */}
      <h1 className="text-2xl font-bold">MakeMyGraph</h1>

      {/* Navigation Links */}
      <ul className="flex space-x-6">
        {["Home", "Create Graph", "Saved Graphs", "About"].map((item, index) => (
          <li key={index}>
            <Link to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "")}`} className="hover:text-gray-200 transition">
              {item}
            </Link>
          </li>
        ))}
      </ul>

      {/* Dark Mode Toggle */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
};

export default Navbar;
