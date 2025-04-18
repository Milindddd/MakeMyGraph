import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const FileUpload = ({ onDataProcessed }) => {
  const [isLoading, setIsLoading] = useState(false);

  const processFile = async (file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    try {
      let data;
      if (fileExtension === "csv") {
        data = await new Promise((resolve) => {
          Papa.parse(file, {
            complete: (results) => resolve(results.data),
            header: true,
          });
        });
      } else if (["xlsx", "xls"].includes(fileExtension)) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        throw new Error("Unsupported file format");
      }

      if (!data || data.length === 0) {
        throw new Error("No data found in file");
      }

      onDataProcessed(data);
    } catch (error) {
      toast.error(`Error processing file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsLoading(true);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-base text-center mb-1">Upload your files</h2>
      <p className="text-xs text-gray-500 text-center mb-4">
        File should be XLS, XLSX, CSV
      </p>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }
          ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}
          min-h-[140px] flex flex-col items-center justify-center`}
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="loading-spinner w-6 h-6 border-2"></div>
              <p className="text-gray-600 text-xs">Processing...</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 mx-auto mb-2">
                <svg
                  className="w-full h-full text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-4a4 4 0 00-4-4H7a4 4 0 00-4 4v4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v8m0-8l-4 4m4-4l4 4"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-xs">
                {isDragActive
                  ? "Drop your file here..."
                  : "Drag & Drop your files here"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
