# Project Scanning & Fixing

## How to scan for issues
Before fixing anything, always run these tools to get real, deterministic findings:

```bash
# TypeScript type errors
npx tsc --noEmit

# ESLint (bugs, code quality)
npx eslint . --ext .ts,.tsx,.js,.jsx

# Security-specific scan
semgrep --config=auto .

# Dependency vulnerabilities
npm audit
```

## Workflow
1. Run all four scans above
2. Parse the output — treat every reported error/warning as a real issue
3. Fix each one directly in the code
4. Re-run the scans to confirm they're clean
5. Summarize what was fixed and why

## Conventions
- Next.js / React / TypeScript / Supabase stack
- Never hardcode API keys or secrets — always use environment variables
- Prefer Supabase RLS policies over application-level auth checks
- Use strict TypeScript, no `any` unless justified with a comment
