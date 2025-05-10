Excellent. I will now draft the Product Requirements Document (PRD) for CFIPros.

Here is the Product Requirements Document for CFIPros:

# CFIPros Product Requirements Document (PRD)

## Intro

CFIPros is a modern web application designed to be a centralized hub for Certified Flight Instructors (CFIs), flight schools, and their students. For its Minimum Viable Product (MVP), CFIPros will focus on delivering a high-accuracy FAA Knowledge Test Extraction Tool. This tool will convert PDF/image test results into structured data, match them with Airman Certification Standards (ACS) codes, and generate insightful reports. The MVP also includes essential user account management for Students, CFIs, and Flight School administrators, basic student management capabilities for subscribers, a tiered analytics system, and an initial API for the future Model Context Protocol (MCP). The overarching aim is to streamline instructional processes, aid FAA compliance, and provide actionable insights from test data, addressing current data management fragmentation and inefficiencies in the flight training sector.

## Goals and Context

- **Project Objectives:**
  - Address fragmented data management and inefficiencies in tracking student progress within flight training.
  - Provide a reliable tool to extract and analyze FAA Knowledge Test results, offering insights for tailored instruction and checkride readiness assessment.
  - Establish a foundational platform for CFIs, flight schools, and students that can be expanded with more features post-MVP.
  - Introduce a freemium model to encourage student adoption and a subscription model for CFIs/Schools to access premium features.
  - Develop a modular system adaptable to both Part 61 and Part 141 operational needs.
- **Measurable Outcomes:**
  - Achieve a high adoption rate among initial target users (CFIs and small flight schools) for the FAA Knowledge Test Extraction Tool.
  - Demonstrate the value of basic and premium analytics through user engagement and feedback.
  - Successfully process a significant number of FAA Knowledge Tests, building a foundational dataset for future analytics.
  - Convert a target percentage of free student users (or their CFIs) to paid CFI/School subscriptions.
- **Success Criteria:**
  - The FAA Knowledge Test Extraction Tool consistently achieves >95% accuracy in OCR and ACS code matching for common test formats.
  - Core user flows (signup, test upload & processing, report generation, CFI-student linking, subscription) are intuitive and have a high task completion rate (>90%).
  - Positive qualitative feedback from early adopters regarding ease of use, platform stability, and the utility of extracted data and analytics.
  - The system operates reliably on the specified technology stack (Next.js, Supabase, Vercel) within budget constraints.
  - The MVP is delivered within the agreed-upon timeframe.
- **Key Performance Indicators (KPIs):**
  - **Extraction Accuracy Rate:** Percentage of FAA Knowledge Test results correctly processed (OCR and ACS matching).
  - **Task Completion Rate:** Percentage of users successfully completing key workflows (e.g., signup, first test processing, subscription).
  - **Active Users (Daily/Monthly):** Number of unique users interacting with the platform.
  - **Number of Tests Processed:** Total FAA Knowledge Tests uploaded and analyzed.
  - **Conversion Rate:** Percentage of CFIs/Schools opting for paid subscriptions after an initial period or student invitation.
  - **User Satisfaction Score:** (e.g., CSAT/NPS) based on user surveys.
  - **Average Processing Time per Test:** For the FAA Knowledge Test Extraction Tool.

## Scope and Requirements (MVP / Current Version)

### Functional Requirements (High-Level)

- **User Authentication & Account Management:**
  - **Role-Based Access:** Distinct accounts and features for Students (free/linked), individual CFIs (paid), and Flight School Administrators (paid).
  - **Signup/Login:** Secure and separate registration and login flows for each user role.
  - **Profile Management:** Basic profile settings for all users (e.g., name, email, password change).
  - **Landing/Marketing Page:** Introduces CFIPros, its value proposition, and clear calls-to-action for signup.
- **FAA Knowledge Test Extraction Tool:**
  - **File Upload:** Allow users to upload FAA Knowledge Test results in PDF and common image formats (e.g., JPEG, PNG).
  - **File Validation:** Basic validation of uploaded file types and sizes.
  - **OCR Processing:** Integration with Gemini API for text extraction from uploaded files.
  - **ACS Code Database & Matching:** Internal database of FAA ACS codes and descriptions; logic to match extracted test question data/codes to these ACS codes.
  - **Error Handling:** Mechanisms to manage failed extractions, mismatches, or low-confidence OCR results (e.g., notification to user, option for review if feasible for MVP).
  - **Data Display:** Clear presentation of extracted data, matched ACS codes, and descriptions.
- **Reporting & Analytics:**
  - **PDF Export of Test Reports:** Users (Students, CFIs, Schools) can export processed test reports as formatted PDFs. PDF reports will include conditional summary statistics on the cover if multiple tests exist for a student.
  - **Basic Analytics (per test):** Included with each processed test report, showing a detailed breakdown of ACS codes (e.g., correct/incorrect, areas of concern). Available to all users for tests they process or have access to.
  - **Premium Organizational Analytics (Subscription for CFIs/Schools):**
    - Aggregated insights from all test results processed for their linked students/organization.
    - Metrics such as most frequently missed ACS sections across their student base, performance trends over time for individual students or groups.
    - Basic charts and summaries for easy interpretation.
- **Student-CFI/School Linking & Invitation:**
  - Students can email their processed PDF test report to their CFI.
  - If the recipient CFI does not have a CFIPros account, the email will contain an invitation to sign up and view detailed analytics, initiating a viral loop.
  - Subscribed CFIs/Schools can directly invite their students to link accounts or add students to their roster.
- **Subscription Management (for CFIs/Flight Schools):**
  - Integration with Stripe for handling subscriptions for CFIs and Flight Schools.
  - Clear flows for selecting subscription tiers (if multiple), payment, and managing subscription status.
- **Student Management (Basic - for Subscribed CFIs/Flight Schools):**
  - **Student List Page:** View and manage a roster of linked students.
  - **Student Details Page:** View a summary of an individual student, including all their processed test reports and basic performance indicators.
- **Model Context Protocol (MCP) - API (Initial MVP Scope):**
  - **Read-Only API:** An initial API endpoint that allows authenticated external AI agents (with appropriate keys/permissions) to retrieve anonymized and aggregated FAA Knowledge Test data (e.g., common missed ACS codes by general test type, without PII).
  - **Data Exposure:** Focus on exposing aggregated, non-PII data relevant for broader analysis or integration with external AI training tools. For MVP, this might be limited to high-level statistics.
- **Modularity for Part 61/141:**
  - **Data Fields:** User profiles (especially for Schools) should allow specification of Part 61 or Part 141 operational type.
  - **Workflows/Settings (Minimal for MVP):** While deep differentiation is post-MVP, the system should not prevent either type from using the core extraction and analytics tools. Data tagging for future filtering might be considered if simple to implement.

### Non-Functional Requirements (NFRs)

- **Performance:**
  - FAA Knowledge Test Extraction Tool: Aim for processing times under 60 seconds for typical test documents. Monitor Gemini API performance.
  - Web Application: Standard responsive load times for all user interface elements (e.g., <3 seconds for page loads, <1 second for interactions).
- **Scalability:**
  - The system architecture (Supabase, Vercel) should support a growing number_of users and data volume without significant degradation in performance for the MVP load.
  - Plan for easy scaling of database and backend services as user base grows post-MVP.
- **Reliability/Availability:**
  - Target 99.5% uptime for the web application.
  - Robust error handling for API integrations (Gemini, Stripe, Resend) and internal processes.
  - Graceful degradation of non-critical features in case of partial system outages.
- **Security:**
  - **Data Protection:** All user data (account information, extracted test results) must be protected using industry best practices. Encryption at rest and in transit (HTTPS mandatory). Supabase security features (Row Level Security) to be utilized.
  - **Authentication & Authorization:** Secure authentication mechanisms. Role-based access control to ensure users can only access data and features appropriate for their role.
  - **PII Handling:** For MVP, no storage of original uploaded PDF/image files of knowledge tests post-processing. Extracted data (which may contain student names, test IDs) must be handled securely. Future PII document storage needs to be considered in the data security model.
  - **API Security:** MCP API endpoints must be secured (e.g., API keys, OAuth).
  - **Compliance:** Standard cookie consent mechanism. Adherence to general data privacy principles.
- **Maintainability:**
  - Codebase should be well-documented, clean, and follow consistent coding standards to facilitate future development and maintenance.
  - Modular design to allow for easier updates and feature additions.
- **Usability/Accessibility:**
  - **Usability:** Intuitive, user-friendly interface ("calm UX") that requires minimal training. Clear navigation and information hierarchy.
  - **Accessibility:** Strive for WCAG 2.1 Level AA compliance for core user flows where feasible within MVP constraints.
- **Data Retention:**
  - Original uploaded PDF/image files of FAA knowledge tests will NOT be stored after successful OCR processing and data extraction for the MVP. Only the extracted textual data and system-generated PDF reports will be retained.
- **Other Constraints:**
  - **Low Initial Budget:** Development choices must prioritize core MVP functionality and cost-effectiveness. Leverage free/developer tiers of services where possible initially.
  - **Technology Stack:** Adherence to Next.js, Supabase, Vercel, Stripe, Resend, Gemini API.

### User Experience (UX) Requirements (High-Level)

- **Core Principles:** Modern, professional, clean UX, minimal clutter, elegant spacing, premium UI details.
- **Aesthetic:** Calm color palette (e.g., slate, blush, off-white, soft blue), modern typography (e.g., Inter, SF Pro, Söhne), rounded corners, subtle shadows.
- **User Experience:** Prioritize clarity, intuitive navigation, and a "calm UX" (inspired by apps like Linear or Superhuman), ensuring users can accomplish key tasks efficiently and without confusion.
- Detailed UI/UX specifications, including wireframes and component design, will be documented in `docs/ui-ux-spec.md`.

### Integration Requirements (High-Level)

- **Gemini API:** For OCR capabilities in the FAA Knowledge Test Extraction Tool. Requires secure API key management.
- **Stripe:** For processing CFI and Flight School subscription payments. Requires integration with Stripe's API for payment processing and subscription management.
- **Resend (or similar email service):** For transactional emails (e.g., account verification, password resets, report sharing, CFI invitations).

### Testing Requirements (High-Level)

- Comprehensive unit, integration, and end-to-end (E2E) tests are required.
- Specific focus on testing the accuracy and reliability of the FAA Knowledge Test Extraction Tool (OCR and ACS matching) with a diverse set of sample test documents.
- Testing of all user authentication and authorization flows.
- Testing of subscription management workflows with Stripe.
- User Acceptance Testing (UAT) with a cohort of target users (CFIs, Students) before launch.

## Epic Overview (MVP / Current Version)

- **Epic 1: Core Platform Setup & User Management** - Goal: Establish the foundational application infrastructure, including database schema, user authentication (Student, CFI, School Admin roles), basic profile management, and landing page.
- **Epic 2: FAA Knowledge Test Extraction & Basic Reporting** - Goal: Develop the core tool for uploading FAA Knowledge Test PDFs/images, processing them via Gemini API for OCR, matching data to ACS codes, and allowing users to view extracted results and export a basic PDF report.
- **Epic 3: Student-CFI/School Linking & Basic Student Management** - Goal: Implement mechanisms for students to share reports with CFIs (triggering invitations) and for CFIs/Schools (subscribed) to invite and manage a basic list of their students and view their test reports.
- **Epic 4: Subscription Management & Premium Organizational Analytics** - Goal: Integrate Stripe for CFI/School subscriptions and develop the initial version of premium organizational analytics dashboards for subscribed users, showcasing aggregated student performance insights.
- **Epic 5: Initial Model Context Protocol (MCP) API & Deployment Prep** - Goal: Define and implement the V1 read-only API for MCP, prepare the application for initial deployment on Vercel, and conduct final testing.

## Key Reference Documents

- `docs/project-brief.md`
- `docs/architecture.md`
- `docs/epic1.md`, `docs/epic2.md`, `docs/epic3.md`, `docs/epic4.md`, `docs/epic5.md`
- `docs/tech-stack.md`
- `docs/api-reference.md` (for MCP API and internal APIs)
- `docs/testing-strategy.md`
- `docs/ui-ux-spec.md`
- `docs/database-schema.md`

## Post-MVP / Future Enhancements

- Advanced Nationwide Analytics (anonymized, aggregated data).
- Full-featured Student Dashboard (progress tracking beyond test results).
- Comprehensive Student File Storage (Passports, IDs, Endorsements for FAA compliance).
- Advanced Organization Settings (complex roles, permissions).
- Comprehensive Notification System.
- Community Page/Forum.
- Direct integration with flight scheduling systems.
- Enhanced Part 141 specific features and reporting.
- Mobile application.
- More sophisticated MCP API capabilities (read/write, more granular data).

## Change Log

| Change        | Date       | Version | Description                | Author   |
| ------------- | ---------- | ------- | -------------------------- | -------- |
| Initial Draft | 2025-05-09 | 0.1     | First draft of PRD for MVP | PM Agent |

## Initial Architect Prompt

Based on the project brief and requirements for CFIPros MVP, the following technical guidance is provided for architectural design:

### Technical Infrastructure

- **Starter Project/Template:** No specific starter template mandated, but leverage the Next.js framework's best practices.
- **Hosting/Cloud Provider:** Vercel (for Next.js frontend and serverless functions).
- **Frontend Platform:** Next.js (React).
- **Backend Platform:** Next.js API routes and serverless functions; Supabase for BaaS (database, auth, storage if reconsidered).
- **Database Requirements:** Supabase (PostgreSQL). Design schema to support user roles, student data, FAA knowledge test results (extracted data, ACS codes), and subscription information.

### Technical Constraints

- **Mandatory Third-Party Services:**
  - **Gemini API:** For OCR of FAA Knowledge Test documents.
  - **Stripe:** For subscription payment processing.
  - **Resend (or equivalent):** For transactional email delivery.
- **Data Retention Policy:** Original uploaded PDF/image files of knowledge tests are **not** to be stored post-processing in the MVP. Only extracted data and generated reports are stored.
- **Budget:** Low initial budget necessitates cost-effective solutions and efficient use of resources. Prioritize free/developer tiers of services during development if possible.
- **Modularity for Part 61/141:** The database schema and user profiles should accommodate differentiation between Part 61 and Part 141 operations, even if full feature differentiation is post-MVP. This might involve tagging users/schools or specific records.

### Deployment Considerations

- **CI/CD:** Leverage Vercel's built-in CI/CD capabilities for automated builds, previews, and deployments.
- **Environments:** Standard development, staging (preview deployments on Vercel), and production environments.

### Local Development & Testing Requirements

- The system should be runnable locally for development and testing.
- Supabase provides local development support which should be utilized.
- Testing should cover OCR accuracy, user flows, API integrations, and data integrity.

### Other Technical Considerations

- **Security:**
  - Implement robust security measures for all user data, especially extracted test information (which includes names and test details). Utilize Supabase's Row Level Security and other security features.
  - Ensure all API communication (internal and external like Gemini, Stripe) is secure.
  - The architecture should be mindful of future needs to store sensitive PII documents securely, even if not implemented in MVP. This means considering encryption strategies and access control mechanisms that can be extended.
- **OCR Accuracy and Performance:**
  - The system design should account for potential variability in Gemini API performance and OCR accuracy.
  - Consider patterns for handling OCR errors or low-confidence results (e.g., flagging for review, though manual review by admin is likely out of scope for MVP).
- **Scalability:** While MVP load is expected to be moderate, the choice of Supabase and Vercel should allow for scaling. Design database queries and backend logic efficiently.
- **API Design (MCP):** The initial MCP API should be designed with future expansion in mind, focusing on clear versioning and secure access.
- **User Experience:** The backend must support a responsive and "calm UX" frontend by providing efficient data retrieval.
