# Contributing to Digital Astrology

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Format](#commit-message-format)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.x
- Yarn 4.12.0 (comes with the project via Corepack)
- PostgreSQL 15+
- Git

### Initial Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/digital-astrology.git
cd digital-astrology
```

2. **Install dependencies**

```bash
corepack enable
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Set up the database**

```bash

npx prisma migrate dev
npx prisma generate
```

5. **Start development servers**

```bash
# Start all apps and services
yarn dev

# Or start specific app
yarn dev
```

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run type check
npx tsc --noEmit

# Run linter
yarn lint

# Build to verify
yarn build
```

### 4. Commit Your Changes

Follow our [commit message format](#commit-message-format):

```bash
git add .
git commit -m "feat: add user profile page"
```

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Tests pass locally (`yarn test`)
- [ ] Code builds without errors (`yarn build`)
- [ ] Lint passes (`yarn lint`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Documentation updated (if needed)
- [ ] Self-review completed

### PR Title Format

Use semantic commit format:

```
<type>: <description>

Examples:
feat: add horoscope sharing feature
fix: resolve authentication timeout issue
docs: update API documentation
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `perf` - Performance improvements
- `test` - Adding tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks

### PR Description

Use the provided template to:

- Describe what changed and why
- Link related issues
- Provide testing instructions
- Note any deployment considerations

### Review Process

1. **Automated Checks** - CI runs automatically
   - Linting
   - Type checking
   - Tests
   - Build verification
   - Security scans

2. **Code Review** - At least 1 approval required
   - Reviewers will provide feedback
   - Address feedback and push updates
   - Re-request review when ready

3. **Merge** - Once approved and checks pass
   - Squash and merge (default)
   - Delete branch after merge

---

## 💻 Coding Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

async function getUser(id: string): Promise<User> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  return user;
}

// ❌ Bad
function getUser(id: any) {
  return db.user.findUnique({ where: { id } });
}
```

### React Components

```tsx
// ✅ Good - Named function component with proper types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ❌ Bad - Arrow function export default
export default ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### File Organization

```

├── app/                    # Next.js App Router
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── sections/         # Page sections
├── lib/                  # Utilities and helpers
│   ├── api/             # API clients
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
└── types/               # TypeScript type definitions
```

### Naming Conventions

- **Files**: `kebab-case.tsx`, `user-profile.ts`
- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Functions**: `camelCase` (e.g., `getUserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `UserProfile`)

---

## ✅ Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { calculateAge } from "./user-utils";

describe("calculateAge", () => {
  it("calculates age correctly", () => {
    const birthDate = new Date("1990-01-01");
    const age = calculateAge(birthDate);
    expect(age).toBeGreaterThan(30);
  });

  it("throws error for invalid date", () => {
    expect(() => calculateAge(null as any)).toThrow();
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createMockUser } from "@/test/factories";

describe("User API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates user successfully", async () => {
    const userData = createMockUser();
    const response = await POST("/api/users", userData);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
  });
});
```

### Test Coverage

- Aim for 70%+ coverage
- Focus on critical paths
- Test edge cases and error handling
- Mock external dependencies

---

## 📝 Commit Message Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```
feat(auth): add Google OAuth integration

Implement Google OAuth sign-in flow with proper error handling
and session management.

Closes #123
```

```
fix(dashboard): resolve chart rendering issue

Fix issue where charts weren't rendering on mobile devices
due to incorrect viewport calculations.

Fixes #456
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding/updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks
- `revert` - Reverting previous commit

### Scopes (optional)

- `auth` - Authentication
- `dashboard` - Dashboard features
- `api` - API changes
- `ui` - UI components
- `db` - Database changes
- `deps` - Dependencies

---

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - How to reproduce the bug
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, browser, Node version, etc.
6. **Screenshots** - If applicable

---

## 💡 Feature Requests

When requesting features, include:

1. **Use Case** - Why is this needed?
2. **Description** - What should it do?
3. **Alternatives** - Other solutions considered
4. **Additional Context** - Mockups, examples, etc.

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vitest Docs](https://vitest.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## 🤔 Questions?

- Check existing issues and discussions
- Ask in PR comments
- Create a discussion thread

---

**Thank you for contributing! 🎉**
