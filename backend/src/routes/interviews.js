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

// Test endpoint to verify routes work
router.get('/test', (req, res) => {
  res.json({ message: 'Routes working!' });
});

// ============================================
// TOKEN-BASED ROUTES (MUST come before /:id)
// ============================================

// @route   POST /api/interviews/token/:token/access
// @desc    Validate interviewee access token
// @access  Public
router.post('/token/:token/access', async (req, res) => {
  try {
    const { secretCode, intervieweeEmail } = req.body;
    const interview = await Interview.findOne({ accessToken: req.params.token });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if already completed
    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed' });
    }

    // Validate credentials
    if (interview.secretCode !== secretCode) {
      return res.status(401).json({ message: 'Invalid access code' });
    }

    if (interview.intervieweeEmail?.toLowerCase() !== intervieweeEmail?.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid email address' });
    }

    res.json({
      valid: true,
      interview: {
        _id: interview._id,
        intervieweeName: interview.intervieweeName,
        intervieweeEmail: interview.intervieweeEmail,
        status: interview.status,
        duration: interview.duration,
        questions: interview.questions,
        questionId: interview.questionId,
        questionTitle: interview.questionTitle
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/interviews/token/:token
// @desc    Get interview by token
// @access  Public
router.get('/token/:token', async (req, res) => {
  try {
    const interview = await Interview.findOne({ accessToken: req.params.token })
      .populate('questions.questionId');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Return interview data (exclude sensitive info like secretCode)
    const interviewData = interview.toObject();
    delete interviewData.secretCode;

    res.json(interviewData);
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

    if (interview.status === 'in-progress') {
      // Already started, just return the interview
      return res.json(interview);
    }

    interview.status = 'in-progress';
    interview.startedAt = new Date();

    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/interviews/token/:token/submit
// @desc    Submit interview solution (for a single question)
// @access  Public
router.post('/token/:token/submit', async (req, res) => {
  try {
    const { submittedCode, language, questionIndex, results, executionResults, testSummary, isAutoSubmit } = req.body;

    const interview = await Interview.findOne({ accessToken: req.params.token });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed' });
    }

    const hasMultipleQuestions = interview.questions && interview.questions.length > 0;
    const isValidQuestionIndex = questionIndex !== undefined && questionIndex !== null && typeof questionIndex === 'number';

    let currentBestScore = null;

    if (hasMultipleQuestions && isValidQuestionIndex && interview.questions[questionIndex]) {
      const existingIndex = interview.questionResults.findIndex(
        qr => qr.questionId.toString() === interview.questions[questionIndex]?.questionId.toString()
      );

      const isAccepted = testSummary?.passed === testSummary?.total;
      const currentQuestionId = interview.questions[questionIndex].questionId;
      const currentQuestionTitle = interview.questions[questionIndex].question?.title || interview.questions[questionIndex].questionTitle || 'Question';
      const passed = testSummary?.passed || 0;
      const total = testSummary?.total || 0;

      const questionResult = {
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: isAccepted ? 'passed' : 'failed',
        executionResults: executionResults || results?.testResults || [],
        testSummary: testSummary || null
      };

      if (existingIndex >= 0) {
        interview.questionResults[existingIndex] = questionResult;
      } else {
        interview.questionResults.push(questionResult);
      }

      // Track all submissions
      interview.allSubmissions = interview.allSubmissions || [];
      interview.allSubmissions.push({
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        passed: passed,
        total: total,
        submittedAt: new Date()
      });

      // Update best score
      interview.bestScores = interview.bestScores || [];
      const bestScoreIndex = interview.bestScores.findIndex(
        bs => bs.questionId.toString() === currentQuestionId.toString()
      );

      if (bestScoreIndex >= 0) {
        if (passed > interview.bestScores[bestScoreIndex].passed) {
          interview.bestScores[bestScoreIndex] = {
            questionId: currentQuestionId,
            questionTitle: currentQuestionTitle,
            passed: passed,
            total: total
          };
        }
        currentBestScore = interview.bestScores[bestScoreIndex];
      } else {
        interview.bestScores.push({
          questionId: currentQuestionId,
          questionTitle: currentQuestionTitle,
          passed: passed,
          total: total
        });
        currentBestScore = {
          questionId: currentQuestionId,
          questionTitle: currentQuestionTitle,
          passed: passed,
          total: total
        };
      }
    } else {
      // Legacy single question
      interview.result = {
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: testSummary?.passed === testSummary?.total ? 'passed' : 'failed',
        executionTime: 0
      };

      interview.questionResults = [{
        questionId: interview.questionId,
        questionTitle: interview.questionTitle || 'Question',
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: testSummary?.passed === testSummary?.total ? 'passed' : 'failed',
        executionResults: executionResults || [],
        testSummary: testSummary || null
      }];

      interview.bestScores = [{
        questionId: interview.questionId,
        questionTitle: interview.questionTitle || 'Question',
        passed: testSummary?.passed || 0,
        total: testSummary?.total || 0
      }];

      currentBestScore = interview.bestScores[0];
    }

    const updatedInterview = await interview.save();

    res.json({
      success: true,
      interview: updatedInterview,
      isAutoSubmit: isAutoSubmit || false,
      bestScore: currentBestScore || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/interviews/token/:token/finish
// @desc    Finish interview - submit current code and mark as completed
// @access  Public
router.post('/token/:token/finish', async (req, res) => {
  try {
    const { submittedCode, language, questionIndex, results, executionResults, testSummary, completionType } = req.body;

    const interview = await Interview.findOne({ accessToken: req.params.token });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview already completed' });
    }

    // First, submit the current code (same logic as /submit)
    const hasMultipleQuestions = interview.questions && interview.questions.length > 0;
    const isValidQuestionIndex = questionIndex !== undefined && questionIndex !== null && typeof questionIndex === 'number';

    let currentQuestionId = null;
    let currentQuestionTitle = 'Question';
    let passed = 0;
    let total = 0;

    if (hasMultipleQuestions && isValidQuestionIndex && interview.questions[questionIndex]) {
      const existingIndex = interview.questionResults.findIndex(
        qr => qr.questionId.toString() === interview.questions[questionIndex]?.questionId.toString()
      );

      const isAccepted = testSummary?.passed === testSummary?.total;

      currentQuestionId = interview.questions[questionIndex].questionId;
      currentQuestionTitle = interview.questions[questionIndex].question?.title || interview.questions[questionIndex].questionTitle || 'Question';
      passed = testSummary?.passed || 0;
      total = testSummary?.total || 0;

      const questionResult = {
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: isAccepted ? 'passed' : 'failed',
        executionResults: executionResults || results?.testResults || [],
        testSummary: testSummary || null
      };

      if (existingIndex >= 0) {
        interview.questionResults[existingIndex] = questionResult;
      } else {
        interview.questionResults.push(questionResult);
      }

      // Track all submissions
      interview.allSubmissions = interview.allSubmissions || [];
      interview.allSubmissions.push({
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        passed: passed,
        total: total,
        submittedAt: new Date()
      });

      // Update best score
      interview.bestScores = interview.bestScores || [];
      const bestScoreIndex = interview.bestScores.findIndex(
        bs => bs.questionId.toString() === currentQuestionId.toString()
      );

      if (bestScoreIndex >= 0) {
        if (passed > interview.bestScores[bestScoreIndex].passed) {
          interview.bestScores[bestScoreIndex] = {
            questionId: currentQuestionId,
            questionTitle: currentQuestionTitle,
            passed: passed,
            total: total
          };
        }
      } else {
        interview.bestScores.push({
          questionId: currentQuestionId,
          questionTitle: currentQuestionTitle,
          passed: passed,
          total: total
        });
      }
    } else {
      // Legacy single question
      currentQuestionId = interview.questionId;
      currentQuestionTitle = interview.questionTitle || 'Question';
      passed = testSummary?.passed || 0;
      total = testSummary?.total || 0;

      interview.result = {
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: testSummary?.passed === testSummary?.total ? 'passed' : 'failed',
        executionTime: 0
      };

      interview.questionResults = [{
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        status: testSummary?.passed === testSummary?.total ? 'passed' : 'failed',
        executionResults: executionResults || [],
        testSummary: testSummary || null
      }];

      interview.allSubmissions = [{
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        submittedCode: submittedCode || '',
        language: language || 'javascript',
        passed: passed,
        total: total,
        submittedAt: new Date()
      }];

      interview.bestScores = [{
        questionId: currentQuestionId,
        questionTitle: currentQuestionTitle,
        passed: passed,
        total: total
      }];
    }

    // Mark interview as completed
    interview.status = 'completed';
    interview.isCompleted = true;
    interview.completedAt = new Date();
    interview.completionType = completionType || 'manual';

    const updatedInterview = await interview.save();

    // Optionally send results to admin
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'YOUR_SENDGRID_API_KEY') {
      try {
        await sendResultsToAdmin(updatedInterview);
        console.log('Results email sent to admin');
      } catch (emailError) {
        console.error('Failed to send results email:', emailError.message);
      }
    }

    res.json({
      success: true,
      interview: updatedInterview,
      message: 'Interview completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ID-BASED ROUTES (MUST come after token routes)
// ============================================

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

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (status) interview.status = status;
    if (result) interview.result = result;

    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
