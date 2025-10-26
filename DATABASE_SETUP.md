# 🗄️ Database Setup Guide

## For Vercel Deployment

Since Vercel doesn't support SQLite databases in production, you have several options for your database:

### Option 1: Vercel Postgres (Recommended - Free Tier Available)

1. **Add Vercel Postgres to your project:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to "Storage" tab
   - Click "Create Database" → "Postgres"
   - Choose the free tier

2. **Update your environment variables:**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add: `DATABASE_URL` with the connection string from Vercel Postgres

3. **Update Prisma schema:**
   ```bash
   # Change provider in prisma/schema.prisma from "sqlite" to "postgresql"
   ```

### Option 2: PlanetScale (MySQL - Free Tier Available)

1. **Create PlanetScale account:**
   - Go to [planetscale.com](https://planetscale.com)
   - Create free account
   - Create new database

2. **Get connection string:**
   - Copy the connection string from PlanetScale dashboard

3. **Add to Vercel environment variables:**
   - Add: `DATABASE_URL` with your PlanetScale connection string

4. **Update Prisma schema:**
   ```bash
   # Change provider in prisma/schema.prisma from "sqlite" to "mysql"
   ```

### Option 3: Railway (PostgreSQL - Free Tier Available)

1. **Create Railway account:**
   - Go to [railway.app](https://railway.app)
   - Create free account
   - Create new PostgreSQL database

2. **Get connection string:**
   - Copy the connection string from Railway dashboard

3. **Add to Vercel environment variables:**
   - Add: `DATABASE_URL` with your Railway connection string

## Database Migration Steps

After setting up your database:

1. **Update Prisma schema:**
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql" // or "mysql" for PlanetScale
     url      = env("DATABASE_URL")
   }
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Run database migrations:**
   ```bash
   npx prisma db push
   ```

4. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

## Environment Variables for Vercel

Add these to your Vercel project settings:

- `DATABASE_URL` - Your database connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with: `openssl rand -base64 32`)
- `OPENAI_API_KEY` - Your OpenAI API key (optional, for AI features)

## Local Development

For local development, you can continue using SQLite:

1. **Create local environment file:**
   ```bash
   # .env.local
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="local-development-secret"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

2. **Use local SQLite:**
   ```bash
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

## Recommended Setup

**For production:** Use Vercel Postgres (free tier)
**For development:** Use local SQLite

This gives you the best of both worlds - free production hosting with a proper database, and fast local development.
