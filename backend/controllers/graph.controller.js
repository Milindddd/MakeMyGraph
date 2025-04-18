const Graph = require('../models/graph.model');

// Create a new graph
exports.createGraph = async (req, res) => {
  try {
    const graph = new Graph(req.body);
    await graph.save();
    res.status(201).json({
      success: true,
      data: graph
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all graphs with pagination
exports.getGraphs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const graphs = await Graph.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Graph.countDocuments();

    res.status(200).json({
      success: true,
      data: graphs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single graph by ID
exports.getGraph = async (req, res) => {
  try {
    const graph = await Graph.findById(req.params.id);
    if (!graph) {
      return res.status(404).json({
        success: false,
        message: 'Graph not found'
      });
    }
    res.status(200).json({
      success: true,
      data: graph
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a graph
exports.updateGraph = async (req, res) => {
  try {
    const graph = await Graph.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: 'Graph not found'
      });
    }

    res.status(200).json({
      success: true,
      data: graph
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a graph
exports.deleteGraph = async (req, res) => {
  try {
    const graph = await Graph.findByIdAndDelete(req.params.id);

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: 'Graph not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Graph deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 