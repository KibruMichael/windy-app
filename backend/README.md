# Windy App - External Database Migration

This version uses **Neon PostgreSQL** (free tier) instead of PocketBase for persistent data storage.

## Architecture

- **Frontend**: React + Vite + TypeScript (same as before)
- **Backend**: Express.js + Prisma (new)
- **Database**: Neon PostgreSQL (free 0.5GB)

## Setup Instructions

### 1. Create Neon Database (Free)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Configure Backend

1. Copy the example env file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and add your Neon connection string:
   ```
   DATABASE_URL="your-neon-connection-string"
   JWT_SECRET="generate-a-random-32-char-string"
   ```

3. Push the database schema:
   ```bash
   npm run db:push
   ```

### 3. Run Backend Locally

```bash
cd backend
npm run dev
```

The API will be available at http://localhost:3001

### 4. Configure Frontend

Create `app/.env`:
```
VITE_API_URL=http://localhost:3001
```

### 5. Run Frontend

```bash
cd app
npm run dev
```

## Deployment

### Deploy Backend to Render (Free)

1. Go to [render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (random string)

### Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set:
   - **Root Directory**: `app`
4. Add environment variable:
   - `VITE_API_URL` (your Render backend URL)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/comments` | GET | Get all comments |
| `/api/comments` | POST | Create comment |
| `/api/favorites` | GET | Get user favorites |
| `/api/favorites` | POST | Create favorite |
| `/api/favorites/:id` | DELETE | Delete favorite |
| `/api/ratings` | GET | Get all ratings |
| `/api/ratings` | POST | Create/update rating |

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Neon | 0.5GB storage, 100 hours/month compute |
| Render | 750 hours/month free |
| Vercel | 100GB bandwidth/month |

## Files Changed

### New Files
- `backend/` - Express + Prisma backend
- `app/src/lib/apiClient.ts` - New API client
- `app/src/hooks/useAuthNew.tsx` - New auth hook
- `app/src/components/*New.tsx` - Updated components

### To Switch to New Backend

1. In `app/src/App.tsx`, change:
   ```tsx
   import { AuthProvider, useAuth } from "./hooks/useAuth";
   ```
   to:
   ```tsx
   import { AuthProvider, useAuth } from "./hooks/useAuthNew";
   ```

2. Import new components:
   ```tsx
   import CommentBox from "./components/CommentBoxNew";
   import Favorites from "./components/FavoritesNew";
   import Rating from "./components/RatingNew";
   ```

3. Update `saveFavorite` function to use new API client.
