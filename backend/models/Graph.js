const mongoose = require('mongoose');

const graphSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Graph', graphSchema); 