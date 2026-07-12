const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// @route   GET /api/questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { title, difficulty, description, testCases, constraints } = req.body;

    const question = new Question({
      title,
      difficulty,
      description,
      testCases,
      constraints
    });

    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { title, difficulty, description, testCases, constraints } = req.body;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { title, difficulty, description, testCases, constraints },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;