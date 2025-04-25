import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./CreateGraph.css";
import GraphDisplay from "./GraphDisplay";

const CreateGraph = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Choose Column, 3: Display
  const [data, setData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { number: 1, title: "Upload Data", description: "Upload your CSV or Excel file" },
    { number: 2, title: "Select Column", description: "Choose the column to visualize" },
    { number: 3, title: "View Graph", description: "View and customize your graph" }
  ];

  const handleFileUpload = (file) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let parsedData;
        if (file.type === "text/csv") {
          Papa.parse(e.target.result, {
            header: true,
            complete: (results) => {
              parsedData = results.data;
              if (parsedData && parsedData.length > 0) {
                setData(parsedData);
                setAvailableColumns(Object.keys(parsedData[0]));
                setStep(2);
              }
              setIsLoading(false);
            },
            error: (error) => {
              console.error("Error parsing CSV:", error);
              setIsLoading(false);
            },
          });
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          const workbook = XLSX.read(e.target.result, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
          
          if (parsedData && parsedData.length > 0) {
            setData(parsedData);
            setAvailableColumns(Object.keys(parsedData[0]));
            setStep(2);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      setIsLoading(false);
    };

    if (file.type === "text/csv") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleColumnSelect = (column) => {
    setSelectedColumn(column);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setData(null);
    setSelectedColumn(null);
    setAvailableColumns([]);
  };

  return (
    <div className="create-graph-container">
      {/* Step Indicator */}
      <div className="step-indicator">
        {steps.map((s, index) => (
          <div
            key={s.number}
            className={`step ${step >= s.number ? 'active' : ''} ${step === s.number ? 'current' : ''}`}
          >
            <div className="step-number">{s.number}</div>
            <div className="step-info">
              <div className="step-title">{s.title}</div>
              <div className="step-description">{s.description}</div>
            </div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="step-content">
        {step === 1 && (
          <div className="upload-section">
            <h2>Step 1: Upload Your Data</h2>
            <p>Choose a CSV or Excel file to create your graph</p>
            <div className="upload-area">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
              {isLoading ? (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Processing your file...</p>
                </div>
              ) : (
                <div className="upload-prompt">
                  <p>Drag and drop your file here or click to browse</p>
                  <p className="file-types">Supported formats: CSV, Excel (.xlsx)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="column-selection-section">
            <h2>Step 2: Choose a Column</h2>
            <p>Select the column you want to visualize</p>
            <div className="column-list">
              {availableColumns.map((column) => (
                <button
                  key={column}
                  className={`column-button ${selectedColumn === column ? 'selected' : ''}`}
                  onClick={() => handleColumnSelect(column)}
                >
                  {column}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="graph-display-section">
            <h2>Step 3: Your Graph</h2>
            <GraphDisplay
              data={data}
              selectedColumn={selectedColumn}
              onBack={handleBack}
              onReset={handleReset}
              columns={availableColumns}
            />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="navigation-controls">
        {step > 1 && (
          <button className="nav-button back" onClick={handleBack}>
            Back to {steps[step - 2].title}
          </button>
        )}
        {step === 3 && (
          <button className="nav-button reset" onClick={handleReset}>
            Start Over with New File
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateGraph; 