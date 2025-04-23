import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./GraphDisplay.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const GraphDisplay = ({ data, selectedColumn }) => {
  const [statistics, setStatistics] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (data && selectedColumn) {
      calculateStatistics();
    }
  }, [data, selectedColumn]);

  const calculateStatistics = () => {
    const values = data
      .map((item) => parseFloat(item[selectedColumn]))
      .filter((val) => !isNaN(val));

    // Calculate mean
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;

    // Calculate median
    const sortedValues = [...values].sort((a, b) => a - b);
    const median =
      sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] +
            sortedValues[sortedValues.length / 2]) /
          2
        : sortedValues[Math.floor(sortedValues.length / 2)];

    // Calculate mode
    const frequency = {};
    values.forEach((val) => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const mode = Object.entries(frequency).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    setStatistics({
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: parseFloat(mode).toFixed(2),
      highest: Math.max(...values).toFixed(2),
      lowest: Math.min(...values).toFixed(2),
    });
  };

  const chartData = {
    labels: ["Mean", "Median", "Mode", "Highest", "Lowest"],
    datasets: [
      {
        label: selectedColumn,
        data: statistics
          ? [
              statistics.mean,
              statistics.median,
              statistics.mode,
              statistics.highest,
              statistics.lowest,
            ]
          : [],
        backgroundColor: [
          "rgba(251, 146, 60, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(194, 65, 12, 0.7)",
          "rgba(154, 52, 18, 0.7)",
          "rgba(124, 45, 18, 0.7)",
        ],
        borderColor: [
          "rgb(251, 146, 60)",
          "rgb(234, 88, 12)",
          "rgb(194, 65, 12)",
          "rgb(154, 52, 18)",
          "rgb(124, 45, 18)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const downloadChart = async (format) => {
    setIsExporting(true);
    try {
      const chartElement = document.getElementById("chart-container");
      const canvas = await html2canvas(chartElement);

      if (format === "png" || format === "jpeg") {
        const link = document.createElement("a");
        link.download = `chart.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      } else if (format === "pdf") {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("chart.pdf");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="graph-display-container">
      {statistics ? (
        <>
          <div className="chart-controls">
            <div className="chart-type-buttons">
              <button
                onClick={() => setChartType("bar")}
                className={`btn ${chartType === "bar" ? "btn-primary" : "btn-secondary"}`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`btn ${chartType === "pie" ? "btn-primary" : "btn-secondary"}`}
              >
                Pie Chart
              </button>
            </div>
            <div className="export-buttons">
              <button
                onClick={() => downloadChart("png")}
                disabled={isExporting}
                className="btn btn-secondary"
              >
                PNG
              </button>
              <button
                onClick={() => downloadChart("jpeg")}
                disabled={isExporting}
                className="btn btn-secondary"
              >
                JPEG
              </button>
              <button
                onClick={() => downloadChart("pdf")}
                disabled={isExporting}
                className="btn btn-secondary"
              >
                PDF
              </button>
            </div>
          </div>

          <div id="chart-container" className="chart-container">
            <div className="chart-wrapper">
              {isExporting && (
                <div className="export-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}
              {chartType === "bar" ? (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: `Statistics for ${selectedColumn}`,
                        font: { size: 16, weight: "bold" },
                        padding: 20,
                      },
                      legend: {
                        position: "bottom",
                      },
                    },
                    animation: {
                      duration: 1000,
                      easing: "easeInOutQuart",
                    },
                  }}
                />
              ) : (
                <Pie
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: `Statistics for ${selectedColumn}`,
                        font: { size: 16, weight: "bold" },
                        padding: 20,
                      },
                      legend: {
                        position: "bottom",
                      },
                    },
                    animation: {
                      duration: 1000,
                      easing: "easeInOutQuart",
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="stats-grid">
            {Object.entries(statistics).map(([key, value], index) => (
              <div key={key} className="stat-card">
                <h3 className="stat-title">{key}</h3>
                <p className="stat-value">{value}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default GraphDisplay;
