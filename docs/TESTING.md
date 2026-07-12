# Testing Documentation

Complete testing guide for the Digital Astrology platform.

## Overview

We use **Vitest** as our primary testing framework with comprehensive coverage reporting and CI integration.

### Testing Stack

- **Vitest** - Fast unit test framework
- **Testing Library** - React component testing
- **jsdom** - Browser environment simulation
- **V8 Coverage** - Code coverage reporting
- **GitHub Actions** - CI/CD integration

---

## Quick Start

```bash
# Install dependencies
yarn install

# Run all tests
yarn test

# Watch mode (recommended for development)
yarn test --watch

# Run with coverage
yarn test --coverage

# Run specific test file
yarn test auth.test.ts
```

---

## Project Structure

```

├── test/
│   ├── setup.ts              # Global test setup
│   ├── utils/
│   │   ├── render.tsx        # Custom render with providers
│   │   └── test-utils.ts     # Test helper functions
│   ├── mocks/
│   │   ├── supabase.ts       # Supabase client mocks
│   │   └── factories.ts      # Data factories
│   └── fixtures/             # Test data
├── lib/
│   └── **/*.test.ts          # Unit tests
├── components/
│   └── **/*.test.tsx         # Component tests
└── app/
    └── **/route.test.ts      # API route tests
```

---

## Writing Tests

### Unit Tests

Test individual functions and utilities:

```typescript
// lib/validation.test.ts
import { describe, it, expect } from "vitest";
import { validateEmail } from "./validation";

describe("validateEmail", () => {
  it("validates correct email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(validateEmail("invalid-email")).toBe(false);
  });
});
```

### Component Tests

Test React components:

```typescript
// components/Button.test.tsx
import { render, screen } from '@test/utils/render'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Hook Tests

Test custom React hooks:

```typescript
// hooks/use-user.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useUser } from "./use-user";

describe("useUser", () => {
  it("fetches user data", async () => {
    const { result } = renderHook(() => useUser("user-123"));

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.loading).toBe(false);
  });
});
```

### API Route Tests

Test Next.js API routes:

```typescript
// app/api/users/route.test.ts
import { GET } from "./route";

describe("GET /api/users", () => {
  it("returns user list", async () => {
    const request = new Request("http://localhost/api/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toBeDefined();
  });
});
```

---

## Coverage

### Coverage Goals

Target: **70%+ coverage** across all metrics

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

### View Coverage

```bash
# Generate coverage report
yarn test --coverage

# Open HTML report
open coverage/index.html
```

### Coverage in CI

Coverage is automatically:

- Generated on every PR
- Uploaded to Codecov
- Displayed in PR comments

---

## Best Practices

### ✅ DO

- Write descriptive test names
- Test user behavior, not implementation
- Use data-testid for dynamic content
- Clean up after tests
- Mock external dependencies
- Test edge cases and error states

### ❌ DON'T

- Test implementation details
- Make tests depend on each other
- Use real API calls
- Ignore async operations
- Skip error handling tests

---

## Continuous Integration

Tests run automatically on:

- Every pull request
- Every push to main/develop
- Manual workflow dispatch

### CI Workflow

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Install dependencies
    - Run tests
    - Upload coverage
```

---

## Troubleshooting

### Tests timing out

Increase timeout in `vitest.config.ts`:

```typescript
{
  test: {
    testTimeout: 15000; // 15 seconds
  }
}
```

### Mock not working

Ensure mock is defined before import:

```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Then import
import { myFunction } from "./my-function";
```

### Coverage too low

Run coverage and check report:

```bash
yarn test --coverage
open coverage/index.html
```

Identify untested files and add tests.

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test README](../test/README.md)
