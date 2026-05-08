# Backend Deployment Guide (Render)

This guide covers deploying the ElectroStore backend to **Render**, utilizing its native Docker support for robust and easy deployment.

## 1. Push to GitHub
Ensure all your local changes are committed and pushed to your server repository.
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```
*Your Server Repository:* `https://github.com/Abdullah-Masood-05/electronics-store-server.git`

## 2. Prepare Environment Variables
Before deploying, have your `.env` variables ready. You will need to paste these into Render. 
**Crucial Note:** Ensure `MONGO_URI` is your MongoDB Atlas connection string, not `localhost`.

## 3. Deploy to Render
1. Log in to [Render](https://render.com) (you can sign in with GitHub).
2. Click **New +** > **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Connect your GitHub account (if not already done) and search for your server repository: `electronics-store-server`. Click **Connect**.
5. **Configuration Settings:**
   - **Name:** `electrostore-api` (or any name you prefer)
   - **Region:** Choose the one closest to your users.
   - **Branch:** `main`
   - **Root Directory:** Leave blank (since the Dockerfile is in the root of the repo).
   - **Environment:** Select **Docker**. (Render will automatically detect your `Dockerfile`).
   - **Instance Type:** Free tier is fine to start.

6. **Environment Variables:**
   Scroll down to "Environment Variables" and click **Add from .env**. Paste the contents of your local `.env` file.
   *Important overrides:*
   - Ensure `PORT` is omitted or set to the default (Render handles ports automatically, but setting `PORT=8000` is fine as our code reads it).
   - Set `ALLOWED_ORIGIN` to your future Netlify frontend URL (e.g., `https://your-app-name.netlify.app`). If you don't know it yet, you can use `*` temporarily, but change it later for security.

7. Click **Create Web Service**.

## 4. Finalize
Render will now build your Docker container and deploy it. This might take 3-5 minutes.
Once the status says **Live**, you will see a URL at the top left, looking something like `https://electrostore-api.onrender.com`.

**Test the deployment:**
Go to `https://electrostore-api.onrender.com/api/health` in your browser. If you see `{"status":"OK","message":"API running"}`, your server is officially live!

*Save this URL — you will need it for the frontend's `NEXT_PUBLIC_API_URL` environment variable.*
