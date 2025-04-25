import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./GraphDisplay.css";

const GraphDisplay = ({ data, selectedColumn, onBack, onReset, columns }) => {
  const [statistics, setStatistics] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showMultiColumn, setShowMultiColumn] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const svgRef = useRef();
  const chartContainerRef = useRef();

  useEffect(() => {
    if (data && selectedColumn) {
      calculateStatistics();
    }
  }, [data, selectedColumn]);

  useEffect(() => {
    if (statistics && svgRef.current) {
      drawChart();
    }
  }, [statistics, chartType]);

  const calculateStatistics = () => {
    const values = data
      .map((item) => {
        const value = parseFloat(item[selectedColumn]);
        return value;
      })
      .filter((val) => !isNaN(val));

    if (values.length === 0) {
      console.error("No valid numeric values found in column:", selectedColumn);
      return;
    }

    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const median =
      sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] +
            sortedValues[sortedValues.length / 2]) /
          2
        : sortedValues[Math.floor(sortedValues.length / 2)];

    const frequency = {};
    values.forEach((val) => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const mode = Object.entries(frequency).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    const stats = {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: parseFloat(mode).toFixed(2),
      highest: Math.max(...values).toFixed(2),
      lowest: Math.min(...values).toFixed(2),
    };

    setStatistics(stats);
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const generateMultiColumnGraphs = () => {
    setShowMultiColumn(true);
    setSelectedColumns([selectedColumn]); // Initialize with current selected column
  };

  const drawChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const chartData = [
      { label: "Mean", value: parseFloat(statistics.mean) },
      { label: "Median", value: parseFloat(statistics.median) },
      { label: "Mode", value: parseFloat(statistics.mode) },
      { label: "Highest", value: parseFloat(statistics.highest) },
      { label: "Lowest", value: parseFloat(statistics.lowest) },
    ];

    if (chartType === "bar") {
      drawBarChart(svg, chartData, width, height, margin);
    } else {
      drawPieChart(svg, chartData, width, height, margin);
    }
  };

  const drawBarChart = (svg, data, width, height, margin) => {
    const x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map((d) => d.label));

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, (d) => d.value)]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d, i) => d3.schemeCategory10[i]);
  };

  const drawPieChart = (svg, data, width, height, margin) => {
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2 + margin.left;
    const centerY = height / 2 + margin.top;

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d3.schemeCategory10[i]);

    arcs
      .append("text")
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text((d) => d.data.label);
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
      <div className="navigation-controls">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button onClick={onReset} className="btn btn-secondary">
          Start Again
        </button>
        <button
          onClick={generateMultiColumnGraphs}
          className="btn btn-primary"
        >
          Generate Multiple Graphs
        </button>
      </div>

      {showMultiColumn ? (
        <div className="multi-column-graphs">
          <div className="column-selection">
            <h3>Select Columns to Graph</h3>
            <div className="column-checkboxes">
              {columns.map((column) => (
                <label key={column} className="column-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => handleColumnToggle(column)}
                  />
                  {column}
                </label>
              ))}
            </div>
          </div>
          <div className="graphs-container">
            {selectedColumns.map((column) => (
              <div key={column} className="graph-card">
                <h3>{column}</h3>
                <div className="chart-container" ref={chartContainerRef}>
                  <svg ref={svgRef} width="100%" height="100%"></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
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

          <div id="chart-container" className="chart-container" ref={chartContainerRef}>
            <div className="chart-wrapper">
              {isExporting && (
                <div className="export-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}
              <svg ref={svgRef} width="100%" height="100%"></svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GraphDisplay;
