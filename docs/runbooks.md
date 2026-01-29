# Operational Runbooks

## 1. Sync Failures
**Severity**: High (Data staleness)
**Trigger**: Alert `sync_failed` logs or User Report of outdated data.

### Diagnosis
1. Check logs for `Sync failed` error message in Vercel.
2. Verify external service status:
   - [Hospitable Status](https://status.hospitable.com/)
   - [Turno Status](https://status.turno.com/)

### Resolution
1. **Manual Retry**: Navigate to `/settings` and click "Sync Now".
2. **API Retry**: `curl -X POST https://<your-domain>/api/sync` (if route exists, currently via Action).
3. **If External Service Down**: Wait for service recovery.
4. **If Auth Error**: Rotate API keys in Vercel Environment Variables (`HOSPITABLE_CLIENT_ID`, `TURNO_API_KEY`).

## 2. Migration Conflicts
**Severity**: Critical (Deployment blocked)
**Trigger**: Deployment failure with `db push` or migration error.

### Resolution
1. **Local Fix**:
   ```bash
   supabase db pull
   # Resolve schema differences in supabase/migrations
   supabase db reset
   ```
2. **Force Push (Dev Only)**:
   ```bash
   bun x supabase db push
   ```

## 3. Incident Response
**Severity**: Critical (Site Down)
**Trigger**: `/api/health` returns non-200.

### Assessment
1. Check Vercel Status.
2. Check Supabase Status.

### Rollback
1. In Vercel Dashboard, go to "Deployments".
2. functionality of the last stable deployment.
3. Click "Redeploy" or "Promote to Production".
