# 🚀 WindyClone Deployment Guide (Render)

This guide details how to deploy your WindyClone application to Render using separate services for frontend and backend, with persistent PostgreSQL storage on Neon.

## 📋 Prerequisites

- [Render](https://render.com) account (free tier available)
- [Neon](https://neon.tech) account (free tier: 0.5GB storage)
- GitHub repository connected to Render

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Render Static  │     │  Render Web      │     │      Neon        │
│   Site (Frontend)│────►│  Service (API)   │────►│   PostgreSQL     │
│   React + Vite   │     │   Express + Node │     │   (Persistent)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Step 1: Set Up Neon PostgreSQL

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project named `windy-app`

### 1.2 Get Connection String
1. Go to your project dashboard
2. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 1.3 Note About Free Tier
- **Storage**: 0.5GB free
- **Auto-pause**: Database pauses after 5 minutes of inactivity
- **Cold start**: First request after pause takes 5-10 seconds
- **Wake up**: Access Neon console or run a query to wake the database

---

## Step 2: Deploy Backend (Web Service)

### 2.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `KibruMichael/windy-app`

### 2.2 Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `windy-app-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 2.3 Add Environment Variables

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Neon connection string |
| `JWT_SECRET` | `your-secret-key` | Random string for JWT signing |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | Frontend URL (add after deploying frontend) |
| `PORT` | `3001` | Server port |

### 2.4 Generate JWT Secret
```bash
# Run locally to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.5 Deploy
1. Click **Deploy Web Service**
2. Wait for build to complete (2-3 minutes)
3. Note your backend URL: `https://windy-app-backend.onrender.com`

### 2.6 Verify Backend
Visit: `https://your-backend.onrender.com/api/health`

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Step 3: Deploy Frontend (Static Site)

### 3.1 Create Static Site
1. Click **New** → **Static Site**
2. Select the same repository: `KibruMichael/windy-app`

### 3.2 Configure Site

| Setting | Value |
|---------|-------|
| **Name** | `windy-app-frontend` |
| **Root Directory** | `app` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3.3 Add Environment Variable

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://windy-app-backend.onrender.com` |

### 3.4 Deploy
1. Click **Deploy Static Site**
2. Wait for build to complete (1-2 minutes)
3. Note your frontend URL: `https://windy-app-frontend.onrender.com`

---

## Step 4: Update CORS (Important!)

After both services are deployed:

1. Go to your **backend** Web Service in Render
2. Navigate to **Environment** tab
3. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   https://windy-app-frontend.onrender.com
   ```
4. Click **Save Changes** - this will trigger a redeploy

---

## Step 5: Test the Deployment

### 5.1 Create Account
1. Open your frontend URL
2. Click "Create account"
3. Enter email, name, and password (min 8 characters)

### 5.2 Test Features
- ✅ Login/Register works
- ✅ Map loads and responds to clicks
- ✅ Weather data displays
- ✅ Can save favorites
- ✅ Can post comments
- ✅ Can rate the app

### 5.3 Test Account
- Email: `test@test.com`
- Password: `test1234`

---

## 🔄 Updating & Git Sync

### Push Changes
```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

Render will automatically redeploy both services.

### Handle Push Conflicts
```bash
# If push is rejected
git pull --rebase origin main
git push origin main
```

---

## 🛠️ Troubleshooting

### Backend Build Fails

**Error**: `Prisma Client could not be generated`
**Solution**: Ensure build command includes `npx prisma generate`:
```bash
npm install && npx prisma generate
```

### CORS Errors

**Error**: `Access-Control-Allow-Origin` errors in browser console
**Solution**: 
1. Verify `FRONTEND_URL` environment variable matches exactly
2. Check that it includes `https://` prefix
3. Redeploy backend after updating

### Database Connection Fails

**Error**: `Can't reach database server`
**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check if Neon database is paused (free tier)
3. Wake up database by visiting Neon console
4. Disable VPN if blocking connections

### Frontend Can't Connect to Backend

**Error**: `Network request failed` or `ERR_CONNECTION_REFUSED`
**Solution**:
1. Verify `VITE_API_URL` is set correctly
2. Ensure backend is running (check `/api/health`)
3. Check Render logs for backend errors

### Neon Database Paused

**Symptom**: First request takes 10+ seconds
**Solution**: This is normal for free tier. Database auto-pauses after 5 minutes of inactivity. Options:
1. Accept the cold start delay
2. Upgrade to Neon Pro ($19/month) for no auto-pause
3. Use a cron job to ping the database periodically

### Environment Variables Not Loading

**Error**: `JWT_SECRET is not defined`
**Solution**:
1. Verify `require('dotenv').config()` is at the top of `index.js`
2. Check environment variables are set in Render dashboard
3. Redeploy after adding environment variables

---

## 📊 Monitoring

### View Logs
1. Go to your service in Render dashboard
2. Click **Logs** tab
3. Real-time logs show server activity

### Check Health
Backend health endpoint: `https://your-backend.onrender.com/api/health`

### Database Status
1. Go to Neon console
2. Check connection count and query history

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier Limits |
|---------|-----------------|
| Render Web Service | 750 hours/month, sleeps after 15 min inactivity |
| Render Static Site | Unlimited |
| Neon PostgreSQL | 0.5GB storage, auto-pauses after 5 min |

**Total Monthly Cost**: $0

---

## 🔐 Security Checklist

- [ ] Strong JWT secret (64+ random characters)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS configured for exact frontend URL
- [ ] Password hashing with bcryptjs (already implemented)
- [ ] Input validation with Zod (already implemented)

---

## 📝 Quick Reference

### Service URLs
- Frontend: `https://windy-app-frontend.onrender.com`
- Backend: `https://windy-app-backend.onrender.com`
- Health: `https://windy-app-backend.onrender.com/api/health`

### Useful Commands
```bash
# Local development
cd backend && npm start          # Start backend
cd app && npm run dev            # Start frontend

# Database
npx prisma studio                # Open database GUI
npx prisma db push               # Push schema changes

# Deployment
git push origin main             # Trigger deployment
```

### Environment Variables Summary

**Backend (`backend/.env`)**:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FRONTEND_URL="https://your-frontend.onrender.com"
PORT=3001
```

**Frontend (`app/.env`)**:
```env
VITE_API_URL="https://your-backend.onrender.com"
```

---

*Last updated: February 2026*
