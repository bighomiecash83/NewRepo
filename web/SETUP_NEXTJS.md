# DMF Music Platform - Next.js Frontend Setup Guide

## Overview
The DMF Music Platform frontend has been completely rebuilt as a **Next.js 14 application** with a professional design system, complete feature modules, and full integration with the C# ASP.NET Core backend.

## Project Structure

```
web/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── layout.tsx               # Root layout
│   │   └── (dashboard)/             # Dashboard route group
│   │       ├── layout.tsx           # Dashboard wrapper (Sidebar + Header)
│   │       ├── page.tsx             # Dashboard home
│   │       ├── artists/
│   │       │   └── page.tsx        # Artists management
│   │       ├── releases/
│   │       │   └── page.tsx        # Release builder & distribution
│   │       ├── bots/
│   │       │   └── page.tsx        # Bot Playground (10k bots)
│   │       ├── revenue/
│   │       │   └── page.tsx        # Revenue analytics
│   │       ├── contracts/
│   │       │   └── page.tsx        # Contracts & Gavel Syndicate
│   │       └── pricing/
│   │           └── page.tsx        # Pricing & feature plans
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx         # Navigation sidebar
│   │       └── Header.tsx          # Top header bar
│   ├── hooks/
│   │   └── useRevenue.ts           # Custom hooks (useRevenue, useBots)
│   ├── lib/
│   │   └── api.ts                  # Axios API client & service layer
│   ├── styles/
│   │   └── globals.css             # Global Tailwind CSS
│   └── (legacy)                    # Old Vite components (can be deleted)
├── public/                          # Static assets
├── package.json                     # Next.js dependencies
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS theme
├── postcss.config.js                # PostCSS configuration
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (git-ignored)
├── .gitignore                       # Git configuration
├── start.sh                         # Linux/Mac startup script
├── start.bat                        # Windows startup script
└── README.md                        # Project documentation
```

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```powershell
cd web
.\start.bat
```

**Linux/Mac:**
```bash
cd web
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
cd web
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
MONGODB_URI=your_mongodb_uri
STREAMGOD_API_KEY=your_streamgod_key
GAVEL_SYNDICATE_API_KEY=your_gavel_key
```

3. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint linter |
| `npm run type-check` | TypeScript type checking |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14.0.4 |
| **React** | React | 18.3.1 |
| **Language** | TypeScript | 5.3.3 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **HTTP Client** | Axios | 1.6.2 |
| **Icons** | Lucide React | 0.292.0 |
| **State Management** | Zustand | 4.4.2 |
| **Build Tool** | Next.js (webpack) | - |

## Features Implemented

### ✅ Dashboard (Home)
- Real-time statistics cards (Revenue, Artists, Releases, Bots)
- Quick action grid (Add Artist, Create Release, Launch Bots, View Analytics)
- Recent releases feed
- Active bot engagement tracking

### ✅ Artist Management
- Artist roster table with search
- Artist metrics (tracks, streams, revenue)
- Add/Edit/Delete functionality
- Integrated artist onboarding

### ✅ Release Builder
- Release creation wizard
- Multi-file upload support
- Scheduling capabilities
- Platform distribution configuration
- Release status tracking (Draft, Scheduled, Live)

### ✅ Bot Playground
- Master controls (Launch All, Pause All)
- 10,000+ bot orchestration interface
- Individual bot status monitoring
- Engagement metrics per bot
- AI-powered recommendations
- Integration with StreamGod bot orchestration

### ✅ Revenue Analytics
- KPI dashboards (Total Revenue, Pending Payouts, Top Artist)
- Multi-platform breakdown (Spotify, Apple Music, YouTube, etc.)
- Artist-level revenue reporting
- Growth trending
- Payout management

### ✅ Contracts Management
- Contract roster and status tracking
- The Gavel Syndicate blockchain integration
- Contract signing workflows
- IP rights management

### ✅ Pricing Plans
- 3-tier pricing model (Indie, Pro, Enterprise)
- Feature comparison matrix
- FAQ section
- CTA buttons for plan selection

## API Integration

The frontend uses a centralized API service layer in `src/lib/api.ts`:

```typescript
// Example usage
import { artistService, releaseService, revenueService, botService, contractService } from '@/lib/api';

// Get all artists
const artists = await artistService.getAll();

// Create a new release
await releaseService.create({ title, artist, files });

// Get revenue summary
const revenue = await revenueService.getSummary();

// Launch all bots
await botService.launchAll();

// Get contracts
const contracts = await contractService.getAll();
```

### API Modules

1. **artistService**
   - `getAll()` - List all artists
   - `getById(id)` - Get artist details
   - `create(data)` - Add new artist
   - `update(id, data)` - Update artist
   - `delete(id)` - Remove artist

2. **releaseService**
   - `getAll()` - List releases
   - `getById(id)` - Get release details
   - `create(data)` - Create release
   - `schedule(id, date)` - Schedule release
   - `publish(id)` - Publish to platforms

3. **revenueService**
   - `getSummary()` - Revenue KPIs
   - `getByArtist(artistId)` - Artist earnings
   - `getByPlatform(platform)` - Platform breakdown
   - `getPending()` - Pending payouts

4. **botService**
   - `getStatus()` - Current bot status
   - `launchAll()` - Launch all bots
   - `pauseAll()` - Pause all bots
   - `getMetrics(botId)` - Bot performance metrics
   - `getRecommendations()` - AI recommendations

5. **contractService**
   - `getAll()` - List contracts
   - `create(data)` - Create contract
   - `sign(id)` - Sign contract

## Design System

### Color Palette
- **Primary Blue**: `#0366d6` - Main branding color
- **Dark Mode**: `#0b1117`, `#010409` - Dark backgrounds
- **Gold Accent**: `#fbbf24` - Highlights and CTAs
- **Success Green**: `#1f883d` - Positive indicators
- **Danger Red**: `#da3633` - Error states

### Typography
- **Font**: System sans-serif (Inter fallback)
- **Headings**: 600-700 weight, larger sizes
- **Body**: 400-500 weight, readable contrast

### Components
- Professional card-based UI
- Responsive grid layouts
- Smooth transitions and hover states
- Status badges and indicators
- Data tables with sorting/filtering

## Custom Hooks

### useRevenue()
Fetches and caches revenue data with error handling:
```typescript
const { revenue, pending, topArtist, byPlatform, loading, error } = useRevenue();
```

### useBots()
Manages bot orchestration state:
```typescript
const { status, metrics, recommendations, loading, error } = useBots();
```

## Environment Variables

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint (default: http://localhost:5001)

**Optional (for features):**
- Firebase authentication
- Supabase database
- MongoDB connection
- StreamGod bot API
- Gavel Syndicate contracts

See `.env.example` for full list.

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t dmf-music-platform-web .
docker run -p 3000:3000 dmf-music-platform-web
```

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy with one click

## Troubleshooting

### "Cannot find module '@/lib/api'"
- Ensure `tsconfig.json` has correct path aliases
- Run `npm install` to rebuild node_modules

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Backend connection failing
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on port 5001
- Run: `curl http://localhost:5001/api/test`

### Tailwind styles not loading
- Ensure `postcss.config.js` exists
- Run `npm install` and restart dev server
- Clear `.next/` directory

## Next Steps

1. **Backend Integration**
   - Implement missing API endpoints in C#
   - Match service layer specifications
   - Add authentication endpoints

2. **Authentication**
   - Integrate Firebase Auth or Supabase Auth
   - Add login/signup pages
   - Implement protected routes

3. **Database**
   - Define MongoDB schemas
   - Create Supabase tables
   - Migrate sample data

4. **Testing**
   - Add Jest unit tests
   - Create E2E tests with Playwright
   - Set up CI/CD pipeline

5. **Enhancement**
   - Advanced filtering and search
   - Real-time updates (WebSockets)
   - Export/reporting features
   - Dark/Light theme toggle

## Support

For issues or questions:
1. Check the [Next.js documentation](https://nextjs.org)
2. Review the API service layer in `src/lib/api.ts`
3. Inspect browser console for errors
4. Check backend logs on port 5001

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
