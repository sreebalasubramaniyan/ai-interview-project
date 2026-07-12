# Admin Frontend Implementation Plan

## Tech Stack
- **Routing**: React Router (v6+)
- **State Management**: React Context API
- **Styling**: CSS Modules or plain CSS (keep simple)
- **HTTP Client**: fetch API (or axios later)

---

## Page Structure

```
/admin                 → Dashboard (overview)
/admin/questions      → Question Management
/admin/questions/new  → Create New Question
/admin/interviews     → Interview Management
/admin/interviews/new → Schedule New Interview
```

---

## Components to Build

### 1. Layout Components
- **AdminLayout**: Sidebar + Header + Main Content area
- **Sidebar**: Navigation menu (Questions, Interviews, Dashboard)
- **Header**: Admin info, logout button

### 2. Question Management
- **QuestionList**: Table showing all questions
- **QuestionForm**: Form to create/edit question
  - Title input
  - Description textarea (markdown support optional)
  - Sample Test Cases (dynamic list - add/remove)
    - Input field
    - Output field
  - Constraints (textarea, one per line)
  - Difficulty dropdown (Easy/Medium/Hard)
  - Save/Cancel buttons

### 3. Interview Management
- **InterviewList**: Table showing scheduled interviews
- **InterviewForm**: Form to schedule interview
  - Select Question dropdown
  - Interviewee Name input
  - Interviewee Email input
  - Date picker
  - Time picker
  - Duration input (minutes)
  - Save/Cancel buttons

---

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install react-router-dom
```

### Step 2: Set up Routing
- Create `src/App.jsx` with Router setup
- Create route definitions
- Create layout wrapper

### Step 3: Create Context
- **AuthContext**: For admin authentication state
- **QuestionContext**: For managing questions (CRUD)
- **InterviewContext**: For managing interviews

### Step 4: Build Pages
- Login page
- Dashboard page
- Questions list page
- Create question page
- Interviews list page
- Schedule interview page

### Step 5: Create Forms
- Question form with dynamic test cases
- Interview scheduling form

---

## UI Mockup

### Create Question Page
```
┌─────────────────────────────────────────────────────┐
│  Admin Portal                                        │
├──────────┬──────────────────────────────────────────┤
│          │  Create New Question                      │
│ Questions│ ───────────────────────────────────────── │
│ Interviews│                                          │
│          │  Title: [________________________]       │
│          │                                          │
│          │  Difficulty: [Easy ▼]                     │
│          │                                          │
│          │  Description:                             │
│          │  [________________________________]      │
│          │  [________________________________]      │
│          │                                          │
│          │  Sample Test Cases:                      │
│          │  ┌─────────────────┬─────────────────┐   │
│          │  │ Input   │ Output │                 │   │
│          │  ├─────────┼────────┤  [+ Add]        │   │
│          │  │ [_____] │[_____]│  [- Remove]     │   │
│          │  └─────────┴────────┘                 │   │
│          │                                          │
│          │  Constraints:                            │
│          │  [________________________________]      │
│          │  (one per line)                          │
│          │                                          │
│          │        [Save Question]  [Cancel]         │
└──────────┴──────────────────────────────────────────┘
```

### Schedule Interview Page
```
┌─────────────────────────────────────────────────────┐
│  Admin Portal                                        │
├──────────┬──────────────────────────────────────────┤
│          │  Schedule New Interview                  │
│ Questions│ ───────────────────────────────────────── │
│ Interviews│                                         │
│          │  Select Question: [Two Sum        ▼]     │
│          │                                          │
│          │  Interviewee Name:  [_________________]  │
│          │                                          │
│          │  Interviewee Email: [_________________]  │
│          │                                          │
│          │  Date: [____/____/________]              │
│          │                                          │
│          │  Time: [__:__ AM/PM]                     │
│          │                                          │
│          │  Duration (minutes): [____60]            │
│          │                                          │
│          │        [Schedule Interview] [Cancel]     │
└──────────┴──────────────────────────────────────────┘
```

---

## Data Models (Frontend)

### Question
```javascript
{
  id: string,
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  description: string,
  testCases: [
    { input: string, output: string }
  ],
  constraints: string[],
  createdAt: Date
}
```

### Interview
```javascript
{
  id: string,
  questionId: string,
  questionTitle: string,
  intervieweeName: string,
  intervieweeEmail: string,
  scheduledAt: Date,
  duration: number, // minutes
  status: 'pending' | 'completed' | 'expired',
  result: {
    submittedCode: string,
    language: string,
    status: 'passed' | 'failed',
    executionTime: number
  }
}
```

---

## Files to Create

```
frontend/vite-project/
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── QuestionContext.jsx
│   │   └── InterviewContext.jsx
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── Questions/
│   │   │   ├── QuestionList.jsx
│   │   │   └── QuestionForm.jsx
│   │   └── Interviews/
│   │       ├── InterviewList.jsx
│   │       └── InterviewForm.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuestionsPage.jsx
│   │   │   ├── NewQuestionPage.jsx
│   │   │   ├── InterviewsPage.jsx
│   │   │   └── NewInterviewPage.jsx
│   │   └── App.jsx
│   └── App.css (updated styles)
└── package.json (add react-router-dom)
```