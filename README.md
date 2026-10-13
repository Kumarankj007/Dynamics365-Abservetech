# Dynamics 365 Course Marketplace Frontend

## Overview
This is the frontend application for a comprehensive e-learning marketplace designed for buying, selling, and managing courses focused on **Microsoft Dynamics 365** and **Enterprise AI**. The platform provides a streamlined storefront for learners to purchase educational content and a management interface for course instructors and administrators.

## Core Features
* **Course Marketplace:** Browse, filter, and securely purchase training courses related to enterprise business applications.
* **Dynamics 365 Specializations:** Dedicated learning tracks and assets featuring high-quality content for:
  * Dynamics 365 Sales
  * Dynamics 365 Finance & Operations (F&O)
  * Dynamics 365 Customer Service
  * Microsoft Dataverse
* **AI-Enhanced Learning Experience:** Incorporates immersive visual assets for AI mentors, circuit teachers, whiteboard instructors, and virtual coaches to visually guide students through the curriculum.
* **Admin & Instructor Portal:** Interfaces mapped by static assets (`admin.png`, `admin.jpg`) for administrators to manage curriculum, track sales, and oversee student enrollments.
* **Custom Error Handling:** Branded fallback screens utilizing custom graphics (`Page-not-found.svg`, `errorImage.webp`) for improved user experience during navigation errors.

## Tech Stack
* **Framework:** Next.js (configured via `next.config.ts`)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (configured via `postcss.config.mjs`)
* **Linting:** ESLint (`eslint.config.mjs`)
* **Package Manager:** npm (`package-lock.json`, `package.json`)

# Project Structure

Below is the recommended and organized directory structure for the **Dynamics 365 Course Marketplace Frontend**, following modern Next.js (App Router) best practices combined with the configuration and asset files provided in the repository.

```text
dynamics365-dynamic365-frontend/
│
├── public/                         # Publicly accessible static assets
│   └── assets/                     # Application images and icons
│       ├── ai-*.jpeg               # AI mentor/coach visual assets (e.g., ai-agent-circuit.jpeg)
│       ├── dynamics-*.jpeg         # D365 module icons (Sales, CS, F&O, Dataverse)
│       ├── hero-bg-*.jpg           # Hero background banners
│       ├── admin.png / admin.jpg   # Admin dashboard placeholder graphics
│       ├── Page-not-found.svg      # Custom 404 vector graphic
│       └── errorImage.webp         # Fallback error image
│
├── src/                            # Main application source code
│   ├── app/                        # Next.js App Router directory
│   │   ├── (auth)/                 # Route group for authentication
│   │   │   ├── login/page.tsx      # Student and Instructor login
│   │   │   └── register/page.tsx   # Account creation
│   │   │
│   │   ├── (storefront)/           # Route group for the public marketplace
│   │   │   ├── courses/            # Course catalog and filtering
│   │   │   ├── checkout/           # Shopping cart and payment flow
│   │   │   └── page.tsx            # Main landing page / Home
│   │   │
│   │   ├── (learning)/             # Route group for student dashboard
│   │   │   ├── dashboard/          # Student enrolled courses overview
│   │   │   └── lesson/[id]/        # Video player and AI mentor interface
│   │   │
│   │   ├── admin/                  # Administrative and Instructor portal
│   │   │   ├── analytics/          # Sales and enrollment tracking
│   │   │   └── courses/            # Course creation and publishing
│   │   │
│   │   ├── api/                    # Next.js API Route Handlers (Backend BFF)
│   │   ├── layout.tsx              # Root HTML layout and global providers
│   │   ├── not-found.tsx           # Global 404 page utilizing Page-not-found.svg
│   │   └── globals.css             # Global Tailwind CSS imports
│   │
│   ├── components/                 # Reusable React components
│   │   ├── ui/                     # Generic UI elements (Buttons, Inputs, Modals)
│   │   ├── course/                 # Course cards, curriculum lists, video players
│   │   ├── layout/                 # Navbar, Footer, Sidebar
│   │   └── ai/                     # AI assistant chat interfaces and coach modals
│   │
│   ├── lib/                        # Utility functions and shared logic
│   │   ├── utils.ts                # Tailwind class mergers and formatters
│   │   └── api.ts                  # Axios/Fetch wrappers for backend communication
│   │
│   ├── hooks/                      # Custom React hooks (e.g., useCart, useAuth)
│   │
│   └── types/                      # Global TypeScript definitions and interfaces
│       └── index.d.ts              # Interface models (Course, User, Order)
│
├── .gitignore                      # Git ignored files and directories
├── eslint.config.mjs               # ESLint code quality rules
├── next.config.ts                  # Next.js compiler and build settings
├── package.json                    # Project dependencies and npm scripts
├── package-lock.json               # Deterministic dependency tree
├── postcss.config.mjs              # PostCSS configuration for Tailwind
└── README.md                       # Project documentation
```

## Installation

1. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

   Using pnpm:

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Copy the example environment file and update it with your own values:

   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#environment-variables) for the required keys.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root. The following variables are typically required:

```env
# Public API endpoint for fetching properties and templates
NEXT_PUBLIC_API_URL=

# Node environment
NODE_ENV=development
```

> ⚠️ **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never store sensitive secrets in them.