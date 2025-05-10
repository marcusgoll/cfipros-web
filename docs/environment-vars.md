---

# CFIPros Environment Variables

This document outlines the environment variables required for the CFIPros application to run correctly in different environments (local development, staging, production).

## Configuration Loading Mechanism

* **Local Development:** Environment variables are loaded from a `.env.local` file at the root of the project. This file should be listed in `.gitignore` and not committed to the repository. An `.env.example` file will be provided as a template.
* **Deployment (Vercel):** Environment variables are configured directly in the Vercel project settings for each environment (Development, Preview/Staging, Production).

## Required and Optional Variables

| Variable Name                      | Description                                                                 | Example / Default Value                                  | Required? | Sensitive? | Notes                                                                                                |
| :--------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------- | :-------- | :--------- | :--------------------------------------------------------------------------------------------------- |
| **General Next.js** |                                                                             |                                                          |           |            |                                                                                                      |
| `NEXT_PUBLIC_APP_URL`              | The canonical public URL of the application.                                | `http://localhost:3000` (dev) / `https://cfipros.com` (prod) | Yes       | No         | Used for absolute URLs, metadata, email links.                                                       |
| `NODE_ENV`                         | Runtime environment.                                                        | `development` / `production` / `test`                    | Yes       | No         | Set automatically by Next.js/Vercel.                                                                 |
| **Supabase** |                                                                             |                                                          |           |            |                                                                                                      |
| `NEXT_PUBLIC_SUPABASE_URL`         | Public URL for your Supabase project.                                       | `https://<project_ref>.supabase.co`                      | Yes       | No         | Used by the Supabase JS client on the frontend.                                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Public anonymous key for your Supabase project.                             | `ey...`                                                  | Yes       | No         | Used by the Supabase JS client on the frontend for unauthenticated requests and initial auth.        |
| `SUPABASE_SERVICE_ROLE_KEY`        | Secret service role key for backend operations requiring elevated privileges. | `ey...`                                                  | Yes       | Yes        | **Never expose on client-side.** Used for admin tasks, calling db functions with `security definer`. |
| `SUPABASE_DB_PASSWORD`             | Database password (if direct DB access is ever needed outside Supabase API).  | `your_db_password`                                       | For Setup | Yes        | Usually not directly used by app code if relying on Supabase JS client and service role key.         |
| `SUPABASE_JWT_SECRET`              | Secret for signing Supabase JWTs.                                           | `your_jwt_secret`                                        | Yes       | Yes        | Ensure this matches the JWT secret in your Supabase project settings.                              |
| **Google Gemini API** |                                                                             |                                                          |           |            |                                                                                                      |
| `GEMINI_API_KEY`                   | API Key for accessing Google Gemini 2.5 Flash API.                          | `AIza...`                                                | Yes       | Yes        | Used by the backend for OCR processing.                                                              |
| **Stripe** |                                                                             |                                                          |           |            |                                                                                                      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable API key.                                                 | `pk_test_...` / `pk_live_...`                            | Yes       | No         | Used by Stripe.js on the frontend.                                                                   |
| `STRIPE_SECRET_KEY`                | Stripe secret API key.                                                      | `sk_test_...` / `sk_live_...`                            | Yes       | Yes        | Used by the backend for payment processing and subscription management.                            |
| `STRIPE_WEBHOOK_SECRET`            | Secret for verifying Stripe webhook signatures.                             | `whsec_...`                                              | Yes       | Yes        | Used by the `/api/subscriptions/stripe-webhook` endpoint.                                          |
| **Resend** |                                                                             |                                                          |           |            |                                                                                                      |
| `RESEND_API_KEY`                   | API Key for Resend email service.                                           | `re_...`                                                 | Yes       | Yes        | Used by the backend for sending transactional emails.                                                |
| `RESEND_FROM_EMAIL`                | The "From" email address for emails sent by the application.                | `noreply@cfipros.com`                                    | Yes       | No         | Must be a verified domain/sender in Resend.                                                          |
| **Application Specific** |                                                                             |                                                          |           |            |                                                                                                      |
| `APP_SECRET`                       | A secret key for general application purposes (e.g., signing invitation tokens). | `generate_a_strong_random_string`                        | Yes       | Yes        | Used for hashing/signing internal tokens or data.                                                    |
| `NEXT_PUBLIC_MCP_API_URL`          | Base URL for the MCP API (if different from app URL, likely not for V1).    | `https://cfipros.com/api/mcp/v1`                         | No        | No         | Primarily for documentation or if MCP clients are external to the Next.js app.                     |
| `PUPPETEER_EXECUTABLE_PATH`        | Path to Chromium executable for Puppeteer (mainly for local dev).           | `/usr/bin/google-chrome-stable` (example)                | Dev Only  | No         | On Vercel, Puppeteer often uses a bundled Chromium (e.g., via `@sparticuz/chromium-min`).            |

## Notes

* **`NEXT_PUBLIC_` Prefix:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should not contain sensitive information.
* **Security:** Sensitive variables (API keys, secrets) must be managed securely and never committed to the repository. Use Vercel's environment variable management for deployed environments.
* **`.env.example` File:** An `.env.example` file should be maintained in the root of the project. It should list all required environment variables with placeholder or example values (but no actual secrets). Developers can copy this to `.env.local` and fill in their actual values for local development. Example:
    ```ini
    # .env.example

    # General Next.js
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # For backend use only
    SUPABASE_JWT_SECRET=your_supabase_jwt_secret

    # Google Gemini API
    GEMINI_API_KEY=your_gemini_api_key

    # Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk_key
    STRIPE_SECRET_KEY=your_stripe_sk_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

    # Resend
    RESEND_API_KEY=your_resend_api_key
    RESEND_FROM_EMAIL=noreply@example.com

    # Application Specific
    APP_SECRET=a_very_strong_random_secret_for_dev
    ```
* **Validation:** Consider implementing a check at application startup (especially in development) to ensure all required environment variables are present. This can save debugging time.
* **Vercel Configuration:** When deploying to Vercel, these variables (especially sensitive ones) will be configured in the "Environment Variables" section of the Vercel project settings. Ensure different values are used for Development, Preview (Staging), and Production environments as appropriate (e.g., test vs. live API keys for Stripe).

## Change Log

| Change        | Date       | Version | Description                  | Author         |
| :------------ | :--------- | :------ | :--------------------------- | :------------- |
| Initial draft | 2025-05-09 | 0.1     | First draft of environment variables list | Architect Gem  |

---
