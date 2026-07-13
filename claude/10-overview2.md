# AI Interview Platform - Project Overview

## Project Summary

**AI Interview** is a web-based coding interview platform that allows administrators to create and schedule coding interviews for candidates. Candidates receive an email with a unique access link to complete a timed coding challenge, and results are automatically sent back to the admin.

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Database      │
│   (React/Vite)  │◀────│   (Express)     │◀────│   (MongoDB)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               ┌─────────────────┐
        │               │   Email Service  │
        │               │  (SendGrid)      │
        └──────────────▶└─────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + Vite | 19.x / 8.x |
| **Routing** | React Router DOM | 7.x |
| **Backend** | Node.js + Express | 18.x / 4.x |
| **Database** | MongoDB + Mongoose | Atlas / 8.x |
| **Email** | SendGrid / Resend | 8.x / 6.x |
| **Styling** | CSS (custom) | - |

---

## Project Structure

```
ai-interview/
├── .gitignore
├── package.json              # Root config
├── README.md
├── claude/                   # Planning documents
│   ├── 00-overview.md
│   ├── 01-techstack.md
│   ├── 02-plan.md
│   ├── 04-frontend-admin-plan.md
│   ├── 05-database-plan.md
│   ├── 06-interviewee-panel-plan.md
│   ├── 07-email-plan-fresh.md
│   ├── 08-domain-verification-plan.md
│   └── 09-free-domain-plan.md
├── frontend/vite-project/    # React frontend
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
│   │   └── pages/admin/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── QuestionsPage.jsx
│   │       ├── NewQuestionPage.jsx
│   │       ├── InterviewsPage.jsx
│   │       └── NewInterviewPage.jsx
│   └── package.json
└── backend/                 # Node.js backend
    ├── src/
    │   ├── index.js          # Express server entry
    │   ├── config/
    │   │   └── db.js         # MongoDB connection
    │   ├── models/
    │   │   ├── Question.js  # Question schema
    │   │   └── Interview.js # Interview schema
    │   ├── routes/
    │   │   ├── questions.js  # Question CRUD endpoints
    │   │   └── interviews.js # Interview CRUD + token endpoints
    │   └── services/
    │       └── email.js      # SendGrid email service
    ├── .env                  # Environment variables
    └── package.json
```

---

## Data Models

### Question Schema
```javascript
{
  _id: ObjectId,
  title: String,           // Question title
  difficulty: String,      // 'Easy' | 'Medium' | 'Hard'
  description: String,     // Question description
  testCases: [{
    input: String,
    output: String
  }],
  constraints: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Interview Schema
```javascript
{
  _id: ObjectId,
  questionId: ObjectId,    // Reference to Question
  questionTitle: String,
  intervieweeName: String,
  intervieweeEmail: String,
  scheduledAt: Date,
  duration: Number,        // minutes (15-180)
  status: String,         // 'pending' | 'in-progress' | 'completed' | 'expired'
  
  // Access credentials
  accessToken: String,     // Unique token for interviewee access
  accessEmail: String,
  
  // Interview timing
  startedAt: Date,
  completedAt: Date,
  
  // Submission details
  result: {
    submittedCode: String,
    language: String,
    status: String,        // 'passed' | 'failed' | 'pending'
    executionTime: Number
  },
  
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

## API Endpoints

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get all questions |
| GET | `/api/questions/:id` | Get question by ID |
| POST | `/api/questions` | Create new question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interviews` | Get all interviews |
| GET | `/api/interviews/:id` | Get interview by ID |
| POST | `/api/interviews` | Create new interview |
| PUT | `/api/interviews/:id` | Update interview |
| DELETE | `/api/interviews/:id` | Delete interview |

### Interviewee Access
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interviews/token/:token` | Get interview by token |
| POST | `/api/interviews/token/:token/access` | Validate access credentials |
| POST | `/api/interviews/token/:token/start` | Mark interview as started |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin/login` | Login | Admin login page |
| `/admin` | Dashboard | Admin dashboard overview |
| `/admin/questions` | Questions | List all questions |
| `/admin/questions/new` | New Question | Create new question |
| `/admin/interviews` | Interviews | List all interviews |
| `/admin/interviews/new` | New Interview | Schedule new interview |
| `/interview/:token` | Interviewee Login | Candidate access page |

---

## Features Implemented

### ✅ Admin Panel
- [x] Login page with authentication
- [x] Dashboard with overview statistics
- [x] Question management (CRUD operations)
- [x] Interview scheduling with question selection
- [x] Interview list with status tracking
- [x] Responsive sidebar navigation

### ✅ Backend API
- [x] MongoDB connection with Mongoose
- [x] RESTful API for questions
- [x] RESTful API for interviews
- [x] Token-based interviewee access validation
- [x] Email integration (SendGrid)

### ✅ Interviewee Flow
- [x] Token-based access validation
- [x] Interview start mechanism
- [x] Status tracking (pending → in-progress → completed)

---

## Features Planned

### Phase 5: Code Execution Engine
- [ ] Integrate Judge0 API for code execution
- [ ] Run code with sample test cases
- [ ] Submit code with all test cases
- [ ] Handle time limits and memory limits
- [ ] Display execution results

### Phase 7-8: Interviewee Portal
- [ ] Monaco Editor integration
- [ ] Language selector (JavaScript, Python, Java, C++)
- [ ] Timer display with countdown
- [ ] Run/Submit buttons
- [ ] Display results after submission

### Optional Features
- [ ] LeetCode scraper for automatic question import
- [ ] Socket.io for real-time coding sessions
- [ ] Admin view of live candidate progress

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_USER=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

---

## Current Status

**Development Phase**: Phase 4 (Interview Management) completed

**What's Working:**
1. Admin can create/edit/delete questions
2. Admin can schedule interviews with candidates
3. Candidates receive email with access link
4. Candidates can access interview portal via token
5. Basic status tracking implemented

**What's Missing:**
1. Code execution (Judge0)
2. Monaco code editor in interviewee panel
3. Actual API integration in frontend (currently uses mock data in contexts)
4. Results submission and viewing

---

## Next Steps

1. **Connect frontend to backend APIs** - Update context files to fetch from real endpoints
2. **Implement code execution** - Add Judge0 integration to backend
3. **Build interviewee coding panel** - Create the coding interface with Monaco editor
4. **Add submission logic** - Save candidate code and results

---

## Dependencies

### Frontend
- react: ^19.2.7
- react-dom: ^19.2.7
- react-router-dom: ^7.18.1

### Backend
- express: ^4.18.2
- mongoose: ^8.0.3
- cors: ^2.8.5
- dotenv: ^16.3.1
- @sendgrid/mail: ^8.1.6
- resend: ^6.17.2
- nodemon: ^3.0.2 (dev)