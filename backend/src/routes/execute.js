const express = require('express');
const router = express.Router();
const { executeAllTestCases } = require('../services/judge0');
const Question = require('../models/Question');

// POST /api/execute/run - Run only first 3 test cases
router.post('/run', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    if (!code || !language || !questionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Get only first 3 test cases
    const testCases = [];
    for (let i = 0; i < 3 && i < question.testCases.length; i++) {
      testCases.push({
        input: question.testCases[i].input,
        output: question.testCases[i].output
      });
    }

    const results = await executeAllTestCases(code, language, testCases);
    const passed = results.filter(r => r.passed).length;

    res.json({
      results,
      summary: {
        passed,
        total: results.length,
        status: passed === results.length ? 'all_passed' : 'partial'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/execute/submit - Run ALL test cases
router.post('/submit', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    if (!code || !language || !questionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Get ALL test cases
    const testCases = [];
    for (let i = 0; i < question.testCases.length; i++) {
      testCases.push({
        input: question.testCases[i].input,
        output: question.testCases[i].output
      });
    }

    const results = await executeAllTestCases(code, language, testCases);
    const passed = results.filter(r => r.passed).length;

    // Only send first 3 results to frontend (hide rest)
    const visibleResults = results.slice(0, 3);

    res.json({
      results: visibleResults,
      summary: {
        passed,
        total: results.length,
        status: passed === results.length ? 'all_passed' : 'partial'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
