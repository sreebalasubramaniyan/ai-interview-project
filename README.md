# AI Interview Platform

A full-stack coding interview platform for creating questions, scheduling interviews, and evaluating candidates through automated testing.

## Overview

This platform allows administrators to create coding questions and schedule interviews for candidates. Candidates access their interviews via a unique URL and secret code, write JavaScript solutions, and receive instant feedback based on test case results.

## Features

- **Question Management** — Create coding questions with difficulty levels and test cases
- **Test Cases** — Visible (3) and hidden test cases like LeetCode
- **Interview Scheduling** — Schedule interviews with custom duration
- **Secure Access** — Token-based access with 4-digit secret code
- **Code Execution** — Local JavaScript execution with 5-second timeout
- **Email Notifications** — SendGrid-powered interview invitations
- **Submission Tracking** — Track all submissions and best scores per question
- **Admin Dashboard** — Manage questions and interviews

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Frontend | React, Vite |
| Email | SendGrid |

## Quick Start

```bash
# Backend
cd backend
npm install
# Configure .env file (see below)
npm start

# Frontend
cd frontend/vite-project
npm install
npm run dev
```

## Environment Variables (backend/.env)

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/aiinterview
PORT=5000
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=your_api_key
EMAIL_USER=your_verified_email
ADMIN_EMAIL=admin@example.com
```

## API Endpoints

**Questions**
- `GET /api/questions` — List all questions
- `POST /api/questions` — Create question
- `GET /api/questions/:id` — Get question
- `PUT /api/questions/:id` — Update question
- `DELETE /api/questions/:id` — Delete question

**Interviews**
- `GET /api/interviews` — List all interviews
- `POST /api/interviews` — Create interview
- `GET /api/interviews/token/:token` — Get by access token
- `POST /api/interviews/token/:token/access` — Validate access
- `POST /api/interviews/token/:token/submit` — Submit solution
- `POST /api/interviews/token/:token/finish` — Complete interview

**Code Execution**
- `POST /api/execute/run` — Run against first 3 test cases
- `POST /api/execute/submit` — Run against all test cases

## Project Structure

```
ai-interview/
├── backend/
│   ├── src/
│   │   ├── config/db.js         # MongoDB connection
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── index.js             # Entry point
│   └── .env
├── frontend/vite-project/       # React application
└── README.md
```

## License

ISC
