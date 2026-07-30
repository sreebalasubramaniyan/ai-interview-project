# Deployment Plan - AI Interview Platform

## Current Project Structure
```
ai-interview/
├── backend/           # Express.js API server
│   └── src/
│       ├── index.js   # Main server file
│       ├── config/db.js
│       ├── models/    # MongoDB schemas
│       ├── routes/    # API endpoints
│       └── services/  # Email & code execution
├── frontend/          # React + Vite app
│   └── vite-project/ # Frontend source
├── package.json      # Root package (optional)
```

## Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)
- **Backend**: Deploy as Web Service
- **Frontend**: Deploy as Static Site
- **Database**: Use MongoDB Atlas (free tier)

### Option 2: Railway
- All-in-one platform
- Easy MongoDB integration
- Free tier available

### Option 3: Vercel + MongoDB Atlas
- Frontend on Vercel
- Backend on Vercel Serverless or Render
- MongoDB Atlas for database

---

## Step-by-Step Plan

### Phase 1: Prepare for Deployment

1. **Update Environment Variables**
   - Create `.env` for production
   - Update `FRONTEND_URL` to your deployed domain
   - Configure `MONGODB_URI` for MongoDB Atlas
   - Configure `SENDGRID_API_KEY` for emails

2. **Fix API URL in Frontend**
   - Currently hardcoded to `http://localhost:5000`
   - Need to use environment variable or proxy

3. **Build Frontend**
   - Run `npm run build` in frontend
   - Outputs to `dist/` folder

### Phase 2: Database Setup (MongoDB Atlas)

1. Create free MongoDB Atlas account
2. Create cluster
3. Create database user
4. Get connection string
5. Whitelist IP (0.0.0.0 for deployment)

### Phase 3: Deploy Backend

**Render.com:**
1. Connect GitHub repo
2. Create Web Service
3. Set environment variables
4. Deploy command: `npm start`

### Phase 4: Deploy Frontend

**Vercel (easiest):**
1. Import GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `frontend/vite-project/dist`
4. Deploy

---

## Required Environment Variables

### Backend
```
MONGODB_URI=mongodb+srv://...
PORT=5000
FRONTEND_URL=https://your-domain.com
SENDGRID_API_KEY=SG.xxxxxx
EMAIL_USER=your-email@gmail.com
ADMIN_EMAIL=admin@example.com
```

### Frontend (optional - if using proxy)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Current Issues to Fix Before Deploy

1. **Frontend API URL is hardcoded** - needs to use env variable
2. **CORS configuration** - may need to update for production domain

---

## Estimated Cost
- MongoDB Atlas: Free (512MB)
- Render: Free (750 hours)
- Vercel: Free
- Domain: ~$10/year (optional)

Total: **Free** for basic deployment
