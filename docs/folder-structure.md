# Nama Wellness — Folder Structure Design

**Version:** 1.0  
**Source:** [Product Requirements Document](./prd.md) · [System Architecture](./architecture.md)  
**Stack:** Next.js · Express · Prisma · Redis · AWS S3

---

## 1. Design Principles

| Principle | Application |
|-----------|-------------|
| **Monorepo** | Single repository with `apps/` and `packages/` for shared contracts |
| **Domain alignment** | Backend modules mirror architecture domains (auth, courses, payments, corporate, etc.) |
| **Portal separation** | Frontend routes grouped by role portal (Student, Teacher, Admin, Corporate) |
| **Extractability** | Each backend module is self-contained (routes → controller → service → repository) for future microservice split |
| **Infrastructure isolation** | Prisma, Redis, and S3 live in dedicated layers — not scattered across modules |
| **Shared types** | API request/response types shared between frontend and backend via `packages/shared` |

---

## 2. Repository Root

```
nama-wellness/
├── apps/
│   ├── web/                          # Next.js frontend
│   └── api/                          # Express backend
├── packages/
│   ├── shared/                       # Shared types, constants, validators
│   ├── prisma/                       # Prisma schema, client, migrations
│   └── config/                       # Shared ESLint, TSConfig, env schemas
├── infrastructure/
│   ├── docker/                       # Dockerfiles, compose for local dev
│   ├── terraform/                    # AWS (RDS, ElastiCache, S3, ECS) — optional
│   └── scripts/                      # Deploy, seed, migration helpers
├── docs/                             # PRD, architecture, API spec, RBAC, database
├── .github/
│   └── workflows/                    # CI/CD pipelines
├── package.json                      # Workspace root (pnpm/npm workspaces)
├── pnpm-workspace.yaml
├── turbo.json                        # Optional: Turborepo task orchestration
├── .env.example
└── README.md
```

---

## 3. Next.js Frontend (`apps/web/`)

Uses **App Router** with route groups per portal. Server Components for catalog/browse; Client Components for interactive dashboards, chat, and live class UI.

```
apps/web/
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── src/
│   ├── app/                                    # App Router
│   │   ├── (public)/                           # Unauthenticated routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                        # Landing page
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx                    # Browse catalog
│   │   │   │   └── [slug]/page.tsx             # Course detail
│   │   │   ├── teachers/
│   │   │   │   └── [id]/page.tsx               # Teacher public profile
│   │   │   ├── certificates/
│   │   │   │   └── verify/[qrCode]/page.tsx    # Public QR verification
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       ├── register/page.tsx
│   │   │       ├── register/corporate/page.tsx
│   │   │       ├── forgot-password/page.tsx
│   │   │       └── reset-password/page.tsx
│   │   │
│   │   ├── (student)/                          # EdPro Student portal
│   │   │   ├── layout.tsx                      # Student nav shell
│   │   │   └── student/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx                # My courses
│   │   │       │   └── [courseId]/
│   │   │       │       ├── page.tsx            # Course home
│   │   │       │       ├── lessons/[lessonId]/page.tsx
│   │   │       │       ├── sessions/[sessionId]/page.tsx
│   │   │       │       ├── recordings/page.tsx
│   │   │       │       ├── assignments/page.tsx
│   │   │       │       └── materials/page.tsx
│   │   │       ├── bookings/page.tsx
│   │   │       ├── checkout/[courseId]/page.tsx
│   │   │       ├── certificates/page.tsx
│   │   │       ├── chat/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [conversationId]/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       └── profile/page.tsx
│   │   │
│   │   ├── (teacher)/                          # EdPro Teacher portal
│   │   │   ├── layout.tsx
│   │   │   └── teacher/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── onboarding/
│   │   │       │   ├── page.tsx                # Application status
│   │   │       │   ├── documents/page.tsx
│   │   │       │   └── payment/page.tsx
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [courseId]/
│   │   │       │       ├── page.tsx
│   │   │       │       ├── modules/page.tsx
│   │   │       │       ├── batches/page.tsx
│   │   │       │       ├── sessions/page.tsx
│   │   │       │       ├── assignments/page.tsx
│   │   │       │       ├── materials/page.tsx
│   │   │       │       ├── students/page.tsx
│   │   │       │       └── pricing/page.tsx
│   │   │       ├── availability/page.tsx
│   │   │       ├── bookings/page.tsx
│   │   │       ├── earnings/page.tsx
│   │   │       ├── analytics/page.tsx
│   │   │       ├── chat/page.tsx
│   │   │       └── profile/page.tsx
│   │   │
│   │   ├── (admin)/                            # Platform Admin portal
│   │   │   ├── layout.tsx
│   │   │   └── admin/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── users/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [userId]/page.tsx
│   │   │       ├── teachers/
│   │   │       │   ├── applications/page.tsx
│   │   │       │   └── [teacherId]/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [courseId]/page.tsx
│   │   │       ├── recordings/page.tsx
│   │   │       ├── reviews/page.tsx
│   │   │       ├── companies/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [companyId]/page.tsx
│   │   │       ├── payments/page.tsx
│   │   │       ├── payouts/page.tsx
│   │   │       ├── refunds/page.tsx
│   │   │       ├── commission/page.tsx
│   │   │       ├── analytics/page.tsx
│   │   │       └── audit-logs/page.tsx
│   │   │
│   │   ├── (corporate)/                        # Corporate portal
│   │   │   ├── layout.tsx
│   │   │   ├── company-admin/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── employees/page.tsx
│   │   │   │   ├── invites/page.tsx
│   │   │   │   ├── subscription/page.tsx
│   │   │   │   ├── programs/page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── participation/page.tsx
│   │   │   │   │   ├── attendance/page.tsx
│   │   │   │   │   └── engagement/page.tsx
│   │   │   │   └── reports/page.tsx            # AI reports
│   │   │   └── employee/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── programs/page.tsx
│   │   │       ├── sessions/[sessionId]/page.tsx
│   │   │       ├── recordings/page.tsx
│   │   │       └── participation/page.tsx
│   │   │
│   │   ├── api/                                # Next.js Route Handlers (BFF optional)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts      # Optional: token refresh proxy
│   │   │
│   │   ├── layout.tsx                          # Root layout
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                                 # Primitives (Button, Input, Modal, Table)
│   │   ├── layout/                             # Header, Sidebar, Footer, RoleSwitcher
│   │   ├── forms/                              # LoginForm, CourseForm, BookingForm
│   │   ├── courses/                            # CourseCard, ModuleList, LessonPlayer
│   │   ├── sessions/                           # SessionCard, MeetLink, AttendanceBadge
│   │   ├── payments/                           # CheckoutSummary, PaymentStatus
│   │   ├── chat/                               # ConversationList, MessageBubble
│   │   ├── analytics/                          # Charts, MetricCards, TrendGraphs
│   │   ├── corporate/                          # EmployeeTable, WellnessScore
│   │   └── shared/                             # Pagination, EmptyState, ErrorBoundary
│   │
│   ├── features/                               # Feature-level logic (hooks + components)
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   ├── sessions/
│   │   ├── recordings/
│   │   ├── assignments/
│   │   ├── certificates/
│   │   ├── chat/
│   │   ├── payments/
│   │   ├── teacher-onboarding/
│   │   └── corporate/
│   │
│   ├── lib/
│   │   ├── api/                                # API client (fetch wrapper, endpoints)
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── enrollments.ts
│   │   │   ├── payments.ts
│   │   │   └── index.ts
│   │   ├── auth/                               # Token storage, role context, guards
│   │   ├── hooks/                              # useAuth, useEnrollment, useChat
│   │   ├── utils/                              # Formatters, date helpers
│   │   └── constants/                          # Routes, role labels
│   │
│   ├── providers/                              # React context providers
│   │   ├── AuthProvider.tsx
│   │   ├── RoleProvider.tsx
│   │   └── QueryProvider.tsx                   # TanStack Query
│   │
│   ├── stores/                                 # Optional: Zustand for client state
│   │   └── auth.store.ts
│   │
│   ├── types/                                  # Frontend-only types (extends shared)
│   │   └── index.ts
│   │
│   └── middleware.ts                           # Route protection by role
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
└── package.json
```

### Frontend Notes

- **Route groups** `(student)`, `(teacher)`, etc. do not affect URLs — they share layout shells per portal.
- **`features/`** colocates domain-specific hooks and composite components; **`components/ui/`** stays generic.
- **`lib/api/`** maps 1:1 to `docs/api-spec.md` endpoint groups.
- **Middleware** enforces role-based route access aligned with `docs/rbac.md`.

---

## 4. Express Backend (`apps/api/`)

Modular monolith. Each domain module owns its routes, controller, service, repository, and DTOs. Cross-cutting infrastructure is shared.

```
apps/api/
├── src/
│   ├── index.ts                                # Entry point
│   ├── app.ts                                  # Express app setup
│   ├── server.ts                               # HTTP server bootstrap
│   │
│   ├── config/
│   │   ├── index.ts                            # Config loader (env validation)
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── s3.ts
│   │   ├── jwt.ts
│   │   └── cors.ts
│   │
│   ├── infrastructure/                         # Shared technical layer
│   │   ├── database/
│   │   │   └── prisma.client.ts                # Prisma singleton
│   │   ├── redis/
│   │   │   ├── redis.client.ts                 # ioredis connection
│   │   │   ├── cache.service.ts                # Generic cache get/set/del
│   │   │   ├── session.store.ts                # Refresh token / session storage
│   │   │   ├── rate-limiter.ts                 # Per-route rate limits
│   │   │   └── pubsub.ts                       # Optional: real-time chat pub/sub
│   │   ├── storage/
│   │   │   ├── s3.client.ts                    # AWS SDK S3 client
│   │   │   ├── s3.service.ts                   # Presign, upload, delete, CDN URL
│   │   │   ├── bucket.config.ts                # Bucket names, key prefixes per purpose
│   │   │   └── mime-validator.ts               # Allowed MIME types per purpose
│   │   ├── queue/
│   │   │   ├── queue.client.ts                 # BullMQ / Redis-backed queue
│   │   │   └── job.types.ts
│   │   ├── email/
│   │   │   └── email.service.ts                # SES / SMTP adapter
│   │   ├── sms/
│   │   │   └── sms.service.ts                  # OTP provider adapter
│   │   └── logger/
│   │       └── logger.ts                       # Structured logging (pino)
│   │
│   ├── middleware/
│   │   ├── authenticate.ts                     # JWT verification
│   │   ├── authorize.ts                        # RBAC role + scope checks
│   │   ├── validate.ts                         # Request body/query validation
│   │   ├── rateLimit.ts                        # Redis-backed rate limiting
│   │   ├── errorHandler.ts
│   │   ├── requestId.ts
│   │   └── auditLog.ts                         # Admin action logging
│   │
│   ├── integrations/                           # External service adapters
│   │   ├── google/
│   │   │   ├── calendar.service.ts
│   │   │   └── meet.service.ts
│   │   ├── razorpay/
│   │   │   ├── razorpay.client.ts
│   │   │   └── webhook.handler.ts
│   │   ├── stripe/
│   │   │   ├── stripe.client.ts
│   │   │   └── webhook.handler.ts
│   │   └── openai/
│   │       └── ai-report.service.ts
│   │
│   ├── modules/                                # Domain modules (mirror architecture)
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── auth.validator.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── users.dto.ts
│   │   │
│   │   ├── teacher/
│   │   │   ├── teacher.routes.ts
│   │   │   ├── teacher.controller.ts
│   │   │   ├── teacher.service.ts
│   │   │   ├── teacher.repository.ts
│   │   │   └── teacher.dto.ts
│   │   │
│   │   ├── categories/
│   │   │   └── ...
│   │   │
│   │   ├── courses/
│   │   │   ├── courses.routes.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── courses.repository.ts
│   │   │   ├── modules/                        # Sub-domain: course modules & lessons
│   │   │   │   ├── modules.service.ts
│   │   │   │   └── lessons.service.ts
│   │   │   └── courses.dto.ts
│   │   │
│   │   ├── enrollments/
│   │   │   └── ...
│   │   │
│   │   ├── scheduling/
│   │   │   ├── batches/
│   │   │   ├── sessions/
│   │   │   ├── availability/
│   │   │   └── bookings/
│   │   │
│   │   ├── attendance/
│   │   │   └── ...
│   │   │
│   │   ├── recordings/
│   │   │   └── ...
│   │   │
│   │   ├── assignments/
│   │   │   └── ...
│   │   │
│   │   ├── certificates/
│   │   │   └── ...
│   │   │
│   │   ├── chat/
│   │   │   └── ...
│   │   │
│   │   ├── reviews/
│   │   │   └── ...
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.routes.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── refunds.service.ts
│   │   │   └── webhooks/
│   │   │       ├── razorpay.webhook.ts
│   │   │       └── stripe.webhook.ts
│   │   │
│   │   ├── payouts/
│   │   │   └── ...
│   │   │
│   │   ├── corporate/
│   │   │   ├── companies/
│   │   │   ├── employees/
│   │   │   ├── invites/
│   │   │   ├── programs/
│   │   │   └── subscriptions/
│   │   │
│   │   ├── analytics/
│   │   │   ├── admin.analytics.service.ts
│   │   │   ├── teacher.analytics.service.ts
│   │   │   └── corporate.analytics.service.ts
│   │   │
│   │   ├── ai-reports/
│   │   │   └── ...
│   │   │
│   │   ├── notifications/
│   │   │   └── ...
│   │   │
│   │   ├── uploads/
│   │   │   ├── uploads.routes.ts
│   │   │   └── uploads.service.ts            # Presign orchestration (uses S3 infra)
│   │   │
│   │   └── admin/
│   │       ├── audit/
│   │       └── commission/
│   │
│   ├── routes/
│   │   ├── index.ts                            # Mounts all module routes under /api/v1
│   │   └── v1/
│   │       └── index.ts
│   │
│   ├── jobs/                                   # Background workers (separate process)
│   │   ├── worker.ts                           # Worker entry point
│   │   ├── processors/
│   │   │   ├── payout.processor.ts
│   │   │   ├── certificate.processor.ts
│   │   │   ├── ai-report.processor.ts
│   │   │   ├── email.processor.ts
│   │   │   ├── recording.processor.ts
│   │   │   └── webhook-reconcile.processor.ts
│   │   └── schedulers/
│   │       ├── monthly-payout.scheduler.ts
│   │       └── ai-report.scheduler.ts
│   │
│   ├── types/
│   │   └── express.d.ts                        # Augment Request with user, role
│   │
│   └── utils/
│       ├── errors.ts                           # AppError, error codes
│       ├── pagination.ts
│       └── crypto.ts                           # Hashing, token generation
│
├── tests/
│   ├── unit/
│   │   └── modules/
│   ├── integration/
│   │   └── api/
│   └── fixtures/
│
├── tsconfig.json
├── .env.example
└── package.json
```

### Backend Module Convention

Each module under `modules/` follows the same internal layout:

```
modules/{domain}/
├── {domain}.routes.ts      # Express Router, mounts middleware
├── {domain}.controller.ts  # HTTP layer — parse request, call service, send response
├── {domain}.service.ts     # Business logic, orchestration
├── {domain}.repository.ts  # Prisma queries (data access only)
├── {domain}.dto.ts         # Input/output shapes
└── {domain}.validator.ts   # Zod/Joi schemas
```

---

## 5. Prisma (`packages/prisma/`)

Prisma lives in a shared package so both API and scripts can import the client. Schema aligns with `docs/database.md`.

```
packages/prisma/
├── prisma/
│   ├── schema.prisma                           # Models, enums, relations
│   ├── migrations/
│   │   ├── 20260611000000_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── seeds/
│       ├── index.ts                            # Seed orchestrator
│       ├── admin.seed.ts
│       ├── categories.seed.ts
│       └── commission.seed.ts
│
├── src/
│   ├── index.ts                                # Re-exports PrismaClient
│   └── client.ts                               # Singleton factory (for scripts)
│
├── package.json
└── tsconfig.json
```

### Prisma Schema Organization

Within `schema.prisma`, group models by domain using comment blocks:

```
// --- Identity & Access ---
// --- Teacher Lifecycle ---
// --- Corporate ---
// --- Catalog & Courses ---
// --- Scheduling ---
// --- Enrollment ---
// --- Recordings ---
// --- Assignments & Certificates ---
// --- Communication ---
// --- Payments & Finance ---
// --- Administration ---
```

For very large schemas, Prisma 5+ supports splitting via multiple files in `prisma/schema/` (optional future step):

```
prisma/
├── schema/
│   ├── base.prisma         # generator, datasource
│   ├── identity.prisma
│   ├── teacher.prisma
│   ├── corporate.prisma
│   ├── courses.prisma
│   ├── scheduling.prisma
│   ├── payments.prisma
│   └── admin.prisma
```

---

## 6. Redis (`apps/api/src/infrastructure/redis/`)

Redis is not a separate app — it is an infrastructure layer consumed by API and workers.

```
infrastructure/redis/
├── redis.client.ts         # Connection pool, reconnect, health check
├── cache.service.ts        # Generic TTL cache (course catalog, categories)
├── session.store.ts          # Refresh tokens, revoked token blocklist
├── rate-limiter.ts           # Sliding window / fixed window per IP and per user
├── otp.store.ts              # OTP codes with expiry (alternative to DB for hot path)
├── lock.service.ts           # Distributed locks (payout processing, webhook idempotency)
└── pubsub.ts                 # Chat message fan-out (optional MVP+)
```

### Redis Key Namespace Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `session:` | Refresh tokens | `session:refresh:{hash}` |
| `cache:` | Response cache | `cache:categories:active` |
| `ratelimit:` | Rate limiting | `ratelimit:auth:login:{ip}` |
| `otp:` | Phone verification | `otp:phone:{phone}:verify` |
| `lock:` | Distributed locks | `lock:payout:{teacherId}:{period}` |
| `queue:` | BullMQ job metadata | Managed by BullMQ |
| `pubsub:` | Chat channels | `pubsub:chat:{conversationId}` |

---

## 7. S3 Integration (`apps/api/src/infrastructure/storage/`)

```
infrastructure/storage/
├── s3.client.ts            # AWS SDK v3 S3Client singleton
├── s3.service.ts           # Presign upload/download, delete, headObject
├── bucket.config.ts        # Bucket names, regions, CDN base URLs
├── key.builder.ts          # S3 key path generator per purpose
└── mime-validator.ts       # Allowed types and max sizes per purpose
```

### S3 Key Prefix Layout

| Prefix | Content | Uploaded By |
|--------|---------|-------------|
| `avatars/{userId}/` | Profile photos | All users |
| `documents/teachers/{applicationId}/` | Verification docs | Teacher |
| `materials/courses/{courseId}/` | Study materials | Teacher |
| `assignments/courses/{courseId}/` | Assignment instructions | Teacher |
| `submissions/{assignmentId}/{studentId}/` | Student submissions | Student |
| `recordings/sessions/{sessionId}/` | Live class recordings | System |
| `recordings/replacements/{sessionId}/` | Replacement recordings | Teacher |
| `certificates/{certificateId}/` | Generated PDFs | System |
| `chat/{conversationId}/` | Chat file attachments | Student, Teacher |

### Environment Variables (S3)

```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_MEDIA=
S3_BUCKET_RECORDINGS=          # Optional separate bucket for large files
CLOUDFRONT_URL=                # CDN for playback
```

---

## 8. Shared Package (`packages/shared/`)

Types and constants consumed by both `apps/web` and `apps/api`.

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── course.types.ts
│   │   ├── enrollment.types.ts
│   │   ├── payment.types.ts
│   │   ├── corporate.types.ts
│   │   └── api.types.ts          # PaginatedResponse, ApiError
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── course-types.ts
│   │   ├── payment-status.ts
│   │   └── routes.ts
│   ├── validators/
│   │   ├── auth.schema.ts        # Zod schemas (shared validation)
│   │   └── course.schema.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 9. Config Package (`packages/config/`)

```
packages/config/
├── eslint/
│   ├── base.js
│   ├── next.js
│   └── node.js
├── typescript/
│   ├── base.json
│   ├── nextjs.json
│   └── node.json
└── env/
    ├── api.env.schema.ts         # Zod env validation for API
    └── web.env.schema.ts         # Zod env validation for Web
```

---

## 10. Infrastructure & DevOps

```
infrastructure/
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── Dockerfile.worker            # Background job worker
│   └── docker-compose.yml           # api + web + postgres + redis + localstack (S3)
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   ├── seed.sh
│   └── generate-env.sh
│
└── terraform/                       # Optional
    ├── modules/
    │   ├── rds/
    │   ├── elasticache/
    │   ├── s3/
    │   └── ecs/
    └── environments/
        ├── staging/
        └── production/
```

### Docker Compose Services (Local Dev)

| Service | Image | Port |
|---------|-------|------|
| `api` | Dockerfile.api | 4000 |
| `worker` | Dockerfile.worker | — |
| `web` | Dockerfile.web | 3000 |
| `postgres` | postgres:15 | 5432 |
| `redis` | redis:7 | 6379 |
| `localstack` | localstack | 4566 (S3 emulation) |

---

## 11. Dependency Flow

```
┌─────────────┐     ┌─────────────┐
│  apps/web   │     │  apps/api   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └────────┬──────────┘
                ▼
       ┌─────────────────┐
       │ packages/shared │
       └────────┬────────┘
                ▼
       ┌─────────────────┐
       │ packages/prisma │
       └─────────────────┘

apps/api also uses:
  infrastructure/redis   → ElastiCache
  infrastructure/storage → S3
  infrastructure/queue   → Redis (BullMQ)
  integrations/*         → Google, Razorpay, Stripe, OpenAI
```

**Rule:** `packages/shared` must not import from `apps/`. `apps/web` must not import Prisma directly — all data access goes through the API.

---

## 12. Scaling Path

| Stage | Change |
|-------|--------|
| **MVP** | Single API process + single worker + Next.js standalone |
| **Growth** | Separate worker containers; Redis cluster; S3 + CloudFront for recordings |
| **Extract services** | Move `modules/payments`, `modules/notifications`, or `modules/ai-reports` to standalone apps — routes and service boundaries already isolated |
| **Multi-region** | Read replica for PostgreSQL; S3 cross-region replication for recordings |

---

## Appendix — Document References

- [Product Requirements Document](./prd.md)
- [System Architecture](./architecture.md)
- [Database Design](./database.md)
- [RBAC Matrix](./rbac.md)
- [API Specification](./api-spec.md)
