#  Interactive Weather Map & Social Platform

![Windy App Screenshot](https://via.placeholder.com/800x400?text=Windy+App+Preview) *Add a screenshot of your app here*

## 📖 Project Overview
This project is a modern, interactive weather map application inspired by Windy.com. It combines real-time weather data visualization with social features, allowing users to interact with locations, leave comments, save favorites, and rate spots.

The application is built with a **React (Vite)** frontend and a **PocketBase** backend, designed for performance, scalability, and ease of deployment.

## ✨ Key Features
- **Interactive Weather Map**: Visualize wind, temperature, and other weather layers using Leaflet.
- **Social Interaction**:
  - **Comments**: Post and view comments on specific map locations.
  - **Ratings**: Rate locations (1-5 stars) based on weather conditions or personal preference.
  - **Favorites**: Save and manage your favorite locations for quick access.
- **User Authentication**: Secure signup and login system (Email/Password) powered by PocketBase.
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **Real-time Updates**: Instant feedback on user actions.

## 🏗️ Architecture
The project follows a modern client-server architecture:

- **Frontend**: Single Page Application (SPA) built with React and TypeScript.
  - State Management: React Hooks & Context.
  - Styling: Tailwind CSS & Lucide Icons.
  - Map Engine: Leaflet & React-Leaflet.
- **Backend**: PocketBase (Go-based BaaS).
  - Database: SQLite (embedded in PocketBase).
  - Auth: Built-in authentication system.
  - API: RESTful API auto-generated for collections.
- **Deployment**: Dockerized application hosted on Render.

## 🛠️ Technology Stack
- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - React Leaflet / Leaflet
  - Lucide React (Icons)
- **Backend**:
  - PocketBase (v0.23+)
- **DevOps**:
  - Docker
  - GitHub Actions (Optional)
  - Render (Hosting)

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/windy-app.git
cd windy-app
```

### 2. Backend Setup (PocketBase)
1.  **Download PocketBase**:
    - Download the executable for your OS from [pocketbase.io](https://pocketbase.io/docs/).
    - Place the `pocketbase` executable in the root or a separate `backend` folder.
2.  **Start the Server**:
    ```bash
    ./pocketbase serve
    ```
    Access the Admin UI at `http://127.0.0.1:8090/_/`.
3.  **Import Schema**:
    - Go to **Settings > Import collections**.
    - Load the file `pb_migrations/pocketbase_collections_import.json`.
    - This will create `Comments`, `Favorites`, and `Ratings` collections.

### 3. Frontend Setup
1.  Navigate to the app directory:
    ```bash
    cd app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    - Create a `.env` file in `app/`:
      ```env
      VITE_PB_URL=http://127.0.0.1:8090
      ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open `http://localhost:5173` in your browser.

## 📂 Project Structure

```
windy-app/
├── app/                  # Frontend Application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components (Map, Auth, UI)
│   │   ├── hooks/        # Custom hooks (useAuth, etc.)
│   │   ├── lib/          # Utilities (PocketBase client)
│   │   ├── services/     # API services
│   │   └── App.tsx       # Main component
│   ├── .env              # Environment variables
│   └── package.json      # Frontend dependencies
├── pb_migrations/        # PocketBase migration files & schema
├── Dockerfile            # Production build configuration
├── DEPLOYMENT_GUIDE.md   # Deployment instructions
└── README.md             # This file
```

## 🚢 Deployment

The project is configured for deployment on **Render** (or any Docker-compatible platform).

### Quick Deploy (Render)
1.  **Create a Web Service** on Render connected to your GitHub repo.
2.  **Runtime**: Docker.
3.  **Environment Variables**:
    - `PB_ADMIN_EMAIL`: Your desired admin email.
    - `PB_ADMIN_PASSWORD`: Your desired admin password.
4.  **Persistent Disk** (Recommended):
    - Mount path: `/pb/pb_data`
    - Start command needs to facilitate this (handled by Dockerfile).

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 🧩 Extending the Project

### Adding a New Feature
1.  **Backend**:
    - Create a new collection in PocketBase (or update `pb_migrations`).
    - Update `pocketbase_collections_import.json` if you want to share the schema.
2.  **Frontend**:
    - create a Type definition in `src/types`.
    - Create an API function in `src/lib/pbClient.ts`.
    - Create a UI component in `src/components`.

### Modifying the Map
- The map logic is in `src/components/ForecastPanel.tsx` (and related map components).
- You can add new layers (e.g., Rain, Clouds) by extending the Leaflet layers.

## 📄 License
MIT License - feel free to use and modify for your own projects.
