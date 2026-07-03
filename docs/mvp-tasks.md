# Nama Wellness — MVP Development Tasks

**Version:** 1.0  
**Sources:** [PRD](./prd.md) · [Architecture](./architecture.md) · [Database](./database.md) · [RBAC](./rbac.md) · [API Spec](./api-spec.md) · [Folder Structure](./folder-structure.md)

**Scope:** Phase 1 MVP only (per PRD §24 and Architecture §6)

### Complexity Scale

| Level | Meaning | Typical Effort |
|-------|---------|----------------|
| **Low** | Single module, few dependencies, well-defined CRUD | 1–3 days |
| **Medium** | Multiple components, moderate business logic | 4–7 days |
| **High** | Cross-module flows, external integration, or significant UI | 1–2 weeks |
| **Very High** | Complex orchestration, async pipelines, or critical third-party dependency | 2+ weeks |

Tasks are ordered **easiest → hardest** (row number = recommended sequence).

---

## Task List

| # | Epic | Feature | Complexity | Dependencies |
|---|------|---------|------------|--------------|
| 1 | Foundation | Monorepo workspace setup (`apps/`, `packages/`, workspaces) | Low | — |
| 2 | Foundation | Shared ESLint + TypeScript config package | Low | #1 |
| 3 | Foundation | Docker Compose (PostgreSQL, Redis, LocalStack S3) | Low | #1 |
| 4 | Foundation | Express API skeleton (app, server, health check) | Low | #1 |
| 5 | Foundation | Next.js web skeleton (App Router, root layout) | Low | #1 |
| 6 | Foundation | Shared types + constants package | Low | #1, #2 |
| 7 | Foundation | API response envelope + global error handler | Low | #4 |
| 8 | Foundation | Structured logging + request ID middleware | Low | #4 |
| 9 | Infrastructure | Prisma package + identity schema (users, profiles, roles) | Low | #3, #6 |
| 10 | Infrastructure | Redis client + connection health check | Low | #3, #4 |
| 11 | Infrastructure | Prisma migrations pipeline + seed scripts | Low | #9 |
| 12 | Auth | User registration API (EdPro — student/teacher) | Medium | #9, #7 |
| 13 | Auth | Login API + JWT access token issuance | Medium | #12 |
| 14 | Auth | Refresh token storage (Redis) + refresh/logout endpoints | Medium | #10, #13 |
| 15 | Auth | RBAC authorization middleware | Medium | #13 |
| 16 | Auth | Active role context (`X-Active-Role` header) | Low | #15 |
| 17 | Auth | Profile read/update API | Low | #13 |
| 18 | Auth | Next.js route middleware (role-based route protection) | Medium | #5, #15 |
| 19 | Admin | Admin portal layout shell (sidebar, nav, auth guard) | Low | #5, #18 |
| 20 | Catalog | Category CRUD API | Low | #9, #15 |
| 21 | Catalog | Category management admin UI | Low | #19, #20 |
| 22 | Auth | Profile UI (all portals) | Low | #17, #5 |
| 23 | Auth | Email verification (send + confirm) | Medium | #12 |
| 24 | Auth | Password forgot + reset flow | Medium | #12, #23 |
| 25 | Infrastructure | Redis cache service (generic get/set/TTL) | Low | #10 |
| 26 | Infrastructure | Rate limiting middleware (Redis) | Low | #10, #15 |
| 27 | Storage | S3 client + bucket/key configuration | Medium | #4 |
| 28 | Storage | Presigned upload API (`/uploads/presign`) | Medium | #15, #27 |
| 29 | Storage | MIME type + file size validation per upload purpose | Low | #28 |
| 30 | Auth | Phone OTP send + verify (Redis-backed) | Medium | #12, #10 |
| 31 | Auth | Corporate registration API (company code) | Medium | #12, #89 |
| 32 | Catalog | Public category list on landing/browse pages | Low | #20, #5 |
| 33 | Teacher | Teacher application submit API | Medium | #15, #9 |
| 34 | Teacher | Teacher application status UI | Medium | #33, #5 |
| 35 | Teacher | Verification document upload (S3) | Medium | #28, #33 |
| 36 | Teacher | Admin teacher application list + detail UI | Medium | #19, #33 |
| 37 | Teacher | Admin approve/reject teacher application | Medium | #36 |
| 38 | Teacher | Interview schedule + outcome recording | Medium | #37 |
| 39 | Teacher | Teacher profile API (performance status, specialties) | Low | #9, #37 |
| 40 | Courses | Course CRUD API (draft state, all 4 types) | Medium | #20, #39 |
| 41 | Courses | Teacher course create/edit UI | Medium | #40, #5 |
| 42 | Courses | Course modules + lessons CRUD API | Medium | #40 |
| 43 | Courses | Lesson video/document upload (S3) | Medium | #28, #42 |
| 44 | Courses | Course pricing proposal API | Low | #40 |
| 45 | Courses | Admin course review (approve / reject / request changes) | Medium | #40, #19 |
| 46 | Courses | Admin course publish workflow | Medium | #45 |
| 47 | Courses | Public course catalog browse API | Low | #46 |
| 48 | Courses | Public course catalog + detail pages | Low | #47, #5 |
| 49 | Courses | Study materials upload API (teacher) | Medium | #28, #40 |
| 50 | Courses | Study materials admin approval | Low | #49, #45 |
| 51 | Courses | Study materials download (enrolled users) | Low | #50, #54 |
| 52 | Enrollment | Enrollment model + admin-assign API | Medium | #40, #17 |
| 53 | Enrollment | Lesson progress tracking API | Medium | #42, #52 |
| 54 | Enrollment | Student "My Courses" API + UI | Medium | #52, #48 |
| 55 | Scheduling | Batch CRUD API | Medium | #40 |
| 56 | Scheduling | Batch management teacher UI | Medium | #55, #41 |
| 57 | Scheduling | Class session scheduling API | Medium | #55 |
| 58 | Scheduling | Teacher availability slots API | Medium | #39 |
| 59 | Scheduling | Session list UI (teacher + enrolled student) | Medium | #57, #54 |
| 60 | Live Class | Attendance join/leave API | Medium | #57, #52 |
| 61 | Live Class | Attendance report API (teacher + admin) | Medium | #60 |
| 62 | Live Class | Live session join UI (Meet link display) | Medium | #59, #60, #70 |
| 63 | Recordings | Recording metadata model + list API | Medium | #57 |
| 64 | Recordings | Recording playback API with 5x replay limit | Medium | #63, #52, #27 |
| 65 | Recordings | Recording playback UI | Medium | #64, #54 |
| 66 | Recordings | Admin replay limit override | Low | #64 |
| 67 | Recordings | Replacement recording upload (teacher) | Medium | #28, #57 |
| 68 | Recordings | Admin replacement recording approval | Medium | #67 |
| 69 | Scheduling | Individual session booking API | High | #58, #40, #52 |
| 70 | Integrations | Google Calendar event + Meet link creation | Very High | #57 |
| 71 | Scheduling | Individual booking UI (student) | Medium | #69, #48 |
| 72 | Payments | Order + payment database models | Medium | #9 |
| 73 | Payments | Razorpay checkout initiation API | High | #72, #44 |
| 74 | Payments | Razorpay webhook handler + idempotency | High | #73 |
| 75 | Payments | Course purchase → enrollment activation flow | High | #74, #52 |
| 76 | Payments | Student checkout UI | Medium | #73, #48 |
| 77 | Payments | Teacher onboarding fee payment | Medium | #73, #37 |
| 78 | Payments | Stripe checkout + webhook (secondary gateway) | High | #73, #74 |
| 79 | Commerce | Commission config API (85/15 split) | Low | #72 |
| 80 | Commerce | Refund request API (3-day window validation) | Medium | #75, #57 |
| 81 | Commerce | Admin refund approve/reject/process | Medium | #80 |
| 82 | Assignments | Assignment CRUD API (teacher) | Medium | #40 |
| 83 | Assignments | Student submission API + file upload | Medium | #82, #28, #52 |
| 84 | Assignments | Teacher review/approve submission API | Medium | #83 |
| 85 | Assignments | Assignment UI (teacher create + student submit) | Medium | #82, #83, #54 |
| 86 | Reviews | Submit teacher review API (1–5 stars) | Low | #52 |
| 87 | Reviews | Teacher reviews list (public profile + course) | Low | #86, #48 |
| 88 | Reviews | Admin review removal/moderation | Low | #86, #19 |
| 89 | Corporate | Company + subscription database models | Medium | #9 |
| 90 | Corporate | Admin company CRUD API + UI | Medium | #89, #19 |
| 91 | Corporate | Company program assignment (admin links course to company) | Medium | #89, #46 |
| 92 | Corporate | Employee invite API (email + token) | Medium | #89, #23 |
| 93 | Corporate | Company admin portal layout shell | Medium | #5, #18, #89 |
| 94 | Corporate | Employee invite management UI | Medium | #92, #93 |
| 95 | Corporate | Employee registration + company code validation | Medium | #31, #91 |
| 96 | Corporate | Corporate enrollment API (no payment) | Medium | #91, #95 |
| 97 | Corporate | Employee portal (programs, sessions, recordings) | Medium | #96, #59, #65 |
| 98 | Payments | Corporate subscription purchase (tier-based) | High | #73, #89 |
| 99 | Notifications | Email service adapter (SES/SMTP) | Medium | #4 |
| 100 | Notifications | Transactional email templates (verify, invite, class reminder) | Medium | #99 |
| 101 | Notifications | Class/session reminder dispatch | Medium | #100, #57 |
| 102 | Notifications | Notification log API + UI | Low | #99 |
| 103 | Chat | Conversations + participants API | Medium | #15, #52 |
| 104 | Chat | Messages API (text, send, list) | Medium | #103 |
| 105 | Chat | Chat UI with polling | High | #104, #54 |
| 106 | Chat | Chat file attachment upload | Medium | #104, #28 |
| 107 | Chat | Admin conversation moderation (read + delete message) | Low | #104, #19 |
| 108 | Certificates | Certificate model + completion check API | Medium | #53, #84 |
| 109 | Certificates | PDF generation + QR code (background job) | High | #108, #27, #111 |
| 110 | Certificates | Teacher certificate approval API | Medium | #109 |
| 111 | Jobs | Background job queue setup (BullMQ + Redis) | Medium | #10 |
| 112 | Certificates | Student certificate download UI | Low | #110, #54 |
| 113 | Certificates | Public certificate QR verification page | Low | #109, #5 |
| 114 | Analytics | Teacher earnings + dashboard API | Medium | #75, #79 |
| 115 | Analytics | Teacher dashboard UI (earnings, classes, reviews) | Medium | #114, #41 |
| 116 | Analytics | Employee personal participation API + UI | Low | #60, #97 |
| 117 | Analytics | Corporate participation + attendance API | High | #60, #96 |
| 118 | Analytics | Corporate engagement metrics API | High | #117, #53 |
| 119 | Analytics | Company admin analytics UI | High | #117, #118, #93 |
| 120 | Payouts | Payout + line item models | Medium | #72, #79 |
| 121 | Payouts | Monthly payout calculation job | Very High | #111, #75, #120 |
| 122 | Payouts | Admin hold / approve / mark-paid API | Medium | #121 |
| 123 | Payouts | Teacher payout history UI | Medium | #122, #41 |
| 124 | Analytics | Admin revenue + commission dashboard API | High | #75, #121 |
| 125 | Analytics | Admin platform analytics UI | High | #124, #19 |
| 126 | AI | OpenAI integration adapter | Medium | #4 |
| 127 | AI | Corporate wellness report generation job | Very High | #111, #126, #118 |
| 128 | AI | AI report API + company admin reports UI | High | #127, #93 |
| 129 | Admin | User suspend / reactivate API + UI | Medium | #15, #19 |
| 130 | Admin | Teacher performance status management | Medium | #39, #19 |
| 131 | Admin | Teacher complaint filing + resolution workflow | Medium | #33, #88 |
| 132 | Admin | Audit log middleware + admin audit log UI | Medium | #15, #19 |
| 133 | Admin | Teacher termination + active student resolution (refund/reassign) | Very High | #81, #52, #131 |
| 134 | Teacher | Teacher onboarding payment → account activation gate | Medium | #77, #39 |
| 135 | Enrollment | Mark enrollment complete (teacher/admin) | Low | #53, #84 |
| 136 | Commerce | End-to-end payment webhook → enrollment smoke tests | High | #75, #74 |
| 137 | Integrations | Google Calendar sync (cancel/reschedule events) | High | #70 |
| 138 | Foundation | CI/CD pipeline (lint, test, build) | Medium | #1 |
| 139 | Foundation | E2E test harness for critical flows | High | #75, #70, #109 |

---

## Epic Summary

| Epic | Tasks | Hardest Task |
|------|-------|--------------|
| Foundation | #1–8, #138–139 | E2E test harness |
| Infrastructure | #9–11, #25–26 | Prisma migrations at scale |
| Auth | #12–18, #22–24, #30–31 | Phone OTP + corporate registration |
| Storage | #27–29 | Presigned upload pipeline |
| Catalog | #20–21, #32 | — |
| Teacher | #33–39, #134 | Onboarding activation gate |
| Courses | #40–51 | All 4 course types + content upload |
| Scheduling | #55–59, #69, #71 | Individual session booking |
| Live Class | #60–62 | Meet link + attendance join flow |
| Integrations | #70, #137 | Google Calendar + Meet creation |
| Recordings | #63–68 | Playback with replay limit enforcement |
| Enrollment | #52–54, #135 | Purchase-triggered enrollment |
| Payments | #72–78, #98 | Webhooks + dual gateway |
| Commerce | #79–81 | Refund window business rules |
| Assignments | #82–85 | Submission + review workflow |
| Reviews | #86–88 | — |
| Chat | #103–107 | Real-time UI with polling |
| Certificates | #108–113 | PDF + QR generation job |
| Notifications | #99–102 | Class reminder scheduling |
| Corporate | #89–97 | Employee portal + corporate enrollment |
| Analytics | #114–119, #124–125 | Admin + corporate dashboards |
| Payouts | #120–123 | Monthly payout calculation job |
| AI | #126–128 | OpenAI wellness report generation |
| Admin | #19, #129–133 | Teacher termination + student resolution |
| Jobs | #111 | Queue infrastructure for all async work |

---

## Sprint Mapping (from Architecture §6.5)

| Sprint Block | Task Range | Goal |
|--------------|------------|------|
| **A — Foundation** | #1–32 | Monorepo, auth, RBAC, categories, admin shell |
| **B — Teacher & Course Core** | #33–51 | Teacher onboarding, course CRUD, admin approval, public browse |
| **C — Learning Delivery** | #52–62, #63–68 | Enrollments, batches, sessions, attendance, recordings |
| **D — Commerce** | #69–81, #134 | Bookings, Meet, payments, enrollment purchase, refunds |
| **E — Engagement** | #82–88, #103–113 | Assignments, reviews, chat, certificates |
| **F — Corporate** | #89–98, #116–119 | Companies, employees, subscriptions, corporate dashboards |
| **G — Intelligence & Finance** | #114–115, #120–128, #129–133 | Payouts, AI reports, admin analytics, termination |

---

## Critical Path

The longest dependency chain for MVP launch:

```
#1 Monorepo → #9 Prisma → #12 Registration → #13 Login → #15 RBAC
  → #40 Course CRUD → #46 Publish → #52 Enrollment → #57 Sessions
  → #70 Google Meet → #73 Razorpay → #75 Purchase enrollment
  → #60 Attendance → #109 Certificates → #121 Payouts
```

**Blockers to watch:**
- **#70 Google Meet** — blocks live class MVP; confirm Workspace recording support early
- **#74 Payment webhooks** — blocks paid enrollment and onboarding fee
- **#111 Job queue** — blocks certificates, payouts, and AI reports
- **#89 Corporate models** — blocks #31 corporate registration (can parallelize schema early)

---

## Parallel Workstreams

These can run concurrently after Sprint A foundation:

| Stream | Owner Focus | Tasks |
|--------|-------------|-------|
| **EdPro learning** | Backend + teacher UI | #40–68, #82–85 |
| **Commerce** | Payments specialist | #72–81, #120–123 |
| **Corporate** | B2B feature team | #89–98, #116–119 |
| **Platform admin** | Admin portal | #19–21, #36–37, #45–46, #129–132 |
| **Engagement** | Full-stack | #86–88, #103–113 |

---

## Out of Scope (Do Not Include in MVP Tasks)

Per PRD §26 and Architecture §6.3:

- Native mobile apps
- Push / WhatsApp notifications
- Advanced AI Coach
- Community forums
- Student subscription membership plans
- Multi-language support
- Native video platform
- AI Teacher Assistant
- AI Student Learning Recommendations

---

## Appendix — Document References

- [Product Requirements Document](./prd.md)
- [System Architecture](./architecture.md)
- [Database Design](./database.md)
- [RBAC Matrix](./rbac.md)
- [API Specification](./api-spec.md)
- [Folder Structure](./folder-structure.md)
