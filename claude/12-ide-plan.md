# Plan 12: IDE (Code Editor & Execution) - Implementation Plan

## Overview

This document explains how LeetCode handles test cases and how we can implement similar functionality.

---

## How LeetCode Test Cases Work

### Two Types of Test Cases

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEETCODE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SAMPLE TEST CASES (Visible to User)                        │
│     ├── Shown in the problem description                      │
│     ├── User can run these manually                           │
│     ├── User sees input + expected output                     │
│     └── Used for debugging                                     │
│                                                                 │
│  2. HIDDEN TEST CASES (Not Visible to User)                   │
│     ├── NOT shown in problem description                      │
│     ├── Only executed when user submits                       │
│     ├── User doesn't see input or expected output             │
│     └── Used for final evaluation                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SUBMIT FLOW:                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐   │
│  │  Code    │───▶│ Run Sample   │───▶│ Run Hidden        │   │
│  │Submit    │    │ Test Cases   │    │ Test Cases        │   │
│  └──────────┘    └──────────────┘    └───────────────────┘   │
│                       │                     │                   │
│                       ▼                     ▼                   │
│                  Show Results         Calculate Score          │
│                                       (No user output)         │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Process

```
1. USER WRITES CODE
   │
   ▼
2. USER CLICKS "RUN"
   │                   ┌─────────────────────────┐
   │                   │ Backend executes code   │
   │                   │ with SAMPLE test cases │
   │                   └─────────────────────────┘
   │                           │
   │                           ▼
   │                   ┌─────────────────────────┐
   │                   │ Compare output with     │
   │                   │ expected (for each test)│
   │                   └─────────────────────────┘
   │                           │
   │                           ▼
   │                   ┌─────────────────────────┐
   └──────────────────▶│ Show results to user    │
│                       │ (passed/failed + output)│
│                       └─────────────────────────┘
│
│
▼
3. USER CLICKS "SUBMIT"
   │                   ┌─────────────────────────┐
   │                   │ Backend executes code   │
   │                   │ with HIDDEN test cases  │
   │                   │ (NOT shown to user)     │
   │                   └─────────────────────────┘
   │                           │
   │                           ▼
   │                   ┌─────────────────────────┐
   │                   │ Compare output with      │
   │                   │ expected (internal only) │
   │                   └─────────────────────────┘
   │                           │
   │                           ▼
   │                   ┌─────────────────────────┐
   └──────────────────▶│ Calculate final score    │
                       │ (all passed = accepted) │
                       └─────────────────────────┘
```

---

## Our Current Implementation

### What's Implemented ✅

| Feature | Status | Description |
|---------|--------|-------------|
| Run Code | ✅ Done | Run against admin's test cases |
| Show Results | ✅ Done | Pass/Fail for each test case |
| Custom Test | ⏳ Planned | Upload input file, get output |

### What's Missing ❌

| Feature | Description |
|---------|-------------|
| Hidden Test Cases | Separate test cases not shown to user |
| Submission Score | Final evaluation after submit |
| Multiple Test Sets | Different sets for run vs submit |

---

## Data Model for Test Cases

### Current (Simple)
```javascript
// Question Schema
{
  testCases: [
    { input: "...", output: "..." }
  ]
}
```

### Recommended (LeetCode Style)
```javascript
// Question Schema
{
  // Visible test cases (shown in problem description)
  sampleTestCases: [
    { input: "...", output: "..." }
  ],
  
  // Hidden test cases (only used for evaluation)
  hiddenTestCases: [
    { input: "...", output: "..." }
  ],
  
  // Additional metadata
  judgeConfig: {
    timeLimit: 1000,      // milliseconds
    memoryLimit: 256      // MB
  }
}
```

---

## API Flow

### Current Flow
```
POST /api/execute/run
  → Runs ALL test cases from question
  → Returns all results

POST /api/interviews/token/:token/submit
  → Saves code to database
  → Sends email to admin
  → (No test execution yet)
```

### Improved Flow
```
POST /api/execute/run
  → Runs SAMPLE test cases only
  → Returns results with input/output

POST /api/execute/submit
  → Runs SAMPLE + HIDDEN test cases
  → Returns summary (X/Y passed)
  → Saves to database

POST /api/execute/custom
  → Run with custom input (from file)
  → Returns raw output only
```

---

## Implementation Options

### Option 1: Simple (Current)
- All test cases are visible
- Run = Submit = same test cases
- Easy to implement

### Option 2: Hybrid (Recommended)
- Sample test cases: visible to user
- Hidden test cases: used only at submit
- Moderate implementation effort

### Option 3: Full LeetCode Style
- Sample: visible, run-able
- Hidden: stored separately, executed at submit
- Custom test: upload input file
- Full implementation effort

---

## Decision Needed

Which approach should we implement?

| Option | Description | Effort |
|--------|-------------|--------|
| **Simple** | Current - all tests visible | None |
| **Hybrid** | Add hidden test cases | Medium |
| **Full** | Complete LeetCode style | High |

Questions:
1. Do we need hidden test cases?
2. Should admin be able to create separate hidden test cases?
3. Do we need custom input file testing?

---

## Files to Modify (for Hybrid)

```
backend/src/
├── models/
│   └── Question.js       # Add hiddenTestCases field
├── routes/
│   └── execute.js       # Add separate endpoints
└── services/
    └── judge0.js        # Add execution options

frontend/vite-project/src/
└── pages/admin/
    └── NewQuestionPage.jsx  # Add hidden test case editor
```

---

## Summary

LeetCode separates test cases into:
1. **Sample** - Shown in problem, used for "Run"
2. **Hidden** - Not shown, used for "Submit" evaluation

This prevents users from:
- Writing code that passes only sample cases
- Seeing hidden test inputs
- Gaming the system

Want me to implement the Hybrid approach (add hidden test cases)?