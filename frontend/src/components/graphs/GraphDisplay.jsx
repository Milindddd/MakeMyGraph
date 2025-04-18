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
          "rgba(59, 130, 246, 0.7)",
          "rgba(99, 102, 241, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(167, 139, 250, 0.7)",
          "rgba(196, 181, 253, 0.7)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(99, 102, 241)",
          "rgb(139, 92, 246)",
          "rgb(167, 139, 250)",
          "rgb(196, 181, 253)",
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
    <div className="w-full space-y-8 animate-fade-in">
      {statistics ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setChartType("bar")}
                className={`btn ${
                  chartType === "bar" ? "btn-primary" : "btn-secondary"
                } hover-lift`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`btn ${
                  chartType === "pie" ? "btn-primary" : "btn-secondary"
                } hover-lift`}
              >
                Pie Chart
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadChart("png")}
                disabled={isExporting}
                className="btn btn-secondary hover-lift"
              >
                PNG
              </button>
              <button
                onClick={() => downloadChart("jpeg")}
                disabled={isExporting}
                className="btn btn-secondary hover-lift"
              >
                JPEG
              </button>
              <button
                onClick={() => downloadChart("pdf")}
                disabled={isExporting}
                className="btn btn-secondary hover-lift"
              >
                PDF
              </button>
            </div>
          </div>

          <div
            id="chart-container"
            className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <div className="h-[400px] relative">
              {isExporting && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statistics).map(([key, value], index) => (
              <div
                key={key}
                className="card hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold capitalize text-gray-700">
                  {key}
                </h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{value}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-600 py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl">
            Please select a column to display statistics
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphDisplay;
