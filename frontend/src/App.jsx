import { Routes, Route } from "react-router-dom";
import CreateGraph from "./components/graphs/CreateGraph";
import SavedGraphs from "./components/graphs/SavedGraphs";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<CreateGraph />} />
          <Route path="/savedgraphs" element={<SavedGraphs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
