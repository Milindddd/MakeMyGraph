import { useState } from "react";
import { toast } from "react-toastify";
import FileUpload from "../upload/FileUpload";
import GraphDisplay from "./GraphDisplay";
import { saveGraph } from "../../services/mongodb";

const CreateGraph = () => {
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleDataProcessed = (processedData) => {
    if (processedData && processedData.length > 0) {
      setData(processedData);
      setColumns(Object.keys(processedData[0]));
      setSelectedColumn("");
      toast.success("Data loaded successfully!");
    }
  };

  const handleSaveGraph = async () => {
    if (!data || !selectedColumn) {
      toast.error("Please upload data and select a column first");
      return;
    }

    try {
      setIsSaving(true);
      await saveGraph({
        data,
        selectedColumn,
        chartType: "bar",
        name: `${selectedColumn} Analysis`,
      });
      toast.success("Graph saved successfully!");
    } catch (error) {
      toast.error("Error saving graph: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center animate-fade-in">
          Create New Graph
        </h1>

        <div className="space-y-8">
          {/* File Upload Section */}
          <div
            className="card animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Upload Your Data
            </h2>
            <FileUpload onDataProcessed={handleDataProcessed} />
          </div>

          {/* Column Selection */}
          {data && columns.length > 0 && (
            <div
              className="card animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Select Column to Analyze
              </h2>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="select-field"
              >
                <option value="">Select a column...</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Graph Display */}
          {data && selectedColumn && (
            <div
              className="card animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Graph Visualization
                </h2>
                <button
                  onClick={handleSaveGraph}
                  disabled={isSaving}
                  className={`btn ${
                    isSaving ? "btn-secondary" : "btn-primary"
                  } hover-lift`}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2 w-5 h-5"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Graph"
                  )}
                </button>
              </div>
              <GraphDisplay data={data} selectedColumn={selectedColumn} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGraph;
