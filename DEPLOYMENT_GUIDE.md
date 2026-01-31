# Deployment Guide: React + PocketBase on Render

This guide will help you deploy your application ("Kimi_Agent_WindyClone") to **GitHub** and **Render**.

We will split the deployment into two parts:
1. **Backend**: PocketBase (Deployed as a Web Service)
2. **Frontend**: React App (Deployed as a Static Site)

---

## Part 1: Push to GitHub

First, we need to get your code onto GitHub.

1.  **Initialize Git** (if not already done):
    *   Open your terminal in VS Code (`Ctrl + ~`).
    *   Run:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        ```

2.  **Create a Repo on GitHub**:
    *   Go to [GitHub.com](https://github.com) and sign in.
    *   Click the **+** icon (top right) -> **New repository**.
    *   Name it `windy-weather-app` (or whatever you like).
    *   **Do not** check "Initialize with README" or .gitignore.
    *   Click **Create repository**.

3.  **Push Code**:
    *   Copy the commands under in the section **"…or push an existing repository from the command line"**. They will look like this:
        ```bash
        git remote add origin https://github.com/<YOUR_USERNAME>/windy-weather-app.git
        git branch -M main
        git push -u origin main
        ```
    *   Run those commands in your VS Code terminal.

---

## Part 2: Deploy PocketBase (Backend) on Render

1.  **Create a Render Account**:
    *   Go to [dashboard.render.com](https://dashboard.render.com/) and login with GitHub.

2.  **Create a New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Select **Build and deploy from a Git repository**.
    *   Find your repo (`windy-weather-app`) and click **Connect**.

3.  **Configure the Service**:
    *   **Name**: `windy-backend` (example)
    *   **Runtime**: **Docker** (This is important, it should pick this up automatically because I added a `Dockerfile`).
    *   **Region**: Choose the one closest to you (e.g., Frankfurt, Oregon).
    *   **Instance Type**: **Free** (for hobby/testing).

4.  **Add a Persistent Disk (CRITICAL)**:
    *   *Note: Persistent disks are a paid feature on Render (approx $7/month). The Free tier does NOT persist data. If you restart a Free tier Web Service, your database is wiped.*
    *   **If you want to stay strictly Free**: You typically cannot use PocketBase on Render *persistently*. You would need to use a hosted database or accept that data is lost on restart.
    *   **To Add a Disk** (Recommended for real apps):
        *   Scroll down to **Disks**.
        *   Click **Add Disk**.
        *   **Name**: `pocketbase-data`
        *   **Mount Path**: `/pb/pb_data`
        *   **Size**: 1 GB is enough to start.

5.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for the build to finish. Once done, you will get a URL like `https://windy-backend.onrender.com`.
    *   **Copy this URL**.

---

## Part 3: Deploy React (Frontend) on Render

1.  **Create a New Static Site**:
    *   On the Render Dashboard, click **New +** -> **Static Site**.
    *   Connect the **Same Repository** (`windy-weather-app`).

2.  **Configure Build Settings**:
    *   **Name**: `windy-frontend`
    *   **Branch**: `main`
    *   **Root Directory**: `app` (IMPORTANT: Your frontend code is inside the `app` folder).
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`

3.  **Environment Variables**:
    *   Scroll down to **Environment Variables**.
    *   Click **Add Environment Variable**.
    *   **Key**: `VITE_PB_URL`
    *   **Value**: `https://windy-backend.onrender.com` (Paste the backend URL you copied in Part 2).

4.  **Deploy**:
    *   Click **Create Static Site**.
    *   Render will build your React app.
    *   Once finished, you will get a URL like `https://windy-frontend.onrender.com`.

---

## Part 4: Sync Your Data (Schema)

Your production database is empty. You need to copy your local structure (schema) to production.

1.  **Export Local Schema**:
    *   Start your local app (`npm run dev` and standard pocketbase serve).
    *   Go to Local Admin: `http://127.0.0.1:8090/_/`
    *   Go to **Settings** -> **Export collections**.
    *   Copy the JSON.

2.  **Import to Production**:
    *   Go to Production Admin: `https://windy-backend.onrender.com/_/`
    *   Create your first Admin account.
    *   Go to **Settings** -> **Import collections**.
    *   Paste the JSON and click **Import**.

3.  **Done!** visit your Frontend URL.
