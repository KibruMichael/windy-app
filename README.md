# WindyClone - Interactive Weather Map & Social Platform

![Windy App Screenshot](https://via.placeholder.com/800x400?text=Windy+App+Preview)

## 📖 Project Overview

WindyClone is a modern, interactive weather map application inspired by Windy.com. It combines real-time weather data visualization with social features, allowing users to interact with locations, leave comments, save favorites, and rate spots.

The application is built with a **React (Vite)** frontend and an **Express + Prisma** backend with **PostgreSQL** database, designed for performance, scalability, and persistent data storage.

## ✨ Key Features

- **Interactive Weather Map**: Visualize wind, temperature, rain, clouds, and pressure layers using Leaflet
- **Real-time Weather Data**: Current conditions, hourly forecast, and 5-day forecast from OpenWeatherMap
- **Social Interaction**:
  - **Comments**: Post and view comments on specific map locations
  - **Ratings**: Rate the app (1-5 stars)
  - **Favorites**: Save and manage your favorite locations for quick access
- **User Authentication**: Secure signup and login system with JWT tokens
- **Responsive Design**: Dark-themed UI optimized for desktop and tablet
- **Persistent Storage**: Data stored in Neon PostgreSQL (free tier: 0.5GB)

## 🏗️ Architecture

```
┌─────────────────┐     HTTP/REST     ┌─────────────────┐
│   React App     │ ◄──────────────► │  Express API    │
│  (Frontend)     │                   │   (Backend)     │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         │ VITE_API_URL                        │ DATABASE_URL
         │                                     │
         ▼                                     ▼
┌─────────────────┐                   ┌─────────────────┐
│ OpenWeatherMap  │                   │  Neon PostgreSQL│
│   (Weather API) │                   │   (Database)    │
└─────────────────┘                   └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.9.3 | Type-safe JavaScript |
| Vite | 7.2.4 | Build tool & dev server |
| Tailwind CSS | 3.4.19 | Styling |
| React Leaflet | 5.0.0 | Map integration |
| Lucide React | 0.562.0 | Icons |
| Axios | 1.13.4 | HTTP client |
| Zod | 4.3.5 | Validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5.2.1 | Web framework |
| Prisma | 5.22.0 | ORM |
| PostgreSQL (Neon) | - | Database |
| JWT | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |

### External Services
- **OpenWeatherMap API**: Weather data, forecasts, map tiles
- **CARTO**: Dark basemap tiles
- **Neon**: Serverless PostgreSQL hosting
- **Render**: Application hosting (planned)

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git
- Neon PostgreSQL account (free)

### 1. Clone the Repository
```bash
git clone https://github.com/KibruMichael/windy-app.git
cd windy-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
FRONTEND_URL=http://localhost:5173
```

```bash
# Initialize database schema
npx prisma db push

# Start the server
npm start
```

The backend will run on `http://localhost:3001`.

### 3. Frontend Setup

```bash
cd ../app

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Create a Test Account
- Click "Create account" on the login screen
- Enter email, name, and password (min 8 characters)
- Or use the test account: `test@test.com` / `test1234`

## 📂 Project Structure

```
windy-app/
├── app/                      # Frontend Application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AuthPanel.tsx # Login/Register forms
│   │   │   ├── CommentBox.tsx# Comments system
│   │   │   ├── Favorites.tsx # Saved locations
│   │   │   ├── Rating.tsx    # Star rating
│   │   │   └── ui/           # Reusable UI components
│   │   ├── hooks/
│   │   │   └── useAuth.tsx   # Authentication hook
│   │   ├── lib/
│   │   │   └── apiClient.ts  # API communication
│   │   ├── App.tsx           # Main component
│   │   └── main.tsx          # Entry point
│   ├── .env                  # Environment variables
│   └── package.json
├── backend/                  # Backend API
│   ├── src/
│   │   └── index.js          # Express server
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── .env                  # Environment variables
│   └── package.json
├── DOCUMENTATION.md          # Full technical documentation
├── DEPLOYMENT_GUIDE.md       # Deployment instructions
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/comments` | Get all comments | Yes |
| POST | `/api/comments` | Create comment | Yes |

### Favorites
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/favorites` | Get user's favorites | Yes |
| POST | `/api/favorites` | Add favorite | Yes |
| DELETE | `/api/favorites/:id` | Remove favorite | Yes |

### Ratings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ratings` | Get all ratings | Yes |
| POST | `/api/ratings` | Create/update rating | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Summary

1. **Backend (Web Service)**:
   - Root: `backend`
   - Build: `npm install && npx prisma generate`
   - Start: `npm start`
   - Env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`

2. **Frontend (Static Site)**:
   - Root: `app`
   - Build: `npm install && npm run build`
   - Publish: `dist`
   - Env: `VITE_API_URL`

## 🧩 Extending the Project

### Adding a New Feature

1. **Database**: Add model to `backend/prisma/schema.prisma`
2. **Backend**: Create routes in `backend/src/index.js`
3. **Frontend**: 
   - Add types to `app/src/lib/apiClient.ts`
   - Create component in `app/src/components/`
   - Integrate in `app/src/App.tsx`

### Adding a New Weather Layer

```typescript
// In App.tsx
const layerMap: Record<string, string> = {
  temp: "temp_new",
  rain: "precipitation_new",
  clouds: "clouds_new",
  pressure: "pressure_new",
  // Add new layer:
  wind: "wind_new",
};
```

## 🛠️ Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if Neon database is paused (free tier auto-pauses after 5 min)
- Disable VPN if connection fails

### CORS Errors
- Ensure `FRONTEND_URL` matches your frontend URL exactly
- Check that credentials are enabled in fetch requests

### Build Failures
- Run `npx prisma generate` before starting
- Check Node.js version (v18+ required)

## 📄 License

MIT License - feel free to use and modify for your own projects.

## 🙏 Acknowledgments

- [Windy.com](https://www.windy.com) for inspiration
- [OpenWeatherMap](https://openweathermap.org) for weather API
- [Leaflet](https://leafletjs.com) for mapping
- [Neon](https://neon.tech) for serverless PostgreSQL
