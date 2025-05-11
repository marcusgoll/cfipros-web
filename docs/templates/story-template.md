# Story {EpicNum}.{StoryNum}: {Short Title Copied from Epic File}

**Status:** Draft | In-Progress | Complete

**DoD Reference:** All aspects of this story must adhere to the standards outlined in `docs/definition-of-done.md`.

## Goal & Context

**User Story:** {As a [role], I want [action], so that [benefit] - Copied or derived from Epic file}

**Context:** {Briefly explain how this story fits into the Epic's goal and the overall workflow. Mention the previous story's outcome if relevant. Example: "This story builds upon the project setup (Story 1.1) by defining the S3 resource needed for state persistence..."}

## Detailed Requirements

{Copy the specific requirements/description for this story directly from the corresponding `docs/epicN.md` file. Ensure these requirements are clear and testable, aligning with DoD principles.}

## Acceptance Criteria (ACs)

{Copy the Acceptance Criteria for this story directly from the corresponding `docs/epicN.md` file. **Ensure each AC is written to be INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable) and directly supports the DoD. These ACs will form the basis for verification and PR checklists.**}

- AC1: ...
- AC2: ...
- ACN: ...

## Technical Implementation Context

**Guidance:** Use the following details for implementation. Refer to the linked `docs/` files for broader context if needed. **All implementation details must align with `docs/definition-of-done.md` criteria.**

- **Relevant Files:**
  - Files to Create: {e.g., `src/services/s3-service.ts`, `test/unit/services/s3-service.test.ts`}
  - Files to Modify: {e.g., `lib/hacker-news-briefing-stack.ts`, `src/common/types.ts`}
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - {e.g., TypeScript, Node.js 22.x, AWS CDK (`aws-s3` construct), AWS SDK v3 (`@aws-sdk/client-s3`), Jest}
  - {If a UI story, mention specific frontend libraries/framework features (e.g., React Hooks, Vuex store, CSS Modules)}
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - {e.g., "Use `@aws-sdk/client-s3`: `S3Client`, `GetObjectCommand`, `PutObjectCommand`.", "Handle `NoSuchKey` error specifically for `GetObjectCommand`."}
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:** (ONLY IF THIS IS A UI Focused Epic or Story)
  - {Ensure alignment with `docs/ui-ux-spec.md` and relevant DoD quality standards for UI.}

- **Data Structures:**
  - {e.g., "Define/Use `AppState` interface in `src/common/types.ts`: `{ processedStoryIds: string[] }`.", "Handle JSON parsing/stringifying for state."}
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - {e.g., `S3_BUCKET_NAME` (Read via `config.ts` or passed to CDK)}
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - {e.g., "Use `async/await` for all S3 calls.", "Implement error logging using `console.error`.", "Follow `kebab-case` for filenames, `PascalCase` for interfaces."}
  - **Ensure all code adheres to `docs/coding-standards.md` and DoD section 3.2.**

## Tasks / Subtasks

{Copy the initial task breakdown from the corresponding `docs/epicN.md` file and expand or clarify as needed to ensure the agent can complete all AC. The agent can check these off as it proceeds. **Each task should contribute to meeting the DoD.**}

- [ ] Task 1
- [ ] Task 2
  - [ ] Subtask 2.1
- [ ] Task 3

## Testing Requirements

**Guidance:** Verify implementation against the ACs using the following tests. **All testing must satisfy the criteria in `docs/definition-of-done.md` (section 3.3) and align with `docs/testing-strategy.md`.**

- **Unit Tests:**
  - {e.g., "Write unit tests for `src/services/s3-service.ts`. Mock `S3Client` and its commands (`GetObjectCommand`, `PutObjectCommand`). Test successful read/write, JSON parsing/stringifying, and `NoSuchKey` error handling."}
  - **Ensure adequate code coverage and that all new/modified logic is unit tested.**
- **Integration Tests:**
  - {e.g., "No specific integration tests required for _just_ this story's module, but it will be covered later in `test/integration/fetch-flow.test.ts`."}
  - **Specify if integration tests are needed and what interactions they should cover.**
- **Manual/CLI Verification:**
  - {e.g., "Not applicable directly, but functionality tested via `npm run fetch-stories` later."}
  - **Document clear steps if manual verification is required for any ACs. Prioritize automated verification where possible.**
- **Automated Verification:**
  - {Prompt for or describe any specific automated tests (e.g., end-to-end, performance) that should be created or updated for this story, supporting DoD section 3.3 and 4.}

## DoD Checklist (Story Specific Points)

- [ ] **Requirements & ACs:** All criteria in DoD section 3.1 met.
- [ ] **Design & Implementation:** All criteria in DoD section 3.2 met.
- [ ] **Testing & Verification:** All criteria in DoD section 3.3 met.
- [ ] **Documentation & Handover:** All criteria in DoD section 3.4 met.
- [ ] **Story Management:** All criteria in DoD section 3.5 met.
- _(Note: This is a reminder; detailed checks are in `docs/definition-of-done.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed. Specifically note how DoD was met or any challenges.}
- **Change Log:** {Track changes _within this specific story file_ if iterations occur}
  - Initial Draft
  - ...
