<div align="center">
  <img src="public/logo.png" alt="AD4K Logo" width="120" height="120" />
  
  # AD4K - Attention Done 4 You
  
  **An ADHD-friendly productivity web application designed to help you stay focused, organized, and motivated.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.15-2D3748)](https://www.prisma.io/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)](https://tailwindcss.com/)
</div>

---

## 🌟 Overview

AD4K is a comprehensive productivity application specifically designed for people with ADHD. It combines task management, time tracking, AI assistance, and gamification to help users break down overwhelming tasks into manageable steps, stay focused, and celebrate every achievement.

### Key Features

- 🎯 **Smart Task Management** - Break down big tasks into mini-tasks with AI-powered task breakdown
- ⏱️ **Pomodoro Timer** - Customizable focus sessions with break reminders
- 🤖 **AI Assistant (Pom)** - Your friendly ADHD productivity companion with 8 customizable personalities
- 📝 **Notes & Journaling** - Quick capture and organize your thoughts
- 🍽️ **Food & Recipes** - Discover recipes with AI-powered recommendations
- 💡 **Daily Advice** - Get motivational advice to start your day
- 📊 **Productivity Dashboard** - Track your progress with XP, levels, streaks, and badges
- 🎨 **ADHD-Friendly Design** - Clean, colorful interface with visual rewards

---

## 🚀 Features in Detail

### Task Management
- Create tasks with color coding and tags
- AI-powered task breakdown into 5-15 minute micro-steps
- Visual progress tracking with subtask completion
- Drag-and-drop task reordering
- Due dates and priority levels

### AI Assistant - Pom
Meet **Pom** (short for Pomegranate), your ADHD-friendly AI companion available 24/7:
- **8 Personality Modes**: Choose how Pom communicates with you
  - Strict & Structured
  - Warm Accountability
  - Hyper-Focused
  - Minimalist Robot
  - Flexible Problem-Solver
  - Calm Monk
  - Compassionate but Firm
  - Chaos Wrangler
- Navigate the app using natural language
- Get personalized task breakdowns
- Receive encouragement and motivation

### Food & Recipes
- Search recipes from TheMealDB API
- AI-powered recipe recommendations based on your preferences
- Detailed recipe cards with ingredients and instructions
- Save your favorite recipes

### Daily Advice
- Get daily motivational advice from Advice Slip API
- Refresh to get new advice anytime
- Beautiful, centered display for easy reading

### Gamification
- Earn XP for completing tasks
- Level up as you progress
- Maintain daily streaks
- Unlock achievement badges
- Visual progress tracking

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI**: [Groq API](https://groq.com/) (Fast LLM inference)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key (for AI features) - [Get one here](https://console.groq.com/)
- Google OAuth credentials (optional, for social login) - [Setup guide](https://console.cloud.google.com/)

---

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dizay1957/AD4K.git
   cd AD4K
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Groq (for AI features)
   GROQ_API_KEY="your-groq-api-key"
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
AD4K/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── advice/        # Advice Slip API integration
│   │   ├── ai/            # AI endpoints (chat, task breakdown)
│   │   ├── auth/          # Authentication routes
│   │   ├── food/          # Food & recipes API
│   │   ├── notes/         # Notes CRUD
│   │   ├── profile/       # User profile management
│   │   └── tasks/         # Tasks CRUD
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── food/              # Food & recipes page
│   ├── notes/             # Notes page
│   ├── settings/          # Settings page
│   ├── sounds/            # Ambient sounds page
│   ├── tasks/             # Tasks page
│   └── timer/             # Pomodoro timer page
├── components/            # React components
│   ├── ai/                # AI components (FloatingAIChat, etc.)
│   ├── dashboard/         # Dashboard components
│   ├── food/              # Food-related components
│   ├── layout/            # Layout components (Navbar, Layout)
│   ├── notes/             # Notes components
│   ├── settings/          # Settings components
│   ├── tasks/             # Task components
│   ├── timer/             # Timer components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
├── public/                # Static assets
│   ├── logo.png           # App logo
│   ├── pome.png           # Pom AI assistant icon
│   └── personalities/     # Personality icons
└── types/                 # TypeScript type definitions
```

---

## 🎮 Usage

### Getting Started

1. **Sign Up**: Create a new account or sign in with Google/GitHub
2. **Dashboard**: View your productivity stats and daily advice
3. **Tasks**: Create tasks and use AI to break them down into smaller steps
4. **Timer**: Start a Pomodoro session to stay focused
5. **Notes**: Capture your thoughts quickly
6. **Food**: Discover recipes based on your preferences
7. **Settings**: Customize Pom's personality and app preferences

### Using Pom (AI Assistant)

- Click the floating Pom icon in the bottom right corner
- Chat with Pom to:
  - Get help breaking down tasks
  - Navigate to different sections ("take me to tasks")
  - Get motivation and encouragement
  - Ask questions about productivity

### Task Breakdown

1. Create a new task
2. Click "Use AI Breakdown" to automatically generate micro-steps
3. Review and adjust the generated steps
4. Start working through each step
5. Check off completed steps to track progress

---

## 🔐 Authentication

AD4K supports multiple authentication methods:

- **Email/Password**: Traditional sign up and sign in
- **Google OAuth**: Sign in with your Google account
- **GitHub OAuth**: Sign in with your GitHub account

### Setting up OAuth

See the authentication setup in the codebase for detailed instructions on configuring OAuth providers.

---

## 🎨 Customization

### Pom's Personality

Choose from 8 different personality modes for Pom:
- Each personality has a unique communication style
- Settings are saved automatically
- Change anytime from the Settings page

### App Preferences

- Language preferences
- Timer settings (focus/break duration)
- Notification preferences
- Accessibility options (dyslexia font, large UI, high contrast)

---

## 📊 Database

The application uses SQLite with Prisma ORM. The database schema includes:

- **Users**: User accounts and authentication
- **Tasks**: Tasks with subtasks, tags, and metadata
- **Notes**: User notes with color coding
- **UserPreferences**: User settings and preferences
- **UserProgress**: XP, levels, streaks, and badges
- **Accounts & Sessions**: OAuth account linking and sessions

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:
- `DATABASE_URL` (use a production database like PostgreSQL)
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GROQ_API_KEY`
- OAuth credentials (if using social login)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Advice Slip API](https://api.adviceslip.com/) - For daily advice
- [TheMealDB API](https://www.themealdb.com/) - For recipe data
- [Groq](https://groq.com/) - For fast AI inference
- [Next.js](https://nextjs.org/) - For the amazing framework
- [Prisma](https://www.prisma.io/) - For the database toolkit

---

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

<div align="center">
  <p>Made with ❤️ for the ADHD community</p>
  <p>© 2025 AD4K - Attention Done 4 You</p>
</div>
