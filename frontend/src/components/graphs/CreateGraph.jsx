import { useState } from "react";
import { toast } from "react-toastify";
import FileUpload from "../upload/FileUpload";
import GraphDisplay from "./GraphDisplay";
import { saveGraph } from "../../services/mongodb";
import "./CreateGraph.css";

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
    <div className="create-graph-container">
      <div className="container">
        <h1 className="create-graph-title">Create New Graph</h1>

        <div className="create-graph-content">
          {/* File Upload Section */}
          <div className="card">
            <h2 className="card-title">Upload Your Data</h2>
            <FileUpload onDataProcessed={handleDataProcessed} />
          </div>

          {/* Column Selection */}
          {data && columns.length > 0 && (
            <div className="card">
              <h2 className="card-title">Select Column to Analyze</h2>
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
            <div className="card">
              <div className="graph-controls">
                <h2 className="card-title">Graph Visualization</h2>
                <button
                  onClick={handleSaveGraph}
                  disabled={isSaving}
                  className={`save-button ${
                    isSaving ? "save-button-secondary" : "save-button-primary"
                  }`}
                >
                  {isSaving ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Graph"
                  )}
                </button>
              </div>
              <div className="w-full overflow-x-auto">
                <GraphDisplay data={data} selectedColumn={selectedColumn} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGraph;
