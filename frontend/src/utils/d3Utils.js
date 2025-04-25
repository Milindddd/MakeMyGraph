// Utility functions for D3 visualizations
export const generateColors = (count) => {
  const colors = d3.schemeCategory10;
  return Array(count).fill().map((_, i) => colors[i % colors.length]);
};

export const createSVG = (container, width, height, margin) => {
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  return svg;
};