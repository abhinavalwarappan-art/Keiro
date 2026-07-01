# Keiro — Deployment Rollback Playbook

Follow this checklist under pressure. Target: live rollback in under 2 minutes.

---

## Instant Rollback via Vercel Dashboard

1. Open **https://vercel.com** and sign in.
2. Select the **keiro** project.
3. Click **Deployments** in the left sidebar.
4. Find the last known-good deployment (look for the green ✓ "Ready" badge just above the bad one).
5. Click the **⋯ three-dot menu** on that deployment row.
6. Select **Promote to Production**.
7. Confirm the dialog — Vercel instantly aliases production traffic to that build with no rebuild.
8. **Verify**: run the health check below and confirm `version` matches the promoted deployment's SHA/tag.

```bash
curl https://keiro.app/api/health
# Expected: {"status":"ok","version":"v1.x.x","timestamp":"..."}
```

> **Total time:** ~30 seconds if you know which deployment to promote.

---

## Identifying the Good Deployment

- Each deployment row shows: commit SHA, branch, deploy time, and status.
- The `version` field in `/api/health` matches the `DEPLOYMENT_VERSION` env var set at build time.
- If you tagged releases (`git tag v1.4.2`), the version string makes this instant.
- If you didn't, compare the commit SHA in the Vercel UI to your git log.

---

## Vercel CLI Rollback (alternative)

If you prefer the terminal:

```bash
# List recent deployments
vercel ls keiro

# Promote a specific deployment URL to production
vercel promote <deployment-url> --scope=<your-team>

# Verify
curl https://keiro.app/api/health
```

---

## Database Migration Rollback

Vercel rollback reverts **code only**. If the bad deployment ran a DB migration:

1. Connect to your Supabase project: **Dashboard → SQL Editor**.
2. Locate the migration that needs reverting in `supabase/migrations/`.
3. Write and run a compensating SQL statement (DROP INDEX, DROP COLUMN, etc.).
4. There is **no automatic down migration** — write the reversal manually before deploying anything that touches the schema.

> Rule: always run schema migrations separately from code deploys when they are destructive (DROP, ALTER). Deploy the code first with a backward-compatible schema, then clean up the old shape.

---

## Preview Deployments (preventing bad pushes from reaching production)

Vercel creates a live preview URL automatically for every push to a **non-main branch**. This is already on by default.

To confirm it is enabled for this project:
1. Vercel Dashboard → keiro → **Settings → Git**.
2. Under **Preview Branches**, confirm "All branches" or your target branch is listed.
3. Every PR and feature branch push gets its own `https://keiro-git-<branch>-<team>.vercel.app` URL.

Workflow:
- Push to any branch → preview URL auto-created.
- Share the preview URL for QA or stakeholder review.
- Merge to `main` → production deployment triggered.
- If the preview looks bad, **never merge** — no production impact.

---

## After Any Rollback

- [ ] File a postmortem issue in GitHub with: what broke, when, how it was detected, rollback time.
- [ ] Update `DEPLOYMENT_VERSION` to a bumped value for the next release so the health check distinguishes the patched build.
- [ ] Check Sentry for any errors that fired during the bad deployment window.
