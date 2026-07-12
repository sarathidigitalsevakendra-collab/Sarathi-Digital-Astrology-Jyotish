# Setup Instructions - Code Quality Enforcement

## 🚀 Quick Start

Follow these steps to activate all quality checks:

### Step 1: Install Dependencies

```bash
# From the root directory (this project uses Yarn)
yarn install
```

This will install:

- `husky` - Git hooks manager
- `lint-staged` - Run linters on staged files only
- Updated ESLint and TypeScript configs

### Step 2: Initialize Husky

```bash
yarn prepare
```

This creates the `.husky` directory and sets up Git hooks.

### Step 3: Verify Installation

```bash
# Check if hooks are executable
ls -la .husky/

# Should show:
# -rwxr-xr-x  1 user  staff  pre-commit
# -rwxr-xr-x  1 user  staff  pre-push
```

### Step 4: Test the Hooks

```bash
# Make a small change
echo "// test" >> test-file.ts

# Try to commit
git add test-file.ts
git commit -m "Test commit"

# You should see:
# 🔍 Running pre-commit checks...
# ✅ Pre-commit checks passed!
```

## 📋 What Was Changed

### Configuration Files Updated

1. **`.eslintrc.json` (root)**
   - Added `max-lines`: 400 lines per file (error)
   - Added `max-lines-per-function`: 80 lines (warning)
   - Added `complexity`: 15 max cyclomatic complexity
   - Added `max-depth`: 4 max nesting
   - Added `max-nested-callbacks`: 4
   - Added `max-params`: 5 max function parameters
   - Enabled TypeScript strict rules
   - Blocked `console.log` in production
   - Added test file overrides (relaxed rules)

2. **`.eslintrc.json`**
   - Inherited root rules
   - Added React-specific rules
   - Added Next.js specific rules
   - Enforced React hooks rules
   - Added test overrides

3. **`tsconfig.json` (root)**
   - Enabled all strict mode flags
   - Added `noUnusedLocals`: true
   - Added `noUnusedParameters`: true
   - Added `noImplicitReturns`: true
   - Added `noFallthroughCasesInSwitch`: true
   - Added `noUncheckedIndexedAccess`: true
   - Added `noImplicitOverride`: true

4. **`tsconfig.json`**
   - Inherited strict rules from root
   - Maintained Next.js specific settings

5. **`package.json` (root)**
   - Added `lint:fix` script
   - Added `type-check` script
   - Added `format:check` script
   - Added `validate` script (runs all checks)
   - Added `validate:fix` script
   - Added `pre-commit` script
   - Added `pre-push` script
   - Added `husky` and `lint-staged` dependencies
   - Configured `lint-staged` for TS/TSX files

6. **`package.json`**
   - Added `--max-warnings=0` to lint script
   - Added `lint:fix` script
   - Added `format` and `format:check` scripts
   - Added `test:watch` and `test:coverage` scripts
   - Added `validate` script
   - Added `clean` script

### New Files Created

1. **`.husky/pre-commit`**
   - Runs `lint-staged` on commit
   - Auto-fixes linting issues
   - Formats code with Prettier
   - Blocks commit if fixes fail

2. **`.husky/pre-push`**
   - Runs type checking
   - Runs full lint
   - Checks formatting
   - Blocks push if any check fails

3. **`.prettierignore`**
   - Ignores build outputs
   - Ignores dependencies
   - Ignores generated files

4. **`.eslintignore`**
   - Ignores build outputs
   - Ignores test directories as needed

5. **`CODE_QUALITY.md`**
   - Comprehensive documentation
   - Rule explanations
   - Common fixes
   - Troubleshooting guide

6. **`SETUP_QUALITY_CHECKS.md`** (this file)
   - Setup instructions
   - Change summary

## 🔍 What Gets Checked

### On Every Commit (Pre-commit Hook)

- **Scope:** Only staged files
- **Speed:** Fast (< 5 seconds typically)
- **Actions:**
  1. ESLint on `.ts` and `.tsx` files
  2. Auto-fix issues when possible
  3. Prettier formatting
  4. Add fixes back to staging area

**Example output:**

```bash
$ git commit -m "Add feature"

🔍 Running pre-commit checks...
  components/chart.tsx
    ✔ ESLint found 0 errors, 2 warnings (auto-fixed)
    ✔ Prettier formatted
✅ Pre-commit checks passed!
[main abc123] Add feature
```

### On Every Push (Pre-push Hook)

- **Scope:** All files in repository
- **Speed:** Slower (30-60 seconds)
- **Actions:**
  1. TypeScript type checking (tsc --noEmit)
  2. ESLint on all files
  3. Prettier format check (no auto-fix)

**Example output:**

```bash
$ git push origin main

🚀 Running pre-push validation...
⏳ This may take a moment...

📝 Type checking...
✓ No type errors found

🔍 Linting...
✓ No lint errors found

💅 Checking formatting...
✓ All files properly formatted

✅ All pre-push checks passed!
🎉 Pushing to remote...
```

## ⚠️ Known Issues You'll Hit

Based on the codebase analysis, here are issues you'll need to fix:

### 1. Files Exceeding Line Limits

**Files over 400 lines:**

- `components/astrology/birth-chart-generator-v2.tsx` (1113 lines)
- `components/astrology/birth-chart-generator-v3.tsx` (993 lines)
- `components/astrology/birth-chart-generator.tsx` (518 lines)
- `app/auth/signin/page.tsx` (382 lines)

**How to fix:** Refactor large components into smaller pieces.

**Example for birth-chart-generator:**

```typescript
// Split into:
// - birth-chart-form.tsx (form UI + inputs)
// - birth-chart-display.tsx (chart visualization)
// - planetary-positions.tsx (planet list)
// - divisional-charts.tsx (D1, D9, etc.)
// - birth-chart-generator.tsx (orchestrates all pieces)
```

### 2. Potential Type Errors from Strict Mode

**Common issues you'll see:**

```typescript
// Index access
const value = arr[0]; // Error: possibly undefined

// Fix:
const value = arr[0];
if (value) {
  // use value
}

// Or:
const value = arr[0] ?? defaultValue;
```

```typescript
// Unused parameters
function handler(event) {
  // Error: 'event' is unused
  doSomething();
}

// Fix:
function handler(_event) {
  // Prefix with underscore
  doSomething();
}
```

### 3. Console.log Statements

**Error:** `no-console` rule will block commits with `console.log`

```typescript
// ❌ Blocked
console.log("User data:", user);

// ✅ Allowed
console.warn("Unexpected response:", response);
console.error("Failed to fetch:", error);

// ✅ Or conditional
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", data);
}
```

## 🛠️ Fixing Existing Issues

### Option 1: Fix All at Once (Recommended for Small Projects)

```bash
# Auto-fix what can be fixed
yarn validate:fix

# Manually fix remaining issues
yarn type-check  # See type errors
yarn lint        # See lint errors
```

### Option 2: Fix Incrementally (Recommended for Large Projects)

1. **Temporarily disable strict rules for existing files:**

Create `legacy-overrides.json`:

```json
{
  "overrides": [
    {
      "files": ["components/astrology/birth-chart-generator*.tsx"],
      "rules": {
        "max-lines": "off",
        "complexity": "off"
      }
    }
  ]
}
```

2. **Enable for new files only:**

All new files will follow strict rules.

3. **Refactor one component at a time:**

```bash
# Tackle one file
# 1. Split birth-chart-generator-v2.tsx
# 2. Remove from legacy-overrides.json
# 3. Repeat for next file
```

### Option 3: Gradual Migration

```bash
# Week 1: Enable TypeScript strict mode
# Week 2: Fix file size limits
# Week 3: Fix complexity issues
# Week 4: Remove all legacy overrides
```

## 📊 Monitoring Compliance

### Check Current Status

```bash
# Count files violating rules
yarn lint 2>&1 | grep -c "max-lines"

# List specific violations
yarn lint | grep "max-lines\|complexity"

# Type check status
yarn type-check
```

### VS Code Setup (Highly Recommended)

Install extensions:

```json
{
  "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "usernamehw.errorlens"]
}
```

Configure workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## 🚨 Emergency: Bypass Hooks

**Only in genuine emergencies:**

```bash
# Skip pre-commit (use very sparingly)
git commit --no-verify -m "Emergency fix"

# Skip pre-push (dangerous)
git push --no-verify
```

**⚠️ Warning:** This should be rare. If you're doing this often, you have a process problem.

## 🎯 Success Criteria

You'll know the setup is working when:

1. ✅ Commits are blocked when adding files with lint errors
2. ✅ Pushes are blocked when type-check fails
3. ✅ Prettier auto-formats on commit
4. ✅ CI/CD passes without code quality issues
5. ✅ New code follows strict TypeScript rules
6. ✅ No files exceed 400 lines
7. ✅ No functions have complexity > 15

## 📚 Next Steps

1. **Run initial setup:** `yarn install && yarn prepare`
2. **Test hooks:** Make a small commit
3. **Check current violations:** `yarn validate`
4. **Choose fix strategy:** All at once vs. incremental
5. **Start fixing:** Begin with the easiest violations
6. **Monitor:** Use `yarn validate` regularly

## 🆘 Getting Help

**Common Questions:**

**Q: Hooks aren't running?**

```bash
yarn prepare
chmod +x .husky/pre-commit .husky/pre-push
```

**Q: Type errors I don't understand?**
See `CODE_QUALITY.md` for common fixes and examples.

**Q: Want to disable a specific rule?**
Edit `.eslintrc.json` but document WHY in comments.

**Q: CI failing but local passes?**
Run `yarn validate` which matches CI checks.

---

**Ready to enforce quality!** 🎉

See `CODE_QUALITY.md` for detailed rule explanations and best practices.
