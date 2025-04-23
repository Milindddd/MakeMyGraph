import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getSavedGraphs, deleteGraph } from "../../services/mongodb";
import GraphDisplay from "./GraphDisplay";
import "./SavedGraphs.css";

const SavedGraphs = () => {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedGraphs();
  }, []);

  const loadSavedGraphs = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedGraphs = await getSavedGraphs();
      setGraphs(savedGraphs);
    } catch (error) {
      console.error('Error loading saved graphs:', error);
      setError("Unable to load saved graphs. Please try again later.");
      toast.error("Failed to load saved graphs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (graphId) => {
    if (window.confirm("Are you sure you want to delete this graph?")) {
      try {
        await deleteGraph(graphId);
        setGraphs(graphs.filter((graph) => graph._id !== graphId));
        toast.success("Graph deleted successfully");
      } catch (error) {
        console.error('Error deleting graph:', error);
        toast.error("Failed to delete graph");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading saved graphs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <div className="error-message">{error}</div>
          <div className="error-actions">
            <button 
              onClick={loadSavedGraphs} 
              className="retry-button"
            >
              <span className="retry-icon">🔄</span>
              Try Again
            </button>
            <Link to="/" className="home-button">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (graphs.length === 0) {
    return (
      <div className="saved-graphs-container">
        <div className="saved-graphs-header">
          <h1 className="saved-graphs-title">Saved Graphs</h1>
        </div>
        <div className="empty-state">
          <h2 className="empty-state-title">No Saved Graphs Yet</h2>
          <p className="empty-state-subtitle">
            Create your first graph to see it here!
          </p>
          <Link to="/" className="graph-btn graph-btn-view">
            Create New Graph
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-graphs-container">
      <div className="saved-graphs-header">
        <h1 className="saved-graphs-title">Saved Graphs</h1>
        <Link to="/" className="create-graph-btn">
          Create New Graph
        </Link>
      </div>
      <div className="graphs-grid">
        {graphs.map((graph) => (
          <div key={graph._id} className="graph-card">
            <div className="graph-header">
              <h2 className="graph-title">{graph.name}</h2>
              <div className="graph-date">
                Created: {new Date(graph.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="graph-preview">
              <GraphDisplay
                data={graph.data}
                selectedColumn={graph.selectedColumn}
              />
            </div>
            <div className="graph-actions">
              <Link to={`/graph/${graph._id}`} className="graph-btn graph-btn-view">
                View Graph
              </Link>
              <button
                onClick={() => handleDelete(graph._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedGraphs;
