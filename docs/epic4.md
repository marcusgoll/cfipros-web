# Epic 4: Subscription Management & Premium Organizational Analytics

**Epic Number:** 4
**Title:** Subscription Management & Premium Organizational Analytics
**Status:** To Do
**Priority:** High
**Product Owner:** TBD
**Assigned Team:** TBD
**Sprint Allocation:** Sprint 5-6 (Estimate)

**Goal:** Integrate Stripe for CFI and Flight School subscriptions, manage subscription statuses, and develop the MVP version of premium organizational analytics dashboards, providing tangible value for subscribed users through aggregated insights.

**Description:**
This epic introduces the monetization aspect for CFIs and Flight Schools and delivers a key premium feature: organizational analytics. It involves integrating Stripe to handle recurring subscription payments, managing the lifecycle of subscriptions (activation, cancellation, payment failures), and gating access to premium features based on subscription status. The premium organizational analytics will provide CFIs and Schools with aggregated views of their students' performance on FAA Knowledge Tests, such as identifying commonly missed ACS sections across their student base and tracking performance trends.

**User Stories:**

| Story ID | User Story                                                                                                                                                           | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                       | Priority | Estimate | Status | Dependencies          | Notes                                                                                                  |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------- | :----- | :-------------------- | :----------------------------------------------------------------------------------------------------- |
| E4-S1    | As a Developer, I want to integrate Stripe SDK/API for payment processing, so that CFIs and Schools can subscribe.                                                   | - Stripe SDK (e.g., Stripe.js for frontend, official Node.js library for backend) integrated.\<br\>- Secure configuration of Stripe API keys (publishable and secret).\<br\>- Products and Prices for CFI/School subscriptions set up in the Stripe dashboard (as per E1-S16).                                                                                                                                                                            | Critical | 3 SP     | To Do  | E1, E1-S16            | E1-S16 sets up Stripe products/prices and DB. This story focuses on SDK integration.                   |
| E4-S2    | As a CFI/School Admin, I want to be able to select a subscription plan and pay for it using Stripe, so I can unlock premium features.                                | - UI page(s) displaying subscription plan options (from E1-S16 Stripe setup).\<br\>- Integration with Stripe Checkout for a secure payment experience.\<br\>- Successful payment creates/updates a subscription record in Stripe and updates the user's/school's status in CFIPros DB (via E4-S3 webhook).                                                                                                                                                | Critical | 4 SP     | To Do  | E4-S1, E1-S16         | Define MVP subscription tiers clearly (done in E1-S16).                                                |
| E4-S3    | As a Developer, I want to implement a webhook handler for Stripe events, so that subscription status changes are automatically reflected in CFIPros.                 | - Backend endpoint created to securely receive webhook events from Stripe (e.g., `invoice.payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`).\<br\>- Webhook signature verification implemented.\<br\>- Logic to update user/school subscription status in Supabase `subscriptions` table (from E1-S16) based on these events.                              | Critical | 3 SP     | To Do  | E4-S1, E1-S16         | Essential for keeping subscription states in sync. Builds on basic status from E1-S16.                 |
| E4-S4    | As a Developer, I want to gate access to premium features based on subscription status, so that only paying users can use them.                                      | - Backend logic/middleware checks user's/school's subscription status (from `subscriptions` table / E1-S16) before allowing access to premium features (e.g., organizational analytics, advanced student management from Epic 3).\<br\>- Frontend UI elements for premium features are hidden or disabled for non-subscribed/lapsed users, with a prompt to subscribe/renew.                                                                              | Critical | 2 SP     | To Do  | E1-S16, E4-S3         | Applies to features in Epic 3 and E4-S6, E4-S7. Relies on status from E1-S16, kept updated by E4-S3.   |
| E4-S5    | As a subscribed CFI/School Admin, I want a basic "Subscription Management" page, so I can view my current plan, billing history, and cancel my subscription.         | - UI page showing current subscription plan details (name, price, renewal date).\<br\>- Link to Stripe's customer portal for managing payment methods and viewing billing history (simplifies PCI compliance).\<br\>- Option to cancel subscription (triggers cancellation in Stripe and updates status in CFIPros DB via webhook or direct API call).                                                                                                    | High     | 3 SP     | To Do  | E4-S2, E4-S3          | Leveraging Stripe customer portal is recommended for MVP.                                              |
| E4-S6    | As a subscribed CFI/School Admin, I want to see an MVP "Premium Organizational Analytics" dashboard, so I can get insights into my students' collective performance. | - Dedicated dashboard page for organizational analytics.\<br\>- Defines key MVP metrics: e.g., Most Frequently Missed ACS Sections (across all linked students), Overall Average Score Trend (for the organization over time), Pass/Fail Rate (if applicable from test data).\<br\>- Data is aggregated from all linked students' processed test reports.\<br\>- Clear and simple visualizations (e.g., bar charts for ACS codes, line chart for trends). | High     | 5 SP     | To Do  | E2 (Data), E3 (Links) | This is a core value proposition for paid tiers. Needs careful definition of what "MVP analytics" are. |
| E4-S7    | As a Developer, I need to implement the backend logic to aggregate data for the premium organizational analytics, ensuring it's performant.                          | - Database queries and/or serverless functions to calculate aggregated metrics from `knowledge_tests` and `test_acs_items` tables for a given CFI/School.\<br\>- Ensure queries are optimized for performance, especially as data grows.\<br\>- Data should be filterable by date ranges if feasible for MVP.\<br\>- Anonymize or ensure privacy is respected when aggregating.                                                                           | High     | 4 SP     | To Do  | E2-S8, E3-S7          | Consider using Supabase database functions or views for complex aggregations.                          |
| E4-S8    | As a CFI/School Admin, if my subscription payment fails, I want to be clearly notified and guided on how to update my payment information.                           | - System detects payment failure (via Stripe webhook E4-S3).\<br\>- User's access to premium features may be temporarily suspended (grace period TBD).\<br\>- In-app notification and email sent to user about payment failure.\<br\>- Clear instructions/link to update payment method (ideally via Stripe customer portal).                                                                                                                             | Medium   | 2 SP     | To Do  | E4-S3, E4-S5          |                                                                                                        |

**Out of Scope for this Epic:**

- Multiple complex subscription tiers with vastly different feature sets for MVP (aim for simplicity first).
- Usage-based billing.
- Free trials that automatically convert to paid (manual upgrade path is fine for MVP).
- Highly customizable or drill-down analytics beyond the defined MVP set.
- Proration for upgrades/downgrades if multiple tiers were in MVP.

**Assumptions:**

- Stripe is the chosen payment processor.
- A clear definition of what constitutes "premium organizational analytics" for MVP is available.
- CFIs/Schools see value in aggregated student data.

**Risks:**

- Complexity of Stripe integration, especially webhook handling and ensuring subscription states are always in sync.
- Defining and implementing analytics that are genuinely valuable and performant within MVP scope.
- Potential for payment disputes or issues requiring customer support (manual support process for MVP).

**Dependencies:**

- Completed User Authentication (Epic 1) and Basic Subscription Setup (E1-S16).
- Availability of student test data (Epic 2) and student-CFI/School links (Epic 3) for analytics.
- Stripe account setup with defined products/prices (covered by E1-S16).
- UI/UX designs for subscription pages and analytics dashboard.

**Metrics for Success:**

- Successful processing of subscription payments via Stripe.
- High adoption rate of premium subscriptions among target CFI/School users.
- Positive feedback on the value and usability of premium organizational analytics.
- Subscription statuses accurately reflect in the system and correctly gate feature access.
