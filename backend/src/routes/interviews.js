const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const { sendInterviewInvitation } = require('../services/email');

// @route   GET /api/interviews
// @desc    Get all interviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/interviews/:id
// @desc    Get interview by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/interviews
// @desc    Create a new interview
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { questionId, questionTitle, intervieweeName, intervieweeEmail, scheduledAt, duration } = req.body;

    const interview = new Interview({
      questionId,
      questionTitle,
      intervieweeName,
      intervieweeEmail,
      scheduledAt,
      duration,
      status: 'pending'
    });

    const newInterview = await interview.save();

    // Send invitation email
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'YOUR_SENDGRID_API_KEY') {
      try {
        await sendInterviewInvitation(newInterview);
        console.log('Invitation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError.message);
      }
    }

    res.status(201).json(newInterview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/interviews/:id
// @desc    Delete an interview
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/interviews/:id
// @desc    Update an interview
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { status, result } = req.body;

    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status, result },
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/interviews/token/:token/access
// @desc    Validate interviewee access token
// @access  Public
router.post('/token/:token/access', async (req, res) => {
  try {
    const { email } = req.body;
    const interview = await Interview.findOne({
      accessToken: req.params.token,
      accessEmail: email
    });

    if (!interview) {
      return res.status(401).json({ valid: false, message: 'Invalid credentials' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ valid: false, message: 'Interview already completed' });
    }

    res.json({ valid: true, interview });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

// @route   GET /api/interviews/token/:token
// @desc    Get interview by token
// @access  Public
router.get('/token/:token', async (req, res) => {
  try {
    const interview = await Interview.findOne({ accessToken: req.params.token })
      .populate('questionId');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/interviews/token/:token/start
// @desc    Mark interview as started
// @access  Public
router.post('/token/:token/start', async (req, res) => {
  try {
    const interview = await Interview.findOne({ accessToken: req.params.token });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed' });
    }

    interview.status = 'in-progress';
    interview.startedAt = new Date();
    await interview.save();

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;