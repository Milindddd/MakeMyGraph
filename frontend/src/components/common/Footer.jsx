import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">📊</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                MakeMyGraph
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              A powerful tool for visualizing and analyzing data through
              interactive graphs and statistical analysis. Make your data come
              alive with beautiful visualizations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
              <span>🔗</span>
              <span>Quick Links</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-blue-400 transition-colors duration-200"></span>
                  <span>Create Graph</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/savedgraphs"
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-blue-400 transition-colors duration-200"></span>
                  <span>Saved Graphs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
              <span>📬</span>
              <span>Contact Us</span>
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-300 flex items-center space-x-2">
                <span>📧</span>
                <span>support@makemygraph.com</span>
              </li>
              <li className="text-gray-300 flex items-center space-x-2">
                <span>📱</span>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="text-gray-300 flex items-center space-x-2">
                <span>📍</span>
                <span>123 Graph Street, Data City, ST 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} MakeMyGraph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
