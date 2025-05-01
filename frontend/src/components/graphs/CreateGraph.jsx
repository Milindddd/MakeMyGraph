import { useState } from "react";
import FileUpload from "../upload/FileUpload";
import GraphDisplay from "./GraphDisplay";
import "./CreateGraph.css";

const CreateGraph = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedData, setUploadedData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedCategoryColumn, setSelectedCategoryColumn] = useState("");
  const [selectedValueColumn, setSelectedValueColumn] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [columnTypes, setColumnTypes] = useState(null);
  const [error, setError] = useState(null);
  const [isPreviewConfirmed, setIsPreviewConfirmed] = useState(false);

  const steps = [
    {
      title: "Upload Data",
      description: "Upload your CSV or Excel file containing the data",
    },
    {
      title: "Select Column",
      description: "Choose the column you want to visualize",
    },
    {
      title: "View Graph",
      description: "Select the type of graph and view your data",
    },
  ];

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: "📊" },
    { value: "line", label: "Line Chart", icon: "📈" },
    { value: "pie", label: "Pie Chart", icon: "🥧" },
    { value: "scatter", label: "Scatter Plot", icon: "🔵" },
    { value: "histogram", label: "Histogram", icon: "📊" },
    { value: "box", label: "Box Plot", icon: "📦" },
  ];

  const handleDataProcessed = (processedData) => {
    const { data, headers, columnTypes } = processedData;
    
    // Validate the data
    if (!data || data.length === 0) {
      setError("No data found in the file");
      return;
    }

    // Check if we have any numeric columns
    const hasNumericColumns = Object.entries(columnTypes).some(
      ([header, type]) => type.isNumeric && type.totalValues > 0
    );
    
    // Check if we have any date columns
    const hasDateColumns = Object.entries(columnTypes).some(
      ([header, type]) => type.isDate && type.totalValues > 0
    );
    
    // Check if we have any categorical columns (non-numeric, non-date)
    const hasCategoricalColumns = Object.entries(columnTypes).some(
      ([header, type]) => !type.isNumeric && !type.isDate && type.totalValues > 0
    );

    if (!hasNumericColumns && !hasDateColumns && !hasCategoricalColumns) {
      setError("No valid data columns found. Please check your file format.");
      return;
    }

    setUploadedData(data);
    setColumnTypes(columnTypes);
    setHeaders(headers);
    setCurrentStep(1);
    setError(null); // Clear any previous errors
  };

  const handleColumnSelect = (column, type) => {
    if ((chartType === "bar" || chartType === "pie")) {
      if (type.isNumeric) {
        setSelectedValueColumn(column);
      } else {
        setSelectedCategoryColumn(column);
      }
    } else {
      setSelectedColumn(column);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep - 1 === 0) {
        setIsPreviewConfirmed(false); // Reset confirmation when going back to preview
      }
    }
  };

  const handleReset = () => {
    setUploadedData(null);
    setSelectedColumn("");
    setSelectedValueColumn("");
    setChartType("bar");
    setCurrentStep(0);
  };

  const renderDataPreview = () => {
    if (!uploadedData || uploadedData.length === 0) return null;

    // Show first 5 rows of data
    const previewData = uploadedData.slice(0, 5);

  return (
      <div className="data-preview">
        <h3>Data Preview</h3>
        <div className="preview-table-container">
          <table className="preview-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {uploadedData.length > 5 && (
          <p className="preview-note">Showing first 5 rows of {uploadedData.length} total rows</p>
        )}
      </div>
    );
  };

  const handlePreviewContinue = () => {
    setIsPreviewConfirmed(true);
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="upload-section">
          <FileUpload onDataProcessed={handleDataProcessed} />
          {error && <div className="error-message">{error}</div>}
          {uploadedData && renderDataPreview()}
          {uploadedData && !isPreviewConfirmed && (
            <div className="preview-confirmation">
              <button className="nav-button continue" onClick={handlePreviewContinue}>
                ✅ Confirm and Continue
              </button>
              <p className="preview-confirmation-text">Please review your data above. Click 'Confirm and Continue' to proceed to column and chart selection.</p>
            </div>
          )}
        </div>
      );
    }
    if (currentStep === 1) {
      if (!isPreviewConfirmed) {
        // If not confirmed, force user back to preview
        setCurrentStep(0);
        return null;
      }
      return (
        <div className="column-selection">
          <h3>Select Chart Type and Columns</h3>
          <div className="chart-type-selection">
            <h4>Available Chart Types:</h4>
            <div className="chart-type-buttons">
              {chartTypes.map((type) => {
                const isAvailable = checkChartTypeAvailability(type.value);
                return (
                  <button
                    key={type.value}
                    className={`chart-type-button ${
                      chartType === type.value ? "active" : ""
                    } ${!isAvailable ? "disabled" : ""}`}
                    onClick={() => isAvailable && setChartType(type.value)}
                    disabled={!isAvailable}
                    title={!isAvailable ? getUnavailableReason(type.value) : ""}
                  >
                    <span className="chart-icon">{type.icon}</span>
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {chartType && (
            <div className="column-selection-section">
              <h4>Select Columns for {chartTypes.find(type => type.value === chartType)?.label}</h4>
              {renderColumnSelection()}
            </div>
          )}
        </div>
      );
    }
    if (currentStep === 2) {
      return (
        <GraphDisplay
          data={uploadedData}
          selectedCategoryColumn={selectedCategoryColumn}
          selectedValueColumn={selectedValueColumn}
          selectedColumn={selectedColumn}
          chartType={chartType}
        />
      );
    }
    return null;
  };

  const checkChartTypeAvailability = (type) => {
    if (!columnTypes) return false;

    switch (type) {
      case "bar":
        return Object.values(columnTypes).some(
          (col) => col.totalValues > 0
        );
      case "line":
        return Object.values(columnTypes).some(
          (col) => col.isNumeric || col.isDate
        );
      case "pie":
        return Object.values(columnTypes).some(
          (col) => col.totalValues >= 2 && col.totalValues <= 8
        );
      case "scatter":
        return Object.values(columnTypes).some((col) => col.isNumeric);
      case "histogram":
        return Object.values(columnTypes).some((col) => col.isNumeric);
      case "box":
        return Object.values(columnTypes).some((col) => col.isNumeric);
      default:
        return false;
    }
  };

  const getUnavailableReason = (type) => {
    if (!columnTypes) return "No data available";

    switch (type) {
      case "bar":
        return "No columns with values found";
      case "line":
        return "No numeric or date columns found";
      case "pie":
        return "No columns with 2-8 values found";
      case "scatter":
        return "No numeric columns found";
      case "histogram":
        return "No numeric columns found";
      case "box":
        return "No numeric columns found";
      default:
        return "Chart type not available";
    }
  };

  const getColumnValidity = (header, type) => {
    switch (chartType) {
      case "bar":
        // For bar charts, require a category column and numeric values
        if (type.isNumeric) {
          return type.totalValues > 0; // Valid value column
        } else {
          return type.totalValues > 0; // Valid category column
        }
      case "line":
        // For line charts, require a category column and numeric values
        if (type.isNumeric) {
          return type.totalValues > 0; // Valid value column
        } else {
          return type.totalValues > 0; // Valid category column
        }
      case "pie":
        if (type.isNumeric) {
          return type.totalValues > 0; // Valid value column
        } else {
          return type.totalValues > 0; // Valid category column
        }
      case "scatter":
        return type.totalValues > 0 && type.isNumeric; // Both columns must be numeric
      case "histogram":
        return type.isNumeric; // Only requires numeric type
      case "box":
        return type.isNumeric; // Only requires numeric type
      default:
        return false;
    }
  };

  const getColumnDescription = () => {
    switch (chartType) {
      case "bar":
        return "Select a category column and a numeric value column";
      case "line":
        return "Select a category column and a numeric value column";
      case "pie":
        return "Select a category column and a numeric value column";
      case "scatter":
        return "Select X and Y columns (both must be numeric)";
      case "histogram":
        return "Select a numeric column";
      case "box":
        return "Select a numeric column";
      default:
        return "";
    }
  };

  const renderColumnSelection = () => {
    if (!columnTypes || !headers) return null;

    if (chartType === "bar") {
      return (
        <>
          <p>Select columns for the bar chart:</p>
          <div className="column-dropdowns">
            <div>
              <label>Category Column:</label>
              <select 
                value={selectedCategoryColumn} 
                onChange={e => setSelectedCategoryColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Value Column:</label>
              <select 
                value={selectedValueColumn} 
                onChange={e => setSelectedValueColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.filter(h => columnTypes[h].isNumeric).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      );
    } else if (chartType === "line") {
      return (
        <>
          <p>Select columns for the line chart:</p>
          <div className="column-dropdowns">
            <div>
              <label>Category Column:</label>
              <select 
                value={selectedCategoryColumn} 
                onChange={e => setSelectedCategoryColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Value Column:</label>
              <select 
                value={selectedValueColumn} 
                onChange={e => setSelectedValueColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.filter(h => columnTypes[h].isNumeric).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      );
    } else if (chartType === "pie") {
      return (
        <>
          <p>Select columns for the pie chart:</p>
          <div className="column-dropdowns">
            <div>
              <label>Category Column:</label>
              <select 
                value={selectedCategoryColumn} 
                onChange={e => setSelectedCategoryColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Value Column:</label>
              <select 
                value={selectedValueColumn} 
                onChange={e => setSelectedValueColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.filter(h => columnTypes[h].isNumeric).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      );
    } else if (chartType === "scatter") {
      return (
        <>
          <p>Select X and Y columns (both must be numeric):</p>
          <div className="column-dropdowns">
            <div>
              <label>X-Axis Column:</label>
              <select 
                value={selectedCategoryColumn} 
                onChange={e => setSelectedCategoryColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.filter(h => columnTypes[h].isNumeric).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Y-Axis Column:</label>
              <select 
                value={selectedValueColumn} 
                onChange={e => setSelectedValueColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.filter(h => columnTypes[h].isNumeric).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      );
    } else if (chartType === "histogram" || chartType === "box") {
      return (
        <>
          <p>Select a numeric column:</p>
          <div className="column-dropdowns">
            <div>
              <label>Data Column:</label>
              <select
                value={selectedColumn}
                onChange={e => setSelectedColumn(e.target.value)}
              >
                <option value="">Select...</option>
                {headers.filter(h => columnTypes[h].isNumeric).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      );
    }
    return null;
  };

  const isContinueEnabled = () => {
    if (chartType === "bar" || chartType === "line" || chartType === "pie" || chartType === "scatter") {
      return selectedCategoryColumn && selectedValueColumn;
    }
    return !!selectedColumn;
  };

  const handleContinue = () => {
    if ((chartType === "bar" || chartType === "line" || chartType === "pie" || chartType === "scatter") && 
        (!selectedCategoryColumn || !selectedValueColumn)) {
      setError("Please select both required columns.");
      return;
    }
    setCurrentStep(2);
  };

  return (
    <div className="create-graph-container">
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className="step">
            <div
              className={`step-number ${
                index < currentStep ? "active" : index === currentStep ? "current" : ""
              }`}
            >
              {index + 1}
                    </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`step-connector ${
                  index < currentStep ? "active" : ""
                }`}
              />
          )}
        </div>
        ))}
      </div>

      <div className="step-content">{renderStepContent()}</div>

      <div className="navigation-controls">
        {currentStep > 0 && (
          <button onClick={handleBack} className="nav-button back">
            Back
          </button>
        )}
        {currentStep === 1 && (
          <button
            onClick={handleContinue}
            className="nav-button continue"
            disabled={!isContinueEnabled()}
          >
            Continue
          </button>
        )}
        {currentStep === 2 && (
          <button onClick={handleReset} className="nav-button reset">
            Start Over
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateGraph;