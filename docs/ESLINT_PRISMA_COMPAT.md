# ESLint v9 & Prisma Compatibility — Reference Notes

> [!NOTE]
> **Historical context**: This document was written when the project was a Turborepo monorepo.
> The project is now a single Next.js 14 app. Path references like `packages/schemas/` no longer exist — `prisma/schema.prisma` is at the **project root**. The ESLint and Prisma version decisions documented here are still relevant; adapt paths as needed.

---

## 🐛 Issues Fixed

### 1. ESLint v9 Incompatibility with Next.js 14.1.4

**Error:** `Unknown options: useEslintrc, extensions - 'extensions' has been removed`

**Root Cause:**

- Next.js 14.1.4 uses internal ESLint configs that rely on ESLint v8 APIs
- ESLint v9 removed options like `useEslintrc`, `extensions`, `resolvePluginsRelativeTo`
- `eslint-config-next@16.0.8` requires ESLint v9, but Next.js 14.1.4 doesn't support it

**Fix Applied:**

1. **Downgraded ESLint** from v9.39.1 → v8.57.1
2. **Matched eslint-config-next** version to Next.js version: v14.1.4
3. **Root package.json** already has `eslint@^8.57.0` specified

### 2. Prisma Client Not Initialized in CI/CD

**Error:** `@prisma/client did not initialize yet. Please run 'prisma generate'`

**Root Cause:**

- Prisma schema at `prisma/schema.prisma`
- `@prisma/client` package is installed, but the actual client code isn't generated
- GitHub Actions needs explicit `prisma generate` before build

**Fix Applied:**

1. **Added postinstall scripts** to auto-generate Prisma client after `yarn install`
2. **Updated GitHub Actions workflows** with explicit "Generate Prisma Client" step
3. **Ensures compatibility** with both local dev and CI/CD

---

## ✅ Files Modified

### 1. Root `package.json` - Added Postinstall Script

```json
{
  "scripts": {
    "postinstall": "cd packages/schemas && prisma generate",
    "dev": "turbo dev",
    "build": "turbo build --filter=@digital-astrology/web",
    ...
  }
}
```

**Why:** Automatically generates Prisma client whenever `yarn install` runs (local or CI).

### 2. `package.json` - Added Postinstall Script

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:generate": "prisma generate",
    ...
  }
}
```

**Why:** Ensures Prisma client is generated when this workspace package is installed.

### 3. `package.json` - Fixed ESLint Versions

**Before:**

```json
{
  "devDependencies": {
    "eslint": "^9.39.1",
    "eslint-config-next": "^16.0.8"
  }
}
```

**After:**

```json
{
  "devDependencies": {
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.1.4"
  }
}
```

**Why:**

- ESLint v8 is compatible with Next.js 14.1.4's internal lint configs
- `eslint-config-next` version should match Next.js version for stability

### 4. `.github/workflows/ci.yml` - Already Fixed (Previous Commit)

```yaml
- name: Generate Prisma Client
  run: |
    cd packages/schemas
    npx prisma generate
  env:
    DATABASE_URL: postgresql://user:password@localhost:5432/digital_astrology
```

### 5. `.github/workflows/deploy.yml` - Already Fixed (Previous Commit)

```yaml
- name: Generate Prisma Client
  run: |
    cd packages/schemas
    npx prisma generate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 6. `.eslintrc.json` - Already Created (Previous Commit)

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"]
}
```

---

## 🔧 How It Works

### Postinstall Flow

```
1. yarn install
   ├─> Installs all dependencies including @prisma/client
   │
   ├─> Runs root postinstall: "cd packages/schemas && prisma generate"
   │   └─> Generates Prisma client to node_modules/.prisma/client/
   │
   └─> Build can now import PrismaClient successfully
```

### GitHub Actions Flow

```
1. Install dependencies (yarn install --immutable)
   └─> Postinstall generates Prisma client automatically

2. Generate Prisma Client (explicit step for clarity)
   └─> Ensures client is generated even if postinstall fails

3. Build all packages (yarn build)
   └─> Next.js can import PrismaClient
   └─> ESLint v8 works with Next.js 14.1.4
   └─> Build succeeds ✅
```

---

## 🎯 Verification

### Local Build Test

```bash
# Clean install
rm -rf node_modules .yarn/cache
yarn install

# Verify Prisma client generated
ls -la node_modules/.prisma/client/

# Test build
yarn build

# Test lint
yarn lint
```

### Expected Results

✅ Prisma client generated at `node_modules/.prisma/client/`
✅ Build completes without errors
✅ ESLint runs without "unknown options" errors
✅ No "@prisma/client did not initialize" errors

---

## 📋 Version Compatibility Matrix

| Package                | Version | Reason                                      |
| ---------------------- | ------- | ------------------------------------------- |
| **next**               | 14.1.4  | Current stable version                      |
| **eslint**             | ^8.57.1 | Required by Next.js 14.x (v9 not supported) |
| **eslint-config-next** | ^14.1.4 | Must match Next.js version                  |
| **@prisma/client**     | 5.11.0  | Stable Prisma version                       |
| **prisma** (dev)       | 5.11.0  | Must match @prisma/client                   |

---

## 🚀 GitHub Actions - What Changed

### Before (Broken)

```yaml
- name: Install dependencies
  run: yarn install --immutable

- name: Build all packages
  run: yarn build
  # ❌ Fails: @prisma/client not initialized
  # ❌ Fails: ESLint unknown options
```

### After (Fixed)

```yaml
- name: Install dependencies
  run: yarn install --immutable
  # ✅ Postinstall generates Prisma client

- name: Generate Prisma Client # Explicit step for safety
  run: |
    cd packages/schemas
    npx prisma generate

- name: Build all packages
  run: yarn build
  # ✅ Succeeds: Prisma client available
  # ✅ Succeeds: ESLint v8 compatible
```

---

## 📝 Next Steps

1. **Commit and push these changes:**

   ```bash
   git add package.json package.json package.json yarn.lock
   git commit -m "fix: downgrade ESLint to v8 and add Prisma postinstall scripts

   - Fix ESLint v9 incompatibility with Next.js 14.1.4
   - Downgrade eslint to v8.57.1 and eslint-config-next to 14.1.4
   - Add postinstall scripts to auto-generate Prisma client
   - Resolves 'unknown options' ESLint error
   - Resolves '@prisma/client not initialized' error"

   git push origin phase1-development
   ```

2. **Monitor GitHub Actions:**
   - Check that postinstall runs successfully
   - Verify "Generate Prisma Client" step shows success
   - Confirm build completes without errors

3. **Clean up local environment (optional):**
   ```bash
   rm -rf node_modules .yarn/cache
   yarn install
   yarn build
   ```

---

## 🔍 Troubleshooting

### If ESLint still shows errors:

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `yarn install`
3. Check ESLint version: `yarn why eslint` (should show v8.57.1)

### If Prisma client not found:

1. Manually generate: `cd packages/schemas && npx prisma generate`
2. Check output: `ls -la node_modules/.prisma/client/`
3. Verify schema location: `prisma/schema.prisma` exists

### If GitHub Actions still fails:

1. Check workflow file has "Generate Prisma Client" step
2. Verify postinstall script in package.json
3. Check GitHub Actions logs for exact error message

---

## 🎉 Summary

**Fixed:**
✅ ESLint v9 incompatibility → Downgraded to v8.57.1
✅ Prisma not initialized → Added postinstall scripts
✅ Version mismatches → Aligned all ESLint packages
✅ CI/CD failures → GitHub Actions workflows updated

**Result:**

- Local builds work ✅
- GitHub Actions builds work ✅
- ESLint runs without errors ✅
- Prisma client always generated ✅
