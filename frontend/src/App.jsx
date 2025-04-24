import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import CreateGraph from "./components/graphs/CreateGraph";
import SavedGraphs from "./components/graphs/SavedGraphs";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 bg-orange-50 responsive-padding">
              <div className="container">
                <Routes>
                  <Route path="/" element={<CreateGraph />} />
                  <Route path="/savedgraphs" element={<SavedGraphs />} />
                </Routes>
              </div>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
