# Tech Stack Recommendation

Based on your app description and MERN familiarity, here's my suggestion:

## Core Stack (MERN-based)

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | React + Next.js | Better routing, SSR, and you know React |
| **Backend** | Node.js + Express | Your familiar territory |
| **Database** | MongoDB | Continues with your MERN knowledge |
| **Auth** | JWT + bcrypt | Simple, familiar |

## App-Specific Additions

| Feature | Technology | Why |
|---------|------------|-----|
| **Code Editor** | Monaco Editor (VS Code's editor) | Rich, professional code editing experience |
| **Code Execution** | **Judge0** (or Piston) | Open-source code execution API, supports 60+ languages, easy to integrate |
| **Real-time** | Socket.io | For live coding sessions if needed |
| **Email** | Nodemailer + SendGrid | Reliable email delivery |
| **Web Scraping** | Cheerio + Axios | Lightweight scraping for LeetCode URLs |

## Optional Upgrades

- **State Management**: React Query (simpler than Redux for this use case)
- **Styling**: Tailwind CSS (fast development)
- **Deployment**: Vercel (frontend) + Render/Railway (backend)

## Recommended Path

Given you're familiar with MERN, I'd suggest: **React + Node/Express + MongoDB + Judge0** — you can ramp up quickly since 80% of the stack is what you already know. The only new pieces are the code execution engine (Judge0 handles this) and the scraping logic.