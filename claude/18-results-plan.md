# Plan 18: Results & Interview Completion

## Overview
Send interview results to admin automatically. Track best score across all submissions. Add finish interview button for early completion. Show question status indicators.

---

## Current State
- Interview can have multiple questions
- Run/Submit buttons work (Run = first 3, Submit = all but shows 3)
- Results saved to `questionResults` in Interview model

---

## Requirements

### 1. Question Status Indicators (Navbar)
Add status tags next to question title in navbar (like Codeforces):

**Status Tags:**
- **Green "Accepted" tag** = All test cases passed
- **Red "Attempted" tag** = Tried but not all passed  
- **No tag** = Not attempted yet

**Placement:** In the question navigator dropdown, show tag next to question name

**Example:**
```
Question Navigator ▼
1. Two Sum [Accepted - green]
2. Reverse List [Attempted - red]
3. Merge Arrays
```

### 2. Auto-submit on Time End
When timer reaches 0, automatically submit the current code

### 3. Finish Interview Button
- Add "Finish Interview" button in interviewee dashboard
- When clicked: submit current code + mark interview as completed
- Send results to admin immediately

### 4. Best Score Logic
- Track all submissions per question
- Store: `bestScore` = maximum test cases passed across all submissions
- On each submit: compare and update if new score > best

### 5. Admin Results View
In admin portal, show for each completed interview:
- Per-question: test cases passed / total
- Number of submits per question
- Solution code (if possible)

---

## Database Changes

### Interview Model - Add fields
```javascript
// Track best scores per question
bestScores: [{
  questionId: ObjectId,
  questionTitle: String,
  passed: Number,
  total: Number
}],

// Track all submissions
allSubmissions: [{
  questionId: ObjectId,
  questionTitle: String,
  code: String,
  language: String,
  passed: Number,
  total: Number,
  submittedAt: Date
}],

// Interview completion
isCompleted: {
  type: Boolean,
  default: false
},
completedAt: Date,
completionType: { // 'time_up' or 'manual'
  type: String
}
```

---

## API Changes

### Update: Submit Solution (per question)
```
POST /api/interviews/token/:token/submit
{
  code: "...",
  language: "javascript",
  questionIndex: 0,
  results: [...],
  testSummary: { passed: 3, total: 5 }
}
```

**Backend Logic:**
1. Save submission to `allSubmissions`
2. Compare with current best for that question
3. Update `bestScores` if new score > old best
4. Return updated best score

### New Endpoint: Finish Interview
```
POST /api/interviews/token/:token/finish
{
  code: "...",
  language: "javascript"
}
```

**Backend Logic:**
1. Submit current code for current question
2. Mark interview as `completed: true`
3. Set `completedAt` = now
4. Set `completionType` = 'manual' or 'time_up'
5. Send email to admin with results (optional)

---

## Frontend Changes

### IntervieweeDashboard.jsx

#### 1. Question Status Indicators
- Track status for each question: 'accepted', 'attempted', 'not_attempted'
- Display as colored badges in the question navigator
- Update status on each submit

#### 2. Add Finish Interview Button
```jsx
<button className="finish-btn" onClick={handleFinishInterview}>
  Finish Interview
</button>
```

#### 3. Add handleFinishInterview function
- Submit current code first
- Call `/api/interviews/token/:token/finish`
- Navigate to completion screen

#### 4. Auto-submit on time up
- When timer reaches 0
- Call finish endpoint automatically

### Admin - Interviews Page

#### 1. Add "View Results" button
For completed interviews, show "Results" button

#### 2. Create Results Modal/Page
Show:
- Interview details (name, email, date)
- Per-question breakdown:
  - Question title
  - Best score (passed/total)
  - Number of submits
- Solution code (expandable)

---

## UI Mockup

### Interviewee Dashboard Header - Question Navigator
```
┌─────────────────────────────────────────────────────────────────┐
│ [<] [Question 1/3 ▼] ●(green)                    [Timer] [Run] [Submit] [Finish]
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              [Dropdown when clicked]
              ┌────────────────────┐
              │ 1. Two Sum ✓      │  ← Green badge
              │ 2. Reverse ✗      │  ← Red badge
              │ 3. Merge -        │  ← Gray badge
              └────────────────────┘
```

### Status Badges (Codeforces style)
```
● ✓ - Green (all passed)
● ✗ - Red (attempted but not all passed)
● -  - Gray (not attempted)
```

### Admin Results View
```
┌─────────────────────────────────────────────────────────┐
│ Interview Results                                       │
├─────────────────────────────────────────────────────────┤
│ Interviewee: John Doe  |  Email: john@email.com        │
│ Completed: 2026-01-15 11:30  |  Type: Manual          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Question 1: Two Sum                                    │
│ ─────────────────────────────────────────────────────── │
│ Best Score: 5/5 ✓  |  Submits: 3                     │
│                                                         │
│ [View Code]                                             │
│                                                         │
│ Question 2: Reverse Linked List                         │
│ ─────────────────────────────────────────────────────── │
│ Best Score: 3/5 ✗  |  Submits: 2                      │
│                                                         │
│ [View Code]                                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Modify

### Backend
```
backend/src/
├── models/
│   └── Interview.js       # Add bestScores, allSubmissions, isCompleted
└── routes/
    └── interviews.js      # Update submit, add finish endpoint
```

### Frontend
```
frontend/vite-project/src/
├── pages/
│   ├── interview/
│   │   └── IntervieweeDashboard.jsx  # Add status indicators, finish button, auto-submit
│   └── admin/
│       └── InterviewsPage.jsx        # Add results view
└── components/
    └── Interviews/
        └── ResultsModal.jsx          # (optional) Show results
```

---

## Implementation Steps

### Step 1: Update Interview Model
- Add `bestScores`, `allSubmissions`, `isCompleted`, `completedAt`, `completionType`

### Step 2: Update Submit Endpoint
- Track all submissions
- Calculate and update best score
- Return best score to frontend

### Step 3: Add Finish Endpoint
- Submit current code
- Mark interview completed

### Step 4: Frontend - Question Status
- Add state to track question statuses
- Display status badges in navigator

### Step 5: Frontend - Finish Button
- Add button and handler
- Navigate to completion on finish

### Step 6: Frontend - Auto-submit
- When timer = 0, auto-call finish

### Step 7: Admin Results View
- Add results button in interviews list
- Show per-question breakdown

---

## Questions for Decision

1. Should we save solution code for each submit or just the best one?
2. Should we send email to admin on interview completion?
3. Should interviewee see their best score during interview?

---

Let me know if you want me to implement this!
