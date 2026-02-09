# Deployment Guide: Windy Weather App (Full-Stack)

This comprehensive guide will walk you through deploying your **Windy Weather App** to **GitHub** and **Render**.

### 🚀 Major Update: Simplified Architecture
Previously, this project required deploying the Frontend (React) and Backend (PocketBase) separately. 
**We have now updated the project to use a single Docker container**. 
- **PocketBase** now serves both the API **and** the React Frontend (as static files).
- This means you only need to deploy **one service** instead of two!

---

## 📋 Prerequisites

1.  **GitHub Account**: [github.com](https://github.com)
2.  **Render Account**: [dashboard.render.com](https://dashboard.render.com)
3.  **Git Installed**: You should have Git installed locally.

---

## Part 1: Push Code to GitHub

First, we need to get your latest code, including the new `Dockerfile` and `pb_migrations`, onto GitHub.

1.  **Initialize & Commit** (if not already done):
    Open your terminal in VS Code (`Ctrl + ~`) and run:
    ```bash
    git init
    git add .
    git commit -m "Update deployment to full-stack Docker"
    ```

2.  **Create a Repo on GitHub**:
    *   Go to [GitHub.com/new](https://github.com/new).
    *   **Name**: `windy-weather-app` (or similar).
    *   **Visibility**: **Public** (or Private).
    *   **Do not** initialize with README, .gitignore, or License.
    *   Click **Create repository**.

3.  **Push Code**:
    *   Copy the commands from the section **"…or push an existing repository from the command line"**.
    *   Run them in your terminal:
        ```bash
        git remote add origin https://github.com/<YOUR_USERNAME>/windy-weather-app.git
        git branch -M main
        git push -u origin main
        ```

---

## Part 2: Deploy on Render (Single Web Service)

We will deploy one **Web Service** that runs PocketBase and serves your React app.

1.  **Create New Service**:
    *   Go to your [Render Dashboard](https://dashboard.render.com).
    *   Click **New +** -> **Web Service**.
    *   Select **Build and deploy from a Git repository**.
    *   Connect your `windy-weather-app` repository.

2.  **Configure Service Details**:
    *   **Name**: `windy-app`
    *   **Region**: Choose the one closest to you (e.g., Frankfurt, Oregon).
    *   **Branch**: `main`
    *   **Root Directory**: Leave blank (defaults to root).
    *   **Runtime**: **Docker** (Render will automatically detect the `Dockerfile` in your repo).
    *   **Instance Type**: **Free** (for hobby/testing).

3.  **Environment Variables**:
    *   You do **NOT** need to set `VITE_PB_URL` manually anymore. The Docker build process inherently knows to use the internal API.
    *   *Note: Your OpenWeatherMap API key is currently embedded in the code. For a production app, consider moving this to an Environment Variable in a future update.*

4.  **Add a Persistent Disk (CRITICAL)**:
    *   **Warning**: The Free tier on Render spins down after inactivity, and without a disk, your database (users, comments, favorites) will be **wiped** on every restart.
    *   To keep your data safe, you must add a Disk (Paid feature, ~$7/mo) or accept data loss on the Free tier.
    *   **If adding a Disk**:
        1.  Scroll down to **Disks**.
        2.  Click **Add Disk**.
        3.  **Name**: `pocketbase-data`
        4.  **Mount Path**: `/pb/pb_data`
        5.  **Size**: 1 GB.

5.  **Deploy**:
    *   Click **Create Web Service**.
    *   Render will start building your Docker image. This may take 3-5 minutes.
    *   Watch the logs. You should see "Building Frontend...", then "Setup PocketBase...", and finally "Server started at 0.0.0.0:8090".

---

## Part 3: Verify Deployment

Once the deployment is live, you will get a URL like `https://windy-app.onrender.com`.

1.  **Visit the URL**: 
    *   You should see your **React App** loading instantly.
    *   The map, weather data, and UI should work perfectly.

2.  **Test Backend Features**:
    *   Try **Creating an Account** (Sign Up).
    *   Try **Posting a Comment**.
    *   Try **Adding a Favorite**.
    *   If these work, your PocketBase backend is correctly integrated!

3.  **Access Admin Panel**:
    *   Go to `https://windy-app.onrender.com/_/`
    *   Create your **Admin Account** (first time only).
    *   You will see your collections (`users`, `comments`, `favorites`, `ratings`) already created thanks to the auto-migration!

---

## 🔧 Troubleshooting

*   **"Deploy Failed"**: Check the logs. Common errors include missing files or build script failures. Ensure `app/package.json` exists in your repo.
*   **"Database is Empty"**: If you restart the app and lose users/comments, it means you didn't add a **Persistent Disk**. This is expected behavior on the Free tier without a disk.
*   **"API Error"**: If the frontend can't talk to the backend, open the browser console (F12) and check the network tab. It should be making requests to `/api/...` on the same domain.

**Enjoy your deployed Windy App!** 🚀
