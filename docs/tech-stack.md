---

# CFIPros Technology Stack

This document outlines the specific technologies, frameworks, and services chosen for the CFIPros Minimum Viable Product (MVP).

## Technology Choices

| Category             | Technology                                    | Version / Details                                     | Description / Purpose                                                                 | Justification (Optional)                                                                                                     |
| :------------------- | :-------------------------------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| **Languages** | TypeScript                                    | Latest Stable (e.g., 5.x)                             | Primary language for both frontend and backend (Next.js)                              | Strong typing, improved developer experience, ecosystem.                                                                     |
| **Runtime** | Node.js                                       | Latest LTS (e.g., 20.x)                               | Server-side execution environment for Next.js API routes and Vercel Serverless Functions. | Compatibility with Vercel, performance, large ecosystem.                                                                     |
| **Frameworks** | Next.js                                       | Latest Stable (e.g., 14.x or newer if stable at dev time) | Full-stack web framework for React frontend and backend API/serverless functions.       | PRD requirement. Excellent for rapid development, performance, SEO, and Vercel integration.                                  |
|                      | React                                         | Bundled with Next.js (e.g., 18.x)                     | Frontend UI library.                                                                  | Core of Next.js, component-based architecture.                                                                               |
| **Databases** | Supabase (PostgreSQL)                         | Latest Stable offering from Supabase                  | Primary relational data store, authentication, and BaaS features.                     | PRD requirement. Provides database, auth, RLS, and scales well. PostgreSQL is robust.                                        |
| **Cloud Platform** | Vercel                                        | N/A                                                   | Hosting platform for Next.js application, serverless functions, and CI/CD.            | PRD requirement. Optimized for Next.js, seamless deployment, serverless functions.                                         |
| **Cloud Services** | Supabase                                      | N/A                                                   | Backend as a Service: Database (PostgreSQL), Authentication, Storage (unused in MVP for uploads), Edge Functions (potential). | PRD requirement. Simplifies backend setup.                                                                                   |
| **OCR Service** | Google Gemini API                             | Gemini 2.5 Flash                                      | Text extraction from PDF/image FAA Knowledge Test results.                              | PRD requirement. Chosen for its balance of performance, accuracy, and cost for document understanding tasks.               |
| **Payment Processing**| Stripe                                        | Latest stable API/SDK versions                        | Handling CFI and Flight School subscriptions.                                         | PRD requirement. Robust, developer-friendly, widely adopted.                                                                 |
| **Email Service** | Resend                                        | Latest stable API/SDK versions                        | Transactional emails (account verification, password resets, report sharing, invitations). | PRD requirement. Modern email API, good deliverability, developer-focused.                                                   |
| **Analytics & Feature Flags** | PostHog                                       | Latest stable API/SDK versions                        | User analytics, event tracking, and feature flag management.                            | Provides both analytics and feature flags in one platform. Open-source with cloud hosting option. Simplifies implementation.  |
| **PDF Generation** | Puppeteer                                     | Latest Stable                                         | Library for controlling a headless Chrome/Chromium instance to generate PDFs.           | Chosen for complex layout control needed for formatted PDF reports with conditional summaries, running in a serverless function. |
| **Styling** | Tailwind CSS                                  | Latest Stable (e.g., 3.x)                             | Utility-first CSS framework for rapid UI development.                                   | Aligns with modern Next.js development, "calm UX" can be achieved with careful theming. Base for shadcn/ui.                  |
| **UI Components** | shadcn/ui                                     | Latest Stable                                         | Collection of beautifully designed, accessible, and customizable components built with Radix UI and Tailwind CSS. | Accelerates UI development, ensures accessibility, and aligns with "calm UX" goals by providing well-crafted primitives.     |
| **State Management** | React Context API / Zustand (Recommendation)  | Latest Stable                                         | Frontend state management.                                                            | Start with React Context for simpler needs; consider Zustand if global state becomes more complex. Avoids Redux boilerplate initially. |
| **Testing** | Jest                                          | Latest Stable                                         | Unit/Integration testing framework for JavaScript/TypeScript.                         | Popular in React/Next.js ecosystem, good for testing components and business logic.                                          |
|                      | React Testing Library                         | Latest Stable                                         | Testing React components in a user-centric way.                                       | Complements Jest for component testing.                                                                                      |
|                      | Playwright                                    | Latest Stable                                         | End-to-end testing framework.                                                         | Powerful for cross-browser E2E testing, good Next.js support. Agreed by user.                                                |
| **CI/CD** | Vercel                                        | N/A                                                   | Built-in CI/CD pipelines triggered by Git commits.                                      | Native to the hosting platform, simplifies setup.                                                                            |
| **Code Formatting** | Prettier                                      | Latest Stable                                         | Opinionated code formatter.                                                           | Ensures consistent code style across the project.                                                                            |
| **Linting** | ESLint                                        | Latest Stable                                         | Pluggable linting utility for JavaScript/TypeScript.                                    | Catches common errors and enforces coding standards.                                                                         |

## Notes

* **Version Pinning:** Specific versions of libraries (npm packages) will be pinned in `package.json` and managed via `package-lock.json` (or `yarn.lock` / `pnpm-lock.yaml` depending on chosen package manager) to ensure reproducible builds.
* **Flexibility:** While "Latest Stable" is indicated for many evolving technologies (like Next.js, Node.js), the project will target versions that are well-supported by the ecosystem (especially Vercel) at the time of active development.
* **State Management:** Zustand is an initial recommendation if React Context becomes insufficient. This can be confirmed or adjusted based on team preference as development progresses.
* **PostHog Usage:** PostHog will be used for two primary purposes:
  * **Analytics:** Track page views and user interactions across the platform to gain insights into user behavior
  * **Feature Flags:** Manage feature rollouts, enabling gradual deployment of new functionality and A/B testing

## Change Log

| Change                  | Date       | Version | Description                                                        | Author         |
| :---------------------- | :--------- | :------ | :----------------------------------------------------------------- | :------------- |
| Initial draft           | 2025-05-09 | 0.1     | First draft based on PRD and user feedback                         | Architect Gem  |
| Added shadcn/ui         | 2025-05-09 | 0.2     | Incorporated shadcn/ui for UI components per user request          | Architect Gem  |
| Corrected Gemini Version| 2025-05-09 | 0.3     | Updated OCR Service to Gemini 2.5 Flash API per user specification | Architect Gem  |
| Added PostHog           | 2025-05-10 | 0.4     | Added PostHog for analytics and feature flag management            | Architect Gem  |

---
