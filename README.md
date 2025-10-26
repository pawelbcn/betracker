# Delegation Expense Tracker

A modern Next.js application for tracking business travel expenses and daily allowances.

## 🚀 Features

- **Delegation Management** - Create and manage business trips
- **Expense Tracking** - Record expenses with automatic PLN conversion
- **Export Functionality** - Generate PDF and CSV reports
- **AI Assistant** - Smart expense categorization and insights
- **Modern UI** - Responsive design with Tailwind CSS
- **Database Integration** - SQLite for development, MySQL for production

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma ORM with SQLite/MySQL
- **AI:** OpenAI integration
- **Export:** jsPDF for PDF generation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MySQL database (for production)

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp env.local .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Production Deployment

```bash
# Build for production
./build-for-server.sh

# Upload deployment folder to your server
```

## 🗄️ Database

### Development
- Uses SQLite (`dev.db`)
- Auto-creates tables on first run

### Production
- MySQL database on shared hosting
- Connection: `sql11.lh.pl`
- Database: `brasserwis_exptracker`

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── delegations/       # Delegation pages
│   └── stats/             # Statistics page
├── components/            # React components
├── lib/                   # Utilities and configurations
├── prisma/                # Database schema
├── scripts/               # Database seeding scripts
└── public/                # Static assets
```

## 🔧 Environment Variables

Create `.env.local` for development:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🌐 Deployment

### Shared Hosting (Current Setup)

1. Run `./build-for-server.sh`
2. Upload `deployment/` folder to server
3. Access at `https://www.brasserwis.pl/tracker/`

### Server Requirements

- Node.js 18+
- MySQL database
- Apache/Nginx with mod_rewrite

## 📝 License

Private project for business use.

## 🎯 Version Control

This project uses Git for version control. The initial commit contains the clean, production-ready application.

```bash
git log --oneline
# Shows: Initial commit: Clean delegation expense tracker ready for server deployment
```

---

**Ready for server deployment to www.brasserwis.pl/tracker** 🚀
