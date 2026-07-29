# Plan 16: Multiple Questions per Interview

## Overview
Allow interviews to contain multiple questions instead of just one. Also hide difficulty tags from interviewees.

---

## Current State
- Interview has single `questionId`
- Difficulty tag visible to interviewee

---

## New Features

### 1. Multiple Questions in Interview

**Interview Schema Changes:**
```javascript
// Current (single question)
questionId: ObjectId,
questionTitle: String,

// New (multiple questions)
questions: [{
  questionId: ObjectId,
  questionTitle: String,
  order: Number  // 1, 2, 3...
}],
```

### 2. Hide Difficulty Tag

**Frontend Change:**
- Remove difficulty tag from `IntervieweeDashboard.jsx`
- Only show question title and description

---

## Implementation Steps

### Step 1: Update Interview Model
- Add `questions` array field
- Keep `questionId` for backward compatibility (optional)

### Step 2: Update Admin Interview Form
- Allow selecting multiple questions
- Show selected questions list
- Reorder questions (drag or up/down buttons)

### Step 3: Update Backend Routes
- `POST /api/interviews` - Accept multiple question IDs
- `GET /api/interviews/:id` - Return questions array

### Step 4: Update Interviewee Dashboard
- Fetch all questions for the interview
- Show question navigation (Question 1, 2, 3...)
- Hide difficulty tags
- Allow switching between questions

### Step 5: Update Code Execution
- Execute code for current question only
- Track results per question

---

## UI Changes

### Interviewee Dashboard (New Layout)
```
┌─────────────────────────────────────────────────────────────────┐
│  Two Sum        [Question 1/3 ▼]          ⏱ 45:32  [Run][Submit]│
├────────────────────────────────┬────────────────────────────────┤
│  PROBLEM                       │  EDITOR                        │
│  ────────────                  │  ─────────                     │
│  Description...                │  code here                     │
│                                │                                │
│  Example 1                    │                                │
│  Input: [2,7,11,15]           │                                │
│  Output: [0,1]                │                                │
│                                │                                │
│  [Prev] [Next Question]       │  Console                       │
│                                │  ─────────                     │
└────────────────────────────────┴────────────────────────────────┘
```

### Question Navigation
- Dropdown or tabs to switch between questions
- "Question X of Y" indicator
- Previous/Next buttons

---

## API Changes

### Create Interview (Backend)
```javascript
POST /api/interviews
{
  intervieweeName: "John",
  intervieweeEmail: "john@email.com",
  scheduledAt: "2026-01-15T10:00:00Z",
  duration: 60,
  questionIds: ["q1_id", "q2_id", "q3_id"]  // New: array of IDs
}
```

### Get Interview (Backend)
```javascript
GET /api/interviews/:id
{
  "_id": "...",
  "questions": [
    { "questionId": "...", "questionTitle": "Two Sum", "order": 1 },
    { "questionId": "...", "questionTitle": "Reverse Linked List", "order": 2 },
    { "questionId": "...", "questionTitle": "Merge Sorted Arrays", "order": 3 }
  ],
  "currentQuestionIndex": 0  // Which question is currently active
}
```

---

## Files to Modify

### Backend
```
backend/src/
├── models/
│   └── Interview.js       # Add questions array
└── routes/
    └── interviews.js      # Handle multiple questionIds
```

### Frontend
```
frontend/vite-project/src/
├── pages/
│   ├── admin/
│   │   └── NewInterviewPage.jsx   # Multi-select questions
│   └── interview/
│       └── IntervieweeDashboard.jsx  # Question navigation, hide difficulty
└── components/
    └── Interviews/
        └── InterviewForm.jsx   # Multi-select UI
```

---

## Question Navigation Logic

```javascript
// In IntervieweeDashboard
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

// Get current question
const currentQuestion = questions[currentQuestionIndex];

// Navigation
const goToNext = () => {
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }
};

const goToPrev = () => {
  if (currentQuestionIndex > 0) {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }
};
```

---

## Summary

| Feature | Change |
|---------|--------|
| Multiple Questions | Interview now has `questions` array |
| Question Navigation | Prev/Next buttons or dropdown |
| Hide Difficulty | Remove difficulty tag from interviewee view |
| Code Execution | Run against current question only |

---

## Decision Needed

1. **Max questions per interview?** (e.g., 3, 5, 10?)
2. **Question order?** Admin can reorder or auto-sort by creation date?
3. **All questions in one session?** Or can save progress between questions?

Let me know your preferences and I'll implement!
