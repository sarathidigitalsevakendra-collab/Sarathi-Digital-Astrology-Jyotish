# Code Quality Standards

This document outlines the code quality rules and enforcement mechanisms for the Digital Astrology project.

## 🎯 Quality Rules

### File Size Limits

| Metric                  | Warning   | Error     |
| ----------------------- | --------- | --------- |
| **Max lines per file**  | 300 lines | 400 lines |
| **Max function length** | 50 lines  | 80 lines  |

**Why?** Large files and functions are harder to understand, test, and maintain. Split large components into smaller, focused pieces.

**How to fix:**

- Extract sub-components
- Create custom hooks for logic
- Move utilities to separate files
- Split page components into layout + content

### Complexity Limits

| Metric                      | Warning | Error |
| --------------------------- | ------- | ----- |
| **Cyclomatic complexity**   | 10      | 15    |
| **Max nesting depth**       | 3       | 4     |
| **Max nested callbacks**    | 3       | 4     |
| **Max function parameters** | 4       | 5     |

**Why?** Complex code with many branches is error-prone and hard to test.

**How to fix:**

- Extract complex conditions into named functions
- Use early returns to reduce nesting
- Replace nested callbacks with async/await
- Group parameters into config objects

### TypeScript Strict Mode

All TypeScript strict checks are **enabled**:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true
}
```

**Why?** Catch bugs at compile time, improve code reliability, better IntelliSense.

**Common fixes:**

```typescript
// ❌ Bad
function getData(id) {
  return data[id]; // Unchecked index access
}

// ✅ Good
function getData(id: string): Data | undefined {
  return data[id];
}
```

### Production Safety

**Blocked in production:**

- `console.log()` - Use `console.warn()` or `console.error()` only
- `debugger` statements
- `alert()` - Use toast notifications instead

**How to fix:**

```typescript
// ❌ Bad
console.log("User logged in", user);

// ✅ Good (development only)
if (process.env.NODE_ENV === "development") {
  console.warn("User logged in", user);
}

// ✅ Better (use logger)
logger.info("User logged in", { userId: user.id });
```

### React Best Practices

**Enforced rules:**

- `react-hooks/rules-of-hooks` - Hooks must be called in the right order
- `react-hooks/exhaustive-deps` - Hook dependencies must be complete
- `react/jsx-key` - Lists must have keys
- No direct state mutation

### Code Style

**Enforced via Prettier + ESLint:**

- Use `const` over `let` (prefer-const)
- Never use `var` (no-var)
- Use object shorthand (object-shorthand)
- Use template literals over concatenation (prefer-template)

## 🛠️ Available Commands

### Development

```bash
# Start development server
yarn dev

# Run type checking (no emit)
yarn type-check

# Run linter
yarn lint

# Fix lint issues automatically
yarn lint:fix

# Format code
yarn format

# Check formatting without changing files
yarn format:check
```

### Validation

```bash
# Run all checks (type-check + lint + format)
yarn validate

# Run all checks and auto-fix issues
yarn validate:fix

# Build the project (includes all checks)
yarn build
```

### Testing

```bash
# Run tests once
yarn test

# Watch mode
yarn test:watch

# With coverage
yarn test:coverage
```

## 🔒 Git Hooks (Automated Enforcement)

### Pre-commit Hook

**Runs on:** `git commit`

**Checks:**

- ESLint on staged `.ts` and `.tsx` files
- Prettier formatting on staged files
- Auto-fixes issues when possible

**Behavior:**

- ✅ Passes → Commit proceeds
- ❌ Fails → Commit blocked, you must fix issues

**Example:**

```bash
git add .
git commit -m "Add new feature"

# Output:
🔍 Running pre-commit checks...
✨ Fixing 3 lint issues in birth-chart.tsx
💅 Formatting 2 files
✅ Pre-commit checks passed!
```

### Pre-push Hook

**Runs on:** `git push`

**Checks (in order):**

1. TypeScript type checking (`tsc --noEmit`)
2. ESLint (all files)
3. Prettier format check (all files)

**Behavior:**

- ✅ All pass → Push proceeds
- ❌ Any fail → Push blocked with clear error message

**Example:**

```bash
git push origin main

# Output:
🚀 Running pre-push validation...
📝 Type checking... ✓
🔍 Linting... ✓
💅 Checking formatting... ✓
✅ All pre-push checks passed!
🎉 Pushing to remote...
```

**If checks fail:**

```bash
🚀 Running pre-push validation...
📝 Type checking... ✓
🔍 Linting... ✗

❌ Lint failed. Fix ESLint errors before pushing.

components/chart.tsx
  45:12  error  File has too many lines (523). Maximum allowed is 400  max-lines
  78:5   error  Function exceeds maximum complexity of 15               complexity
```

## 🚫 What Gets Blocked

### Scenario 1: File Too Large

```typescript
// ❌ birth-chart-generator.tsx (1100 lines)
// Error: File has too many lines (1100). Maximum allowed is 400

// ✅ Solution: Split into multiple files
// birth-chart-generator.tsx (200 lines)
// birth-chart-form.tsx (150 lines)
// birth-chart-display.tsx (180 lines)
// planetary-positions.tsx (120 lines)
```

### Scenario 2: Function Too Complex

```typescript
// ❌ Complexity: 18 (max: 15)
function processChart(data) {
  if (condition1) {
    if (condition2) {
      if (condition3) {
        // ... many nested conditions
      }
    }
  }
}

// ✅ Solution: Extract logic
function processChart(data) {
  if (!isValidData(data)) return null;

  const processed = applyInitialTransform(data);
  const validated = validateChart(processed);
  return finalizeChart(validated);
}
```

### Scenario 3: Type Errors

```typescript
// ❌ Type error
const user = getUser(); // Could be undefined
console.log(user.name); // Error: Object is possibly 'undefined'

// ✅ Solution: Handle undefined
const user = getUser();
if (user) {
  console.warn(user.name);
}
```

### Scenario 4: Console.log in Production

```typescript
// ❌ Blocked
console.log("Debug info", data);

// ✅ Use console.warn or console.error for important logs
console.warn("Unexpected API response", response);

// ✅ Or use conditional logging
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", data);
}
```

## 📝 Configuration Files

### Root Level

- `.eslintrc.json` - ESLint rules for all workspaces
- `tsconfig.json` - TypeScript config with strict mode
- `.prettierrc` - Code formatting rules
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script
- `package.json` - Scripts and lint-staged config

### Web App (``)

- `.eslintrc.json` - Next.js and React-specific rules
- `tsconfig.json` - Extends root config with Next.js settings
- `package.json` - App-specific scripts

## 🔧 Troubleshooting

### Hook not running?

```bash
# Reinstall hooks
yarn prepare

# Or manually
yarn dlx husky install
```

### Want to skip hooks? (Not recommended)

```bash
# Skip pre-commit (dangerous)
git commit --no-verify

# Skip pre-push (very dangerous)
git push --no-verify
```

**⚠️ Warning:** Skipping hooks defeats the purpose of quality gates. Only do this in emergencies.

### CI/CD failing but local passes?

```bash
# Run the same checks as CI
yarn validate

# This runs:
# 1. Type check
# 2. Lint
# 3. Format check
```

## 📚 Best Practices

### 1. Commit Often, Push When Ready

```bash
# Good practice
git add feature.tsx
git commit -m "Add feature X"  # Pre-commit runs, fast
git add tests.tsx
git commit -m "Add tests"      # Pre-commit runs, fast

git push  # Pre-push runs once, validates everything
```

### 2. Fix Issues Incrementally

Don't let issues pile up. Fix lint/type errors as you code:

```bash
# While developing, run in watch mode
yarn type-check -- --watch
yarn test:watch
```

### 3. Use IDE Integration

**VS Code Extensions:**

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Error Lens (usernamehw.errorlens)

Configure `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 4. Refactor Large Files

If you hit the 400-line limit, it's a sign to refactor:

**Extract components:**

```tsx
// Before: 600-line component
export default function BirthChart() {
  /* huge component */
}

// After: 200 lines each
export default function BirthChart() {
  return (
    <>
      <ChartForm />
      <ChartDisplay />
      <DivisionalCharts />
    </>
  );
}
```

**Extract hooks:**

```tsx
// Before: Logic mixed in component
export default function Chart() {
  const [data, setData] = useState();
  // 50 lines of fetch logic
}

// After: Custom hook
export default function Chart() {
  const { data, loading, error } = useChartData();
  // Component is now just UI
}
```

## 📈 Metrics to Track

Monitor these in your codebase:

- **Average file size** - Target: < 200 lines
- **Average function length** - Target: < 30 lines
- **TypeScript strict compliance** - Target: 100%
- **Test coverage** - Target: > 80%
- **Build time** - Keep under 2 minutes
- **Lint errors** - Target: 0

## 🎯 Goals

These rules exist to:

1. **Improve code quality** - Catch bugs before they reach production
2. **Enhance maintainability** - Keep code readable and modular
3. **Speed up onboarding** - Consistent patterns = faster learning
4. **Enable safe refactoring** - Type safety + tests = confidence
5. **Reduce technical debt** - Prevent complexity from accumulating

---

**Questions?** Check the main README or ask in the team channel.
