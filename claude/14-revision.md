# AI Interview Platform - Project Documentation (Revision 04)

## 1. Project Overview

### 1.1 Project Summary

**AI Interview** is a web-based coding interview platform that allows administrators to create and schedule coding interviews for candidates. Candidates receive an email with a unique access link to complete a timed coding challenge, and results are automatically sent back to the admin.

### 1.2 Core Features

| Feature | Description |
|---------|-------------|
| **Admin Panel** | Create/edit/delete questions, schedule interviews, view results |
| **Question Management** | Manual question creation with test cases, difficulty levels |
| **Interview Scheduling** | Set date, time, duration; send email invitations |
| **Interviewee Portal** | Token-based access, coding interface, timer, code execution |
| **Code Execution** | Run code with sample test cases, submit with hidden test cases |
| **Results Tracking** | Pass/fail status, execution results, admin dashboard |

### 1.3 User Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────────┐   │
│  │  Admin   │───▶│   Creates    │───▶│   Sends     │───▶│   Interviewee    │   │
│  │          │    │   Question   │    │  Invitation │    │   Receives       │   │
│  └──────────┘    └──────────────┘    └─────────────┘    └──────────────────┘   │
│                                                                   │              │
│                                                                   ▼              │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────────┐   │
│  │  Admin   │◀───│   Views      │◀───│   Submits   │◀───│   Solves         │   │
│  │          │    │   Results    │    │   Code      │    │   Problem        │   │
│  └──────────┘    └──────────────┘    └─────────────┘    └──────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Database      │
│   (React/Vite)  │◀────│   (Express)     │◀────│   (MongoDB)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               ┌─────────────────┐
        │               │   Judge0 API    │
        │               │ (Code Execution)│
        │               └─────────────────┘
        │                        │
        │                        ▼
        │               ┌─────────────────┐
        │               │   Email Service │
        │               │   (Resend)      │
        └──────────────▶└─────────────────┘
```

### 2.2 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + Vite | 19.x / 8.x |
| **Routing** | React Router DOM | 7.x |
| **Backend** | Node.js + Express | 18.x / 4.x |
| **Database** | MongoDB + Mongoose | Atlas / 8.x |
| **Code Execution** | Judge0 API | - |
| **Email** | Resend | 6.x |
| **Code Editor** | Monaco Editor | 4.x |
| **Styling** | CSS (custom) | - |

---

## 3. Project Structure

```
ai-interview/
├── .gitignore
├── README.md
├── claude/                         # Planning documents
│   ├── 00-overview.md
│   ├── 01-techstack.md
│   ├── 02-plan.md
│   ├── 04-frontend-admin-plan.md
│   ├── 05-database-plan.md
│   ├── 06-interviewee-panel-plan.md
│   ├── 07-email-plan-fresh.md
│   ├── 08-domain-verification-plan.md
│   ├── 09-free-domain-plan.md
│   ├── 10-overview2.md
│   ├── 11-interview-dashboard-plan.md
│   ├── 12-ide-plan.md
│   ├── 13-run&submit.md
│   └── 04-revision.md              # This file
├── frontend/vite-project/          # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── QuestionContext.jsx
│   │   │   └── InterviewContext.jsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── Questions/
│   │   │   │   ├── QuestionForm.jsx
│   │   │   │   └── QuestionList.jsx
│   │   │   └── Interviews/
│   │   │       ├── InterviewForm.jsx
│   │   │       └── InterviewList.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── QuestionsPage.jsx
│   │   │   │   ├── NewQuestionPage.jsx
│   │   │   │   ├── InterviewsPage.jsx
│   │   │   │   └── NewInterviewPage.jsx
│   │   │   └── interview/
│   │   │       ├── InterviewLogin.jsx
│   │   │       ├── IntervieweeDashboard.jsx
│   │   │       └── CompletionScreen.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
└── backend/                        # Node.js backend
    ├── src/
    │   ├── index.js               # Express server entry
    │   ├── config/
    │   │   └── db.js              # MongoDB connection
    │   ├── models/
    │   │   ├── Question.js        # Question schema
    │   │   └── Interview.js       # Interview schema
    │   ├── routes/
    │   │   ├── questions.js       # Question CRUD endpoints
    │   │   ├── interviews.js      # Interview CRUD + token endpoints
    │   │   └── execute.js         # Code execution endpoints
    │   └── services/
    │       ├── email.js           # Resend email service
    │       └── judge0.js          # Judge0 API integration
    ├── .env                      # Environment variables
    └── package.json
```

---

## 4. Data Models

### 4.1 Question Schema

```javascript
{
  _id: ObjectId,
  title: String,                    // Question title
  difficulty: String,               // 'Easy' | 'Medium' | 'Hard'
  description: String,               // Question description
  
  // Sample test cases (visible to user)
  testCases: [{
    input: String,
    output: String
  }],
  
  // Hidden test cases (used only for submission)
  hiddenTestCases: [{
    input: String,
    output: String
  }],
  
  constraints: [String],             // Problem constraints
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Interview Schema

```javascript
{
  _id: ObjectId,
  questionId: ObjectId,             // Reference to Question
  questionTitle: String,
  
  // Interviewee details
  intervieweeName: String,
  intervieweeEmail: String,
  
  // Scheduling
  scheduledAt: Date,
  duration: Number,                 // minutes (15-180)
  
  // Status tracking
  status: String,                   // 'pending' | 'in-progress' | 'completed' | 'expired'
  
  // Access credentials
  accessToken: String,              // Unique token for interviewee access
  accessEmail: String,
  
  // Interview timing
  startedAt: Date,
  completedAt: Date,
  
  // Submission details
  submittedCode: String,
  language: String,
  
  // Results
  result: {
    status: String,                 // 'passed' | 'failed' | 'pending'
    executionTime: Number,
    failedAtTestCase: Number
  },
  
  // Detailed execution results
  executionResults: [{
    testCase: {
      input: String,
      expected: String,
      actual: String,
      passed: Boolean,
      output: String,
      error: String,
      executionTime: Number
    }
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. API Endpoints

### 5.1 Questions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get all questions |
| GET | `/api/questions/:id` | Get question by ID |
| POST | `/api/questions` | Create new question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |

### 5.2 Interviews API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interviews` | Get all interviews (admin) |
| GET | `/api/interviews/:id` | Get interview by ID (admin) |
| POST | `/api/interviews` | Create new interview |
| PUT | `/api/interviews/:id` | Update interview |
| DELETE | `/api/interviews/:id` | Delete interview |

### 5.3 Interviewee Access API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interviews/token/:token` | Get interview by token |
| POST | `/api/interviews/token/:token/access` | Validate access credentials |
| POST | `/api/interviews/token/:token/start` | Mark interview as started |
| POST | `/api/interviews/token/:token/submit` | Submit final solution |

### 5.4 Code Execution API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute/run` | Run code with sample test cases |
| POST | `/api/execute/submit` | Submit code with hidden test cases |

### 5.5 System API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## 6. Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin/login` | Login | Admin login page |
| `/admin` | Dashboard | Admin dashboard overview |
| `/admin/questions` | Questions | List all questions |
| `/admin/questions/new` | New Question | Create new question |
| `/admin/interviews` | Interviews | List all interviews |
| `/admin/interviews/new` | New Interview | Schedule new interview |
| `/interview/:token` | Interviewee Login | Candidate access page |
| `/interview/:token/start` | Coding Dashboard | Main coding interface |
| `/interview/:token/complete` | Completion Screen | After submission |

---

## 7. Implementation Phases

### Phase 1: Project Setup ✅
- [x] Initialize Vite + React project (frontend)
- [x] Initialize Node.js + Express project (backend)
- [x] Set up MongoDB Atlas connection
- [x] Configure environment variables
- [x] Set up folder structure

### Phase 2: Authentication & User Management ✅
- [x] Admin login with JWT
- [x] Protected admin routes
- [x] Auth middleware

### Phase 3: Question Management ✅
- [x] Question CRUD operations
- [x] Question model with test cases
- [x] Admin question management UI

### Phase 4: Interview Management ✅
- [x] Interview model with scheduling
- [x] Interview CRUD operations
- [x] Access token generation
- [x] Admin interview management UI

### Phase 5: Code Execution Engine ✅
- [x] Judge0 API integration
- [x] Run code with sample test cases
- [x] Submit code with hidden test cases
- [x] Execute endpoint implementation

### Phase 6: Email System ✅
- [x] Resend integration
- [x] Interview invitation emails
- [x] Results notification emails

### Phase 7: Interviewee Portal ✅
- [x] Token-based access validation
- [x] Interview login page
- [x] Question display panel
- [x] Monaco code editor integration
- [x] Language selector
- [x] Timer with countdown
- [x] Run/Submit buttons
- [x] Completion screen

---

## 8. Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
RESEND_API_KEY=re_...
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
JWT_SECRET=your_jwt_secret
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
```

---

## 9. Code Execution Flow

### 9.1 Run Code (Sample Test Cases)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User     │────▶│   Backend    │────▶│   Judge0    │
│  clicks    │     │  executes   │     │   API       │
│  "Run"     │     │  sample     │     │             │
└─────────────┘     │  test cases │     └─────────────┘
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Returns    │────▶│   User      │
                    │  results    │     │  sees       │
                    │  (pass/fail)│     │  output     │
                    └─────────────┘     └─────────────┘
```

### 9.2 Submit Code (Hidden Test Cases)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User     │────▶│   Backend    │────▶│   Judge0    │
│  clicks    │     │  executes    │     │   API       │
│  "Submit"  │     │  hidden      │     │             │
└─────────────┘     │  test cases │     └─────────────┘
                    └─────────────┘
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │   All Pass  │         │   Any Fail  │
        └─────────────┘         └─────────────┘
               │                       │
               ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │ Interview   │         │   Show      │
        │ Completed   │         │  "Failed    │
        │ Email to    │         │  at test    │
        │ Admin       │         │  case #N"   │
        └─────────────┘         └─────────────┘
```

---

## 10. Testing Checklist

### Admin Features
- [ ] Admin can log in
- [ ] Admin can create a question with test cases
- [ ] Admin can create hidden test cases
- [ ] Admin can edit/delete questions
- [ ] Admin can schedule an interview
- [ ] Admin can view all scheduled interviews
- [ ] Admin receives email when candidate submits

### Interviewee Features
- [ ] Interviewee receives email with access link
- [ ] Interviewee can access interview with token
- [ ] Question displays correctly
- [ ] Code editor works (Monaco)
- [ ] Language selector works
- [ ] Timer counts down correctly
- [ ] Run button executes sample test cases
- [ ] Submit button executes hidden test cases
- [ ] Completion screen shows after successful submit
- [ ] Auto-submit works when timer expires

### Code Execution
- [ ] JavaScript code executes correctly
- [ ] Python code executes correctly
- [ ] Test case results display correctly
- [ ] Errors are handled and displayed

---

## 11. Current Status

### ✅ Implemented Features
1. Admin authentication and dashboard
2. Question management (CRUD)
3. Interview scheduling
4. Token-based interviewee access
5. Email invitations (Resend)
6. Monaco code editor
7. Code execution via Judge0
8. Run and Submit functionality
9. Hidden test cases
10. Timer with countdown

### ⏳ Planned Features
- Real-time progress tracking (Socket.io)
- LeetCode URL scraper
- Multiple programming languages support
- Admin live view of candidate code

---

## 12. Dependencies

### Frontend
```json
{
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.1",
    "@monaco-editor/react": "^4.6.0",
    "axios": "^1.6.0"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "resend": "^6.17.2",
    "axios": "^1.6.0",
    "uuid": "^9.0.0"
  }
}
```

---

## 13. Quick Start Guide

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Resend account (for emails)
- Judge0 API key (RapidAPI)

### Installation

1. **Clone and install dependencies:**
```bash
# Frontend
cd frontend/vite-project
npm install

# Backend
cd backend
npm install
```

2. **Configure environment variables:**
```bash
# Backend .env
cp .env.example .env
# Fill in your values
```

3. **Start development servers:**
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend/vite-project
npm run dev
```

4. **Access the application:**
- Admin Panel: http://localhost:5173/admin/login
- Interviewee Portal: http://localhost:5173/interview/:token

---

## 14. Appendix: File Reference

### Backend Key Files

| File | Description |
|------|-------------|
| `backend/src/index.js` | Express server entry point |
| `backend/src/config/db.js` | MongoDB connection |
| `backend/src/models/Question.js` | Question schema |
| `backend/src/models/Interview.js` | Interview schema |
| `backend/src/routes/questions.js` | Question API routes |
| `backend/src/routes/interviews.js` | Interview API routes |
| `backend/src/routes/execute.js` | Code execution routes |
| `backend/src/services/email.js` | Resend email service |
| `backend/src/services/judge0.js` | Judge0 API integration |

### Frontend Key Files

| File | Description |
|------|-------------|
| `frontend/vite-project/src/App.jsx` | Main app with routing |
| `frontend/vite-project/src/context/AuthContext.jsx` | Admin auth state |
| `frontend/vite-project/src/context/QuestionContext.jsx` | Question state |
| `frontend/vite-project/src/context/InterviewContext.jsx` | Interview state |
| `frontend/vite-project/src/pages/admin/Login.jsx` | Admin login |
| `frontend/vite-project/src/pages/admin/Dashboard.jsx` | Admin dashboard |
| `frontend/vite-project/src/pages/admin/QuestionsPage.jsx` | Question list |
| `frontend/vite-project/src/pages/admin/InterviewsPage.jsx` | Interview list |
| `frontend/vite-project/src/pages/interview/InterviewLogin.jsx` | Candidate login |
| `frontend/vite-project/src/pages/interview/IntervieweeDashboard.jsx` | Coding interface |
| `frontend/vite-project/src/components/Questions/QuestionForm.jsx` | Question form |

---

*Last Updated: 2026-07-29*
*Revision: 04*
