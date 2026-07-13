# Interview Dashboard (Coding Panel) - Implementation Plan

## Overview

Create the interviewee-facing dashboard where candidates solve coding questions during their interview. Modeled after LeetCode's problem-solving interface, but without the full IDE for now.

---

## User Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Email     │────▶│  Interview  │────▶│  Question   │────▶│  Results    │
│  Received   │     │   Login     │     │   Display   │     │  Submitted  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                        │                                        │
                        ▼                                        ▼
                  ┌─────────────┐                          ┌─────────────┐
                  │    Timer    │                          │   Email to  │
                  │   Starts    │                          │    Admin    │
                  └─────────────┘                          └─────────────┘
```

---

## Page Structure

```
/interview/:token              → Interview Login (verify email + secret code)
/interview/:token/start        → Coding Dashboard (main interview page)
/interview/:token/complete     → Completion Screen
```

---

## Component Structure

### 1. InterviewLogin Page
- Email input field
- Secret code input field
- "Start Interview" button
- Error messages for invalid credentials

### 2. CodingDashboard Page

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Interview Title | Timer (countdown) | Submit Button   │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                      │
│    QUESTION PANEL        │         CODE DISPLAY (READ-ONLY)    │
│    ─────────────────     │         (show sample solution)       │
│    Title: Two Sum       │                                      │
│    Difficulty: Easy     │    // User will type here later      │
│                          │    // For now just show placeholder │
│    Description:         │                                      │
│    Given an array...    │                                      │
│                          │                                      │
│    Example 1:           │                                      │
│    Input: [2,7,11,15]  │                                      │
│    Output: [0,1]       │                                      │
│                          │                                      │
│    Constraints:         │                                      │
│    - 2 <= nums.length   │                                      │
│                          │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│  OUTPUT PANEL (Hidden for now - IDE coming later)               │
│  Shows results when user runs code                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Components to Build

| Component | Description |
|-----------|-------------|
| `InterviewHeader` | Shows interview title, timer, submit button |
| `QuestionPanel` | Displays question details (title, description, examples, constraints) |
| `CodeDisplay` | Read-only code area (placeholder for now) |
| `Timer` | Countdown timer showing remaining time |
| `OutputPanel` | Shows code execution results (hidden initially) |
| `CompletionScreen` | Shows after submission - success message |

---

## Timer Logic

- Timer starts when interviewee clicks "Start Interview"
- Duration set by admin (e.g., 30, 60, 90 minutes)
- Countdown display: `MM:SS` format
- When timer reaches 0:
  - Auto-submit the current solution
  - Show completion screen
  - Send results to admin

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/token/:token/access` | Verify email + secret code |
| GET | `/api/interviews/token/:token` | Get interview + question details |
| POST | `/api/interviews/token/:token/start` | Mark interview as started |
| POST | `/api/interviews/token/:token/submit` | Submit final solution |
| POST | `/api/interviews/:id/result` | Update interview with results |

---

## Data Flow

### 1. Interview Login
```
User enters email + secret code
    ↓
POST /api/interviews/token/:token/access
    ↓
Returns: { valid: true/false, interview }
    ↓
If valid → redirect to /interview/:token/start
```

### 2. Start Interview
```
Page loads
    ↓
GET /api/interviews/token/:token (get question)
    ↓
POST /api/interviews/token/:token/start (mark started)
    ↓
Timer starts countdown
```

### 3. Submit Solution
```
User clicks Submit (or timer ends)
    ↓
POST /api/interviews/token/:token/submit
    ↓
Backend:
  - Updates interview status to "completed"
  - Saves submitted code
  - Sends results email to admin
    ↓
Show completion screen
```

---

## Interview Model Updates

```javascript
{
  // Existing fields
  questionId: ObjectId,
  questionTitle: String,
  intervieweeName: String,
  intervieweeEmail: String,
  scheduledAt: Date,
  duration: Number,
  status: 'pending' | 'in-progress' | 'completed',
  accessToken: String,
  accessEmail: String,
  secretCode: String,
  startedAt: Date,
  
  // New fields for submission
  submittedCode: String,        // Code submitted by interviewee
  language: String,             // Programming language used
  submittedAt: Date,            // When submitted
  result: {
    status: 'passed' | 'failed' | 'pending',
    executionTime: Number,
    testCaseResults: [{
      input: String,
      expected: String,
      actual: String,
      passed: Boolean
    }]
  }
}
```

---

## Frontend Routes

```javascript
// App.jsx routes
<Route path="/interview/:token" element={<InterviewLogin />} />
<Route path="/interview/:token/start" element={<CodingDashboard />} />
<Route path="/interview/:token/complete" element={<CompletionScreen />} />
```

---

## Files to Create

### Backend
```
backend/src/
├── routes/
│   └── interview.js   // Add submit endpoint (already exists, need to add)
└── models/
    └── Interview.js  // Add new fields if needed
```

### Frontend
```
frontend/vite-project/src/
├── pages/
│   └── interview/
│       ├── InterviewLogin.jsx      // Login page
│       ├── CodingDashboard.jsx    // Main coding interface
│       └── CompletionScreen.jsx   // After submission
├── components/
│   └── interview/
│       ├── InterviewHeader.jsx    // Header with timer
│       ├── QuestionPanel.jsx      // Question display
│       ├── CodeDisplay.jsx        // Code placeholder
│       ├── Timer.jsx              // Countdown timer
│       └── OutputPanel.jsx        // Results display
├── context/
│   └── InterviewContext.jsx       // Interview state management
└── services/
    └── api.js                     // API calls
```

---

## Implementation Order

### Phase 1: Login & Access Control
1. Create `InterviewLogin.jsx` page
2. Add access validation API endpoint
3. Create InterviewContext for state
4. Test email + secret code verification

### Phase 2: Question Display
1. Create `QuestionPanel.jsx` component
2. Fetch question data from API
3. Display title, description, examples, constraints
4. Style to match LeetCode-like appearance

### Phase 3: Timer
1. Create `Timer.jsx` component
2. Implement countdown logic
3. Handle auto-submit when timer ends
4. Add visual warning when time is low (e.g., < 5 min)

### Phase 4: Submission Flow
1. Create submit button in header
2. Add submit API endpoint
3. Create completion screen
4. Send results email to admin

### Phase 5: Styling
1. Apply LeetCode-like dark theme
2. Make it responsive
3. Add loading states
4. Error handling

---

## UI Mockup (Coding Dashboard)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Two Sum                    ⏱ 45:32             [Submit]        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────┬─────────────────────────────────────────┤
│  Difficulty: Easy              │  ┌─────────────────────────────────┐  │
│                                │  │ // Type your solution here      │  │
│  Description                   │  │                                 │  │
│  ─────────────────────────     │  │ function twoSum(nums, target) { │  │
│  Given an array of integers   │  │   // TODO                       │  │
│  nums and an integer target,   │  │                                 │  │
│  return indices of the two    │  │ }                                │  │
│  numbers such that they add    │  │                                 │  │
│  up to target.                 │  │                                 │  │
│                                │  └─────────────────────────────────┘  │
│  Example 1:                   │                                        │
│  Input: nums = [2,7,11,15],   │  ┌─────────────────────────────────┐  │
│         target = 9             │  │ Test Results                    │  │
│  Output: [0,1]                 │  │ ─────────────────────────────── │  │
│  Explanation: Because          │  │ Test 1: ✓ Passed               │  │
│  nums[0] + nums[1] == 9        │  │ Test 2: ✗ Failed               │  │
│                                │  │ Expected: [0,1]                │  │
│  Constraints:                  │  │ Actual: [0,2]                  │  │
│  • 2 <= nums.length <= 10^4   │  └─────────────────────────────────┘  │
│  • -10^9 <= nums[i] <= 10^9   │                                        │
└────────────────────────────────┴─────────────────────────────────────────┘
```

---

## Next Steps (After This Plan)

Once the interview dashboard is working without IDE:
- **Plan 12**: Integrate Monaco Editor for actual code editing
- **Plan 13**: Integrate Judge0 for code execution
- **Plan 14**: Add run code vs submit code functionality

---

## Decision Needed Before Implementation

1. **Timer default**: What should be the default interview duration? (30 min / 60 min / configurable)
2. **Auto-submit**: Should the code auto-submit when timer ends, or show a warning first?
3. **Language**: What programming languages should be supported initially? (JavaScript, Python, Java, C++)
