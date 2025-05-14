# Contributing to CFIPros

We're excited that you're interested in contributing to CFIPros! This document outlines our guidelines for contributions, including our Git workflow, commit message conventions, and pull request process.

## 🤝 Code of Conduct

While we don't have a formal Code of Conduct document yet, we expect all contributors to interact respectfully and constructively. Please be mindful of others and help create a positive and welcoming environment for everyone.

## 📋 Definition of Done

All contributions to CFIPros must meet our Definition of Done (DoD) criteria before they can be considered complete. Our DoD ensures consistent quality across the project and provides clear guidelines for what constitutes completed work.

The full DoD can be found in [docs/definition-of-done.md](docs/definition-of-done.md). In summary, the DoD covers:

- Requirements fulfillment and acceptance criteria
- Code quality and implementation standards
- Testing and verification requirements
- Documentation and knowledge sharing

When submitting a PR, you must check all applicable items in the DoD checklist. If you need an exception to any DoD criteria, please follow the exceptions process documented in the DoD.

## 🌳 Git Branching Strategy

We follow a Gitflow-like branching model with some simplifications suitable for our project size and team.

- **`main`**: This branch represents the latest production-ready code. All direct commits to `main` are forbidden. Merges to `main` happen only from the `develop` branch after thorough testing and represent a new release.
- **`develop`**: This is the primary development branch. All feature branches are created from `develop` and merged back into `develop`. This branch should always be stable enough for internal testing and represent the latest delivered development changes for the next release.
- **`feature/<feature-name>`**: Feature branches are used for developing new features or significant changes. They should be branched off `develop`.
  - Example: `feature/user-authentication`, `feature/faa-test-parser`
  - Use kebab-case for branch names (e.g., `feature/new-dashboard-widget`).
- **`bugfix/<bug-description>`**: For fixing bugs found in `develop` or `main`. Branched from `develop` (for upcoming release bugs) or `main` (for hotfixes to production).
  - Example: `bugfix/login-redirect-issue`
- **`hotfix/<hotfix-description>`**: Used for critical production bugs that need immediate attention. Branched from `main` and, once fixed and tested, merged back into both `main` and `develop`.

**General Branching Rules:**

- Always pull the latest changes from `develop` (or `main` for hotfixes) before creating a new branch.
- Keep your branches focused on a single feature or bug fix.
- Delete your feature/bugfix branches after they have been merged.

## 💬 Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps in automating changelog generation and makes the commit history more readable.

The commit message format is:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Common Types:**

- `feat`: A new feature for the user.
- `fix`: A bug fix for the user.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs).
- `chore`: Other changes that don't modify `src` or `test` files (e.g., updating dependencies, releasing a version).

**Example Commit Messages:**

```
feat: allow users to upload PDF knowledge tests

This commit introduces the functionality for users to upload their FAA knowledge test results in PDF format. Includes backend processing and UI elements.
```

```
fix(auth): correct redirect loop on invalid login

Resolves an issue where users were stuck in a redirect loop if they entered incorrect credentials.

Closes #123
```

```
docs: update README with setup instructions
```

## 🚀 Pull Request (PR) Process

1.  **Create a Feature/Bugfix Branch:** Branch off `develop` (or `main` for hotfixes) as described in the Git Branching Strategy.
2.  **Implement Changes:** Make your code changes, adhering to our [Coding Standards](docs/coding-standards.md).
3.  **Write Tests:** Add appropriate unit, integration, or E2E tests for your changes. Ensure all tests pass.
4.  **Verify DoD Compliance:** Ensure your changes meet all applicable criteria in the [Definition of Done](docs/definition-of-done.md).
5.  **Commit Changes:** Follow the Commit Message Conventions.
6.  **Push Your Branch:** Push your feature/bugfix branch to the remote repository.
7.  **Create a Pull Request:**
    - Open a PR from your branch to the `develop` branch (or `main` for hotfixes).
    - Use the PR template provided (`.github/PULL_REQUEST_TEMPLATE.md`). Fill it out completely.
    - Complete the DoD checklist in the PR template, indicating which criteria have been met.
    - If any DoD exceptions are needed, document them in the "Request for Exception" section.
    - Clearly describe the changes made and the problem solved.
    - Link any relevant issues (e.g., `Closes #issue-number`).
8.  **Code Review:** At least one other team member (or designated reviewer) will review your PR.
    - Reviewers will verify compliance with the DoD criteria.
    - Address any feedback or comments promptly.
    - Push further commits to your branch to address feedback; the PR will update automatically.
9.  **Automated Checks:** Ensure all automated checks (tests, linting, type checking) are passing.
10. **Merge PR:** Once the PR is approved, DoD criteria are satisfied, and all checks pass, it will be merged by a maintainer.
    - Prefer squash and merge or rebase and merge to keep the `develop` history clean, though this can be decided on a per-PR basis.

**PR Expectations:**

- PRs should be focused and not too large. Break down large features into smaller, manageable PRs.
- Ensure your PR passes all automated checks (linters, tests, CI builds).
- Provide clear and concise descriptions and test steps.
- Complete the DoD checklist honestly; it's better to note exceptions than to claim false compliance.
- Be responsive to review comments.

## 💅 Code Style and Standards

All contributions should adhere to the project's coding standards, which are documented in `docs/coding-standards.md`. This includes guidelines on formatting, naming conventions, and best practices.

We use Prettier for automated code formatting and ESLint for linting to maintain consistency.

## 👀 Review Process

- Reviewers will check for correctness, adherence to standards, test coverage, and overall quality.
- Constructive feedback is encouraged. The goal is to improve the codebase and learn together.
- Reviewers should aim to provide timely feedback.
- Once all concerns are addressed and the PR is approved, it can be merged.

Thank you for contributing to CFIPros! 🎉
