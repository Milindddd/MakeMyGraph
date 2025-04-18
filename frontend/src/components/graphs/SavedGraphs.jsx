import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getSavedGraphs, deleteGraph } from "../../services/mongodb";
import GraphDisplay from "./GraphDisplay";

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
      const savedGraphs = await getSavedGraphs();
      setGraphs(savedGraphs);
    } catch (error) {
      setError("Error loading saved graphs");
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
        toast.error("Failed to delete graph");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Saved Graphs
        </h1>

        {graphs.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="text-xl">No saved graphs found</p>
            <p className="mt-2">Create a new graph to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {graphs.map((graph) => (
              <div
                key={graph._id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {graph.name}
                  </h2>
                  <div className="space-x-4">
                    <button
                      onClick={() => handleDelete(graph._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Created: {new Date(graph.createdAt).toLocaleDateString()}
                </div>
                <GraphDisplay
                  data={graph.data}
                  selectedColumn={graph.selectedColumn}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedGraphs;
