---

# CFIPros Coding Standards and Patterns

This document defines the coding standards, architectural patterns, and best practices to be adopted for the CFIPros project. Adherence to these standards is crucial for maintaining code quality, consistency, and ease of collaboration, especially when AI agents are involved in code generation or modification.

## 1. Architectural / Design Patterns Adopted

The high-level architectural style and key patterns are detailed in `docs/architecture.md`. Key adopted patterns include:

* **Serverless First (Vercel & Supabase):** Backend logic as Next.js API routes (serverless functions) and leveraging Supabase for BaaS (database, auth).
    * _Rationale:_ Reduces infrastructure overhead, enables auto-scaling, cost-effective for MVP.
* **Monorepo for Frontend & Backend (Next.js):** Single project for UI and API.
    * _Rationale:_ Simplified workflow, code/type sharing.
* **Model-View-Controller (MVC) variant (for Next.js App Router):**
    * React Server Components (RSCs) and Client Components for the View.
    * Route Handlers (in `app/api/`) and backend Services (`src/services/`) act as Controllers/Service Layer.
    * Supabase and domain logic act as the Model.
    * _Rationale:_ Standard for Next.js, good separation of concerns.
* **Service Layer Pattern:** Business logic encapsulated in service modules (`src/services/`) called by API route handlers.
    * _Rationale:_ Promotes reusability, testability, and separation of concerns from API routing.
* **Repository Pattern (Conceptual for Supabase):** Supabase client functions in `src/lib/supabase/` act as a data access layer, abstracting direct database queries where appropriate.
    * _Rationale:_ Centralizes data access logic.
* **Dependency Injection (Implicit via module imports):** Services and utilities are imported where needed.
    * _Rationale:_ Standard JavaScript/TypeScript practice.
* **Component-Based UI (React with shadcn/ui):** UI built from reusable, encapsulated components.
    * _Rationale:_ Modularity, reusability, maintainability.

## 2. Coding Standards

* **Primary Language:** TypeScript (latest stable, e.g., 5.x, as supported by Next.js/Vercel).
* **Primary Runtime:** Node.js (latest LTS, e.g., 20.x, as used by Vercel).
* **Style Guide & Linters:**
    * **ESLint:** Configured with recommended Next.js rules (`eslint-config-next`), TypeScript-ESLint plugin, and potentially rules for import sorting and best practices.
    * **Prettier:** For automatic code formatting.
    * _Configuration:_ ESLint (`.eslintrc.json`) and Prettier (`.prettierrc.json`, `.prettierignore`) configurations will be in the project root. A pre-commit hook (e.g., via Husky and lint-staged) will enforce linting and formatting.
* **Naming Conventions:**
    * Variables: `camelCase`
    * Functions: `camelCase`
    * Classes/Types/Interfaces/Enums: `PascalCase`
    * React Components (TSX files and function names): `PascalCase` (e.g., `UserProfileForm.tsx`)
    * Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_UPLOAD_SIZE`)
    * Files:
        * TSX/JSX (React Components): `PascalCase.tsx` (e.g., `MyComponent.tsx`) or `kebab-case.tsx` if preferred by a framework convention (Next.js pages/routes use folder names or `page.tsx`, `layout.tsx`, `route.ts`). We will primarily use `kebab-case` for folders and specific file names like `page.tsx`, `layout.tsx`, `route.ts` within the `app` directory. Component files in `src/components/` will be `PascalCase.tsx`.
        * TypeScript files (non-components): `kebab-case.ts` (e.g., `user-service.ts`) or `camelCase.ts`. Prefer `kebab-case.ts` for consistency.
    * API Route Handlers: Follow Next.js conventions (e.g., `app/api/users/route.ts`).
* **File Structure:** Adhere to the layout defined in `docs/project-structure.md`.
* **Asynchronous Operations:**
    * Use `async/await` for all asynchronous operations (Promises).
    * Properly handle Promise rejections using `try/catch` blocks or `.catch()` where appropriate.
* **Type Safety:**
    * Leverage TypeScript's static typing. Strive for strong type coverage.
    * Use interfaces (`interface`) for defining object shapes and types (`type`) for unions, intersections, or simpler type aliases.
    * Shared types should be defined in `src/lib/types/`.
    * Enable `strict` mode and related compiler options in `tsconfig.json`.
* **Comments & Documentation:**
    * Use JSDoc-style comments for functions, classes, interfaces, and complex logic sections.
    * Explain *why* something is done, not just *what* is being done if the code itself is not self-explanatory.
    * Keep comments up-to-date with code changes.
    * Each significant module/service should have a brief overview comment.
* **Dependency Management:**
    * Use `pnpm` (or `yarn`/`npm` if preferred by the team - default to `pnpm` for `create-next-app`).
    * `package-lock.json` (or equivalent) must be committed.
    * Minimize dependencies. Evaluate need and trustworthiness before adding new ones.
    * Regularly review and update dependencies for security patches (e.g., using `pnpm audit`).
* **Modularity:**
    * Break down code into small, focused modules/functions with single responsibilities.
    * Aim for high cohesion within modules and loose coupling between them.
* **Immutability:** Prefer immutable data structures where practical, especially when dealing with state.
* **Environment Variables:** All environment-specific configurations must be loaded via environment variables as defined in `docs/environment-vars.md`. Do not hardcode secrets or configurations.

## 3. Error Handling Strategy

* **General Approach:**
    * Use standard JavaScript `Error` objects or custom error classes extending `Error` for specific error types (e.g., `ApiError`, `ValidationError`, `NotFoundError`).
    * API Route Handlers should catch errors from services and transform them into appropriate HTTP JSON responses with clear error messages and status codes (see `docs/api-reference.md`).
* **Logging:**
    * **Library/Method:** Use `console.log`, `console.warn`, `console.error` for server-side logging (Vercel will capture these). For client-side, use `console.error` for caught errors. Consider integrating a dedicated logging service (e.g., Sentry, Logtail) post-MVP if more advanced error tracking/aggregation is needed.
    * **Format:** Log messages should be descriptive. For errors, include stack traces and relevant context (e.g., user ID if available and safe, request ID).
    * **Levels:** Use appropriate console methods (`log`, `info`, `warn`, `error`).
    * **Context:** Include contextual information like function name, operation being performed, and relevant IDs where possible without exposing PII in verbose logs.
* **Specific Handling Patterns:**
    * **External API Calls (Gemini, Stripe, Resend):**
        * Wrap all external API calls in `try/catch` blocks.
        * Implement retry logic with exponential backoff for transient network errors where appropriate (e.g., for idempotent operations or if the service docs recommend it). Be mindful of serverless function timeout limits.
        * Log errors returned by external APIs, including status codes and response bodies if helpful for debugging (ensure no sensitive data from responses is logged).
        * Gracefully degrade functionality if a non-critical external API fails, if possible.
    * **Input Validation:**
        * Validate all inputs to API Route Handlers (request bodies, query parameters, path parameters). Use libraries like Zod for schema validation to ensure type safety and correctness.
        * Return `400 Bad Request` for validation errors with clear messages indicating which fields are problematic.
        * Validate data at service boundaries as well.
    * **Database Operations (Supabase):**
        * Handle potential errors from Supabase client calls (e.g., RLS violations, constraint violations, connection issues).
        * Translate database errors into user-friendly API responses where appropriate.

## 4. Security Best Practices (Code-Level)

Refer to `docs/architecture.md` for broader security decisions. These are code-level practices.

* **Input Sanitization/Validation:**
    * Always validate and sanitize data received from users or external systems (as covered in Error Handling).
    * Be cautious of data used in dynamic queries or HTML rendering (though React mitigates many XSS risks by default).
* **Secrets Management:**
    * Secrets (API keys, JWT secrets) must ONLY be accessed via environment variables. Never hardcode secrets in the codebase.
    * Ensure `SUPABASE_SERVICE_ROLE_KEY` and other backend secrets are not exposed to the client-side (i.e., not prefixed with `NEXT_PUBLIC_`).
* **Dependency Security:**
    * Regularly run `npm audit` (or equivalent) and address reported vulnerabilities promptly.
    * Use tools like Snyk or Dependabot for automated vulnerability scanning if possible.
* **Authentication/Authorization Checks:**
    * Authentication is handled by Supabase. Middleware (`src/middleware.ts`) will protect authenticated routes.
    * Authorization (what an authenticated user is allowed to do) must be enforced:
        * Primarily via Supabase Row Level Security (RLS) policies for data access.
        * Additionally, in API Route Handlers or service layers for actions that RLS might not cover (e.g., "is this user a School Admin before allowing school creation?").
* **Least Privilege:** Backend functions and services should only have the permissions necessary to perform their tasks (e.g., using Supabase client with user's JWT vs. service_role key where appropriate).
* **Secure API Key Handling (for MCP API):**
    * When validating incoming MCP API keys, compare bcrypt hashes rather than storing plaintext keys (as detailed in `docs/api-reference.md` and `architecture.md`).
* **CSRF Protection:** Next.js generally provides some protection, but be mindful if creating custom form handlers outside of standard Next.js patterns. Supabase client uses JWTs in headers which are not susceptible to traditional CSRF via cookies.
* **Error Message Detail:** Avoid leaking excessive system details or stack traces in error messages sent to the client. Log detailed errors on the server.

## 5. Code Reviews

* All code should be peer-reviewed before merging to the main branch.
* Reviewers should check for adherence to coding standards, correctness, performance, security, and test coverage.
* Use Pull Requests (PRs) for code reviews.

## Change Log

| Change        | Date       | Version | Description                  | Author         |
| :------------ | :--------- | :------ | :--------------------------- | :------------- |
| Initial draft | 2025-05-09 | 0.1     | First draft of coding standards | Architect Gem  |

---
