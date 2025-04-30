import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./FileUpload.css";
import GraphDisplay from "../graphs/GraphDisplay";

const FileUpload = ({ onDataProcessed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [availableColumns, setAvailableColumns] = useState([]);
  const [step, setStep] = useState("upload"); // "upload", "preview", "graph"
  const [error, setError] = useState(null);

  const processFile = (file) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data;
        let headers;
        
        if (file.type === "text/csv") {
          const parsed = Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
          });
          headers = parsed.meta.fields;
          data = parsed.data;
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          const workbook = XLSX.read(e.target.result, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          headers = jsonData[0];
          data = jsonData.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = row[i];
            });
            return obj;
          });
        } else {
          throw new Error("Unsupported file format");
        }

        // Validate data types for each column
        const columnTypes = {};
        headers.forEach((header) => {
          const values = data.map((row) => row[header]).filter(val => val !== undefined && val !== null && val !== '');
          const isNumeric = values.length > 0 && values.every(
            (val) => !isNaN(parseFloat(val)) && isFinite(val)
          );
          const isDate = values.length > 0 && values.every(
            (val) => !isNaN(Date.parse(val)) && val !== ""
          );
          const uniqueValues = new Set(values).size;

          columnTypes[header] = {
            isNumeric,
            isDate,
            uniqueValues,
            sampleValues: values.slice(0, 5),
            totalValues: values.length
          };
        });

        // Add validation info to the data
        const processedData = {
          data,
          headers,
          columnTypes,
        };

        // Call the parent component's callback with the processed data
        if (onDataProcessed) {
          onDataProcessed(processedData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };

    if (file.type === "text/csv") {
      reader.readAsText(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      reader.readAsArrayBuffer(file);
    } else {
      setError("Unsupported file format");
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("upload");
      setData(null);
      setPreviewData(null);
      setSelectedColumn(null);
      setAvailableColumns([]);
    } else if (step === "graph") {
      setStep("preview");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setData(null);
    setPreviewData(null);
    setSelectedColumn(null);
    setAvailableColumns([]);
    setChartType("bar");
  };

  const handleContinueToGraph = () => {
    if (selectedColumn) {
      onDataProcessed({
        data: data,
        selectedColumn: selectedColumn,
        chartType: chartType
      });
      setStep("graph");
    }
  };

  const handleConfirm = () => {
    if (data) {
      onDataProcessed(data);
    }
  };

  const renderUploadSection = () => (
    <div className="upload-section">
      <h2 className="upload-title">Upload Your Data</h2>
      <p className="upload-description">
        Upload a CSV or Excel file to create your graph
      </p>
      <div
        className={`upload-area ${isLoading ? "upload-area-loading" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          className="file-input"
        />
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Processing your file...</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📊</div>
            <p className="upload-text">
              Drag and drop your file here or click to browse
            </p>
            <p className="file-types">Supported formats: CSV, Excel (.xlsx)</p>
          </div>
        )}
      </div>
      {error && (
        <div className="error-container">
          <div className="error-icon">❌</div>
          <p className="error-message">{error}</p>
        </div>
      )}
    </div>
  );

  const renderPreviewSection = () => (
    <div className="data-preview-container">
      <h2 className="preview-title">Data Preview</h2>
      <div className="preview-table-container">
        <table className="preview-table">
          <thead>
            <tr>
              {Object.keys(previewData[0]).map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="preview-actions">
        <button
          onClick={() => {
            setData(null);
            setPreviewData(null);
          }}
          className="back-button"
        >
          Back
        </button>
        <button onClick={handleConfirm} className="continue-button">
          Continue
        </button>
      </div>
    </div>
  );

  return (
    <div className="file-upload-container">
      {step === "upload" && renderUploadSection()}
      {step === "preview" && renderPreviewSection()}
      {step === "graph" && (
        <GraphDisplay
          data={data}
          selectedColumn={selectedColumn}
          chartType={chartType}
          onBack={handleBack}
          onReset={handleReset}
          columns={availableColumns}
        />
      )}
    </div>
  );
};

export default FileUpload;