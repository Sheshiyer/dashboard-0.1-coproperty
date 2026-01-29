# Environment Variables

Documentation of all environment variables used in the application. This file documents the variables, not their values.

## Frontend Variables (.env)

### Application
| Variable | Description | Example Format |
|----------|-------------|----------------|
| `NODE_ENV` | Environment mode | `development`, `production` |
| `PORT` | Development server port | `3000` |

### Cloudflare Workers
| Variable | Description | Example Format |
|----------|-------------|----------------|
| `NEXT_PUBLIC_WORKERS_URL` | Workers API base URL | `https://api.example.com` or `http://localhost:8787` |

## Workers Variables (wrangler.toml / secrets)

### External API Tokens
| Variable | Description | Security |
|----------|-------------|----------|
| `HOSPITABLE_API_TOKEN` | Hospitable API Personal Access Token | Secret (wrangler secret) |
| `TURNO_API_KEY` | Turno API key for cleaning job access | Secret (wrangler secret) |

### Authentication
| Variable | Description | Security |
|----------|-------------|----------|
| `API_KEY` | API key for dashboard authentication | Secret (wrangler secret) |

### KV Namespaces (wrangler.toml)
| Binding | Description | Purpose |
|---------|-------------|---------|
| `CACHE` | Cache namespace ID | API response caching (TTL-based) |
| `TASKS` | Tasks namespace ID | Persistent task storage |

## Environment-Specific Configuration

### Development
```bash
# .env
NEXT_PUBLIC_WORKERS_URL=http://localhost:8787
```

### Production
```bash
# .env
NEXT_PUBLIC_WORKERS_URL=https://co-property-api.workers.dev

# Workers secrets (via wrangler CLI)
wrangler secret put HOSPITABLE_API_TOKEN
wrangler secret put TURNO_API_KEY
wrangler secret put API_KEY
```

## Adding New Variables

When adding a new environment variable:

1. Add to this documentation
2. Add to `.env.example` with placeholder value  
3. For Workers secrets, use `wrangler secret put`
4. Update deployment documentation

## Security Notes

- Never commit API tokens or secrets to version control
- Use `wrangler secret` for Workers secrets (not environment vars)
- Rotate API keys regularly
- Different API keys per environment

## Removed Variables (v2.0 Migration)

The following Supabase-related variables were removed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
