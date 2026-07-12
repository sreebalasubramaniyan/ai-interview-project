const mongoose = require('mongoose');
const crypto = require('crypto');

const interviewSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  questionTitle: {
    type: String,
    required: true
  },
  intervieweeName: {
    type: String,
    required: true,
    trim: true
  },
  intervieweeEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 180
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'expired'],
    default: 'pending'
  },

  // Access credentials for interviewee
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex'),
    unique: true
  },
  accessEmail: {
    type: String,
    trim: true,
    lowercase: true
  },

  // Interview timing
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },

  // Submission details
  result: {
    submittedCode: String,
    language: String,
    status: {
      type: String,
      enum: ['passed', 'failed', 'pending']
    },
    executionTime: Number
  },

  // Detailed test case results
  executionResults: [
    {
      testCase: {
        input: String,
        expected: String,
        actual: String,
        passed: Boolean,
        output: String,
        error: String,
        executionTime: Number
      }
    }
  ]
}, {
  timestamps: true
});

// Set accessEmail from intervieweeEmail before save
interviewSchema.pre('save', function(next) {
  if (this.isNew && this.intervieweeEmail) {
    this.accessEmail = this.intervieweeEmail;
  }
  next();
});

module.exports = mongoose.model('Interview', interviewSchema);