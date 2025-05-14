# Story Draft Checklist

The Scrum Master should use this checklist to validate that each story contains sufficient context for a developer agent to implement it successfully, while assuming the dev agent has reasonable capabilities to figure things out. **Crucially, the story must also be structured to meet the project's Definition of Done (DoD) as outlined in `docs/definition-of-done.md`.**

## 1. GOAL & CONTEXT CLARITY

- [ ] Story goal/purpose is clearly stated
- [ ] Relationship to epic goals is evident
- [ ] How the story fits into overall system flow is explained
- [ ] Dependencies on previous stories are identified (if applicable)
- [ ] Business context and value are clear

## 2. REQUIREMENTS & ACCEPTANCE CRITERIA

- [ ] Detailed requirements are copied from the epic and are unambiguous.
- [ ] Acceptance Criteria (ACs) are copied from the epic.
- [ ] **ACs are INVEST:**
  - [ ] Independent
  - [ ] Negotiable
  - [ ] Valuable
  - [ ] Estimable
  - [ ] Small
  - [ ] Testable (clear pass/fail conditions)
- [ ] Potential edge cases and error scenarios considered.

## 3. TECHNICAL IMPLEMENTATION GUIDANCE

- [ ] Key files to create/modify are identified (not necessarily exhaustive)
- [ ] Technologies specifically needed for this story are mentioned
- [ ] Critical APIs or interfaces are sufficiently described
- [ ] Necessary data models or structures are referenced
- [ ] Required environment variables are listed (if applicable)
- [ ] Any exceptions to standard coding patterns are noted

## 4. REFERENCE EFFECTIVENESS

- [ ] References to external documents point to specific relevant sections (e.g., `docs/architecture.md#section-xyz`).
- [ ] Critical information from previous stories is summarized (not just referenced).
- [ ] Context is provided for why references are relevant.
- [ ] References use consistent format.

## 5. SELF-CONTAINMENT ASSESSMENT

- [ ] Core information needed is included (not overly reliant on external docs).
- [ ] Implicit assumptions are made explicit.
- [ ] Domain-specific terms or concepts are explained.

## 6. TESTING GUIDANCE

- [ ] Required testing approach is outlined (Unit, Integration, Manual).
- [ ] Key test scenarios are identified for each AC.
- [ ] Success criteria for tests are clear.
- [ ] Prompts for automated verification where feasible (aligns with DoD section 4).
- [ ] Special testing considerations are noted (if applicable).

## 7. DEFINITION OF DONE (DoD) COMPLIANCE (`docs/definition-of-done.md`)

- [ ] **Story Structure for DoD:** The story template is populated in a way that prompts the developer agent to address all relevant DoD criteria.
- [ ] **Requirements & ACs (DoD 3.1):**
  - [ ] Story requirements and ACs are clear and complete.
  - [ ] ACs are framed to be testable and meet quality standards.
- [ ] **Design & Implementation Guidance (DoD 3.2):**
  - [ ] Sufficient guidance is provided for adhering to architecture, tech stack, and coding standards.
  - [ ] Prompts for consideration of security, configuration, and data models.
- [ ] **Testing & Verification Guidance (DoD 3.3):**
  - [ ] Story prompts for comprehensive unit and integration tests (where applicable).
  - [ ] Guidance for manual tests (if needed) is clear.
  - [ ] Explicitly mentions need for AC verification.
- [ ] **Documentation & Handover Prompts (DoD 3.4):**
  - [ ] Story includes reminders/sections for inline comments and updating story/project documentation.
- [ ] **Automated Verification (DoD 4):**
  - [ ] Story encourages or specifies areas for automated verification.

## VALIDATION RESULT

| Category                              | Status            | Issues (Reference DoD section if applicable) |
| ------------------------------------- | ----------------- | -------------------------------------------- |
| 1. Goal & Context Clarity             | PASS/FAIL/PARTIAL |                                              |
| 2. Requirements & Acceptance Criteria | PASS/FAIL/PARTIAL |                                              |
| 3. Technical Implementation Guidance  | PASS/FAIL/PARTIAL |                                              |
| 4. Reference Effectiveness            | PASS/FAIL/PARTIAL |                                              |
| 5. Self-Containment Assessment        | PASS/FAIL/PARTIAL |                                              |
| 6. Testing Guidance                   | PASS/FAIL/PARTIAL |                                              |
| 7. DoD Compliance                     | PASS/FAIL/PARTIAL |                                              |

**Final Assessment:**

- READY: The story provides sufficient context for implementation and aligns with DoD.
- NEEDS REVISION: The story requires updates (see issues).
- BLOCKED: External information required (specify what information).
