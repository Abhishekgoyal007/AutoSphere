#  AutoSphere - Modern Car Dealership Platform

AutoSphere is a full-stack Next.js application for car dealerships, featuring AI-powered car recognition, test drive booking, and comprehensive admin management.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-18-blue)
![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

##  Features

###  User Features
- **Browse Cars** - Filter by make, model, body type, fuel type, transmission, and price range
- **AI Image Search** - Upload car photos to find similar vehicles using Google Gemini AI
- **Car Details** - Comprehensive vehicle information with image gallery
- **Test Drive Booking** - Schedule test drives with real-time availability
- **Save Favorites** - Wishlist cars for later viewing
- **Reservations Management** - Track upcoming and past test drives
- **Responsive Design** - Optimized for mobile, tablet, and desktop

###  Admin Features
- **Dashboard** - Real-time analytics and insights
- **Car Management** - Add, edit, delete, and feature cars
- **AI Auto-fill** - Automatically extract car details from images
- **Test Drive Management** - View, confirm, complete, or cancel bookings
- **User Management** - Promote/demote admin roles
- **Dealership Settings** - Configure working hours and contact info

##  Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide Icons** - Icon set
- **date-fns** - Date utilities

### Backend
- **Next.js Server Actions** - API endpoints
- **Prisma** - ORM for database access
- **PostgreSQL** - Database (via Supabase)
- **Supabase Auth** - Authentication & user management

### AI & Services
- **Google Gemini 2.0 Flash** - AI image analysis
- **Arcjet** - Rate limiting & security
- **Supabase Storage** - Image hosting
- **Vercel** - Deployment platform

##  Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database and auth)
- Google Gemini API key
- Arcjet API key

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/Abhishekgoyal007/AutoSphere.git
cd AutoSphere
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/database

ARCJET_KEY=your_key
GEMINI_API_KEY=your_key
```

**4. Set up the database**

```bash
npx prisma generate
npx prisma migrate deploy
```

**5. Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

##  Project Structure

```
autosphere/
 app/
    (auth)/           # Authentication
    (main)/           # Public pages
    (admin)/          # Admin portal
 actions/              # Server actions
 components/           # UI components
 lib/                  # Utilities
 prisma/               # Database schema
```

##  Security

- Supabase authentication
- Arcjet rate limiting
- Prisma ORM
- Environment variables
- Role-based access control

##  Scripts

```bash
npm run dev          # Development
npm run build        # Production build
npm run start        # Start server
npm run lint         # Lint code
```

Made by Abhishek Goyal