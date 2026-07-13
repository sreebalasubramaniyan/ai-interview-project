# Plan 12: IDE (Code Editor & Execution) - Implementation Plan

## Overview

Implement a full-featured code IDE for the interviewee dashboard with Monaco Editor and Judge0 code execution integration. This allows candidates to write, run, and submit code that gets validated against test cases.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend       │────▶│   Backend       │────▶│   Judge0 API    │
│   Monaco Editor  │     │   Execution     │     │   (Code Run)    │
│   + UI           │     │   Service       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   MongoDB       │
                        │   (Results)     │
                        └─────────────────┘
```

---

## Tech Stack Additions

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Code Editor** | Monaco Editor | ^0.52.x | VS Code's editor component |
| **Code Execution** | Judge0 API | Public/Fast | Run code against test cases |
| **Frontend UI** | @monaco-editor/react | ^4.6.x | React wrapper for Monaco |

---

## Supported Languages

Initial support (Judge0 defaults):
| Language | ID | Default Code Template |
|----------|----|----------------------|
| JavaScript | 63 | `function solution(nums, target) { ... }` |
| Python | 71 | `def solution(nums, target): ...` |
| Java | 62 | `public class Solution { public int[] solution(...) }` |
| C++ | 76 | `#include <iostream> ...` |
| C | 50 | `#include <stdio.h> ...` |
| Go | 60 | `package main ...` |

---

## Implementation Phases

### Phase 1: Backend - Code Execution Service

#### 1.1 Create Judge0 Service
```
backend/src/services/judge0.js
```

```javascript
// judge0.js - Code execution service

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Optional for public API

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 76,
  c: 50,
  go: 60
};

/**
 * Execute code against a single test case
 * @param {string} sourceCode - The code to execute
 * @param {string} language - Programming language
 * @param {string} input - Test case input
 * @returns {object} - Execution result
 */
async function executeCode(sourceCode, language, input) {
  // 1. Create submission
  const createResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(JUDGE0_API_KEY && { 'X-RapidAPI-Key': JUDGE0_API_KEY })
    },
    body: JSON.stringify({
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: LANGUAGE_IDS[language],
      stdin: Buffer.from(input).toString('base64')
    })
  });

  const result = await createResponse.json();
  
  return {
    stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
    stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '',
    compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : '',
    status: result.status?.description,
    time: result.time,
    memory: result.memory
  };
}

/**
 * Run code against multiple test cases
 * @param {string} sourceCode - The code to execute
 * @param {string} language - Programming language  
 * @param {array} testCases - Array of {input, expectedOutput}
 * @returns {array} - Array of test results
 */
async function executeAllTestCases(sourceCode, language, testCases) {
  const results = [];
  
  for (const testCase of testCases) {
    const result = await executeCode(sourceCode, language, testCase.input);
    
    results.push({
      input: testCase.input,
      expected: testCase.output,
      actual: result.stdout.trim(),
      passed: result.stdout.trim() === testCase.output.trim(),
      error: result.stderr || result.compile_output,
      executionTime: result.time,
      memory: result.memory
    });
  }
  
  return results;
}

module.exports = {
  executeCode,
  executeAllTestCases,
  LANGUAGE_IDS
};
```

#### 1.2 Add Execute Endpoint
```
backend/src/routes/execute.js
```

```javascript
const express = require('express');
const router = express.Router();
const { executeCode, executeAllTestCases } = require('../services/judge0');
const Question = require('../models/Question');

// @route   POST /api/execute/run
// @desc    Run code against sample test case
// @access  Public
router.post('/run', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;
    
    // Get question to find test cases
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Use first test case for "Run"
    const sampleTestCase = question.testCases[0];
    const result = await executeCode(code, language, sampleTestCase.input);
    
    res.json({
      output: result.stdout,
      error: result.stderr || result.compile_output,
      executionTime: result.time,
      memory: result.memory,
      testCase: sampleTestCase
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/execute/submit
// @desc    Submit code - test against all test cases
// @access  Public
router.post('/submit', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Run against ALL test cases
    const results = await executeAllTestCases(code, language, question.testCases);
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;
    
    res.json({
      results,
      summary: {
        passed: passedCount,
        total: totalCount,
        status: allPassed ? 'passed' : 'failed'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

#### 1.3 Update Interview Route for Execution Results

Update `backend/src/routes/interviews.js` to save execution results:

```javascript
// In the submit endpoint, after saving code:
const question = await Question.findById(interview.questionId);
const results = await executeAllTestCases(submittedCode, language, question.testCases);

interview.executionResults = results;
interview.result.status = results.every(r => r.passed) ? 'passed' : 'failed';
```

#### 1.4 Register New Route

In `backend/src/index.js`:
```javascript
const executeRoutes = require('./routes/execute');
app.use('/api/execute', executeRoutes);
```

---

### Phase 2: Frontend - Monaco Editor Integration

#### 2.1 Install Monaco Editor
```bash
cd frontend/vite-project
npm install @monaco-editor/react
```

#### 2.2 Create Code Editor Component
```
frontend/vite-project/src/components/interview/CodeEditor.jsx
```

```jsx
import Editor from '@monaco-editor/react';

const CODE_TEMPLATES = {
  javascript: `function solution(nums, target) {
  // Write your solution here
  
}`,
  python: `def solution(nums, target):
    # Write your solution here
    pass`,
  java: `public class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        return new int[] {};
    }
}`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> solution(vector<int> nums, int target) {
    // Write your solution here
    return {};
}`,
  c: `#include <stdio.h>

int* solution(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 0;
    return NULL;
}`,
  go: `package main

func solution(nums []int, target int) []int {
    // Write your solution here
    return []int{}
}`
};

export default function CodeEditor({ language, code, onChange }) {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  const handleEditorMount = (editor, monaco) => {
    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true
    });
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={handleEditorChange}
      onMount={handleEditorMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 16 }
      }}
    />
  );
}
```

---

### Phase 3: Frontend - Update Dashboard

#### 3.1 Update IntervieweeDashboard.jsx

Replace the textarea with Monaco Editor and add Run functionality:

```jsx
// Add to imports
import CodeEditor from '../../components/interview/CodeEditor';

// Replace the textarea code editor with:
<div className="code-editor">
  <CodeEditor
    language={language}
    code={code}
    onChange={(newCode) => setCode(newCode)}
  />
</div>

// Add Run button next to Submit:
<button
  className="run-btn"
  onClick={handleRun}
  disabled={running}
>
  {running ? 'Running...' : 'Run'}
</button>
```

#### 3.2 Implement Run/Submit Logic

```javascript
const handleRun = async () => {
  setRunning(true);
  setShowOutput(true);
  setOutput(null);

  try {
    const response = await fetch('http://localhost:5000/api/execute/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        questionId: question._id
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      setOutput({
        output: data.output,
        error: data.error,
        executionTime: data.executionTime,
        passed: !data.error && data.output?.trim() === data.testCase?.output?.trim()
      });
    } else {
      setOutput({ error: data.message });
    }
  } catch (err) {
    setOutput({ error: 'Failed to connect to execution service' });
  } finally {
    setRunning(false);
  }
};

const handleSubmit = async () => {
  setSubmitting(true);
  
  try {
    // First, run execution against all test cases
    const execResponse = await fetch('http://localhost:5000/api/execute/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        questionId: question._id
      })
    });

    const execData = await execResponse.json();
    
    // Then save the interview with results
    const response = await fetch(`${API_URL}/token/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submittedCode: code,
        language: language,
        isAutoSubmit: false,
        executionResults: execData.results,
        resultStatus: execData.summary.status
      })
    });

    // Navigate to completion
  } finally {
    setSubmitting(false);
  }
};
```

---

### Phase 4: UI/UX Improvements

#### 4.1 Output Panel Enhancements

```
┌─────────────────────────────────────────────────────────────┐
│  Test Results                                               │
│  ──────────────────────────────────────────────────────────  │
│  ✓ Test 1 Passed                                          │
│    Input: [2,7,11,15], 9                                   │
│    Expected: [0,1]                                          │
│    Output: [0,1]                                           │
│    Time: 0.023s                                            │
│                                                             │
│  ✗ Test 2 Failed                                           │
│    Input: [3,2,4,6], 7                                      │
│    Expected: [1,2]                                          │
│    Output: [0,2]                                           │
│    Time: 0.018s                                            │
│                                                             │
│  ──────────────────────────────────────────────────────────  │
│  Summary: 2/5 Passed                                       │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Loading States

- Show spinner while "Run" is executing
- Disable buttons during execution
- Show "Executing..." overlay

#### 4.3 Error Display

- Syntax errors in red
- Runtime errors with stack trace
- Clear error messages

---

## Files to Create/Modify

### Backend
```
backend/src/
├── services/
│   └── judge0.js          # NEW - Judge0 execution service
├── routes/
│   └── execute.js        # NEW - Run/Submit endpoints
└── index.js             # MODIFY - Register execute routes
```

### Frontend
```
frontend/vite-project/src/
├── components/
│   └── interview/
│       └── CodeEditor.jsx    # NEW - Monaco Editor component
└── pages/
    └── interview/
        └── IntervieweeDashboard.jsx  # MODIFY - Add Run/Submit logic
```

---

## Environment Variables

### Backend (.env)
```
# Judge0 Configuration
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key  # Optional - needed for faster execution
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute/run` | Run code with sample test case |
| POST | `/api/execute/submit` | Run code with all test cases |
| POST | `/api/interviews/token/:token/submit` | Save submission with results |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. User writes code in Monaco Editor                                │
│                                                                     │
│ 2. User clicks "Run"                                                │
│     ↓                                                               │
│    Backend executes with first test case                           │
│     ↓                                                               │
│    Results shown in Output Panel                                    │
│                                                                     │
│ 3. User clicks "Submit"                                            │
│     ↓                                                               │
│    Backend executes ALL test cases                                 │
│     ↓                                                               │
│    Interview marked complete                                       │
│     ↓                                                               │
│    Results saved to database                                       │
│     ↓                                                               │
│    Navigate to Completion Screen                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Timing Considerations

| Action | Timeout | Notes |
|--------|---------|-------|
| Code Execution | 10s per test | Judge0 default |
| All Test Cases | 60s max | Loop through test cases |
| API Response | 30s | Browser timeout |

---

## Decision Points

1. **Judge0 Hosting**: Use public API or self-host Judge0?
   - Public: `judge0-ce.p.rapidapi.com` (rate limited, free tier)
   - Self-host: Deploy Judge0 on Railway/Render (unlimited, requires setup)

2. **Template Functions**: Should we provide function signatures?
   - Yes: Helps candidates understand expected input/output
   - No: More flexibility

3. **Test Case Visibility**: Show all test cases or only sample?
   - LeetCode approach: Show sample, hide hidden test cases
   - Our approach: Show all (simpler for now)

---

## Next Steps (After This Plan)

- **Plan 13**: Add time limit handling for code execution
- **Plan 14**: Add memory limit and optimize execution
- **Plan 15**: Add hidden test cases for better validation

---

## Estimated Implementation Time

| Phase | Time |
|-------|------|
| Backend Judge0 Service | 2-3 hours |
| Execute Endpoints | 1-2 hours |
| Monaco Editor Integration | 2 hours |
| Run/Submit UI Logic | 2 hours |
| Testing & Fixes | 2 hours |
| **Total** | **9-11 hours** |