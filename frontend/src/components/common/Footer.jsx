import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <span className="footer-logo">📊</span>
              <span className="footer-brand-name">
                MakeMyGraph
              </span>
            </div>
            <p className="footer-description">
              A powerful tool for visualizing and analyzing data through
              interactive graphs and statistical analysis. Make your data come
              alive with beautiful visualizations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">
              <span>🔗</span>
              <span>Quick Links</span>
            </h3>
            <ul className="footer-links">
              <li>
                <Link
                  to="/"
                  className="footer-link"
                >
                  <span className="footer-dot"></span>
                  <span>Create Graph</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/savedgraphs"
                  className="footer-link"
                >
                  <span className="footer-dot"></span>
                  <span>Saved Graphs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-section">
            <h3 className="footer-heading">
              <span>📬</span>
              <span>Contact Us</span>
            </h3>
            <ul className="contact-list">
              <li className="contact-item">
                <span>📧</span>
                <span>support@makemygraph.com</span>
              </li>
              <li className="contact-item">
                <span>📱</span>
                <span>+91 (123) 456-7890</span>
              </li>
              <li className="contact-item">
                <span>📍</span>
                <span>123 Graph Street, Data City, ST 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} MakeMyGraph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
