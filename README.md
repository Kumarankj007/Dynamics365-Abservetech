# Dynamics 365 Admin Dashboard

A modern administration and management dashboard using [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/). This platform provides administrators and instructors with a powerful suite of tools to manage e-commerce, user roles, course publishing, financials, and application settings.

---

## 🚀 Key Features

*   **Next.js App Router Architecture:** Utilizes the latest Next.js features, including Server Components, Server Actions, and organized routing structures.
*   **Comprehensive E-commerce Management:**
    *   Manage products, view detailed customer and order lists, and handle invoice generation and tracking (`/ecommerce`).
    *   Monitor transaction histories and seller performance metrics.
*   **Course & Curriculum Publishing:**
    *   Full suite for creating, editing, and managing courses (`/courses`, `/manage-courses`).
    *   Tools for structuring curriculums, uploading lecture attachments, and integrating video players.
    *   Review management system for student feedback.
*   **Financial & Payout Workflows:**
    *   Track commissions, configure global default rates, and manage instructor payout requests (`/commissions`, `/payout-requests`).
    *   Detailed transaction tables and filtering tools.
*   **Role-Based Access Control (RBAC):**
    *   Manage administrative accounts, define roles, and assign specific permissions (`/admin`, `/adminrole`).
*   **Interactive Dashboards:**
    *   Specialized dashboards for Analytics, Banking, CRM, and E-commerce, featuring interactive charts (ApexCharts), data tables, and recent activity feeds (`/dashboard`).
*   **Extensive UI Component Library:**
    *   A rich collection of customizable UI components including accordions, alert dialogs, avatars, carousels, forms (with React Hook Form and Zod validation), tables, and more (`/components`).
*   **Internationalization (i18n):**
    *   Support for multiple languages using `next-intl`, with Arabic (`ar`) and English (`en`) configurations available out-of-the-box.
*   **Advanced Features:**
    *   Interactive maps utilizing Leaflet (`/maps`).
    *   Customizable application settings (AWS, Google, SMTP, Payments).
    *   Kanban boards and Todo applications for task management (`/app/kanban`, `/app/todo`).

---

## 🛠️ Technologies & Stack

*   **Framework:** Next.js (App Router)
*   **UI Library:** React
*   **Styling:** Tailwind CSS (configured via `postcss.config.mjs`)
*   **Language:** TypeScript
*   **State Management:** Zustand (e.g., `useCourseTabsStore.ts`, `userProfileStore.ts`)
*   **Data Fetching & Caching:** TanStack React Query (`query-client.provider.tsx`, `useReactQuery.ts`)
*   **Forms & Validation:** React Hook Form + Zod
*   **Authentication:** NextAuth.js (`app/api/auth/[...nextauth]`)
*   **Tables:** TanStack React Table (`/table/react-table`)
*   **Internationalization:** `next-intl`
*   **Charts:** ApexCharts (`appex-chart-options.ts`)

---

## 📂 Project Structure

```text
dynamics365-dynamic365-admin/
├── action/                     # Server Actions for app workflows and authentication
├── app/
│   ├── [locale]/               # Internationalized route groups
│   │   ├── (protected)/        # Authenticated administrative routes
│   │   │   ├── (course)/       # Course creation, management, and reviews
│   │   │   ├── admin/          # Admin account management
│   │   │   ├── adminrole/      # Role and permission management
│   │   │   ├── app/            # Productivity tools (Calendar, Chat, Email, Kanban, Todo)
│   │   │   ├── catalog-config/ # System taxonomy and configuration
│   │   │   ├── commissions/    # Financial tracking and defaults
│   │   │   ├── components/     # UI component showcases and examples
│   │   │   ├── dashboard/      # Specialized dashboard views (Analytics, Banking, CRM, E-com)
│   │   │   ├── ecommerce/      # E-commerce management (Orders, Products, Invoices)
│   │   │   ├── forms/          # Form component examples and validation
│   │   │   ├── maps/           # Interactive Leaflet map components
│   │   │   ├── payout-requests/# Instructor payout approval workflows
│   │   │   ├── settings/       # Application configuration (AWS, Google, SMTP)
│   │   │   ├── students/       # Student management
│   │   │   └── table/          # Basic and React Table examples
│   │   ├── auth/               # Authentication views (Login, Register, Forgot Password)
│   │   └── api/                # Next.js API Routes (Auth, Chat, Email, User)
│   └── constants/              # Global constants (e.g., country codes)
├── components/                 # Reusable UI primitives and layout components
├── config/                     # Site configuration files
├── hooks/                      # Custom React hooks (Queries, Mutations, UI state)
├── i18n/                       # Internationalization setup and routing
├── lib/                        # Utility functions, configuration, and shared logic
├── messages/                   # Translation files (ar.json, en.json)
├── providers/                  # Context providers (Theme, QueryClient, Auth)
├── public/                     # Static assets (images, icons, svgs)
├── middleware.ts               # Next.js middleware for auth and i18n
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies and scripts
└── postcss.config.mjs          # PostCSS configuration
