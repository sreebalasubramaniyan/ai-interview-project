# Database Connection Plan

## Approach
- **Database**: MongoDB Atlas (cloud-hosted)
- **Backend**: Node.js + Express (manual setup)
- **Connection**: Mongoose ODM

---

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── Question.js     # Question schema
│   │   └── Interview.js    # Interview schema
│   ├── routes/
│   │   ├── questions.js    # Question API routes
│   │   └── interviews.js   # Interview API routes
│   └── index.js            # Express server entry
├── .env                    # Environment variables
└── package.json
```

---

## Implementation Steps

### 1. Create Backend Project
- Initialize Node.js project
- Install dependencies:
  ```bash
  npm init -y
  npm install express mongoose cors dotenv nodemon
  ```

### 2. Set up MongoDB Atlas
- Create free cluster on MongoDB Atlas
- Get connection string
- Create `.env` file with:
  ```
  MONGODB_URI=your_atlas_connection_string
  PORT=5000
  ```

### 3. Create Database Connection
- `src/config/db.js` - Connect to MongoDB using Mongoose

### 4. Create Models
- **Question Schema**:
  ```javascript
  {
    title: String,
    difficulty: String (Easy/Medium/Hard),
    description: String,
    testCases: [{ input: String, output: String }],
    constraints: [String],
    createdAt: Date
  }
  ```

- **Interview Schema**:
  ```javascript
  {
    questionId: ObjectId (ref: Question),
    questionTitle: String,
    intervieweeName: String,
    intervieweeEmail: String,
    scheduledAt: Date,
    duration: Number,
    status: String (pending/completed/expired),
    result: {
      submittedCode: String,
      language: String,
      status: String,
      executionTime: Number
    },
    createdAt: Date
  }
  ```

### 5. Create API Routes
- `GET /api/questions` - List all questions
- `POST /api/questions` - Create question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/interviews` - List all interviews
- `POST /api/interviews` - Create interview
- `DELETE /api/interviews/:id` - Delete interview

### 6. Update Frontend to Use API
- Replace Context mock data with API calls
- Use `fetch` or `axios` to communicate with backend

---

## MongoDB Atlas Setup (Quick Start)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster (free tier)
4. Create database user (username/password)
5. Network access: Allow All (0.0.0.0/0) for development
6. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Files to Create

```
backend/
├── package.json
├── .env
├── src/
│   ├── index.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Question.js
│   │   └── Interview.js
│   └── routes/
│       ├── questions.js
│       └── interviews.js
└── nodemon.json (optional)
```

---

## After Implementation

The frontend will communicate with backend via HTTP:
- `GET http://localhost:5000/api/questions`
- `POST http://localhost:5000/api/questions`
- etc.