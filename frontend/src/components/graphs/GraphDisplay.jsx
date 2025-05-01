import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./GraphDisplay.css";

const GraphDisplay = ({ data, selectedCategoryColumn, selectedValueColumn, selectedColumn, chartType }) => {
  const [statistics, setStatistics] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const svgRef = useRef();
  const chartContainerRef = useRef();

  // Add logging to check incoming props
  useEffect(() => {
    console.log("GraphDisplay Props:", {
      data,
      selectedCategoryColumn,
      selectedValueColumn,
      selectedColumn,
      chartType
    });
  }, [data, selectedCategoryColumn, selectedValueColumn, selectedColumn, chartType]);

  const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const validateInputs = () => {
    if (!data || data.length === 0) {
      setError("No data available");
      return false;
    }

    switch (chartType) {
      case "histogram":
        if (!selectedColumn) {
          setError("No column selected for histogram");
          return false;
        }
        const histogramValues = data.map(row => row[selectedColumn]).filter(isNumeric);
        if (histogramValues.length === 0) {
          setError(`No numeric values found in column: ${selectedColumn}`);
          return false;
        }
        console.log("Histogram values:", histogramValues);
        return true;

      case "bar":
      case "line":
      case "pie":
        if (!selectedCategoryColumn || !selectedValueColumn) {
          setError("Both category and value columns must be selected");
          return false;
        }
        return true;

      case "scatter":
        if (!selectedCategoryColumn || !selectedValueColumn) {
          setError("Both X and Y columns must be selected");
          return false;
        }
        return true;

      case "box":
        if (!selectedColumn) {
          setError("No column selected for box plot");
          return false;
        }
        return true;

      default:
        setError("Invalid chart type");
        return false;
    }
  };

  useEffect(() => {
    if (data && validateInputs()) {
      calculateStatistics();
    }
  }, [data, selectedCategoryColumn, selectedValueColumn, selectedColumn, chartType]);

  useEffect(() => {
    if (statistics && svgRef.current) {
      if (validateInputs()) {
        drawChart();
      }
    }
  }, [statistics, chartType]);

  const calculateStatistics = () => {
    console.log("Calculating statistics for chart type:", chartType);
    
    if (chartType === "histogram" || chartType === "box") {
      // For histogram and box plot, we need all numeric values from the selected column
      const values = data
        .map(row => parseFloat(row[selectedColumn]))
        .filter(value => !isNaN(value));

      console.log("Numeric values:", values);

      if (values.length === 0) {
        setError("No valid numeric values found in the selected column");
        return;
      }

      setStatistics({
        values,
        statistics: {
          mean: d3.mean(values),
          median: d3.median(values),
          min: d3.min(values),
          max: d3.max(values),
        }
      });
    } else if (chartType === "scatter") {
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

      setStatistics({
        values: numericValues,
        chartData,
        statistics: {
          mean: d3.mean(numericValues),
          median: d3.median(numericValues),
          min: d3.min(numericValues),
          max: d3.max(numericValues),
        },
      });
    }
  };

  const drawChart = () => {
    console.log("Drawing chart:", chartType);
    console.log("Current statistics:", statistics);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;
    
    const margin = { top: 60, right: 20, bottom: 50, left: 60 };
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
    const margin = { top: 60, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear any existing content
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([innerHeight, 0])
      .nice();

    // Add X axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .text(selectedValueColumn);

    // Add bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.value))
      .attr("fill", "#2196F3")
      .attr("rx", 4) // Rounded corners
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("fill", "#1976D2");
        
        // Add tooltip
        g.append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.label) + x.bandwidth() / 2)
          .attr("y", y(d.value) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(d.value);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", "#2196F3");
        
        // Remove tooltip
        g.selectAll(".tooltip").remove();
      });

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${selectedValueColumn} by ${selectedCategoryColumn}`);
  };

  const drawPieChart = (data, svg, width, height) => {
    const margin = { top: 60, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    // Clear any existing content
    svg.selectAll("*").remove();

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
      .attr("fill", (d, i) => color(i))
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#1976D2")
          .attr("stroke-width", 2);
        
        // Add tooltip
        g.append("text")
          .attr("class", "tooltip")
          .attr("x", 0)
          .attr("y", -radius - 20)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(`${d.data.label}: ${d.data.value}`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "none");
        
        // Remove tooltip
        g.selectAll(".tooltip").remove();
      });

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
        return `${percentage}%`;
      });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${selectedValueColumn} by ${selectedCategoryColumn}`);
  };

  const drawLineChart = (data, svg, width, height) => {
    const margin = { top: 60, right: 20, bottom: 50, left: 60 };
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
      .style("text-anchor", "end")
      .style("font-size", "12px");

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .text(selectedValueColumn);

    // Create the line
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

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.label))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#2196F3")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 7)
          .attr("fill", "#1976D2");
        
        // Add tooltip
        g.append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.label))
          .attr("y", y(d.value) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(d.value);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 5)
          .attr("fill", "#2196F3");
        
        // Remove tooltip
        g.selectAll(".tooltip").remove();
      });

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${selectedValueColumn} by ${selectedCategoryColumn}`);
  };

  const drawScatterPlot = (data, svg, width, height) => {
    const margin = { top: 60, right: 20, bottom: 50, left: 60 };
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
      .style("font-size", "14px")
      .text(selectedCategoryColumn);

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
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
      .attr("fill", "#2196F3")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 7)
          .attr("fill", "#1976D2");
        
        // Add tooltip
        g.append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.x))
          .attr("y", y(d.y) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(`(${d.x.toFixed(2)}, ${d.y.toFixed(2)})`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 5)
          .attr("fill", "#2196F3");
        
        // Remove tooltip
        g.selectAll(".tooltip").remove();
      });

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${selectedValueColumn} vs ${selectedCategoryColumn}`);
  };

  const drawHistogram = (svg, stats, width, height, margin) => {
    if (!stats || !stats.values || stats.values.length === 0) {
      console.error("No valid data for histogram");
      return;
    }

    // Clear any existing content
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get the data values
    const values = stats.values;
    
    // Create bins using d3.histogram
    const histogram = d3.histogram()
      .value(d => d)
      .domain([d3.min(values), d3.max(values)])
      .thresholds(20); // Number of bins

    const bins = histogram(values);

    // Create scales
    const x = d3.scaleLinear()
      .domain([d3.min(values), d3.max(values)])
      .range([0, width - margin.left - margin.right])
      .nice();

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height - margin.top - margin.bottom, 0])
      .nice();

    // Add X axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width - margin.left - margin.right)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .text(selectedColumn);

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .text("Frequency");

    // Add bars
    g.selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - margin.top - margin.bottom - y(d.length))
      .attr("fill", "#2196F3")
      .attr("rx", 4) // Rounded corners
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("fill", "#1976D2");
        
        // Add tooltip
        g.append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.x0) + (x(d.x1) - x(d.x0)) / 2)
          .attr("y", y(d.length) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(d.length);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", "#2196F3");
        
        // Remove tooltip
        g.selectAll(".tooltip").remove();
      });

    // Add title
    g.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Distribution of ${selectedColumn}`);
  };

  const drawBoxPlot = (svg, stats, width, height, margin) => {
    if (!stats || !stats.values || stats.values.length === 0) {
      console.error("No valid data for box plot");
      return;
    }

    // Clear any existing content
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate statistics
    const values = stats.values;
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = d3.quantile(sortedValues, 0.25);
    const median = d3.quantile(sortedValues, 0.5);
    const q3 = d3.quantile(sortedValues, 0.75);
    const iqr = q3 - q1;
    const min = Math.max(q1 - 1.5 * iqr, sortedValues[0]);
    const max = Math.min(q3 + 1.5 * iqr, sortedValues[sortedValues.length - 1]);

    // Create scales
    const y = d3
      .scaleLinear()
      .domain([min - iqr, max + iqr])
      .range([innerHeight, 0])
      .nice();

    const x = d3
      .scaleBand()
      .domain([selectedColumn])
      .range([0, innerWidth])
      .padding(0.3);

    // Add Y axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .text(selectedColumn);

    // Add X axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "14px");

    // Draw the box
    const boxWidth = x.bandwidth();
    const centerX = x(selectedColumn) + boxWidth / 2;

    // Draw whiskers
    g.append("line")
      .attr("x1", centerX)
      .attr("x2", centerX)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 2);

    // Draw box
    g.append("rect")
      .attr("x", centerX - boxWidth / 2)
      .attr("y", y(q3))
      .attr("width", boxWidth)
      .attr("height", y(q1) - y(q3))
      .attr("fill", "#2196F3")
      .attr("stroke", "#1976D2")
      .attr("stroke-width", 2)
      .attr("rx", 4);

    // Draw median line
    g.append("line")
      .attr("x1", centerX - boxWidth / 2)
      .attr("x2", centerX + boxWidth / 2)
      .attr("y1", y(median))
      .attr("y2", y(median))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add outliers
    const outliers = values.filter(d => d < min || d > max);
    g.selectAll(".outlier")
      .data(outliers)
      .enter()
      .append("circle")
      .attr("class", "outlier")
      .attr("cx", centerX)
      .attr("cy", d => y(d))
      .attr("r", 4)
      .attr("fill", "#f44336")
      .attr("stroke", "#d32f2f")
      .attr("stroke-width", 1);

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Box Plot of ${selectedColumn}`);

    // Add statistics tooltip
    const tooltip = g.append("g")
      .attr("class", "tooltip")
      .style("opacity", 0);

    tooltip.append("rect")
      .attr("width", 200)
      .attr("height", 100)
      .attr("fill", "white")
      .attr("stroke", "#2196F3")
      .attr("rx", 4);

    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text(`Min: ${min.toFixed(2)}`);

    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .text(`Q1: ${q1.toFixed(2)}`);

    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 60)
      .text(`Median: ${median.toFixed(2)}`);

    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 80)
      .text(`Q3: ${q3.toFixed(2)}`);

    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 100)
      .text(`Max: ${max.toFixed(2)}`);

    // Add hover interaction
    g.append("rect")
      .attr("x", centerX - boxWidth / 2)
      .attr("y", y(max))
      .attr("width", boxWidth)
      .attr("height", y(min) - y(max))
      .attr("fill", "transparent")
      .on("mouseover", function() {
        tooltip
          .attr("transform", `translate(${centerX + 20},${y(median) - 50})`)
          .style("opacity", 1);
      })
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
      });
  };

  const downloadChart = async (format) => {
    setIsExporting(true);
    try {
      // Get the SVG element
      const svgElement = svgRef.current;
      if (!svgElement) {
        throw new Error("No chart to export");
      }

      // Create a clone of the SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Set canvas dimensions to match SVG
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;

      // Create an image element
      const img = new Image();
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
      });

      // Draw the image on canvas
      ctx.drawImage(img, 0, 0);

      if (format === "png" || format === "jpeg") {
        // Create download link for PNG/JPEG
        const link = document.createElement("a");
        link.download = `chart.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      } else if (format === "pdf") {
        // Create PDF
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height]
        });
        
        // Add the image to PDF
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        // Save the PDF
        pdf.save("chart.pdf");
      }

      // Clean up
      URL.revokeObjectURL(svgUrl);
    } catch (error) {
      console.error("Error exporting chart:", error);
      setError("Failed to export chart. Please try again.");
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
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%"
            style={{ backgroundColor: "white" }}
          ></svg>
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
