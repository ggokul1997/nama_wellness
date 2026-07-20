# E2E Testing Guide

This guide explains how to run the new Playwright End-to-End tests locally and how they work. 
Because the E2E tests wipe the database frequently and require their own isolated data, they use a completely separate testing infrastructure from your normal development environment.

## 1. Start the Test Infrastructure

Before you run the tests, you must start the dedicated testing database and Redis instance. We use Docker to spin these up on isolated ports (`5433` and `6380`) so they don't clash with your running dev databases.

```bash
# Start the E2E Docker containers in the background
pnpm run infra:e2e:up
```

> **Tip:** You only need to do this once per session. The database runs quietly in the background until you stop it.

## 2. Run the Tests

You can run the tests using two different modes. Both modes automatically reset the test database, apply migrations, and boot up your Next.js and API dev servers in the background.

### Option A: UI Mode (Highly Recommended)
UI mode opens Playwright's time-travel debugger. It allows you to visually step through each test, watch the browser click around, and inspect the DOM at any point in time.

```bash
pnpm run test:e2e:ui
```

### Option B: Headless Mode (Fast)
This mode runs the tests invisibly in your terminal without popping up a browser window. It's great for quickly verifying that everything works before pushing your code.

```bash
pnpm run test:e2e
```

## 3. Stop the Test Infrastructure

When you are completely finished testing for the day, you can shut down the test database containers to save computer resources:

```bash
pnpm run infra:e2e:down
```

---

## 🛠 Troubleshooting & Resetting

If your test database ever gets stuck in a weird state (for example, if you abort a test halfway through before it could clean up after itself), you can completely wipe and restart the test database containers using:

```bash
pnpm run infra:e2e:reset
```

## 🤖 CI/CD Integration

You don't need to do anything to run these tests on GitHub! 
Every time you push to `main` or create a Pull Request, the `.github/workflows/e2e.yml` action will automatically spin up its own database, run all the tests in Headless mode, and upload the report for you.
