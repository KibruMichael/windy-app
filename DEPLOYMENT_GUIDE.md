# 🚀 Windy App Deployment Guide (Render)

This guide details how to deploy your Windy Clone application to Render using Docker. This setup includes both the **Frontend (React)** and **Backend (PocketBase)** in a single container for simplicity and cost-effectiveness.

## 📋 Prerequisites
- A [Render](https://render.com) account.
- This GitHub repository connected to your Render account.

## 1. Create a Web Service on Render

### Step 1: New Web Service
1.  Go to your Render Dashboard.
2.  Click **New +** -> **Web Service**.
3.  Select **Build and deploy from a Git repository**.
4.  Connect your repository (`windy-app`).

### Step 2: Configuration
Configure the service as follows:

- **Name**: `windy-app` (or your choice)
- **Region**: Closest to you (e.g., Frankfurt, Ohio)
- **Runtime**: **Docker** (Crucial!)
- **Instance Type**: Free (or Starter for persistence features)

### Step 3: Environment Variables
Add the following Environment Variables to automatically create your Superuser account on deployment:

| Key | Value | Description |
|-----|-------|-------------|
| `PB_ADMIN_EMAIL` | `your-email@example.com` | Email for Admin Login |
| `PB_ADMIN_PASSWORD` | `your-secure-password` | Password for Admin Login |
| `PORT` | `8090` | (Optional, defaults to 8090) |

### Step 4: Persistent Disk (Highly Recommended)
To prevent data loss on restarts (Render Free tier restarts frequently), add a **Disk**:
- **Name**: `pb_data`
- **Mount Path**: `/pb/pb_data`
- **Size**: 1GB (sufficient for start)

### Step 5: Deploy
Click **Create Web Service**. Render will start building your Docker image. This may take 3-5 minutes.

## 2. Post-Deployment Setup (One-Time)

Once the deployment is live (green checkmark), you need to initialize the database schema.

### Option A: Import Schema via UI (Easiest)
1.  Open your deployed Admin Dashboard:
    `https://your-app-name.onrender.com/_/`
2.  Log in with the credentials you set in the Environment Variables.
3.  Go to **Settings > Import collections**.
4.  Copy the content of `pb_migrations/pocketbase_collections_import.json` from your local repo.
5.  Paste it into the import box and click **Import**.

### Option B: Verification
1.  Go to your live app URL (`https://your-app-name.onrender.com`).
2.  Sign up a new user.
3.  Post a comment or save a favorite.
4.  Check the Admin Dashboard to see the new records.

## 🔄 Updating the App
To deploy new changes (frontend or backend code):
1.  Push your changes to GitHub (`git push`).
2.  Render will automatically detect the push and start a new deployment.
    - If you modified `pb_migrations`, re-import the schema via the UI if necessary (PocketBase usually handles additive changes, but major schema changes might require manual intervention).

## �️ Troubleshooting

### "Dao is not defined" Error
If you see migration errors in the logs, ensure you are using the modern PocketBase v0.23+ migration format (using `app` instead of `Dao`). This repository is already patched for this.

### Data Disappears on Restart?
Ensure you attached a **Persistent Disk** on Render mounting to `/pb/pb_data`. Without this, the SQLite database is ephemeral and lost on every deployment.
