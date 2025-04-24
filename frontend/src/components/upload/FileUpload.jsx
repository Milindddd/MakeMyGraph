import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "./FileUpload.css";

const FileUpload = ({ onDataProcessed }) => {
  const [isLoading, setIsLoading] = useState(false);

  const processFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let data;
        if (file.type === "text/csv") {
          Papa.parse(e.target.result, {
            header: true,
            complete: (results) => {
              data = results.data;
              onDataProcessed(data);
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
          data = XLSX.utils.sheet_to_json(worksheet);
          onDataProcessed(data);
          setIsLoading(false);
        } else {
          throw new Error("Unsupported file format");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
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

  return (
    <div className="file-upload-container">
      <h2 className="upload-title">Upload Your Data</h2>
      <p className="upload-subtitle">
        Supported formats: CSV, Excel (.xlsx)
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
          <div className="upload-content">
            <div className="loading-spinner"></div>
            <p className="processing-text">Processing your file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="upload-text">
              Drag and drop your file here, or click to browse
            </p>
            <p className="upload-hint">
              Supported formats: CSV, Excel (.xlsx)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
