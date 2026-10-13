# Dynamics 365 Course Marketplace Backend

A scalable, microservices-based backend architecture powering the Dynamics 365 e-learning marketplace. Built with the NestJS framework, this system handles course provisioning, user enrollment, multi-gateway payments, instructor payouts, and administrative approval workflows.

---

## 🏛️ System Architecture (Microservices)

The backend operates as a NestJS monorepo, divided into a central API Gateway and dedicated business-logic microservices:

*   **API Gateway (`api-gateway/`)**: The central entry point that routes incoming client requests to the appropriate underlying microservices.
*   **Auth Service (`apps/auth-service/`)**: Manages authentication and session security with distinct controllers for administrative (`admin`) workflows and standard `users`.
*   **Admin Service (`apps/admin-service/`)**: Handles platform governance, including taxonomy (`category`, `subcategory`, `Tag`), course configuration (`coursetype`, `durationband`), financials (`tax`, `commission`), and administrative dashboards. It also manages the `approvalQueue` for instructor payouts and course publishing.
*   **User Service (`apps/user-service/`)**: Powers the student and instructor experience, handling `courses` discovery, `enrollment` processing, `payout` management, and user `transactions`.

---

## ⚙️ Core Features & Shared Libraries

The project utilizes a shared `libs/` directory for core business logic and infrastructure utilities used across all microservices:

*   **Payment Gateways**: Multi-provider payment orchestration utilizing `stripe.service.ts`, `paypal.service.ts`, and `razorpay.service.ts`.
*   **Role-Based Access Control (RBAC)**: Centralized security in `libs/access/` featuring `jwt.strategy.ts`, custom decorators (`roles.decorator.ts`), and role-based route guards (`jwt-auth.guard.ts`, `roles.guard.ts`).
*   **File Upload Infrastructure**: Dual-strategy media management supporting both local disk storage (`local/uploads.service.ts`) and Amazon S3 (`aws/aws-uploads.service.ts`).
*   **Database Management**: A unified `libs/database/` module housing shared entities such as `course.entity.ts`, `enrollments.entity.ts`, `payout.entity.ts`, `transactions.entity.ts`, and `approval-queue.entity.ts`.
*   **Common Utilities**: Built-in helpers for pagination (`querybuilder.service.ts`), data exports (`export.util.ts`), commission calculations (`commission.helper.ts`), and email dispatch (`mailer.helper.ts`).

---

## 🛠️ Tech Stack

*   **Framework**: NestJS (Monorepo/Microservices Architecture)
*   **Language**: TypeScript (`tsconfig.json`, `tsconfig.build.json`)
*   **Database ORM**: TypeORM (Utilizing standard `.entity.ts` models)
*   **Payments**: Stripe, PayPal, Razorpay APIs
*   **Authentication**: JWT (JSON Web Tokens) with Passport strategies
*   **Process Management**: PM2 (`ecosystem.config.js`)

---

## 📂 Project Structure

```text
dynamics365-backend/
├── api-gateway/                      # Main request router and aggregator
├── apps/                             # Independent Microservices
│   ├── admin-service/                # Platform administration, approvals, & configuration
│   ├── auth-service/                 # User and Admin authentication workflows
│   └── user-service/                 # Course consumption, enrollments, and student dashboards
├── libs/                             # Shared Monorepo Libraries
│   ├── access/                       # JWT Strategies, Enums, and Role Guards
│   ├── common/                       # Payments, Pagination, Uploads, and Mailer utilities
│   └── database/                     # Shared Data Entities (Courses, Users, Payouts, etc.)
├── uploads/                          # Local storage directory for media assets
├── ecosystem.config.js               # PM2 cluster and deployment configuration
├── nest-cli.json                     # NestJS CLI workspace configuration
├── package.json                      # Project dependencies and script definitions
└── .env                              # Environment variable configuration
