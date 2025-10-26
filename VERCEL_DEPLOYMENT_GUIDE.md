# 🚀 Vercel Deployment Guide

Deploy your Delegation Expense Tracker to Vercel for free!

## 📋 Prerequisites

- GitHub repository: [https://github.com/pawelbcn/betracker](https://github.com/pawelbcn/betracker)
- Vercel account (free)
- Database (PlanetScale, Supabase, or Vercel Postgres)

## 🎯 Quick Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your repository: `pawelbcn/betracker`
5. Vercel will auto-detect it's a Next.js project

### 2. Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables:

```env
DATABASE_URL=your_database_connection_string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 3. Database Options

#### Option A: Vercel Postgres (Recommended)
- Free tier: 1 database, 1GB storage
- Built-in integration with Vercel
- Automatic connection string

#### Option B: PlanetScale (MySQL)
- Free tier: 1 database, 1GB storage
- MySQL compatible
- Great for existing MySQL schemas

#### Option C: Supabase (PostgreSQL)
- Free tier: 2 databases, 500MB each
- Full PostgreSQL features
- Built-in auth and real-time features

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Your app will be live at: `https://your-app-name.vercel.app`

## 🔧 Configuration Files

### vercel.json
- Framework detection
- Environment variable mapping
- Function timeout settings

### next.config.vercel.js
- Vercel-specific optimizations
- Image domain configuration
- Environment variable handling

## 📊 Vercel Free Tier Limits

✅ **What's Included:**
- Unlimited personal projects
- 100GB bandwidth per month
- 6,000 build minutes per month
- Automatic HTTPS
- Global CDN
- Custom domains (1 free)

⚠️ **Limitations:**
- 12 serverless function executions per day
- 1GB storage for databases
- No team collaboration on free tier

## 🗄️ Database Setup

### For Vercel Postgres:
1. In Vercel dashboard → Storage → Create Database
2. Copy the connection string
3. Add to environment variables as `DATABASE_URL`

### For PlanetScale:
1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string
4. Add to Vercel environment variables

## 🚀 Deployment Commands

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from local (optional)
vercel

# Or just push to GitHub - Vercel auto-deploys!
git push origin main
```

## 🔄 Auto-Deployment

Once connected:
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests
- Instant rollbacks if needed

## 📱 Your App Will Be Available At:

`https://your-app-name.vercel.app`

## 🎉 Benefits of Vercel

✅ **Free hosting** - No cost for personal projects
✅ **Automatic deployments** - Push to GitHub = deploy
✅ **Global CDN** - Fast worldwide
✅ **HTTPS included** - Secure by default
✅ **Custom domains** - Use your own domain
✅ **Analytics** - Built-in performance monitoring
✅ **Preview deployments** - Test before going live

## 🆘 Troubleshooting

### Build Errors:
- Check environment variables are set
- Ensure all dependencies are in package.json
- Check Next.js version compatibility

### Database Connection:
- Verify DATABASE_URL is correct
- Check database is accessible from Vercel
- Ensure Prisma schema is compatible

### API Routes:
- Check function timeout settings
- Verify environment variables in API routes
- Check CORS settings if needed

---

**Ready to deploy to Vercel! Your delegation expense tracker will be live in minutes.** 🚀
