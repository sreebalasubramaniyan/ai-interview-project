# Implementation Plan: Run & Submit with Hidden Test Cases

## Overview
Admin can create normal test cases and hidden test cases. When running code, normal test cases are used. When submitting code, hidden test cases are used for verification.

---

## Step 1: Update Question Model
**File:** `backend/src/models/Question.js`

Add `hiddenTestCases` array field similar to `testCases`:
```javascript
hiddenTestCases: [
  {
    input: { type: String, required: true },
    output: { type: String, required: true }
  }
]
```

---

## Step 2: Update QuestionForm (Admin UI)
**File:** `frontend/vite-project/src/components/Questions/QuestionForm.jsx`

- Add state for `hiddenTestCases` with initial empty array
- Add UI section for hidden test cases (similar to test cases but labeled "Hidden Test Cases")
- Update `handleSubmit` to include both `testCases` and `hiddenTestCases`
- Filter out empty test cases

---

## Step 3: Update Judge0 Service
**File:** `backend/src/services/judge0.js`

No changes needed - existing `executeAllTestCases` function can be reused.

---

## Step 4: Add Submit Endpoint
**File:** `backend/src/routes/execute.js`

Add new route `/submit`:
```javascript
router.post('/submit', async (req, res) => {
  // Get question with hidden test cases
  // Execute code against all hidden test cases
  // Return results with pass/fail status
});
```

Returns:
- All test results with pass/fail status
- First failed test case number (if any)
- Any errors that occurred
- If all pass: success = true

---

## Step 5: Update IntervieweeDashboard
**File:** `frontend/vite-project/src/pages/interview/IntervieweeDashboard.jsx`

### Update `handleSubmit`:
- Call `/api/execute/submit` instead of `/api/interviews/token/:token/submit`
- On success (all hidden tests pass):
  - Call `/api/interviews/token/:token/submit` to save the interview
  - Navigate to completion screen
- On failure (any hidden test fails):
  - Show which test case failed (don't reveal hidden input/output)
  - Show error if any
  - Stay on editor page

### Update submit button behavior:
- On submit: run hidden test cases first
- If passed: complete interview
- If failed: show "Failed at test case #N" message

---

## Step 6: Update Interview Model (Optional)
**File:** `backend/src/models/Interview.js`

Consider storing execution results from hidden test cases:
```javascript
result: {
  submittedCode: String,
  language: String,
  status: String, // 'passed', 'failed'
  executionTime: Number,
  failedAtTestCase: Number
}
```

---

## Execution Flow

### Run Button:
1. User clicks "Run"
2. Frontend calls `POST /api/execute/run` with code, language, questionId
3. Backend executes against **normal test cases**
4. Returns results with pass/fail for each test case
5. Frontend displays pass/fail status

### Submit Button:
1. User clicks "Submit"
2. Frontend calls `POST /api/execute/submit` with code, language, questionId
3. Backend executes against **hidden test cases only**
4. Returns results:
   - If all passed: `{ success: true, results: [...] }`
   - If failed: `{ success: false, failedAt: N, error: ... }`
5. If success:
   - Frontend calls `POST /api/interviews/token/:token/submit`
   - Navigate to completion screen
6. If failed:
   - Frontend shows error: "Failed at hidden test case #N"
   - User stays on editor to fix code

---

## Testing Checklist
- [ ] Admin can create normal test cases
- [ ] Admin can create hidden test cases
- [ ] Run executes normal test cases only
- [ ] Submit executes hidden test cases only
- [ ] All hidden tests pass → interview completes
- [ ] Any hidden test fails → shows failure message
- [ ] Errors are displayed properly