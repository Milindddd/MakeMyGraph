const express = require('express');
const router = express.Router();
const {
  createGraph,
  getGraphs,
  getGraph,
  updateGraph,
  deleteGraph
} = require('../controllers/graph.controller');

// Create a new graph
router.post('/', createGraph);

// Get all graphs with pagination
router.get('/', getGraphs);

// Get a single graph
router.get('/:id', getGraph);

// Update a graph
router.put('/:id', updateGraph);

// Delete a graph
router.delete('/:id', deleteGraph);

module.exports = router; 