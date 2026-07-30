const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  testCases: [
    {
      input: {
        type: String,
        required: true
      },
      output: {
        type: String,
        required: true
      }
    }
  ],
  // Sample test cases = first 3, rest are hidden
  constraints: [
    {
      type: String
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);