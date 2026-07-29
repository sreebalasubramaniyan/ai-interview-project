const express = require('express');
const router = express.Router();
const { executeAllTestCases } = require('../services/judge0');
const Question = require('../models/Question');

// @route   POST /api/execute/run
// @desc    Run code against all test cases
// @access  Public
router.post('/run', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;
    console.log('Run request:', { code: code?.substring(0, 30), language, questionId });

    if (!code || !language || !questionId) {
      return res.status(400).json({
        message: 'Missing required fields: code, language, questionId'
      });
    }

    // Get question with test cases
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found with ID: ' + questionId });
    }

    console.log('Question found:', question.title, 'Test cases:', question.testCases?.length);

    if (!question.testCases || question.testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases found for this question' });
    }

    // Execute code against all test cases
    const results = await executeAllTestCases(code, language, question.testCases);
    console.log('Execution complete, results:', results.length);

    // Calculate summary
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    res.json({
      success: true,
      results,
      summary: {
        passed: passedCount,
        total: totalCount,
        status: passedCount === totalCount ? 'all_passed' : 'partial'
      }
    });
  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/execute/submit
// @desc    Submit code - run against hidden test cases only
// @access  Public
router.post('/submit', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    if (!code || !language || !questionId) {
      return res.status(400).json({
        message: 'Missing required fields: code, language, questionId'
      });
    }

    // Get question with hidden test cases
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.hiddenTestCases || question.hiddenTestCases.length === 0) {
      return res.status(400).json({ message: 'No hidden test cases found for this question' });
    }

    // Execute code against all hidden test cases
    const results = await executeAllTestCases(code, language, question.hiddenTestCases);

    // Find first failed test case
    const firstFailed = results.find(r => !r.passed);
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    if (firstFailed) {
      return res.json({
        success: false,
        failedAt: firstFailed.testCaseNumber,
        results: results,
        summary: {
          passed: passedCount,
          total: totalCount,
          status: 'failed'
        }
      });
    }

    // All hidden test cases passed
    res.json({
      success: true,
      results: results,
      summary: {
        passed: passedCount,
        total: totalCount,
        status: 'all_passed'
      }
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;