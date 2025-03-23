import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

import AboutUs from "./components/AboutUs";

function App() {
  return (
    <div>
      <AboutUs />
    </div>
  );
}

export default App;


import Navbar from "./components/navbar";

function App() {
  return (
    <div>
      <Navbar />
      {/* Other components go here */}
    </div>
  );
}
export default App;


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
