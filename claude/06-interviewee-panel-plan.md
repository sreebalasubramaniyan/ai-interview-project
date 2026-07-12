# Interviewee Panel - Implementation Plan

## Overall Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Admin     │────▶│   Email     │────▶│ Interviewee │
│ schedules   │     │   sent      │     │  receives   │
│ interview   │     │             │     │   email     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Admin     │◀────│  Interview  │
                    │  views      │     │   portal    │
                    │   result    │     │  completed  │
                    └─────────────┘     └─────────────┘
```

## Step-by-Step Flow

### 1. Interview Scheduling (Admin)
- Admin creates interview → saves to DB with unique access token
- Email sent to interviewee with:
  - Interview link: `http://localhost:5174/interview/:token`
  - Access credentials (email + token)

### 2. Interviewee Login
- Interviewee clicks link → lands on `/interview/:token`
- Enters email + token to authenticate
- Validates token against DB → starts interview

### 3. Interview Coding Panel
- Timer starts (based on interview duration)
- Displays:
  - Question title & description
  - Constraints
  - Sample test cases
- Code editor (Monaco Editor)
- Language selector (JavaScript, Python, Java, C++, etc.)
- Run Code button → sends to Judge0 → shows output
- Submit button → saves final submission → ends interview

### 4. Results
- Interview marked as "completed"
- Admin can view submission in dashboard
- Interviewee sees pass/fail status

---

## Technical Implementation

### Database Changes

#### Interview Schema Update
```javascript
{
  // ... existing fields
  accessToken: String,      // Unique token for interviewee access
  accessEmail: String,      // Interviewee's email (for login)
  startedAt: Date,         // When interviewee started
  submittedCode: String,    // Final submitted code
  language: String,        // Programming language used
  submissionStatus: String, // passed/failed/pending
  executionResults: [{     // Test case results
    input: String,
    expected: String,
    actual: String,
    passed: Boolean
  }]
}
```

### Backend API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/access` | Validate interviewee access |
| GET | `/api/interviews/:token` | Get interview details |
| POST | `/api/interviews/:token/start` | Mark interview as started |
| POST | `/api/interviews/:token/execute` | Run code via Judge0 |
| POST | `/api/interviews/:token/submit` | Submit final solution |

### Email System

- Use **Nodemailer** + **Gmail** (or SendGrid/Mailgun)
- Send invitation email with:
  - Interview question name
  - Date & Time
  - Access link
  - Credentials

### Code Execution (Judge0)

- **Signup**: https://judge0.com/ (free tier available)
- **API**: Send code → Judge0 executes → returns output
- **Languages supported**: Python, JavaScript, Java, C++, C, Go, Rust, etc.

### Frontend Pages

| Route | Page |
|-------|------|
| `/interview/:token` | Interviewee login/verify |
| `/interview/:token/start` | Coding panel (protected) |

### Coding Panel Components

1. **QuestionPanel** - Display question details
2. **CodeEditor** - Monaco Editor with syntax highlighting
3. **LanguageSelector** - Dropdown for language selection
4. **OutputPanel** - Show code execution results
5. **Timer** - Countdown timer for interview duration
6. **RunButton** - Execute code (test locally)
7. **SubmitButton** - Submit final solution

---

## Files to Create/Modify

### Backend
```
backend/src/
├── routes/
│   └── interviewAccess.js   # New: access, execute, submit endpoints
├── services/
│   └── email.js             # New: email service
└── models/
    └── Interview.js         # Update: add new fields
```

### Frontend
```
frontend/vite-project/src/
├── pages/
│   └── interview/
│       ├── InterviewLogin.jsx    # Interviewee login
│       └── CodingPanel.jsx       # Main coding interface
├── components/
│   └── interview/
│       ├── QuestionPanel.jsx
│       ├── CodeEditor.jsx
│       ├── OutputPanel.jsx
│       └── Timer.jsx
└── context/
    └── InterviewContext.jsx   # Update: add execution methods
```

---

## Implementation Order

1. **Update Interview model** - Add accessToken, results fields
2. **Create email service** - Set up Nodemailer
3. **Update interview routes** - Add access validation, execute, submit
4. **Create interview login page** - Token-based authentication
5. **Create coding panel** - Monaco Editor integration
6. **Implement code execution** - Connect to Judge0 API
7. **Add timer functionality** - Countdown + auto-submit
8. **Update admin dashboard** - Show interview results

---

## Dependencies to Install

### Backend
```bash
npm install nodemailer
```

### Frontend
```bash
npm install @monaco-editor/react axios
```

---

## Environment Variables (Backend)

```
# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Judge0 API
JUDGE0_API_KEY=your-judge0-api-key
JUDGE0_API_URL=https://api.judge0.com
```

---

## Mock Credentials for Testing

For development, use:
- Email: Any valid email format
- Token: Auto-generated UUID stored in interview document

After implementation, interviewee receives:
- **Email**: `candidate@example.com`
- **Link**: `http://localhost:5174/interview/abc123-token`
- **Token**: Auto-generated and sent via email