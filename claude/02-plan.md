# Implementation Plan

## Phase 1: Project Setup
- [ ] Initialize Next.js project (frontend)
- [ ] Initialize Node.js + Express project (backend)
- [ ] Set up MongoDB database connection
- [ ] Configure environment variables
- [ ] Set up folder structure for both frontend and backend

---

## Phase 2: Backend - Authentication & User Management
- [ ] Create User model (Admin, Interviewee roles)
- [ ] Implement JWT authentication
- [ ] Create auth routes (login, register, logout)
- [ ] Create middleware for protected routes
- [ ] Test auth endpoints with Postman

---

## Phase 3: Backend - Question Management
- [ ] Create Question model
- [ ] Implement CRUD operations for questions
- [ ] Build LeetCode scraper service
  - [ ] Scrape problem title, description, examples
  - [ ] Extract test cases from LeetCode or generate them
- [ ] Create question API endpoints

---

## Phase 4: Backend - Interview Management
- [ ] Create Interview model
- [ ] Implement interview creation (link question to interviewee)
- [ ] Add scheduling (date, time, duration)
- [ ] Create interview status tracking (pending, in-progress, completed)
- [ ] Build interview API endpoints

---

## Phase 5: Backend - Code Execution Engine
- [ ] Integrate Judge0 API for code execution
- [ ] Create code submission endpoint
- [ ] Implement run code (test with sample test cases)
- [ ] Implement submit code (test with all test cases)
- [ ] Handle time limits and memory limits
- [ ] Return execution results (output, runtime, memory)

---

## Phase 6: Backend - Email System
- [ ] Configure Nodemailer with SendGrid/Gmail
- [ ] Create email templates (interview invitation, results)
- [ ] Send interview link to interviewee
- [ ] Send results to admin after submission

---

## Phase 7: Frontend - Admin Dashboard
- [ ] Create login page for admin
- [ ] Build dashboard layout (sidebar, header)
- [ ] Implement question management page (add, edit, delete)
- [ ] Create "Create Interview" page
  - [ ] Select/import question
  - [ ] Enter interviewee email
  - [ ] Set date/time
- [ ] Build "View Reports" page (list of completed interviews)
- [ ] View individual interview details

---

## Phase 8: Frontend - Interviewee Portal
- [ ] Create interview access page (verify token from email)
- [ ] Build coding interface
  - [ ] Question display panel
  - [ ] Monaco code editor
  - [ ] Language selector
  - [ ] Run/Submit buttons
  - [ ] Timer display
- [ ] Implement code execution API calls
- [ ] Show results after submission

---

## Phase 9: Real-time Features (Optional)
- [ ] Add Socket.io for live coding sessions
- [ ] Show admin real-time progress of interviewee

---

## Phase 10: Testing & Deployment
- [ ] Write unit tests for backend APIs
- [ ] Test end-to-end flows
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel)
- [ ] Set up CI/CD pipeline

---

## Project Timeline Suggestion

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1-2 | 1 week | Must have |
| Phase 3-4 | 1 week | Must have |
| Phase 5 | 3-4 days | Must have |
| Phase 6 | 2-3 days | Must have |
| Phase 7-8 | 1 week | Must have |
| Phase 9 | 3-4 days | Optional |
| Phase 10 | 3-4 days | Must have |

**Estimated Total: 5-6 weeks**