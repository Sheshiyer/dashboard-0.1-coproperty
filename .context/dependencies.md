# Approved Dependencies

Approved packages and libraries with rationale. Use these before adding new dependencies.

## Principles

1. **Standard library first** - Use built-in solutions when sufficient
2. **Proven over novel** - Prefer battle-tested packages
3. **Minimal dependencies** - Each addition is maintenance burden
4. **Security matters** - Check for known vulnerabilities
5. **Active maintenance** - Avoid abandoned packages

## Core Stack

### Frontend (Next.js)
| Package | Use For | Why This One |
|---------|---------|--------------|
| Next.js 14 | React framework | App Router, SSR, file-based routing |
| React | UI library | Industry standard |
| TypeScript | Type safety | Better DX, catch errors early |
| Tailwind CSS | Styling | Utility-first, fast development |

### Backend (Cloudflare Workers)
| Package | Use For | Why This One |
|---------|---------|--------------|
| Hono | HTTP router | Lightweight, fast, Workers-native |
| Workers KV | Caching/Storage | Edge-native key-value store |

### State Management
| Package | Use For | Why This One |
|---------|---------|--------------|
| zustand | Client state | Simple, hooks-based, minimal boilerplate |
| @tanstack/react-query | Server state | Caching, refetching, mutations |

### Form & Validation
| Package | Use For | Why This One |
|---------|---------|--------------|
| zod | Schema validation | Type inference, composable |
| react-hook-form | Form handling | Performant, uncontrolled inputs |
| @hookform/resolvers | Zod integration | Connect zod with RHF |

### UI Components
| Package | Use For | Why This One |
|---------|---------|--------------|
| lucide-react | Icons | Comprehensive, tree-shakeable |
| class-variance-authority | Variant styles | Type-safe component variants |
| clsx + tailwind-merge | Class utilities | Conditional classes, merge conflicts |

### Utilities
| Package | Use For | Why This One |
|---------|---------|--------------|
| date-fns | Date manipulation | Modular, tree-shakeable |
| sonner | Toast notifications | Modern, customizable |

## Removed Dependencies (v2.0 Migration)

Packages removed during Supabase to Cloudflare Workers migration:

| Package | Reason Removed |
|---------|----------------|
| `@supabase/supabase-js` | Supabase no longer used |
| `@supabase/ssr` | Supabase auth no longer used |

## Evaluation Criteria

Before adding a new dependency, consider:

- [ ] Is this functionality in standard library?
- [ ] Can we implement it in < 100 lines?
- [ ] Is package actively maintained?
- [ ] Are there known security issues?
- [ ] What's the dependency tree size?
- [ ] Is it widely used (community trust)?
- [ ] License compatible?

## Banned Packages

Packages we explicitly avoid:

| Package | Reason | Alternative |
|---------|--------|-------------|
| moment.js | Bloated, deprecated | date-fns |
| lodash (full) | Usually overkill | lodash-es (specific imports) |
| axios | Overkill for Workers | Native fetch |

## Security

- Run `bun audit` regularly
- Address critical vulnerabilities immediately
- Review dependency licenses
