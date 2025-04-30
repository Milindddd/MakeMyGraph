import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./GraphDisplay.css";

const GraphDisplay = ({ data, selectedCategoryColumn, selectedValueColumn, chartType }) => {
  const [statistics, setStatistics] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const svgRef = useRef();
  const chartContainerRef = useRef();

  const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const validateInputs = () => {
    if (!data || !selectedCategoryColumn || !selectedValueColumn) {
      setError("No data or columns selected");
      return false;
    }

    const values = data.map(item => item[selectedValueColumn]);

    switch (chartType) {
      case "bar":
        // For bar charts, require at least 2 unique categories
        const uniqueCategories = new Set(values);
        if (uniqueCategories.size < 2) {
          setError("Bar chart needs at least 2 unique categories");
          return false;
        }
        break;

      case "pie":
        // For pie charts, require 2-8 unique categories
        const uniquePieCategories = new Set(values);
        if (uniquePieCategories.size < 2 || uniquePieCategories.size > 8) {
          setError("Pie chart needs 2-8 unique categories");
          return false;
        }
        break;

      case "line":
      case "scatter":
      case "histogram":
      case "box":
        // For these, require numeric values
        const numericValues = values.map(val => {
          if (typeof val === 'string') {
            return parseFloat(val.replace(/[^0-9.-]/g, ''));
          }
          return parseFloat(val);
        }).filter(val => !isNaN(val));
        if (chartType === 'line' || chartType === 'scatter') {
          if (numericValues.length < 2) {
            setError(`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart needs at least 2 numeric values`);
            return false;
          }
        } else if (chartType === 'histogram' && numericValues.length < 30) {
          setError("Histogram needs at least 30 numeric values");
          return false;
        } else if (chartType === 'box' && numericValues.length < 20) {
          setError("Box plot needs at least 20 numeric values");
          return false;
        }
        break;

      default:
        setError("Unknown chart type");
        return false;
    }

    setError(null);
    return true;
  };

  useEffect(() => {
    if (data && selectedCategoryColumn && selectedValueColumn) {
      calculateStatistics();
    }
  }, [data, selectedCategoryColumn, selectedValueColumn]);

  useEffect(() => {
    if (statistics && svgRef.current) {
      if (validateInputs()) {
        drawChart();
      }
    }
  }, [statistics, chartType]);

  const calculateStatistics = () => {
    if (!data || !selectedCategoryColumn || !selectedValueColumn) return;

    if (chartType === "scatter") {
      // For scatter plot, we need pairs of X and Y values
      const scatterData = data.map(row => ({
        x: parseFloat(row[selectedCategoryColumn]),
        y: parseFloat(row[selectedValueColumn])
      })).filter(point => !isNaN(point.x) && !isNaN(point.y));

      setStatistics({
        scatterData,
        values: scatterData.map(point => point.y),
        statistics: {
          mean: d3.mean(scatterData, d => d.y),
          median: d3.median(scatterData, d => d.y),
          min: d3.min(scatterData, d => d.y),
          max: d3.max(scatterData, d => d.y),
        }
      });
    } else {
      // For other chart types, use the existing logic
      const groupedData = {};
      data.forEach((row) => {
        const category = row[selectedCategoryColumn];
        const value = parseFloat(row[selectedValueColumn]);
        if (!isNaN(value)) {
          if (!groupedData[category]) {
            groupedData[category] = 0;
          }
          groupedData[category] += value;
        }
      });

      const chartData = Object.entries(groupedData).map(([label, value]) => ({
        label,
        value,
      }));

      const numericValues = data
        .map((row) => parseFloat(row[selectedValueColumn]))
        .filter((v) => !isNaN(v));

      const sortedValues = [...numericValues].sort((a, b) => a - b);
      const sum = sortedValues.reduce((a, b) => a + b, 0);
      const mean = sum / sortedValues.length;
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const min = sortedValues[0];
      const max = sortedValues[sortedValues.length - 1];
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
      const iqr = q3 - q1;
      const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
      const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

    setStatistics({
        values: numericValues,
        chartData,
        statistics: {
          mean,
          median,
          min,
          max,
          q1,
          q3,
          iqr,
          lowerWhisker,
          upperWhisker,
        },
      });
    }
  };

  const drawChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    if (chartType === "bar") {
      drawBarChart(statistics.chartData, svg, width, height);
    } else if (chartType === "pie") {
      drawPieChart(statistics.chartData, svg, width, height);
    } else if (chartType === "line") {
      drawLineChart(statistics.chartData, svg, width, height);
    } else if (chartType === "scatter") {
      drawScatterPlot(statistics.scatterData, svg, width, height);
    } else if (chartType === "histogram") {
      drawHistogram(svg, statistics, width, height, margin);
    } else if (chartType === "box") {
      drawBoxPlot(svg, statistics, width, height, margin);
    }
  };

  const drawBarChart = (data, svg, width, height) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(selectedValueColumn);

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.value))
      .attr("fill", "#4CAF50");

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .text(selectedCategoryColumn);
  };

  const drawPieChart = (data, svg, width, height) => {
    const radius = Math.min(width, height) / 2;
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i));

    const total = data.reduce((sum, d) => sum + d.value, 0);
    arcs
      .append("text")
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text((d) => {
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        return `${d.data.label} (${percentage}%)`;
      });

    // Add a title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .text(`${selectedCategoryColumn} Distribution`);
  };

  const drawLineChart = (data, svg, width, height) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear any existing content
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scalePoint()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([innerHeight, 0])
      .nice();

    // Add X axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(selectedValueColumn);

    // Create the line generator
    const line = d3.line()
      .x(d => x(d.label))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add the line path
    g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots for each data point
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.label))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#2196F3");

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .text(selectedCategoryColumn);
  };

  const drawScatterPlot = (data, svg, width, height) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear any existing content
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
      .range([0, innerWidth])
      .nice();

    const y = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
      .range([innerHeight, 0])
      .nice();

    // Add X axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(selectedCategoryColumn);

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(selectedValueColumn);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", "#2196F3");

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .text(`${selectedValueColumn} vs ${selectedCategoryColumn}`);
  };

  const drawHistogram = (svg, stats, width, height, margin) => {
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const histogram = d3
      .histogram()
      .value((d) => d)
      .domain([0, d3.max(stats.values)])
      .thresholds(20);

    const bins = histogram(stats.values);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(stats.values)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .range([height, 0]);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y));

    g.selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.x0))
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
      .attr("height", (d) => height - y(d.length))
      .attr("fill", "#2196f3");

    g.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text(selectedValueColumn);

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Frequency");
  };

  const drawBoxPlot = (svg, stats, width, height, margin) => {
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const sortedValues = [...stats.values].sort((a, b) => a - b);
    const q1 = d3.quantile(sortedValues, 0.25);
    const q3 = d3.quantile(sortedValues, 0.75);
    const iqr = q3 - q1;
    const min = Math.max(q1 - 1.5 * iqr, sortedValues[0]);
    const max = Math.min(q3 + 1.5 * iqr, sortedValues[sortedValues.length - 1]);

    const y = d3
      .scaleLinear()
      .domain([min - iqr, max + iqr])
      .range([height, 0]);

    const boxWidth = 50;
    const centerX = width / 2;

    // Draw whiskers
    g.append("line")
      .attr("x1", centerX)
      .attr("x2", centerX)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "#2196f3")
      .attr("stroke-width", 2);

    // Draw box
    g.append("rect")
      .attr("x", centerX - boxWidth / 2)
      .attr("y", y(q3))
      .attr("width", boxWidth)
      .attr("height", y(q1) - y(q3))
      .attr("fill", "#2196f3")
      .attr("stroke", "#2196f3")
      .attr("stroke-width", 2);

    // Draw median line
    g.append("line")
      .attr("x1", centerX - boxWidth / 2)
      .attr("x2", centerX + boxWidth / 2)
      .attr("y1", y(parseFloat(stats.median)))
      .attr("y2", y(parseFloat(stats.median)))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add y-axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y));

    // Add title
    g.append("text")
      .attr("x", centerX)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(selectedValueColumn);
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
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="chart-container" ref={chartContainerRef}>
        <div className="chart-wrapper">
          {isExporting && (
            <div className="export-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
      </div>

      <div className="export-section">
        <h3>Export Chart</h3>
        <p>Download your chart in different formats</p>
        <div className="export-buttons">
              <button
                onClick={() => downloadChart("png")}
            disabled={isExporting || error}
            className="export-button"
              >
            <span className="export-icon">📷</span>
                PNG
              </button>
              <button
                onClick={() => downloadChart("jpeg")}
            disabled={isExporting || error}
            className="export-button"
              >
            <span className="export-icon">🖼️</span>
                JPEG
              </button>
              <button
                onClick={() => downloadChart("pdf")}
            disabled={isExporting || error}
            className="export-button"
              >
            <span className="export-icon">📄</span>
                PDF
              </button>
            </div>
          </div>
    </div>
  );
};

export default GraphDisplay;
