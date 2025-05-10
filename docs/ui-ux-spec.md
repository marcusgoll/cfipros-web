# CFIPros UI/UX Specification

## Introduction

This document defines the user experience (UX) goals, information architecture (IA), key user flows, and preliminary visual design specifications for the CFIPros web application's user interface (UI). It aims to ensure a consistent, intuitive, and professional user experience across the platform, aligned with the project's vision of a "calm UX."

- **Link to Primary Design Files:** {Placeholder for Figma/Sketch/Adobe XD URL - To be added when designs are available}
- **Link to Deployed Storybook / Design System:** {Placeholder for Storybook URL - To be added if a design system is developed}

## Overall UX Goals & Principles

- **Target User Personas:**
  - **Students:** Seeking to understand their FAA Knowledge Test performance and share it easily. Value simplicity and clarity.
  - **Individual CFIs:** Need efficient ways to track multiple students' test results, identify weak areas, and manage their small-scale operations. Value actionable insights and ease of use.
  - **Flight School Administrators:** Require tools to oversee multiple CFIs and a larger student body, manage subscriptions, and gain organizational insights. Value comprehensive views and administrative control.
- **Usability Goals:**
  - **Ease of Learning:** Users should quickly understand how to navigate the platform and use its core features (especially test uploading and report viewing).
  - **Efficiency of Use:** Common tasks should be accomplishable with minimal steps and cognitive load.
  - **Error Prevention & Recovery:** The UI should guide users to avoid errors and provide clear, helpful messages if errors occur.
  - **Satisfaction:** Users should find the platform pleasant, professional, and trustworthy.
- **Design Principles:**
  1.  **Clarity Above All:** Ensure information is presented clearly, jargon is minimized (or explained), and calls to action are unambiguous.
  2.  **Effortless Navigation:** Create an intuitive information hierarchy and navigation system that allows users to find what they need easily.
  3.  **Calm & Focused Experience:** Minimize clutter, distractions, and unnecessary visual noise. Emphasize elegant spacing and a sense of order.
  4.  **Professional & Trustworthy:** The design should convey competence, reliability, and security, reinforcing the professional nature of flight training.
  5.  **Consistent & Predictable:** UI elements and interaction patterns should be consistent across the application, making it predictable and easier to learn.

## Information Architecture (IA)

- **Site Map / Screen Inventory (High-Level MVP):**

  ```mermaid
  graph TD
      subgraph Public
          LP[Landing Page]
          SubLP("Pricing/Subscription Page (for CFIs/Schools)")
          Login[Login Page]
          SignupStudent[Student Signup Page]
          SignupCFI[CFI Signup Page]
          SignupSchool[School Signup Page]
          ForgotPassword[Forgot Password Page]
          ResetPassword[Reset Password Page]
      end

      subgraph Authenticated - Student
          S_Dashboard[Student Dashboard] --> S_MyReports("My Test Reports List")
          S_MyReports --> S_ViewReport("View Individual Test Report")
          S_ViewReport --> S_ShareReportModal("Share Report Modal (Email)")
          S_Profile[Student Profile Settings]
          S_Dashboard --> S_UploadTest("Upload FAA Test Page")
      end

      subgraph Authenticated - CFI / School Admin
          CS_Dashboard[CFI/School Dashboard]
          CS_Dashboard --> CS_UploadTest("Upload FAA Test Page (for own/unassigned tests)")
          CS_Dashboard --> CS_StudentList("Student Roster Page")
          CS_StudentList --> CS_StudentDetail("Student Detail Page")
          CS_StudentDetail --> CS_ViewStudentReport("View Student's Test Report")
          CS_Dashboard --> CS_OrgAnalytics("Organizational Analytics Page (Premium)")
          CS_Profile[CFI/School Profile Settings]
          CS_Subscription[Subscription Management Page]
          CS_InviteStudentModal("Invite/Add Student Modal")
      end

      LP --> Login; LP --> SignupStudent; LP --> SignupCFI; LP --> SignupSchool; LP --> SubLP;
      Login --> S_Dashboard; Login --> CS_Dashboard;
      S_Dashboard --- S_Profile;
      CS_Dashboard --- CS_Profile; CS_Dashboard --- CS_Subscription; CS_StudentList --- CS_InviteStudentModal;
  ```

- **Navigation Structure:**

  - **Public Navigation (Header):** Logo, Features, Pricing (for CFI/School), Login, Signup.
  - **Authenticated Navigation (Sidebar or Header):**
    - **Student:** Dashboard (Upload/View Reports), Profile, Logout.
    - **CFI/School:** Dashboard, Students, Analytics (Premium), Upload Test, Profile, Subscription, Logout.
  - **Footer:** Copyright, Privacy Policy, Terms of Service.
  - **Breadcrumbs:** May be used on deeper pages for clarity if needed.

## User Flows

### 1\. Student - Process and Share FAA Knowledge Test

- **Goal:** Student uploads their FAA test, views the results, and emails it to their CFI.
- **Steps / Diagram:**
  ```mermaid
  graph TD
      A[Login/Signup] --> B(Student Dashboard);
      B --> C["Click 'Upload Test'"];
      C --> D["Upload Test Page: Select/Drag PDF/Image"];
      D --> E{File Valid?};
      E -- No --> DError["Show Error (e.g., format/size)"];
      DError --> D;
      E -- Yes --> F["Processing... (Gemini OCR, ACS Match)"];
      F --> G{Process OK?};
      G -- No --> FError["Show Processing Error"];
      FError --> D;
      G -- Yes --> H["View Individual Test Report Page"];
      H --> I["Click 'Share via Email'"];
      I --> J["Share Report Modal: Enter CFI Email"];
      J --> K["Click 'Send'"];
      K --> L["Email Sent Confirmation"];
  ```

### 2\. CFI - Sign up, Subscribe, and View Organizational Analytics

- **Goal:** A new CFI signs up, subscribes, and views their organizational analytics (assuming they have linked students with test data).
- **Steps / Diagram:**
  ```mermaid
  graph TD
      Start[Landing Page] --> SignupCFI[CFI Signup Page];
      SignupCFI --> CompleteForm[Complete Signup Form];
      CompleteForm --> VerifyEmail[Verify Email (Link from inbox)];
      VerifyEmail --> LoginPage[Login Page];
      LoginPage --> PromptSub[Prompt for Subscription / Subscription Page];
      PromptSub --> SelectPlan[Select Subscription Plan];
      SelectPlan --> StripeCheckout[Stripe Checkout Process];
      StripeCheckout --> SubSuccess[Subscription Successful];
      SubSuccess --> CFIDash[CFI Dashboard];
      CFIDash --> NavAnalytics["Navigate to Organizational Analytics"];
      NavAnalytics --> ViewAnalytics[View Analytics Page];
  ```

### 3\. CFI/School - Invite Student & View Their Report

- **Goal:** A subscribed CFI/School Admin invites a student, the student accepts, and the CFI/School views one of the student's reports.
- **Steps / Diagram:**

  ```mermaid
  graph TD
      CSDash[CFI/School Dashboard] --> InvStudent["Click 'Invite Student'"];
      InvStudent --> InvModal["Invite Student Modal: Enter Student Email"];
      InvModal --> SendInvite["Send Invitation"];
      SendInvite --> StudentEmail["Student Receives Email Invitation"];

      StudentEmail --> AcceptLink["Student Clicks Accept Link"];
      AcceptLink --> StudentSignupLogin["Student Signs Up (if new) or Logs In"];
      StudentSignupLogin --> ConfirmLink["Student Confirms Linkage"];
      ConfirmLink --> LinkActive["Link Activated Notification (to CFI/Student)"];

      CSDash --> StudentRoster["View Student Roster"];
      StudentRoster --> SelectStudent["Select Linked Student"];
      SelectStudent --> StudentDetailPage["View Student Detail Page"];
      StudentDetailPage --> ViewReport["Select & View Student's Test Report"];
  ```

## Wireframes & Mockups

- {Placeholder: This section will link to specific Figma frames/pages once visual designs are created. Key screens to design include:}
  - Landing Page
  - Login / Signup Forms (for all roles)
  - Student Dashboard (Test Upload, My Reports List)
  - Individual Test Report View (with ACS codes)
  - CFI/School Dashboard
  - Student Roster Page (CFI/School view)
  - Student Detail Page (CFI/School view)
  - Organizational Analytics Page (CFI/School view)
  - Subscription Management Page
  - Profile Settings Page

## Component Library / Design System Reference

- {Placeholder: This section will link to a Storybook or Figma Library. If none, key components to define would include:}
  - **Buttons:** Primary, Secondary, Tertiary, Destructive (States: Default, Hover, Active, Disabled, Loading).
  - **Input Fields:** Text, Email, Password, File Upload (States: Default, Focused, Error, Disabled).
  - **Cards:** For displaying summaries (e.g., test reports, student summaries).
  - **Tables:** For lists (e.g., My Reports, Student Roster).
  - **Modals:** For actions like sharing, inviting.
  - **Navigation Elements:** Header, Sidebar, Tabs.
  - **Typography:** Defined set of H1-H6, body text, captions, links.
  - **Loading Indicators/Spinners.**
  - **Notifications/Alerts:** Success, Error, Info, Warning.

## Branding & Style Guide Reference

- **Color Palette:**
  - Primary: Soft Blue (e.g., `#A0C4FF` - calm, trustworthy)
  - Secondary: Slate Gray (e.g., `#6B7280` - professional, grounding)
  - Accent: Blush/Pale Peach (e.g., `#FFDAB9` - for subtle highlights or CTAs if used sparingly)
  - Neutral/Backgrounds: Off-White (e.g., `#F8F9FA`), Light Gray (e.g., `#E9ECEF`)
  - Feedback Colors: Green for success (e.g., `#73D487`), Red for error (e.g., `#FF6B6B`), Yellow for warning, Blue for info.
  - _Specific hex codes are illustrative and need refinement by a designer._
- **Typography:**
  - Primary Font Family: Inter (sans-serif, modern, highly readable).
  - Alternative Font Family: SF Pro (if targeting Apple ecosystem primarily) or Söhne.
  - Headings: Clear hierarchy with distinct sizes and weights.
  - Body Text: Optimized for readability, sufficient line height.
- **Iconography:**
  - Use a consistent, modern, and clean icon set (e.g., Feather Icons, Heroicons).
  - Icons should be simple and easily recognizable.
- **Spacing & Grid:**
  - Generous use of white space (elegant spacing).
  - Consistent margin and padding scale (e.g., 4px or 8px grid).
  - Layouts should be based on a flexible grid system for responsiveness.
- **Visual Details:**
  - Rounded corners for containers and interactive elements (e.g., 4px-8px border-radius).
  - Subtle shadows for depth on cards or modals, avoiding heavy or distracting effects.

## Accessibility (AX) Requirements

- **Target Compliance:** Strive for WCAG 2.1 Level AA for all user-facing interfaces.
- **Specific Requirements:**
  - Semantic HTML for all content.
  - Keyboard navigability for all interactive elements.
  - Sufficient color contrast between text and background (minimum 4.5:1 for normal text).
  - ARIA landmarks/attributes for complex components where necessary.
  - Focus indicators must be clear and visible.
  - Images to have appropriate alt text.
  - Forms to have proper labels and error message associations.

## Responsiveness

- **Breakpoints (Illustrative):**
  - Mobile: \< 768px
  - Tablet: 768px - 1024px
  - Desktop: \> 1024px
- **Adaptation Strategy:**
  - The application must be fully responsive and provide an optimal viewing experience across all common device sizes.
  - Navigation may collapse into a hamburger menu on smaller screens.
  - Grid layouts will reflow content appropriately.
  - Touch target sizes on mobile should be adequate.

## Change Log

| Change        | Date       | Version | Description                 | Author   |
| ------------- | ---------- | ------- | --------------------------- | -------- |
| Initial draft | 2025-05-09 | 0.1     | Initial UI/UX Specification | PM Agent |
