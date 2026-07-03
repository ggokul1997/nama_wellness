# Nama Wellness — System Architecture

**Version:** 1.0  
**Source:** [Product Requirements Document](./prd.md)  
**Product Variants:** Nama Wellness EdPro (B2C), Nama Wellness Corporate (B2B)

---

## 1. System Architecture

### 1.1 Architectural Style

Nama Wellness is a **modular monolith** with clear domain boundaries, deployed on AWS. The system follows a **three-tier web architecture**:


| Tier         | Technology                | Responsibility                                                                                  |
| ------------ | ------------------------- | ----------------------------------------------------------------------------------------------- |
| Presentation | Next.js                   | Server-rendered and client-rendered portals for Students, Teachers, Admins, and Corporate users |
| Application  | Node.js + Express.js      | REST APIs, business logic, orchestration, background jobs                                       |
| Data         | PostgreSQL, Redis, AWS S3 | Persistent storage, caching/sessions, file and media assets                                     |


This style balances MVP delivery speed with maintainability. Domain modules are isolated at the code level so they can be extracted into microservices later (e.g., payments, notifications, AI analytics) without rewriting core flows.

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Student      │ │ Teacher      │ │ Admin        │ │ Corporate        │  │
│  │ Portal       │ │ Portal       │ │ Portal       │ │ Portal           │  │
│  │ (EdPro)      │ │ (EdPro)      │ │              │ │ (Employee +      │  │
│  │              │ │              │ │              │ │  Company Admin)  │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘  │
└─────────┼────────────────┼────────────────┼──────────────────┼────────────┘
          │                  │                │                  │
          └──────────────────┴────────────────┴──────────────────┘
                                      │
                              HTTPS / JWT
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                           API GATEWAY / LOAD BALANCER                          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                      APPLICATION LAYER (Node.js / Express)                     │
│                                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ Auth &      │ │ Course &    │ │ Live Class  │ │ Payment &   │             │
│  │ Identity    │ │ Enrollment  │ │ & Attendance│ │ Payout      │             │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ Content &   │ │ Assignment  │ │ Chat &      │ │ Corporate & │             │
│  │ Recording   │ │ & Cert      │ │ Reviews     │ │ AI Analytics│             │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                              │
│  │ Teacher     │ │ Notification│ │ Admin &     │                              │
│  │ Lifecycle   │ │ Service     │ │ Audit       │                              │
│  └─────────────┘ └─────────────┘ └─────────────┘                              │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                    Background Job Queue (async workers)                   │ │
│  │  Payout processing · Certificate generation · AI report generation ·     │ │
│  │  Email dispatch · Recording post-processing · Webhook reconciliation       │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┬───────────────────────────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
│ PostgreSQL   │  │ Redis        │  │ AWS S3       │  │ External Services    │
│ (primary DB) │  │ (cache,      │  │ (recordings, │  │ Google Calendar/Meet │
│              │  │  sessions,   │  │  documents,  │  │ Razorpay · Stripe    │
│              │  │  rate limits)│  │  materials)  │  │ OpenAI · Email SMTP  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘
```

### 1.3 Cross-Cutting Concerns


| Concern        | Approach                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Authentication | JWT access tokens + refresh tokens; email and phone OTP verification at registration                |
| Authorization  | Role-Based Access Control (RBAC) with product-variant scoping (EdPro vs Corporate)                  |
| API design     | RESTful JSON APIs; versioned under `/api/v1`                                                        |
| File handling  | Direct-to-S3 presigned uploads; virus scan and MIME validation at application layer                 |
| Observability  | Structured logging, audit trail for admin actions, activity tracking per user                       |
| Security       | Encrypted passwords (bcrypt/argon2), TLS in transit, payment data handled by PCI-compliant gateways |


### 1.4 Deployment Topology (AWS)

```
Internet
    │
    ▼
CloudFront (optional CDN for static assets)
    │
    ▼
ALB → ECS/Fargate or EC2 (Next.js + Express containers)
    │
    ├── RDS PostgreSQL (Multi-AZ for production)
    ├── ElastiCache Redis
    └── S3 (media bucket + lifecycle policies for recordings)
```

### 1.5 Product Variant Isolation

EdPro and Corporate share the same platform core but differ in:

- **Tenant model** — Corporate organizations are first-class tenants with employee seat limits and subscription tiers.
- **Enrollment paths** — EdPro students purchase courses individually; Corporate employees enroll via company code without individual course purchase.
- **Analytics** — Corporate adds organization-level wellness dashboards and AI-generated reports; EdPro focuses on marketplace and teacher metrics.

Shared infrastructure (auth, courses, live classes, recordings) serves both variants through tenant and role context on every request.

---

## 2. Major Modules

### 2.1 Module Map


| Module                   | Primary Responsibility                                                                                            | Key Consumers                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Auth & Identity**      | Registration, login, email/phone verification, JWT lifecycle, password management                                 | All roles                       |
| **User Management**      | Profile CRUD, role assignment, suspension, termination                                                            | Admin                           |
| **Teacher Lifecycle**    | Application, document upload, admin review, interview scheduling, onboarding fee, activation, performance status  | Teacher, Admin                  |
| **Category Management**  | Admin-defined course categories (Yoga, Meditation, Music, etc.)                                                   | Admin, Teacher                  |
| **Course Management**    | Course creation, pricing proposals, admin approval, publishing, course types (Live, Recorded, Hybrid, Individual) | Teacher, Admin, Student         |
| **Batch & Scheduling**   | Batch creation, class schedules, session instances, teacher availability slots                                    | Teacher, Student                |
| **Enrollment & Access**  | Course purchase, batch assignment, corporate code enrollment, access control                                      | Student, Employee, Admin        |
| **Live Class & Meet**    | Google Calendar event creation, Meet link generation, participant notification                                    | Teacher, Student, Employee      |
| **Attendance**           | Join/leave timestamps, session duration, attendance percentage                                                    | Teacher, Admin                  |
| **Recording Management** | Auto-recording attachment, replay limits (5x), replacement recording workflow, admin override                     | Student, Teacher, Admin         |
| **Content Delivery**     | Module/lesson structure, downloadable materials, progress tracking                                                | Student, Employee               |
| **Assignment**           | Assignment creation, submission, feedback, completion approval                                                    | Teacher, Student                |
| **Certificate**          | Completion validation, PDF generation with QR verification                                                        | Student, Teacher, Admin         |
| **Chat**                 | Direct messaging, file sharing, admin moderation visibility                                                       | Student, Teacher                |
| **Reviews & Ratings**    | Teacher ratings (1–5), review submission, admin moderation                                                        | Student, Admin                  |
| **Payment & Billing**    | Course purchases, teacher onboarding fee, corporate subscriptions, multi-gateway support                          | Student, Teacher, Company Admin |
| **Payout & Commission**  | 85/15 split, monthly payout cycles, hold/approve workflow                                                         | Teacher, Admin                  |
| **Refund**               | 3-day window from class start, admin approval                                                                     | Student, Admin                  |
| **Corporate**            | Company management, employee invites, company codes, seat packages                                                | Company Admin, Employee         |
| **Corporate Analytics**  | Participation, attendance trends, wellness engagement, AI-generated reports                                       | Company Admin                   |
| **AI Analytics**         | OpenAI-powered insights, recommendations, monthly wellness reports                                                | Company Admin                   |
| **Notification**         | Email notifications for classes, approvals, payouts, invites                                                      | All roles                       |
| **Admin & Audit**        | Platform-wide dashboards, revenue/commission analytics, audit logs, user management                               | Admin                           |


### 2.2 Module Interaction — Core Learning Flow

```
Teacher applies → Admin approves → Teacher pays onboarding fee
        │
        ▼
Teacher creates course → proposes pricing → Admin approves → Course published
        │
        ▼
Student browses → purchases course → joins batch
        │
        ▼
Live Class module creates Meet → Attendance tracked → Recording stored
        │
        ▼
Student completes assignments → Teacher approves → Certificate issued
        │
        ▼
Student reviews teacher → Payment module settles commission → Monthly payout
```

### 2.3 Module Interaction — Corporate Flow

```
Company Admin purchases seat package → receives company code
        │
        ▼
Employees register with code → enrolled in wellness programs
        │
        ▼
Employees attend sessions → Attendance & participation tracked
        │
        ▼
Corporate Analytics + AI module generates engagement reports
```

---

## 3. Database Entities

Entities are grouped by domain. All tables include standard audit columns (`created_at`, `updated_at`) unless noted. Soft deletes are recommended for user-facing records.

### 3.1 Identity & Access


| Entity              | Key Attributes                                                                                         | Relationships       |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------- |
| **User**            | id, email, phone, password_hash, email_verified, phone_verified, status (active/suspended), last_login | → UserRole, Profile |
| **UserRole**        | user_id, role (student, teacher, admin, employee, company_admin), product_variant (edpro, corporate)   | User                |
| **Profile**         | user_id, first_name, last_name, avatar_url, bio, timezone                                              | User                |
| **RefreshToken**    | user_id, token_hash, expires_at, revoked                                                               | User                |
| **OTPVerification** | identifier (email/phone), code_hash, purpose, expires_at, consumed                                     | —                   |


### 3.2 Teacher Lifecycle


| Entity                 | Key Attributes                                                                                                                            | Relationships      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **TeacherApplication** | user_id, status (pending/review/interview/approved/rejected), submitted_at                                                                | User               |
| **TeacherDocument**    | application_id, type (gov_id, certification, experience, photo), file_url, verified                                                       | TeacherApplication |
| **TeacherProfile**     | user_id, onboarding_fee_paid, onboarding_paid_at, performance_status (good_standing/warning/probation/suspension/terminated), specialties | User               |
| **TeacherInterview**   | application_id, scheduled_at, notes, outcome                                                                                              | TeacherApplication |


### 3.3 Organization (Corporate)


| Entity                  | Key Attributes                                                         | Relationships         |
| ----------------------- | ---------------------------------------------------------------------- | --------------------- |
| **Company**             | name, status, subscription_tier, employee_limit, company_code          | → CompanySubscription |
| **CompanySubscription** | company_id, tier, monthly_fee, seat_count, status, billing_cycle_start | Company               |
| **CompanyAdmin**        | company_id, user_id                                                    | Company, User         |
| **EmployeeEnrollment**  | company_id, user_id, enrolled_at, status                               | Company, User         |


### 3.4 Catalog & Courses


| Entity            | Key Attributes                                                                                                                                           | Relationships            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **Category**      | name, slug, description, icon_url, is_active, sort_order                                                                                                 | → Course                 |
| **Course**        | title, description, type (live/recorded/hybrid/individual), category_id, teacher_id, status (draft/pending/approved/published/rejected), cover_image_url | Category, User (teacher) |
| **CoursePricing** | course_id, amount, currency, proposed_by, approved_by, effective_at                                                                                      | Course                   |
| **CourseModule**  | course_id, title, sort_order                                                                                                                             | → Lesson                 |
| **Lesson**        | module_id, title, type (video/document/live), content_url, duration_seconds, sort_order                                                                  | CourseModule             |
| **StudyMaterial** | course_id, title, file_url, approved, uploaded_by                                                                                                        | Course                   |


### 3.5 Scheduling & Live Classes


| Entity                  | Key Attributes                                                                                                 | Relationships            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **Batch**               | course_id, name, capacity, start_date, end_date, status                                                        | Course → BatchEnrollment |
| **ClassSession**        | batch_id, scheduled_at, duration_minutes, meet_link, calendar_event_id, status (scheduled/completed/cancelled) | Batch                    |
| **TeacherAvailability** | teacher_id, day_of_week, start_time, end_time, is_recurring                                                    | User (teacher)           |
| **IndividualBooking**   | course_id, student_id, teacher_id, slot_start, slot_end, meet_link, status                                     | Course, User             |
| **AttendanceRecord**    | session_id, user_id, joined_at, left_at, duration_seconds, attendance_percentage                               | ClassSession, User       |


### 3.6 Enrollment & Progress


| Entity             | Key Attributes                                                                            | Relationships         |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------- |
| **Enrollment**     | user_id, course_id, batch_id (nullable), source (purchase/corporate), status, enrolled_at | User, Course, Batch   |
| **LessonProgress** | enrollment_id, lesson_id, completed_at, progress_percent                                  | Enrollment, Lesson    |
| **RecordingView**  | enrollment_id, recording_id, view_count, last_viewed_at                                   | Enrollment, Recording |


### 3.7 Recordings


| Entity                   | Key Attributes                                                                                                           | Relationships      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **Recording**            | session_id, file_url, duration_seconds, type (auto/replacement), status (pending/approved), max_replay_count (default 5) | ClassSession       |
| **ReplacementRecording** | original_session_id, teacher_id, file_url, status (pending/approved/rejected), reviewed_by                               | ClassSession, User |


### 3.8 Assignments


| Entity                   | Key Attributes                                                                                    | Relationships    |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ---------------- |
| **Assignment**           | course_id, title, instructions, due_date, created_by                                              | Course           |
| **AssignmentSubmission** | assignment_id, student_id, file_url, submitted_at, feedback, status (submitted/approved/rejected) | Assignment, User |


### 3.9 Certificates


| Entity          | Key Attributes                                                                                       | Relationships |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| **Certificate** | enrollment_id, student_name, course_name, teacher_name, completion_date, qr_code, pdf_url, issued_at | Enrollment    |


### 3.10 Communication


| Entity                      | Key Attributes                                                                    | Relationships      |
| --------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| **Conversation**            | course_id (nullable), type (direct)                                               | → Message          |
| **ConversationParticipant** | conversation_id, user_id                                                          | Conversation, User |
| **Message**                 | conversation_id, sender_id, body, file_url, sent_at, read_at                      | Conversation       |
| **Review**                  | teacher_id, student_id, course_id, rating (1–5), comment, status (active/removed) | User, Course       |


### 3.11 Payments & Finance


| Entity               | Key Attributes                                                                                                          | Relationships         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Payment**          | user_id, amount, currency, gateway (razorpay/stripe/upi), gateway_ref, purpose (course/onboarding/subscription), status | User                  |
| **Order**            | user_id, course_id (nullable), company_id (nullable), total_amount, payment_id, status                                  | User, Course, Company |
| **Refund**           | order_id, amount, reason, status (requested/approved/rejected), approved_by, requested_within_window                    | Order                 |
| **Payout**           | teacher_id, period_start, period_end, gross_amount, commission_amount, net_amount, status (pending/held/approved/paid)  | User (teacher)        |
| **PayoutLineItem**   | payout_id, order_id, amount, commission_rate                                                                            | Payout, Order         |
| **CommissionConfig** | rate (default 15%), effective_from                                                                                      | —                     |


### 3.12 Platform Administration


| Entity               | Key Attributes                                                                   | Relationships |
| -------------------- | -------------------------------------------------------------------------------- | ------------- |
| **AuditLog**         | actor_id, action, entity_type, entity_id, metadata (JSON), ip_address, timestamp | User          |
| **AdminAction**      | admin_id, action_type, target_user_id, reason, metadata                          | User          |
| **TeacherComplaint** | teacher_id, reported_by, description, status, resolution                         | User          |
| **AIReport**         | company_id, report_type, period, content (JSON/text), generated_at               | Company       |


### 3.13 Entity Relationship Overview

```
User ──┬── TeacherProfile ── Course ──┬── Batch ── ClassSession ── Recording
       │                              ├── Lesson (via Module)
       │                              ├── Assignment
       │                              └── Enrollment ── Certificate
       ├── Enrollment
       ├── Payment ── Order ── Refund
       ├── Payout (as teacher)
       └── CompanyAdmin ── Company ── EmployeeEnrollment
```

---

## 4. User Roles

### 4.1 Role Matrix


| Capability                              | Student | Teacher | Admin          | Employee | Company Admin |
| --------------------------------------- | ------- | ------- | -------------- | -------- | ------------- |
| Register / verify identity              | ✓       | ✓       | —              | ✓        | ✓             |
| Browse & purchase courses               | ✓       | —       | —              | —        | —             |
| Join batches / book sessions            | ✓       | —       | —              | ✓        | —             |
| Attend live classes                     | ✓       | ✓       | —              | ✓        | —             |
| Watch recordings (limited replays)      | ✓       | —       | —              | ✓        | —             |
| Submit assignments                      | ✓       | —       | —              | —        | —             |
| Chat with teacher/student               | ✓       | ✓       | ✓ (moderation) | —        | —             |
| Review teachers                         | ✓       | —       | —              | —        | —             |
| Receive certificates                    | ✓       | —       | —              | —        | —             |
| Apply for teacher onboarding            | —       | ✓       | —              | —        | —             |
| Create & manage courses                 | —       | ✓       | ✓              | —        | —             |
| Schedule classes / manage batches       | —       | ✓       | —              | —        | —             |
| Track attendance & progress             | —       | ✓       | ✓              | —        | —             |
| View earnings & analytics               | —       | ✓       | ✓              | —        | —             |
| Approve teachers / courses / recordings | —       | —       | ✓              | —        | —             |
| Manage users, payouts, commissions      | —       | —       | ✓              | —        | —             |
| Register with company code              | —       | —       | —              | ✓        | —             |
| Attend corporate wellness programs      | —       | —       | —              | ✓        | —             |
| Purchase employee packages              | —       | —       | —              | —        | ✓             |
| Invite employees                        | —       | —       | —              | —        | ✓             |
| View corporate analytics & AI reports   | —       | —       | —              | —        | ✓             |


### 4.2 Role Hierarchy & Scoping

```
Platform Admin (global)
    │
    ├── EdPro Domain
    │       ├── Student
    │       └── Teacher
    │
    └── Corporate Domain
            ├── Company Admin (scoped to Company)
            └── Employee (scoped to Company)
```

- A single **User** may hold multiple roles (e.g., Teacher who is also a Student), but active session context selects one role at a time.
- **Admin** has global platform access across both EdPro and Corporate.
- **Company Admin** and **Employee** are always scoped to a single Company tenant.
- **Teacher performance status** (Good Standing → Warning → Probation → Suspension → Termination) gates Teacher capabilities independently of the base role.

### 4.3 Permission Groups (RBAC Implementation)


| Permission Group       | Roles                                 |
| ---------------------- | ------------------------------------- |
| `catalog:read`         | Student, Employee, Teacher, Admin     |
| `course:write`         | Teacher, Admin                        |
| `course:approve`       | Admin                                 |
| `enrollment:purchase`  | Student                               |
| `enrollment:corporate` | Employee                              |
| `class:host`           | Teacher                               |
| `class:attend`         | Student, Employee, Teacher            |
| `recording:view`       | Student, Employee (with replay limit) |
| `recording:approve`    | Admin                                 |
| `assignment:manage`    | Teacher                               |
| `assignment:submit`    | Student                               |
| `payment:process`      | Student, Teacher, Company Admin       |
| `payout:manage`        | Admin                                 |
| `corporate:manage`     | Company Admin, Admin                  |
| `analytics:platform`   | Admin                                 |
| `analytics:teacher`    | Teacher                               |
| `analytics:corporate`  | Company Admin                         |
| `user:moderate`        | Admin                                 |
| `chat:moderate`        | Admin                                 |


---

## 5. External Integrations

### 5.1 Integration Summary


| Service                 | Purpose                                                           | Integration Pattern                                               | Criticality |
| ----------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------- |
| **Google Calendar API** | Create calendar events for scheduled live classes                 | OAuth 2.0 service account or delegated domain-wide auth; REST API | High        |
| **Google Meet**         | Auto-generate meeting links attached to calendar events           | Created via Calendar API conference data                          | High        |
| **Razorpay**            | Payment processing (UPI, cards, net banking) — primary for India  | REST API + webhooks for payment confirmation                      | High        |
| **Stripe**              | International/alternate card payments                             | REST API + webhooks                                               | High        |
| **AWS S3**              | Store recordings, documents, study materials, certificates        | SDK presigned URLs for upload/download                            | High        |
| **OpenAI API**          | Corporate AI analytics, wellness reports, program recommendations | REST API; async job for report generation                         | Medium      |
| **Email (SMTP / SES)**  | Verification, class reminders, approval notifications, invites    | SMTP or AWS SES                                                   | High        |
| **SMS / OTP Provider**  | Phone verification (e.g., Twilio, MSG91)                          | REST API                                                          | High        |


### 5.2 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Integration Adapter Layer                   │
│  (isolates third-party SDKs from domain logic)              │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Google      │ Payment     │ Storage     │ AI & Comms        │
│ Adapter     │ Adapter     │ Adapter     │ Adapter           │
│             │             │             │                   │
│ Calendar    │ Razorpay    │ S3          │ OpenAI            │
│ Meet        │ Stripe      │ Presigned   │ Email (SES)       │
│             │ Webhooks    │ URLs        │ SMS/OTP           │
└─────────────┴─────────────┴─────────────┴───────────────────┘
```

### 5.3 Webhook & Event Handling


| Source             | Events Handled                                              | Action                                           |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------ |
| Razorpay           | `payment.captured`, `payment.failed`, `refund.processed`    | Update Order/Payment status, trigger enrollment  |
| Stripe             | `checkout.session.completed`, `charge.refunded`             | Same as Razorpay                                 |
| Google Calendar    | Event updates/cancellations (polling or push notifications) | Sync ClassSession status                         |
| Internal job queue | Class start reminder, payout cycle, AI report generation    | Dispatch notifications and downstream processing |


### 5.4 Integration Security

- Store API keys and OAuth credentials in AWS Secrets Manager or environment-sealed config.
- Verify webhook signatures (Razorpay, Stripe) before processing.
- Use least-privilege IAM roles for S3 access.
- Google service account scoped to Calendar and Meet creation only.
- No payment card data stored on platform; PCI scope limited to gateway token references.

### 5.5 Deferred Integrations (Post-MVP)


| Service                        | Purpose                          | Phase   |
| ------------------------------ | -------------------------------- | ------- |
| WhatsApp Business API          | Session reminders, notifications | Phase 2 |
| Firebase Cloud Messaging       | Mobile push notifications        | Phase 2 |
| Native video platform          | Replace Google Meet dependency   | Phase 2 |
| Multi-language translation API | Localized content                | Phase 2 |


---

## 6. MVP Boundaries

### 6.1 MVP Definition

**MVP = Phase 1** as defined in the PRD. The goal is a functional wellness learning marketplace (EdPro) with corporate wellness delivery (Corporate) on a single web platform.

### 6.2 In Scope (MVP)


| Area                        | MVP Deliverables                                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**          | Email + phone OTP registration, JWT auth, email verification, RBAC                                                                                                                                    |
| **Student Portal**          | Browse courses, purchase, join batches, book individual sessions, attend live classes, watch recordings (5x limit), submit assignments, chat, review teachers, download certificates                  |
| **Teacher Portal**          | Apply and upload documents, create courses, propose pricing, manage batches/schedules, upload materials/assignments/replacement recordings, chat, track attendance and progress, view earnings        |
| **Admin Portal**            | Teacher approval workflow, course approval, recording approval, user management, category management, commission/payout management, review moderation, certificate management, suspension/termination |
| **Course Management**       | All four course types: Live, Recorded, Hybrid, Individual Session                                                                                                                                     |
| **Google Meet Integration** | Auto-create calendar events and Meet links, store meeting details, notify participants                                                                                                                |
| **Payments**                | Razorpay + Stripe + UPI; course purchase, teacher onboarding fee, corporate subscription billing                                                                                                      |
| **Attendance**              | Join/leave tracking, duration, attendance percentage for Teacher and Admin                                                                                                                            |
| **Recordings**              | Auto-attach to course, replay limit enforcement, replacement recording workflow                                                                                                                       |
| **Certificates**            | PDF generation with QR verification on course completion + teacher approval                                                                                                                           |
| **Assignments**             | Create, submit, feedback, approval workflow                                                                                                                                                           |
| **Chat**                    | Direct messaging with file sharing; admin moderation access                                                                                                                                           |
| **Reviews**                 | 1–5 star ratings, text reviews, admin removal                                                                                                                                                         |
| **Corporate Dashboard**     | Company code registration, employee invites, participation/attendance/wellness metrics                                                                                                                |
| **AI Reporting**            | OpenAI-generated corporate wellness insights and monthly reports                                                                                                                                      |
| **Teacher Performance**     | Status tracking (Good Standing through Termination), complaint logging                                                                                                                                |
| **Refunds**                 | 3-day window from class start, admin approval                                                                                                                                                         |
| **Payouts**                 | Monthly cycle, 85/15 split, admin hold/approve                                                                                                                                                        |
| **Analytics**               | Admin revenue dashboard, Teacher earnings dashboard, Corporate engagement dashboard                                                                                                                   |


### 6.3 Out of Scope (MVP — Deferred to Phase 2+)


| Area                                         | Rationale                                         |
| -------------------------------------------- | ------------------------------------------------- |
| Native mobile applications (iOS/Android)     | Web-first MVP; responsive design only             |
| Push notifications                           | Requires mobile app or PWA infrastructure         |
| WhatsApp notifications                       | Additional integration and compliance             |
| Advanced AI Coach                            | Beyond basic corporate AI reporting               |
| Community forums                             | Separate social feature set                       |
| Subscription membership plans (student-side) | Marketplace uses per-course purchase model in MVP |
| Multi-language support                       | i18n infrastructure adds complexity               |
| Native video platform                        | Google Meet sufficient for MVP                    |
| AI Teacher Assistant                         | Teacher tooling enhancement                       |
| AI Student Learning Recommendations          | Personalization engine for later phase            |


### 6.4 MVP Technical Constraints


| Constraint         | Decision                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| Frontend           | Next.js web application only (responsive, not native)                    |
| Video conferencing | Google Meet only (no custom WebRTC)                                      |
| Payment gateways   | Razorpay (India-primary) + Stripe                                        |
| AI capabilities    | OpenAI API for corporate reports only (not conversational coach)         |
| File storage       | AWS S3                                                                   |
| Real-time chat     | WebSocket or polling-based (not a third-party chat SDK required for MVP) |
| Recording source   | Google Meet auto-recording → S3 storage pipeline                         |


### 6.5 MVP Phasing Recommendation

Although the PRD lists Phase 1 as a single block, implementation should follow this internal sequencing to reduce risk:

```
Sprint Block A — Foundation
  Auth, RBAC, User profiles, Category management, Admin shell

Sprint Block B — Teacher & Course Core
  Teacher onboarding workflow, Course CRUD, Admin approval, Student browse

Sprint Block C — Learning Delivery
  Batches, Google Meet integration, Attendance, Live + Recorded content

Sprint Block D — Commerce
  Payments (Razorpay/Stripe), Enrollment, Onboarding fee, Commission logic

Sprint Block E — Engagement
  Assignments, Certificates, Chat, Reviews, Recording replay limits

Sprint Block F — Corporate
  Company subscriptions, Employee registration, Corporate dashboard

Sprint Block G — Intelligence & Finance
  AI corporate reports, Payouts, Refunds, Analytics dashboards
```

### 6.6 MVP Success Criteria


| Metric                                                 | Target Direction     |
| ------------------------------------------------------ | -------------------- |
| End-to-end course purchase → live class → certificate  | Functional           |
| Teacher onboarding (apply → approve → pay → teach)     | Functional           |
| Corporate employee registration and session attendance | Functional           |
| Payment reconciliation via webhooks                    | Reliable             |
| Admin audit trail for approvals and payouts            | Complete             |
| Recording replay limit enforcement                     | Enforced server-side |


### 6.7 Known MVP Risks & Mitigations


| Risk                                                        | Mitigation                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Google Meet recording availability varies by Workspace plan | Confirm Workspace edition supports auto-recording; define fallback (teacher upload) |
| Dual payment gateways increase complexity                   | Abstract behind Payment Adapter; Razorpay as primary                                |
| AI report cost and latency                                  | Batch-generate monthly reports asynchronously; cache results                        |
| Large recording files on S3                                 | Lifecycle policies, CDN for playback, transcode pipeline in Phase 2                 |
| Teacher termination with active students                    | Admin workflow for refund/reassignment built into MVP Admin module                  |


---

## Appendix A — Glossary


| Term                  | Definition                                                 |
| --------------------- | ---------------------------------------------------------- |
| EdPro                 | B2C learning marketplace variant                           |
| Corporate             | B2B employee wellness variant                              |
| Batch                 | A cohort of students enrolled in a live course schedule    |
| Individual Session    | One-on-one bookable session with a teacher                 |
| Replacement Recording | Teacher-uploaded recording when live class is missed       |
| Company Code          | Unique identifier for corporate employee self-registration |


## Appendix B — Document References

- [Product Requirements Document](./prd.md)
- Suggested stack: Next.js, Node.js/Express, PostgreSQL, Redis, AWS S3, JWT, Razorpay, Stripe, Google Meet, OpenAI, AWS hosting

