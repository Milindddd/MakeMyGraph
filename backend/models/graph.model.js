const mongoose = require('mongoose');

const graphSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: Array,
    required: true
  },
  selectedColumn: {
    type: String,
    required: true
  },
  chartType: {
    type: String,
    enum: ['bar', 'pie'],
    default: 'bar'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
graphSchema.index({ createdAt: -1 });
graphSchema.index({ name: 'text' });

const Graph = mongoose.model('Graph', graphSchema);

module.exports = Graph; 