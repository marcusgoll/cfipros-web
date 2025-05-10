---

# CFIPros API Reference

This document provides an overview of the key Application Programming Interfaces (APIs) consumed and provided by the CFIPros application for the Minimum Viable Product (MVP).

## 1. External APIs Consumed

This section details the third-party APIs that CFIPros integrates with. Secure API key management and robust error handling for these integrations are critical. (Refer to `docs/environment-vars.md` for environment variable names for API keys).

### 1.1 Google Gemini API

* **Purpose:** Used for Optical Character Recognition (OCR) to extract text from uploaded FAA Knowledge Test result documents (PDFs/images).
* **Specific Model:** Gemini 2.5 Flash
* **Authentication:** API Key managed securely on the backend.
* **Key Endpoint(s) Used (Conceptual):**
    * Endpoint for submitting image/PDF data and receiving extracted text.
    * **Note:** The integration will aim to utilize Gemini's structured output capabilities (e.g., requesting JSON output) to simplify backend parsing and improve reliability.
* **Rate Limits:** To be monitored based on Google's policies and our usage patterns.
* **Link to Official Docs:** [Google AI for Developers - Gemini API](https://ai.google.dev/gemini-api/docs) (or specific Vertex AI documentation if used via Vertex).

### 1.2 Stripe API

* **Purpose:** Handling subscription payments for CFIs and Flight Schools, managing subscription lifecycles.
* **Authentication:** Stripe API Keys (secret key on backend, publishable key on frontend where appropriate for Stripe.js/Checkout).
* **Key Functionality Used:**
    * **Stripe Checkout:** For one-time setup of subscriptions.
    * **Customers API:** To create and manage customer records in Stripe.
    * **Subscriptions API:** To create and manage subscription statuses.
    * **Webhooks:** To receive real-time updates from Stripe (e.g., `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`). An endpoint like `/api/subscriptions/stripe-webhook` will handle these.
* **Rate Limits:** Standard Stripe API rate limits apply.
* **Link to Official Docs:** [Stripe API Reference](https://stripe.com/docs/api)

### 1.3 Resend API

* **Purpose:** Sending transactional emails (e.g., account verification, password resets, report sharing, CFI/student invitations).
* **Authentication:** Resend API Key managed securely on the backend.
* **Key Endpoint(s) Used:**
    * `POST /emails`: To send emails.
* **Rate Limits:** Based on Resend's plan and policies.
* **Link to Official Docs:** [Resend API Reference](https://resend.com/docs/api-reference/introduction)

### 1.4 Puppeteer (as a service for PDF Generation)

* **Purpose:** While not an external API in the traditional sense, Puppeteer will be used in a serverless function (effectively an internal service endpoint) to generate PDF reports.
* **Interaction:** The backend API route for PDF generation will invoke a serverless function that uses Puppeteer to render HTML content (based on test report data) into a PDF.
* **Authentication:** Internal access control; not publicly exposed.

## 2. Internal APIs Provided (Next.js API Routes)

These are the primary backend API endpoints provided by CFIPros, consumed by the Next.js frontend. They are organized by resource and follow RESTful principles where applicable. All endpoints are under the `/api/` path. Authentication is handled via Supabase JWTs, and authorization via Supabase Row Level Security (RLS) and application-level checks.

* **Authentication (`/api/auth/...`)**
    * Endpoints for Supabase Auth callbacks (e.g., `/api/auth/callback`), retrieving user session state.
    * `POST /api/auth/password-reset-request`: Initiates a password reset flow.
        * Request Body: `{ "email": "user@example.com" }`
    * `POST /api/auth/update-password`: Updates user password using a reset token or current password.
        * Request Body: (Varies based on flow, e.g., `{ "token": "...", "new_password": "..." }` or `{ "current_password": "...", "new_password": "..." }`)

* **User Profiles (`/api/profiles/...`)**
    * `GET /api/profiles/me`: Get current authenticated user's profile.
        * Response: UserProfile object.
    * `PUT /api/profiles/me`: Update current authenticated user's profile.
        * Request Body: Partial UserProfile object (e.g., `{ "full_name": "...", "preferences": {...}, "part_61_or_141_type": "PART_61" }`).
        * Response: Updated UserProfile object.

* **Knowledge Tests (`/api/knowledge-tests/...`)**
    * `POST /api/knowledge-tests/upload`: Upload FAA knowledge test document for processing.
        * Request: `FormData` containing the file.
        * Response (Success): `{ "reportId": "uuid", "status": "PENDING" }` or full `KnowledgeTestReport` if processing is immediate.
        * Response (Error): `{ "error": "Error message" }`
    * `GET /api/knowledge-tests`: List all knowledge test reports for the current user (or students of a CFI/School, based on RLS).
        * Query Parameters: `student_user_id` (optional, for CFIs/Admins to specify a student).
        * Response: Array of `KnowledgeTestReport` objects.
    * `GET /api/knowledge-tests/{testId}`: Get details of a specific knowledge test report.
        * Response: `KnowledgeTestReport` object (including `processed_acs_items`).
    * `GET /api/knowledge-tests/{testId}/pdf`: Generate and download the PDF report for a specific test.
        * Response: PDF file stream.
    * `DELETE /api/knowledge-tests/{testId}`: Soft delete a knowledge test report.
        * Response: Success/failure message.

* **Schools (`/api/schools/...`)**
    * `POST /api/schools`: Create a new school (School Admin only).
        * Request Body: School object data (name, part\_61\_or\_141\_type, description, etc.).
        * Response: Created School object.
    * `GET /api/schools/{schoolId}`: Get school details (accessible to linked CFIs, admins).
        * Response: School object.
    * `PUT /api/schools/{schoolId}`: Update school details (School Admin only).
        * Request Body: Partial School object.
        * Response: Updated School object.
    * `DELETE /api/schools/{schoolId}`: Soft delete a school (School Admin only).
        * Response: Success/failure message.

* **Invitations (`/api/invitations/...`)**
    * `POST /api/invitations`: Create and send an invitation.
        * Request Body: `{ "invitee_email": "...", "invitee_name": "...", "role_to_invite": "CFI" | "STUDENT" | null, "target_entity_type": "...", "target_entity_id": "uuid" | null }`
        * Response: Created Invitation object (excluding token for general view).
    * `GET /api/invitations/validate/{token}`: Validate an invitation token (used when invitee clicks link, before showing signup or acceptance UI).
        * Response: `{ "valid": true, "invitation_details": { ... } }` or `{ "valid": false, "error": "..." }`.
    * `POST /api/invitations/accept/{token}`: Accept an invitation (creates user if new, creates relevant link).
        * Request Body: (May include signup details if new user).
        * Response: Success message, potentially new user session.
    * `POST /api/invitations/decline/{token}`: Decline an invitation.
        * Response: Success message.
    * `GET /api/invitations/sent`: List invitations sent by the current user.
    * `DELETE /api/invitations/{invitationId}`: Cancel/revoke a pending invitation (by inviter).

* **Links (`/api/links/...`)** (For managing established relationships - typically only delete/inactivate actions)
    * `PUT /api/links/student-cfi/{linkId}/inactivate`: Mark a student-CFI link as inactive (soft delete).
    * `PUT /api/links/cfi-school/{linkId}/inactivate`: Mark a CFI-school link as inactive (soft delete).
    * `PUT /api/links/student-school/{linkId}/inactivate`: Mark a student-school link as inactive (soft delete).
    * (Listing links is generally part of fetching student, CFI, or school details which would include their active links).

* **Student Report Summaries (`/api/student-report-summaries/...`)**
    * `POST /api/student-report-summaries`: Create a new summary definition.
        * Request Body: `{ "student_user_id": "uuid", "name": "Summary Name", "report_ids": ["uuid1", "uuid2"] }`
        * Response: Created `ReportSummary` object (with items).
    * `GET /api/student-report-summaries?student_user_id={uuid}`: List summaries for a specific student (accessible to student, linked CFI/School Admin).
        * Response: Array of `ReportSummary` objects.
    * `GET /api/student-report-summaries/{summaryId}`: Get details of a specific summary.
        * Response: `ReportSummary` object (with items).
    * `PUT /api/student-report-summaries/{summaryId}`: Update a summary's name or the set of included reports.
        * Request Body: `{ "name": "New Summary Name", "report_ids": ["uuid1", "uuid3"] }`
        * Response: Updated `ReportSummary` object.
    * `DELETE /api/student-report-summaries/{summaryId}`: Soft delete a summary definition.
        * Response: Success/failure message.
    * `GET /api/student-report-summaries/{summaryId}/pdf`: Generate and download the PDF for this summary.
        * Response: PDF file stream.

* **Subscriptions (`/api/subscriptions/...`)**
    * `POST /api/subscriptions/checkout-session`: Create a Stripe Checkout session for initiating a new subscription.
        * Request Body: `{ "price_id": "stripe_price_id", "school_id": "uuid" (optional if School Admin subscribing for school) }`
        * Response: `{ "sessionId": "stripe_checkout_session_id" }`
    * `GET /api/subscriptions/manage-portal`: Get a URL for the Stripe customer portal to manage existing subscription.
        * Response: `{ "portal_url": "stripe_portal_url" }`
    * `POST /api/subscriptions/stripe-webhook`: Handles incoming webhooks from Stripe. This endpoint is called by Stripe, not the frontend.
        * Request: Stripe webhook event payload.
        * Response: `200 OK` or appropriate error code.

* **Analytics (`/api/analytics/...`)**
    * `GET /api/analytics/organization`: Get premium organizational analytics for subscribed CFIs/Schools.
        * Query Parameters: `school_id` (if applicable, for School Admin), `cfi_id` (if applicable, for CFI).
        * Response: JSON object with aggregated data (e.g., most missed ACS codes for the organization, average scores, trends. Includes school-wide and potentially nationwide anonymized data if subscribed).

* **Error Handling:** APIs will use standard HTTP status codes (e.g., 200, 201, 400, 401, 403, 404, 500) and return JSON error responses with a clear message: `{ "error": "Descriptive error message" }`.

## 3. Model Context Protocol (MCP) API Provided (V1)

This API is designed for authenticated external AI agents. For V1, it provides read-only access to the CFIPros ACS code definitions.

* **Base URL:** `/api/mcp/v1`
* **Authentication:** API Key based. Clients must include the API key in the `X-MCP-API-Key` HTTP header with each request.
    * Example: `X-MCP-API-Key: your_actual_api_key_here`
    * **Key Management:** API keys are generated and issued manually by CFIPros administrators for trusted partners during the MVP phase. The provided API key should be kept confidential by the client. The system stores a secure hash of the key for validation (see `docs/data-models.md` - `mcp_api_keys` table).
* **Endpoints:**
    * **`GET /api/mcp/v1/acs-codes/lookup`**
        * Description: Retrieve details for one or more specific ACS codes.
        * Query Parameters:
            * `ids` (required, string): Comma-separated list of ACS code IDs (e.g., "CA.I.A.K1,CA.I.B.K2"). URL-encoded if necessary.
        * Success Response (Code: `200 OK`):
            ```json
            {
              "data": [
                {
                  "id": "CA.I.A.K1",
                  "description": "Certification requirements, recent flight experience, and recordkeeping.",
                  "area": "Preflight Preparation",
                  "task": "Pilot Qualifications",
                  "sub_task": "Certification, Experience, Recordkeeping",
                  "knowledge_area": "Regulations",
                  "exam_type": "CAX"
                }
                // ... other found ACS code objects
              ],
              "errors": [ // Array of objects for IDs that were not found or had issues
                // { "id": "INVALID.CODE", "error": "ACS code not found." }
              ]
            }
            ```
        * Error Responses:
            * `400 Bad Request`: If `ids` parameter is missing, malformed, or exceeds a reasonable limit.
            * `401 Unauthorized`: If API key is missing or invalid.
            * `403 Forbidden`: If API key is not authorized for this resource or is inactive.
            * `429 Too Many Requests`: If rate limits are exceeded.
* **Rate Limiting:** API access will be subject to rate limits based on the provided API key to ensure fair usage and system stability. Specific rate limits (e.g., requests per minute/hour) can be defined per key in the `mcp_api_keys` table and will be enforced by the API middleware. Clients exceeding the rate limit will receive a `429 Too Many Requests` HTTP status code.

## Change Log

| Change        | Date       | Version | Description                  | Author         |
| :------------ | :--------- | :------ | :--------------------------- | :------------- |
| Initial draft | 2025-05-09 | 0.1     | First draft of API Reference | Architect Gem  |
| Revisions 1   | 2025-05-09 | 0.2     | MCP API updates, Gemini structured output note, new student report summaries endpoints. | Architect Gem  |
| Full Document | 2025-05-09 | 0.3     | Generated full API reference document with all sections. | Architect Gem  |
| MCP Auth/Rate | 2025-05-09 | 0.4     | Added details on MCP API key authentication, management, and rate limiting. | Architect Gem  |

---
