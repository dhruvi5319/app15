---
status: complete
phase: 01-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md
started: 2026-05-15T18:30:00Z
updated: 2026-05-15T18:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Docker stack starts up
expected: Running `docker compose up -d` brings up all three services (postgres, api, client) without errors. `docker compose ps` shows all three as "Up".
result: pass

### 2. Health endpoint responds
expected: After the stack is running, `curl http://localhost:3001/health` returns `{"status":"ok"}` with HTTP 200.
result: pass

### 3. User registration works
expected: Sending a POST to `http://localhost:3001/api/v1/auth/register` with `{"email":"test@example.com","password":"Password123!"}` returns HTTP 201 with a JSON body containing `user` (id + email), `access_token`, and `refresh_token`.
result: pass

### 4. Login works
expected: Sending a POST to `http://localhost:3001/api/v1/auth/login` with the same credentials returns HTTP 200 with `access_token` and `refresh_token`.
result: pass

### 5. Protected route rejects unauthenticated request
expected: Sending a POST to `http://localhost:3001/api/v1/auth/logout` without an `Authorization` header returns HTTP 401.
result: pass

### 6. App opens in browser at localhost:5173
expected: Navigating to `http://localhost:5173` loads the app. Since the user is not logged in, they are redirected to `/login`. The login page shows an email field, a password field, and a submit button.
result: pass

### 7. Login via UI works
expected: Entering valid credentials on the login page and clicking Submit redirects to the inventory list page (path `/`). No error is shown.
result: pass

### 8. Invalid login shows an error
expected: Entering a wrong email or password and clicking Submit shows an error message on the page (e.g. "Invalid credentials") without crashing or navigating away.
result: pass

### 9. Empty form shows validation errors
expected: Clicking Submit on the login page with empty fields shows validation messages (e.g. "Email is required" / "Password is required") — no network request is made.
result: pass

### 10. GitHub Actions CI runs on push
expected: The `.github/workflows/ci.yml` file exists in the repo. On any push or PR to main, the CI pipeline runs lint, type-check, test, and build jobs in GitHub Actions.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
