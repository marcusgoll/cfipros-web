# Project Brief: CFIPros

## Introduction / Problem Statement

Certified Flight Instructors (CFIs) and flight schools currently face challenges in efficiently managing the end-to-end student lifecycle, from ground school to flight training and FAA compliance. The lack of a centralized, modern hub leads to fragmented data, difficulties in tracking student performance comprehensively, and inefficiencies in preparing for FAA audits. Instructors often spend excessive time on administrative tasks rather than direct instruction, and identifying precise student readiness for checkrides or gleaning deep insights from FAA Knowledge Tests can be cumbersome. This impacts both Part 61 (less structured) and Part 141 (more structured FAA-approved) flight training programs.

CFIPros is being developed to address these critical needs by providing a singular, professional web application. It aims to be the centralized system for tracking all aspects of student flight training, ensuring data integrity for FAA compliance, and streamlining the overall instructional process with modular features adaptable to both Part 61 and Part 141 operations. Beyond efficient data management, CFIPros will offer valuable insights into student performance and their readiness for evaluations.

A key innovation will be the development and integration of the **Model Context Protocol (MCP)**. MCP is envisioned as an open protocol to standardize how applications provide context to Large Language Models (LLMs), akin to a "USB-C port for AI applications." This will enable external AI agents to connect to CFIPros' rich dataset via an API, facilitating accurate, context-aware results and paving the way for advanced AI-driven tools and insights within the flight training ecosystem.

## Vision & Goals

- **Vision:** To significantly improve flight student success rates by seamlessly connecting ground and flight training data, providing actionable insights for instructors, and ultimately helping more students confidently pass their checkrides. CFIPros aims to be the indispensable data-driven co-pilot for flight schools and CFIs.
- **Primary Goals (MVP):**
  1.  **Develop and Launch a High-Accuracy FAA Knowledge Test Extraction Tool:** Within the MVP timeframe, deliver a functional tool that accurately extracts text data from uploaded PDF or image versions of FAA Knowledge Test results using the Gemini API for OCR. This tool must then successfully match extracted information to the corresponding Airman Certification Standards (ACS) codes and descriptions stored in our database. The tool should also provide initial analytics, such as identifying commonly missed ACS sections based on aggregated user data.
  2.  **Establish a Seamless Core User Experience for CFIs/Schools:** Ensure a smooth, intuitive, and efficient user flow for account creation (signup), initial setup, and the utilization of the FAA Knowledge Test Extraction Tool. This includes easy uploading of test results and clear presentation of extracted data and basic analytics.
- **Success Metrics (Initial Ideas):**
  - **Extraction Accuracy:** Achieve a target accuracy rate (e.g., >95%) for the FAA Knowledge Test Extraction Tool in correctly identifying ACS codes from uploaded test results.
  - **Task Completion Rate:** High success rate for users completing the signup process and successfully processing at least one knowledge test result.
  - **User Feedback (Qualitative):** Positive feedback from early adopters regarding the ease of use and utility of the extraction tool and the overall platform signup/navigation.
  - **Data Generation:** Successful aggregation of anonymized ACS performance data from uploaded tests to begin building the analytics insights.

## Target Audience / Users

CFIPros will serve three primary user groups, with distinct needs and levels of access, primarily focusing on providing paid services to instructors and schools:

1.  **Individual Certified Flight Instructors (CFIs):**

    - **Characteristics:** Independent instructors, CFIs working for smaller organizations, or those who want a personal tool to manage their students. May operate under Part 61 rules.
    - **Key Needs:**
      - Efficiently track individual student progress (flight hours, ground lessons, endorsements).
      - Quickly analyze FAA Knowledge Test results to identify student weak areas.
      - Streamline record-keeping for FAA compliance and personal organization.
      - Improve teaching effectiveness with data-driven insights.
      - Easy communication and data sharing with their students.

2.  **Part 61 and Part 141 Flight/Ground Schools:**

    - **Characteristics:** Organizations ranging from small schools to larger, FAA-approved Part 141 certified institutions. They manage multiple CFIs and a larger student body, often with more stringent FAA oversight and reporting requirements (especially Part 141).
    - **Key Needs:**
      - A centralized platform for managing all student and instructor data.
      - Robust tools for ensuring and demonstrating FAA compliance and simplifying audit processes.
      - School-wide analytics on student performance, instructor effectiveness, and common challenging areas in the curriculum.
      - Administrative controls for managing user accounts (CFIs, students, staff), assigning students to instructors, and overseeing operations.
      - Modular system that can adapt to the differing operational and record-keeping requirements of Part 61 and Part 141 programs.
      - Efficient communication channels within the school (admin-CFI, CFI-student).

3.  **Flight Students:**
    - **Characteristics:** Individuals undergoing flight or ground training, from initial private pilot candidates to those pursuing advanced ratings.
    - **Key Needs (primarily when connected via a CFI/School subscription):**
      - View their training progress, logged hours, and endorsements.
      - Access and understand feedback from their FAA Knowledge Tests.
      - Communicate with their instructor or school.
      - (Potentially with free tier) Basic progress tracking or access to shared information if invited by a CFI/School.
    - The primary value for students is unlocked when their CFI or School uses CFIPros.

## Key Features / Scope (High-Level Ideas for MVP)

The MVP will focus on delivering the core FAA Knowledge Test Extraction functionality with robust reporting and a clear path for CFIs, Flight Schools, and Students to engage with the system.

1.  **User Authentication & Account Management:**

    - **Landing (Marketing) Page:** Introduces CFIPros, its value, and call-to-action.
    - **Signup/Signin Pages:** Separate, streamlined flows for Students, individual CFIs, and Flight Schools.
    - Student accounts are free, allowing use of the extraction tool for their own tests.
    - **Basic Profile Settings:** For all user types to manage account details.
    - **Subscription Management (for CFIs/Flight Schools):** Mechanism for CFIs/Schools to subscribe to unlock premium features (e.g., advanced analytics, managing multiple students comprehensively).
    - **Student-CFI Linking & Invitation:**
      - Students can email their processed test report (PDF) to their CFI.
      - If the CFI does not have an account, the email serves as an invitation to join CFIPros and view more detailed analytics for that student and others.
      - CFIs/Schools can directly invite/add their students.

2.  **Core FAA Knowledge Test Extraction & Reporting:**

    - **FAA Knowledge Test Extraction Tool Page:**
      - Upload PDF or image of FAA Knowledge Test results.
      - OCR processing (e.g., via Gemini API) to extract text.
      - ACS code lookup and matching with internal database.
      - Display of extracted data and ACS code descriptions.
      - _Data Retention Note:_ Original uploaded PDF/image files will not be stored long-term after processing; only the extracted textual data and generated reports will be retained.
    - **PDF Export of Test Reports:**
      - Any processed test report can be exported as a formatted PDF by students or CFIs/Schools.
      - If multiple tests exist for a student, a summary statistics section will be included on the front cover of the PDF report.

3.  **Dashboards & Analytics (Tiered Approach for MVP):**

    - **Student Dashboard (Basic):**
      - View their own processed FAA Knowledge Test reports.
      - Access to PDF export and email sharing features.
    - **CFI/Flight School Dashboard:**
      - Central hub for managing students and viewing test results.
      - Quick access to the extraction tool.
      - **Basic Analytics (Included with Test Processing):** View detailed breakdown of ACS codes (correct/incorrect) for each individual processed test.
      - **Premium Organizational Analytics (Subscription Required):** View aggregated insights and trends from all test results processed for _their_ students/organization (e.g., most frequently missed ACS sections across their student base, performance trends).

4.  **Reports Management Page (for Subscribed CFIs/Flight Schools):**

    - View a list of all FAA Knowledge Test reports processed for their linked students.
    - Ability to generate and view summary reports and aggregated analytics based on past uploaded data for their organization.

5.  **Student Management (for Subscribed CFIs/Flight Schools):**
    - **Student List Page:** Add, view, and manage their roster of students.
    - **Student Details Page:** Comprehensive view of an individual student, including all their processed test reports, summary statistics, and historical performance.

**Considered for Post-MVP/Future Enhancements:**

- Advanced Nationwide Analytics: Broader, anonymized industry-wide trend data based on a larger dataset.
- Full-featured Student Dashboard: More interactive elements, progress tracking beyond test results.
- Advanced Organization Settings: Complex roles, permissions, and structures for larger schools.
- Comprehensive Notification System.
- Community Page.
- Secure Student File Storage: For documents like Passports, IDs, Endorsements for FAA Compliance (planned post-MVP, but security considerations for PII should inform MVP architecture).

## Known Technical Constraints or Preferences

- **Technology Stack & Hosting Preferences:**
  - Frontend/Backend Framework: Next.js
  - Backend as a Service (BaaS) / Database: Supabase
  - Hosting Platform: Vercel
  - This stack is preferred for its development efficiency, scalability, and integrated tooling.
- **Third-Party Service Preferences:**
  - Payment Processing: Stripe (for subscriptions)
  - Email Service: Resend (for transactional emails like reports and invitations)
  - OCR & AI: Gemini API (for FAA Knowledge Test extraction)
- **Budget Constraints:**
  - The project has a **low initial budget**. This emphasizes the need for an efficiently scoped MVP, leveraging free/developer tiers of services where possible, and focusing on core functionality first.
- **Compliance & Security Considerations:**
  - **General Web Practices:** Standard cookie consent mechanisms will be required (e.g., banner for user notification and consent where applicable based on user location and relevant regulations). Best judgment should be applied to ensure compliance with common data privacy principles.
  - **Data Security:** While the MVP will not store uploaded documents, the extracted data needs to be handled securely.
  - **Future PII Storage (Post-MVP):** The long-term plan includes storing sensitive student documents (Passports, IDs, Endorsements) for FAA compliance. The MVP architecture should, where feasible without over-engineering, consider future requirements for robust security, access controls, and PII data protection to accommodate this. This implies a need for strong data encryption at rest and in transit, and careful consideration of Supabase's security features for handling such data eventually.
- **Identified Risks:**
  - **Gemini API Performance:** Potential for speed limitations or bottlenecks with the Gemini API during high-volume OCR processing could impact user experience. This should be monitored and optimized.
  - **OCR Accuracy:** Variability in the quality and format of uploaded FAA Knowledge Test PDFs/images might affect OCR accuracy, requiring robust error handling and potentially manual review mechanisms or user feedback loops if accuracy dips.
  - **Budget Constraints:** A low initial budget may limit the breadth of features or the speed of development for the MVP and subsequent iterations.

## Relevant Research (Optional)

No formal research has been conducted or provided at this stage. Market and competitor analysis may be undertaken as part of the product development lifecycle if deemed necessary later.

---
