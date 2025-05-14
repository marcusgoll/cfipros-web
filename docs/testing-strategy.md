---

# CFIPros Testing Strategy

## 1. Overall Philosophy & Goals

The testing strategy for CFIPros aims to ensure a high-quality, reliable, and maintainable application by embedding testing throughout the development lifecycle. We will follow a balanced approach, emphasizing automated testing at various levels to catch bugs early, prevent regressions, and enable confident refactoring.

* **Primary Goals:**
    1.  **High Accuracy of Core Feature:** Ensure the FAA Knowledge Test Extraction Tool (OCR and ACS matching) meets its >95% accuracy target for common test formats.
    2.  **Reliability of User Flows:** Verify that all critical user journeys (signup, login, test processing, PDF generation, linking, subscription) are robust and function as expected.
    3.  **Prevent Regressions:** Automated tests should catch regressions in functionality before they reach production.
    4.  **Enable Confident Refactoring:** A solid test suite will allow developers to refactor and enhance code with greater confidence.
    5.  **Performance Validation:** Ensure the application meets its performance targets (e.g., <10 seconds for test processing, responsive UI).

## 2. Testing Levels

### 2.1 Unit Tests

* **Scope:** Test individual functions, methods, React components, and utility modules in isolation. Focus on business logic within services (`src/services/`), helper functions in `src/lib/`, and individual UI components (`src/components/`).
* **Tools:**
    * **Jest:** Primary test runner and assertion library.
    * **React Testing Library:** For testing React components by interacting with them as a user would.
    * **TypeScript:** Type checking itself acts as a form of static testing.
* **Mocking/Stubbing:**
    * Jest's built-in mocking capabilities (`jest.fn()`, `jest.mock()`) will be used to mock dependencies like Supabase client calls, external API clients (Gemini, Stripe, Resend), and other services during unit tests.
* **Location:** Test files will typically reside alongside the source files (`*.test.ts` or `*.test.tsx`) or in a `__tests__` subdirectory next to the module being tested.
* **Expectations:**
    * Aim for high code coverage for critical business logic and complex utility functions.
    * Tests should be fast, independent, and repeatable.
    * Focus on testing different paths, edge cases, and expected outputs for given inputs.

### 2.2 Integration Tests

* **Scope:** Verify the interaction and collaboration between multiple internal components or modules. This includes testing:
    * API Route Handlers (`src/app/api/...`) with their underlying services (`src/services/...`).
    * Service interactions with the Supabase client (potentially against a local or test Supabase instance).
    * Frontend components that make API calls to the backend.
* **Tools:**
    * **Jest:** As the test runner.
    * **Supertest (or similar):** For testing Next.js API route handlers by making HTTP requests to them.
    * **React Testing Library:** For testing frontend components that integrate with backend APIs (using mocked API responses or a test API server).
    * **Supabase Test Helpers:** Supabase provides utilities for testing with local development instances.
* **Location:** Likely in a dedicated `tests/integration/` directory, organized by feature or component group.
* **Expectations:**
    * Focus on the contracts and interactions between modules (e.g., API request/response schemas, service method signatures).
    * Ensure data flows correctly between components.
    * These tests will be slower than unit tests and may require more setup (e.g., seeding test data in a Supabase test instance).

### 2.3 End-to-End (E2E) / Acceptance Tests

* **Scope:** Test the entire application flow from an end-user perspective, simulating real user scenarios. This involves interacting with the UI (for web flows) or making calls to public API endpoints (for MCP API).
* **Tools:**
    * **Playwright:** For browser automation to test key user journeys on the web application (signup, login, test upload, report viewing, subscription).
* **Environment:**
    * E2E tests should ideally run against a staging environment that closely mirrors production (Vercel Preview Deployments).
    * For local development, E2E tests can run against a locally running instance of the application with a local Supabase instance.
* **Location:** `tests/e2e/`
* **Expectations:**
    * Cover critical user paths ("happy paths") and key functionalities.
    * These are the slowest and potentially most brittle tests, so focus on the most important flows.
    * Will be run less frequently than unit/integration tests (e.g., as part of a pre-release checklist or nightly/weekly builds).
    * User Acceptance Testing (UAT) with a cohort of target users (as per PRD) will complement automated E2E tests before launch.

## 3. Specialized Testing Types

### 3.1 FAA Knowledge Test Extraction Accuracy Testing

* **Scope:** This is a critical component requiring dedicated testing.
* **Process:**
    * Maintain a diverse corpus of sample FAA Knowledge Test documents (various formats: PDF, JPEG, PNG; various test types: CAX, PAR, IRA, etc.; different layouts if variations exist).
    * For each sample document, define the expected extracted data (missed ACS codes, score, dates, etc.).
    * Create automated tests that:
        1.  Upload the sample document to the processing endpoint.
        2.  Compare the actual extracted and matched ACS codes (and other key data points) against the expected output.
        3.  Measure accuracy and flag discrepancies.
    * Performance testing: Ensure processing completes within the 10-second target.
* **Tools:** Jest for orchestration, potentially custom scripts for managing test documents and expected outputs. The FAA Test Processing Service will be the primary target.

### 3.2 API Testing (Internal & MCP)

* **Scope:** Directly test the internal API endpoints and the MCP API for correctness, security, and adherence to their contracts.
* **Tools:** Playwright (can also be used for API testing) or dedicated API testing tools like Postman (with Newman for automation if preferred, though Playwright can cover this).
* **Process:** Test request/response schemas, authentication, authorization, error handling, and rate limiting (for MCP API).

### 3.3 Security Testing (Considerations for MVP)

* **Dependency Scanning:** Use `npm audit` (or equivalent) and potentially Vercel's built-in scanning or GitHub's Dependabot to identify known vulnerabilities in dependencies.
* **RLS Policy Testing:** Manually verify and, where possible, write tests (potentially integration tests with specific user roles) to ensure Supabase Row Level Security policies correctly restrict data access. This is critical.
* **API Endpoint Security:** Basic penetration testing concepts (e.g., checking for common vulnerabilities like improper access control on API endpoints) should be considered during manual QA and UAT. Formal penetration testing is likely post-MVP.
* **Input Validation:** Ensure all API inputs are rigorously validated to prevent injection attacks or unexpected behavior.

### 3.4 Usability & Accessibility Testing

* **Usability:** Primarily through manual exploratory testing and formal User Acceptance Testing (UAT) with target users.
* **Accessibility (AX):**
    * Automated checks using tools like Axe (e.g., via Playwright integration or browser extensions during development).
    * Manual checks against WCAG 2.1 AA guidelines for core user flows.
    * Strive for compliance as per PRD.

## 4. Test Data Management

* **Unit Tests:** Use mocked data or small, focused fixtures directly within test files.
* **Integration Tests:**
    * May require a dedicated test database (e.g., a separate Supabase project or local Supabase instance).
    * Scripts to seed and tear down common test data (e.g., sample users with different roles, sample ACS codes, basic school/CFI setups). Supabase test helpers or custom scripts in `scripts/` can be used.
* **E2E Tests:**
    * Requires a stable test environment with representative data. This might involve pre-populating the staging environment or having scripts to set up specific scenarios.
    * Care must be taken not to use real PII in test data, especially in shared environments.
* **FAA Test Corpus:** The collection of sample FAA test documents for accuracy testing needs to be managed and versioned if necessary.

## 5. CI/CD Integration & Pre-Commit Quality Gates

A robust CI/CD pipeline is essential for maintaining code quality and ensuring smooth deployments. Furthermore, local pre-commit checks are crucial for catching issues early and form part of the "Definition of Done" for development tasks.

* **Local Pre-Commit Checks (Mandatory for Story Completion):**
    * Before any code related to a story is committed (`git add`, `git commit`), and before the story is considered ready for further review or merging, the following scripts **MUST** be run locally by the developer and pass successfully:
        * `npm run typecheck`: Ensures all TypeScript type checks pass.
        * `npm run lint`: Enforces code style guidelines and identifies potential errors. Developers must fix reported issues or apply auto-fixes and commit the changes.
        * `npm run format:check`: Verifies adherence to code formatting standards. Developers must apply required formatting changes (e.g., using `npm run format`) and commit them.
        * `npm run test:coverage`: Executes all unit and integration tests. All tests must pass, and code coverage should meet the project's defined targets.
    * These checks serve as a local "Definition of Done" from a code quality perspective for any development work on a story. Successful completion of these checks is a prerequisite for pushing code and marking development tasks as complete.

* **Vercel CI/CD Pipeline:**
    * **Automated Checks on Pull Requests (PRs):** On every push to a PR and before merging to the `main` branch, the following checks will be automatically executed:
        * **Linting & Formatting:** `npm run lint` and `npm run format:check` (or their direct equivalents if the CI environment runs them differently but achieves the same goal).
        * **Type Checking:** `npm run typecheck`.
        * **Unit and Integration Tests:** `npm run test:coverage`.
    * A failing check in any of these automated steps will block the PR merge and any subsequent deployment.
    * **E2E Tests:** May be run on a schedule (e.g., nightly against staging/preview environments) or triggered manually before a production release due to their longer execution time. Successful completion will be a gate for production promotion.

* **Build & Deployment:** Vercel handles builds and deployments. Test failures in the CI pipeline (including any of the checks above) will prevent deployments to preview and production environments.

## Change Log

| Change                                | Date       | Version | Description                                                                                                     | Author        |
| :------------------------------------ | :--------- | :------ | :-------------------------------------------------------------------------------------------------------------- | :------------ |
| Initial draft                         | 2025-05-09 | 0.1     | First draft of testing strategy                                                                                 | Architect Gem |
| Added pre-commit checks to CI & DoD | 2025-05-14 | 0.2     | Clarified mandatory local pre-commit checks (`typecheck`, `lint`, `format:check`, `test:coverage`) within Section 5. | Gemini AI     |

---
