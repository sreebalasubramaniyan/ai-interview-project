const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const { sendInterviewInvitation, sendResultsToAdmin } = require('../services/email');

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
    const {
      questionIds, // Array of question IDs
      questions,   // Array of { questionId, questionTitle, order }
      questionId,  // Single question (backward compatibility)
      questionTitle,
      intervieweeName,
      intervieweeEmail,
      scheduledAt,
      duration
    } = req.body;

    let interviewQuestions = [];

    // Handle multiple questions
    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      // questionIds is array of question IDs - need to fetch titles
      const Question = require('../models/Question');
      const questionDocs = await Question.find({ _id: { $in: questionIds } });

      interviewQuestions = questionIds.map((qId, index) => {
        const qDoc = questionDocs.find(q => q._id.toString() === qId);
        return {
          questionId: qId,
          questionTitle: qDoc ? qDoc.title : `Question ${index + 1}`,
          order: index + 1
        };
      });
    } else if (questions && Array.isArray(questions) && questions.length > 0) {
      // questions array already provided
      interviewQuestions = questions.map((q, index) => ({
        questionId: q.questionId,
        questionTitle: q.questionTitle,
        order: q.order || index + 1
      }));
    } else if (questionId) {
      // Single question (backward compatibility)
      interviewQuestions = [{
        questionId,
        questionTitle: questionTitle || 'Question',
        order: 1
      }];
    }

    const interview = new Interview({
      questions: interviewQuestions,
      questionId: interviewQuestions[0]?.questionId, // Keep for compatibility
      questionTitle: interviewQuestions[0]?.questionTitle,
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
    const { email, secretCode } = req.body;

    // Find interview by URL token (accessToken)
    const interview = await Interview.findOne({
      accessToken: req.params.token
    });

    if (!interview) {
      return res.status(401).json({ valid: false, message: 'Invalid interview link' });
    }

    // Validate email and secret code
    if (interview.accessEmail !== email || interview.secretCode !== secretCode) {
      return res.status(401).json({ valid: false, message: 'Invalid email or secret code' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ valid: false, message: 'Interview already completed' });
    }

    // Populate all question details
    let populatedInterview = interview.toObject();
    if (interview.questions && interview.questions.length > 0) {
      const questionIds = interview.questions.map(q => q.questionId);
      const Question = require('../models/Question');
      const questionDocs = await Question.find({ _id: { $in: questionIds } });

      populatedInterview.questions = interview.questions.map(q => {
        const qDoc = questionDocs.find(doc => doc._id.toString() === q.questionId.toString());
        return {
          questionId: q.questionId,
          questionTitle: q.questionTitle,
          order: q.order,
          _id: q._id,
          question: qDoc ? qDoc.toObject() : null
        };
      });
    }

    res.json({ valid: true, interview: populatedInterview });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

// @route   GET /api/interviews/token/:token
// @desc    Get interview by token
// @access  Public
router.get('/token/:token', async (req, res) => {
  try {
    const interview = await Interview.findOne({ accessToken: req.params.token });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Populate all question details
    let populatedInterview = interview.toObject();
    if (interview.questions && interview.questions.length > 0) {
      const questionIds = interview.questions.map(q => q.questionId);
      const Question = require('../models/Question');
      const questionDocs = await Question.find({ _id: { $in: questionIds } });

      // Add full question details to response
      populatedInterview.questions = interview.questions.map(q => {
        const qDoc = questionDocs.find(doc => doc._id.toString() === q.questionId.toString());
        return {
          questionId: q.questionId,
          questionTitle: q.questionTitle,
          order: q.order,
          _id: q._id,
          question: qDoc ? qDoc.toObject() : null
        };
      });
    }

    res.json(populatedInterview);
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

// @route   POST /api/interviews/token/:token/submit
// @desc    Submit interview solution
// @access  Public
router.post('/token/:token/submit', async (req, res) => {
  try {
    const { submittedCode, language, isAutoSubmit, questionIndex, results, executionResults, testSummary } = req.body;

    const interview = await Interview.findOne({ accessToken: req.params.token });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed' });
    }

    // Handle per-question submission
    if (questionIndex !== undefined && interview.questions && interview.questions.length > 0) {
      // Update or add question result
      const existingIndex = interview.questionResults.findIndex(
        qr => qr.questionId.toString() === interview.questions[questionIndex]?.questionId.toString()
      );

      const questionResult = {
        questionId: interview.questions[questionIndex].questionId,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: testSummary?.passed === testSummary?.total ? 'passed' : 'failed',
        executionResults: executionResults || results?.testResults || [],
        testSummary: testSummary || null
      };

      if (existingIndex >= 0) {
        interview.questionResults[existingIndex] = questionResult;
      } else {
        interview.questionResults.push(questionResult);
      }

      // Check if all questions are answered
      const answeredCount = interview.questionResults.length;
      const totalQuestions = interview.questions.length;

      // If all questions answered, mark as completed
      if (answeredCount >= totalQuestions) {
        interview.status = 'completed';
        interview.completedAt = new Date();
      }
    } else {
      // Legacy single question submission
      interview.status = 'completed';
      interview.completedAt = new Date();
      interview.result = {
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: 'pending',
        executionTime: 0
      };
    }

    const updatedInterview = await interview.save();

    // Send results to admin when interview is completed
    if (interview.status === 'completed') {
      try {
        await sendResultsToAdmin(updatedInterview);
      } catch (emailError) {
        console.error('Failed to send results email:', emailError.message);
      }
    }

    res.json({
      success: true,
      interview: updatedInterview,
      isAutoSubmit: isAutoSubmit || false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;