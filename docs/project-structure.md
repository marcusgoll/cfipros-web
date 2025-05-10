---

# CFIPros Project Structure

This document outlines the recommended directory and file structure for the CFIPros project. This structure is designed to promote clarity, maintainability, and ease of navigation, following Next.js best practices with the App Router.

```plaintext
cfipros/
├── .github/                    # GitHub specific files (e.g., CI/CD workflows)
│   └── workflows/
│       └── main.yml            # Example: Vercel deployment workflow
├── .husky/                     # Pre-commit hooks (e.g., for linting, formatting)
├── .vscode/                    # VSCode specific settings (optional)
│   └── settings.json
├── docs/                       # Project documentation (PRD, Architecture, Epics, etc.)
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── project-structure.md    # This file
│   ├── data-models.md
│   ├── api-reference.md
│   ├── environment-vars.md
│   ├── coding-standards.md
│   ├── testing-strategy.md
│   ├── ui-ux-spec.md
│   ├── prd.md
│   ├── project-brief.md
│   └── epics/
│       ├── epic1.md
│       └── ...
├── public/                     # Static assets (images, fonts, favicon.ico, etc.)
├── src/                        # Main application source code
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group for authentication pages (layout, loading)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup-student/
│   │   │   │   └── page.tsx
│   │   │   ├── signup-cfi/
│   │   │   │   └── page.tsx
│   │   │   ├── signup-school/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (app)/              # Route group for authenticated app pages
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── knowledge-tests/
│   │   │   │   ├── upload/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── [testId]/
│   │   │   │   │   └── page.tsx  # View individual test report
│   │   │   │   └── page.tsx      # List of user's test reports
│   │   │   ├── students/         # CFI/School: Student roster & details
│   │   │   │   ├── [studentId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/        # CFI/School: Organizational analytics
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx        # Main app layout (e.g., with sidebar/header)
│   │   ├── api/                  # API routes (backend logic)
│   │   │   ├── auth/             # Authentication endpoints (e.g., callbacks)
│   │   │   │   └── ...
│   │   │   ├── knowledge-tests/  # Endpoints for test processing, PDF generation
│   │   │   │   ├── upload/route.ts
│   │   │   │   ├── [testId]/pdf/route.ts
│   │   │   │   └── route.ts      # Get all tests for user
│   │   │   ├── students/         # Endpoints for student management
│   │   │   │   └── ...
│   │   │   ├── subscriptions/    # Stripe webhook, subscription management
│   │   │   │   ├── stripe-webhook/route.ts
│   │   │   │   └── ...
│   │   │   ├── analytics/        # Endpoints for organizational analytics data
│   │   │   │   └── ...
│   │   │   ├── mcp/              # Model Context Protocol API
│   │   │   │   └── v1/
│   │   │   │       └── acs-codes/
│   │   │   │           └── [codeId]/route.ts
│   │   │   └── ...               # Other API endpoints
│   │   ├── favicon.ico
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/             # Shared/reusable UI components (shadcn/ui based)
│   │   ├── layout/             # Layout components (Header, Footer, Sidebar, etc.)
│   │   ├── ui/                 # Base UI elements from shadcn/ui (Button, Input, etc.)
│   │   └── features/           # Components specific to features (e.g., TestUploadForm)
│   ├── config/                 # Application-wide configuration
│   │   └── site.ts             # Site metadata, navigation links
│   ├── lib/                    # Utility functions, libraries, helper modules
│   │   ├── acs-codes/          # Raw ACS code definitions
│   │   │   ├── CAX.ts
│   │   │   ├── PAR.ts
│   │   │   └── ...
│   │   ├── supabase/           # Supabase client setup, helper functions, types
│   │   │   ├── client.ts       # Client-side Supabase client
│   │   │   ├── server.ts       # Server-side Supabase client (for RSC, Route Handlers)
│   │   │   └── types.ts        # Supabase-specific generated types
│   │   ├── stripe/             # Stripe client setup and helpers
│   │   ├── resend/             # Resend client setup
│   │   ├── gemini/             # Gemini API client setup and helpers
│   │   ├── puppeteer/          # Puppeteer setup for PDF generation
│   │   ├── utils.ts            # General utility functions
│   │   └── types/              # Shared TypeScript types/interfaces for the app
│   │       ├── index.ts
│   │       ├── user.ts
│   │       └── knowledge-test.ts
│   ├── services/               # Backend service logic (higher-level business logic, orchestrating lib functions)
│   │   ├── authService.ts
│   │   ├── knowledgeTestService.ts
│   │   ├── subscriptionService.ts
│   │   ├── userService.ts
│   │   └── reportService.ts
│   ├── hooks/                  # Custom React hooks
│   ├── providers/              # React Context providers (Theme, Auth, etc.)
│   └── middleware.ts           # Next.js middleware (e.g., for protecting routes)
├── scripts/                    # Utility scripts (e.g., DB seeding, deployment helpers)
│   └── seed-acs-codes.ts       # Script to populate ACS codes table from lib/acs-codes/
├── tests/                      # Automated tests
│   ├── e2e/                    # End-to-end tests (Playwright)
│   ├── integration/            # Integration tests
│   └── unit/                   # Unit tests (Jest & React Testing Library)
├── .env.example                # Example environment variables
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── next-env.d.ts
├── next.config.mjs             # Next.js configuration
├── package.json
├── postcss.config.js           # PostCSS configuration (for Tailwind CSS)
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Key Directory Descriptions:

* **`src/app/`**: Core of the Next.js application using the App Router.
    * **`(auth)/` & `(app)/`**: Route groups to apply different layouts or logic to sets of pages (e.g., authentication pages vs. main application pages).
    * **`api/`**: Backend API route handlers. Organized by resource/feature.
* **`src/components/`**: Reusable React components.
    * **`layout/`**: Components defining page structure (Header, Nav, Footer, Sidebar).
    * **`ui/`**: Customized shadcn/ui components (e.g., `button.tsx`, `input.tsx`). This is where you'd put the components you get from `npx shadcn-ui add ...`.
    * **`features/`**: Larger components or groups of components specific to a feature (e.g., a complex form for test uploads).
* **`src/lib/`**: Utility functions, helper modules, and client configurations for external services.
    * **`acs-codes/`**: Stores the raw TypeScript files defining ACS codes (e.g., `CAX.ts`).
    * **`supabase/`**: Configuration and helper functions for interacting with Supabase (client, server, types).
    * **`stripe/`, `resend/`, `gemini/`, `puppeteer/`**: Client setup and helpers for these respective services.
    * **`types/`**: Shared TypeScript type definitions for the application's domain models and API payloads.
* **`src/services/`**: Contains more complex backend business logic, orchestrating calls to `lib` functions, database interactions, and external APIs. These services would be primarily used by the API Route Handlers in `src/app/api/`. This layer helps keep API routes cleaner and business logic more testable and organized.
* **`src/config/`**: Application-level configuration files (e.g., site metadata, navigation structure).
* **`scripts/`**: Standalone scripts, such as for database seeding (e.g., populating the `acs_codes` table from the TS files).
* **`tests/`**: Contains all automated tests, organized by type (unit, integration, E2E).

## Notes for AI Agent Implementation:

* **Clear Separation:** The structure aims for a clear separation between UI components (`components`), page routing/layouts (`app`), API logic (`app/api`), core business logic/orchestration (`services`), low-level utilities/SDK wrappers (`lib`), and static data (`lib/acs-codes`).
* **Modularity:** Feature-specific API routes and corresponding services should be grouped logically.
* **Typed Interfaces:** Extensive use of TypeScript in `lib/types/` will provide clear data contracts for AI agents to understand inputs and outputs of different modules.
* **Service Layer:** The `src/services/` directory is intended to encapsulate distinct business operations, making it easier for an AI agent to understand where to implement or modify specific backend functionalities.

---
