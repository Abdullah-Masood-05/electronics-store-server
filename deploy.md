# Backend Deployment Guide (Digital Ocean)

This guide covers deploying the ElectroStore backend to an Ubuntu 22.04 Droplet using Docker and Nginx.

## 1. Provision a Droplet
- Create a new Droplet on Digital Ocean using the **Ubuntu 22.04** image.
- Select a size (e.g., Basic, 1GB RAM) and add your SSH key.
- SSH into your server: `ssh root@<your-server-ip>`

## 2. Install Docker
Run the following commands to install Docker:
```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

## 3. Database Setup (MongoDB)
It is highly recommended to use **MongoDB Atlas** for a production database.
- Create a free tier cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Set network access to `0.0.0.0/0` (or specifically whitelist your Droplet IP).
- Get your connection string (e.g., `mongodb+srv://...`).

## 4. Clone and Configure
```bash
git clone <your-repo-url> electrostore
cd electrostore/electronics-store-server
```
Create an `.env` file:
```bash
nano .env
```
Paste your production environment variables:
```env
PORT=8000
MONGO_URI=mongodb+srv://bscs22054_db_user:AHCsCt3nFtOjImsD@electrostore.ko0ny0q.mongodb.net/electrostore?appName=ElectroStore
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGIN=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_live_...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 5. Build and Run Docker Container
Build the image:
```bash
docker build -t electrostore-api .
```
Run the container:
```bash
docker run -d -p 8000:8000 --name api --env-file .env --restart unless-stopped electrostore-api
```
Check logs:
```bash
docker logs -f api
```

## 6. Nginx Reverse Proxy
Install Nginx:
```bash
sudo apt install -y nginx
```
Configure a server block:
```bash
nano /etc/nginx/sites-available/electrostore
```
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/electrostore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL with Certbot
Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
Generate SSL Certificate:
```bash
sudo certbot --nginx -d api.yourdomain.com
```
Your backend is now fully deployed and secure!
