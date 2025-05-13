# CFIPros: Flight Training Analytics Platform

## 🚀 Project Overview

CFIPros is a modern web application designed to be a centralized hub for Certified Flight Instructors (CFIs), flight schools, and their students. It aims to streamline instructional processes, aid FAA compliance, and provide actionable insights from flight training data.

The initial Minimum Viable Product (MVP) focuses on delivering a high-accuracy FAA Knowledge Test Extraction Tool. This tool converts PDF/image test results into structured data, matches them with Airman Certification Standards (ACS) codes, and generates insightful reports. The platform also includes essential user account management, basic student management capabilities for subscribers, a tiered analytics system, and an initial API for the future Model Context Protocol (MCP).

**Key Goals:**
- Address fragmented data management in flight training.
- Provide reliable FAA Knowledge Test analysis.
- Establish an expandable platform for CFIs, schools, and students.
- Introduce a freemium model for students and subscriptions for CFIs/Schools.

## 📄 Key Project Documentation

- **Product Requirements Document (PRD):** [docs/prd.md](docs/prd.md)
- **Architecture Document:** [docs/architecture.md](docs/architecture.md)
- **Project Brief:** [docs/project-brief.md](docs/project-brief.md)
- **Technology Stack:** [docs/tech-stack.md](docs/tech-stack.md)
- **Project Structure:** [docs/project-structure.md](docs/project-structure.md)
- **Coding Standards:** [docs/coding-standards.md](docs/coding-standards.md)
- **Testing Strategy:** [docs/testing-strategy.md](docs/testing-strategy.md)

## 🛠️ Getting Started: Local Development Setup

Follow these instructions to set up the project for local development.

### Prerequisites

- **Node.js:** Latest LTS version (e.g., 20.x). You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
- **npm, yarn, or pnpm:** A Node.js package manager. This project uses `npm` by default.
- **Git:** For version control.
- **Supabase Account:** You will need a Supabase project for database and authentication.
  - Set up a new project on [Supabase](https://supabase.com/).
  - Obtain your Project URL and `anon` key.
- **Google Cloud Account & Gemini API Key:** For FAA Knowledge Test OCR processing.
  - Set up a project on [Google Cloud Platform](https://cloud.google.com/).
  - Enable the Gemini API.
  - Obtain an API Key.
- **Stripe Account & API Keys (Optional for core local dev):** If you intend to test subscription features.
- **Resend Account & API Key (Optional for core local dev):** If you intend to test email functionalities.

### Environment Variables

1.  **Copy the example environment file:**
    ```bash
    cp .env.example .env.local
    ```
2.  **Populate `.env.local` with your credentials and settings:**
    Refer to `docs/environment-vars.md` for a detailed list of all environment variables. At a minimum, you will need to set up Supabase and Gemini variables for core functionality:

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # If using admin operations from backend

    # Google Gemini API
    GEMINI_API_KEY=your_gemini_api_key

    # NextAuth (if using a custom setup, otherwise Supabase handles auth)
    # NEXTAUTH_URL=http://localhost:3000
    # NEXTAUTH_SECRET=your_nextauth_secret

    # Other services (Stripe, Resend) - Add as needed
    # STRIPE_SECRET_KEY=...
    # RESEND_API_KEY=...
    ```
    **Important:** Never commit your `.env.local` file to version control.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd cfipros-main
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(Or `yarn install` or `pnpm install` if you prefer a different package manager)*

### Database Setup (Supabase)

1.  **Schema Migrations:**
    Apply the database schema. SQL migration files are typically located in a `supabase/migrations` directory (not yet present in the provided structure, but will be added). For now, you might need to set up tables manually via the Supabase dashboard according to `docs/data-models.md` or run seed scripts if available.
    *Watch for specific instructions on database migrations as the project evolves.*

2.  **Seed Initial Data (if applicable):**
    Run any data seeding scripts provided (e.g., to populate ACS codes).
    ```bash
    # Example: npm run seed:db
    ```
    *(A script like `scripts/seed-acs-codes.ts` is planned).*

### Running the Development Server

Once the installation and environment setup are complete, you can start the development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:3000`.

## 🧪 Running Tests

The project uses Jest for unit/integration tests and Playwright for end-to-end tests.

### Unit & Integration Tests (Jest)

To run Jest tests:

```bash
npm test
```
Or, to run in watch mode:
```bash
npm run test:watch
```

Test files are located in `tests/unit/` and `tests/integration/`.

### End-to-End Tests (Playwright)

To run Playwright E2E tests:

1.  Ensure the development server is running (`npm run dev`).
2.  Execute the Playwright test command:
    ```bash
    npm run test:e2e
    ```
    *(This might be `npx playwright test` depending on package.json scripts)*

Test files are located in `tests/e2e/`.

## 📖 Basic Usage Examples

*(This section can be expanded as features are developed. For MVP, it might focus on the FAA Knowledge Test upload process.)*

1.  **Sign up / Log in:** Access the platform through the respective authentication flows.
2.  **Upload FAA Knowledge Test:** Navigate to the "Knowledge Tests" section and use the upload tool.
3.  **View Results:** Once processed, view the extracted data and ACS code analysis.
4.  **Export Report:** Download a PDF summary of the test results.

## 🤝 Contributing

We welcome contributions to CFIPros! If you're interested in helping, please review our contribution guidelines:

-   **[CONTRIBUTING.md](CONTRIBUTING.md)**: Detailed information on our Git branching strategy, commit message conventions, PR process, code style, and review process.

**Quick Summary:**

-   **Branching:** Features are developed in `feature/<name>` branches off `develop`.
-   **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/).
-   **Pull Requests:** Submit PRs to `develop`, use the PR template, and ensure tests pass.

---

*This README is a living document and will be updated as the project evolves.*
