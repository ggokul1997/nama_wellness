# Nama Wellness — RBAC Matrix

**Version:** 1.0  
**Source:** [Product Requirements Document](./prd.md)  
**Roles:** Admin · Teacher · Student · Company Admin · Employee

---

## 1. Overview

Nama Wellness uses **Role-Based Access Control (RBAC)** with two product variants:

| Variant | Roles |
|---------|-------|
| **EdPro** (B2C) | Student, Teacher, Admin |
| **Corporate** (B2B) | Employee, Company Admin, Admin |

Admin operates globally across both variants. A user may hold multiple roles; the **active session role** determines effective permissions.

### Scoping Rules

| Role | Scope |
|------|-------|
| Admin | Platform-wide |
| Teacher | Own courses, batches, students, and earnings |
| Student | Own enrollments, purchases, and progress |
| Company Admin | Own company tenant (employees, subscription, analytics) |
| Employee | Own company tenant (assigned wellness programs only) |

### Conditional Access

| Condition | Effect |
|-----------|--------|
| Teacher `performance_status` = Suspension | Deny all Teacher write actions; read-only on own profile and earnings history |
| Teacher `performance_status` = Termination | Deny all Teacher actions |
| Teacher `performance_status` = Probation | All Teacher actions allowed; flagged for admin monitoring |
| User `status` = Suspended | Deny all actions except logout and support contact |
| Enrollment required | Recording, assignment, certificate, and review actions require active enrollment |
| Company program assignment | Employee session/recording access limited to courses linked via `company_programs` |
| Ownership / tenancy | Teachers act only on their own courses; Company Admins act only on their own company |

---

## 2. Complete RBAC Matrix

### 2.1 Authentication & Profile

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Auth | Register (EdPro) | Student, Teacher |
| Auth | Register (Corporate — company code) | Employee, Company Admin |
| Auth | Login | Admin, Teacher, Student, Company Admin, Employee |
| Auth | Logout | Admin, Teacher, Student, Company Admin, Employee |
| Auth | Verify email | Admin, Teacher, Student, Company Admin, Employee |
| Auth | Verify phone (OTP) | Admin, Teacher, Student, Company Admin, Employee |
| Auth | Reset password | Admin, Teacher, Student, Company Admin, Employee |
| Auth | Refresh session token | Admin, Teacher, Student, Company Admin, Employee |
| Profile | Read own profile | Admin, Teacher, Student, Company Admin, Employee |
| Profile | Update own profile | Admin, Teacher, Student, Company Admin, Employee |
| Profile | Upload avatar | Admin, Teacher, Student, Company Admin, Employee |
| Profile | Read any user profile | Admin |
| Profile | Update any user profile | Admin |

### 2.2 User Management

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Users | List all users | Admin |
| Users | Read user details | Admin |
| Users | Suspend user | Admin |
| Users | Reactivate user | Admin |
| Users | Terminate user | Admin |
| Students | List students | Admin |
| Students | Read student details | Admin, Teacher *(own course enrollees only)* |
| Students | Manage student accounts | Admin |
| Teachers | List teachers | Admin |
| Teachers | Read teacher public profile | Admin, Student, Employee |
| Teachers | Manage teacher accounts | Admin |

### 2.3 Teacher Onboarding & Lifecycle

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Teacher Application | Submit application | Teacher |
| Teacher Application | Read own application | Teacher |
| Teacher Application | Upload verification documents | Teacher |
| Teacher Application | List pending applications | Admin |
| Teacher Application | Review application | Admin |
| Teacher Application | Approve application | Admin |
| Teacher Application | Reject application | Admin |
| Teacher Application | Request changes | Admin |
| Teacher Documents | Upload document | Teacher *(own application)* |
| Teacher Documents | Read own documents | Teacher |
| Teacher Documents | Verify document | Admin |
| Teacher Interview | Schedule interview | Admin |
| Teacher Interview | Record interview outcome | Admin |
| Teacher Onboarding | Pay onboarding fee | Teacher *(post-approval only)* |
| Teacher Profile | Read own profile | Teacher |
| Teacher Profile | Read teacher analytics | Teacher *(own)*, Admin |
| Teacher Profile | Update performance status | Admin |
| Teacher Complaints | File complaint | Student, Admin |
| Teacher Complaints | List complaints | Admin |
| Teacher Complaints | Investigate complaint | Admin |
| Teacher Complaints | Resolve complaint | Admin |
| Teacher Termination | Initiate termination review | Admin |
| Teacher Termination | Resolve active student cases (refund / reassignment) | Admin |

### 2.4 Categories

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Categories | List / browse | Admin, Teacher, Student, Company Admin, Employee |
| Categories | Read category details | Admin, Teacher, Student, Company Admin, Employee |
| Categories | Create category | Admin |
| Categories | Update category | Admin |
| Categories | Deactivate category | Admin |
| Categories | Reorder categories | Admin |

### 2.5 Courses & Catalog

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Courses | Browse published catalog | Student, Teacher, Company Admin, Employee |
| Courses | Read published course details | Student, Teacher, Company Admin, Employee |
| Courses | Create course | Teacher, Admin |
| Courses | Update own course | Teacher *(own, pre-publish or as permitted)* |
| Courses | Update any course | Admin |
| Courses | Propose pricing | Teacher *(own course)* |
| Courses | Approve course proposal | Admin |
| Courses | Reject course proposal | Admin |
| Courses | Request course changes | Admin |
| Courses | Modify course pricing | Admin |
| Courses | Publish course | Admin |
| Courses | Archive course | Admin |
| Courses | Assign teacher to course | Admin |
| Courses | List own courses | Teacher |
| Courses | List all courses | Admin |
| Course Modules | Create module | Teacher *(own course)*, Admin |
| Course Modules | Update module | Teacher *(own course)*, Admin |
| Course Modules | Delete module | Teacher *(own course)*, Admin |
| Course Modules | Read modules | Admin, Teacher, Student *(enrolled)*, Employee *(assigned program)* |
| Lessons | Create lesson | Teacher *(own course)*, Admin |
| Lessons | Update lesson | Teacher *(own course)*, Admin |
| Lessons | Delete lesson | Teacher *(own course)*, Admin |
| Lessons | Read lesson content | Admin, Teacher, Student *(enrolled)*, Employee *(assigned program)* |
| Lessons | Track lesson progress | Student *(enrolled)*, Employee *(assigned program)* |
| Study Materials | Upload material | Teacher *(own course)* |
| Study Materials | Approve material | Admin |
| Study Materials | Download approved material | Student *(enrolled)*, Employee *(assigned program)* |
| Study Materials | Reject material | Admin |

### 2.6 Batches & Scheduling

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Batches | Create batch | Teacher *(own course)* |
| Batches | Update batch | Teacher *(own course)* |
| Batches | Cancel batch | Teacher *(own course)*, Admin |
| Batches | List batches for course | Admin, Teacher, Student *(enrolled)*, Employee *(assigned program)* |
| Batches | Join batch | Student *(enrolled)*, Employee *(assigned program)* |
| Class Sessions | Schedule session | Teacher *(own batch)* |
| Class Sessions | Update session | Teacher *(own batch)* |
| Class Sessions | Cancel session | Teacher *(own batch)*, Admin |
| Class Sessions | List upcoming sessions | Admin, Teacher, Student *(enrolled)*, Employee *(assigned program)* |
| Class Sessions | Host live session | Teacher *(own session)* |
| Class Sessions | Join live session | Student *(enrolled)*, Employee *(assigned program)*, Teacher *(own session)* |
| Teacher Availability | Set availability slots | Teacher |
| Teacher Availability | Update availability slots | Teacher |
| Teacher Availability | Read own availability | Teacher |
| Teacher Availability | Read teacher availability (for booking) | Student |
| Individual Bookings | Book session | Student |
| Individual Bookings | Confirm booking | Teacher *(own)* |
| Individual Bookings | Cancel booking | Student *(own)*, Teacher *(own)*, Admin |
| Individual Bookings | Read own bookings | Student, Teacher |

### 2.7 Enrollment

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Enrollments | Purchase and enroll (EdPro) | Student |
| Enrollments | Enroll via company program | Employee |
| Enrollments | Admin-assign enrollment | Admin |
| Enrollments | Reassign enrollment (termination case) | Admin |
| Enrollments | Read own enrollments | Student, Employee |
| Enrollments | Read course enrollments | Teacher *(own course)*, Admin |
| Enrollments | Cancel enrollment | Admin |
| Enrollments | Mark completion | Teacher *(own course)*, Admin |
| Lesson Progress | Read own progress | Student, Employee |
| Lesson Progress | Read student progress | Teacher *(own course enrollees)*, Admin |

### 2.8 Attendance

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Attendance | Record join event | Student *(enrolled)*, Employee *(assigned program)* |
| Attendance | Record leave event | Student *(enrolled)*, Employee *(assigned program)* |
| Attendance | View session attendance | Teacher *(own session)*, Admin |
| Attendance | View own attendance history | Student, Employee |
| Attendance | View batch attendance report | Teacher *(own batch)*, Admin |
| Attendance | Export attendance data | Admin, Company Admin *(own company employees)* |

### 2.9 Recordings

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Recordings | Watch recording | Student *(enrolled, replay limit)*, Employee *(assigned program, replay limit)* |
| Recordings | List course recordings | Student *(enrolled)*, Employee *(assigned program)*, Teacher *(own course)*, Admin |
| Recordings | Upload replacement recording | Teacher *(own course)* |
| Recordings | Approve replacement recording | Admin |
| Recordings | Reject replacement recording | Admin |
| Recordings | Override replay access limit | Admin |
| Recordings | Delete recording | Admin |

### 2.10 Assignments

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Assignments | Create assignment | Teacher *(own course)* |
| Assignments | Update assignment | Teacher *(own course)* |
| Assignments | Delete assignment | Teacher *(own course)* |
| Assignments | List assignments | Student *(enrolled)*, Teacher *(own course)*, Admin |
| Assignment Submissions | Submit assignment | Student *(enrolled)* |
| Assignment Submissions | Upload submission file | Student *(enrolled)* |
| Assignment Submissions | Read own submission | Student |
| Assignment Submissions | Read submission feedback | Student |
| Assignment Submissions | Review submission | Teacher *(own course)* |
| Assignment Submissions | Approve completion | Teacher *(own course)* |
| Assignment Submissions | Reject submission | Teacher *(own course)* |
| Assignment Submissions | List all submissions for course | Teacher *(own course)*, Admin |

### 2.11 Certificates

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Certificates | Trigger completion check | Student *(enrolled)*, Teacher *(own course)*, Admin |
| Certificates | Approve certificate issuance | Teacher *(own course)* |
| Certificates | Download own certificate | Student |
| Certificates | Verify certificate (QR / public) | Admin, Teacher, Student, Company Admin, Employee |
| Certificates | List certificates | Admin, Teacher *(own course)* |
| Certificates | Revoke certificate | Admin |

### 2.12 Chat & Messaging

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Conversations | Start direct conversation | Student, Teacher |
| Conversations | Read own conversations | Student, Teacher |
| Conversations | List all conversations (moderation) | Admin |
| Messages | Send text message | Student, Teacher *(own conversation)* |
| Messages | Send file attachment | Student, Teacher *(own conversation)* |
| Messages | Read messages | Student, Teacher *(own conversation)*, Admin *(moderation)* |
| Messages | Delete message (moderation) | Admin |

### 2.13 Reviews & Ratings

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Reviews | Submit rating and review | Student *(enrolled, post-course)* |
| Reviews | Read teacher reviews | Student, Teacher, Admin |
| Reviews | Read own review | Student |
| Reviews | Flag review as inappropriate | Admin |
| Reviews | Remove review | Admin |
| Reviews | Investigate review complaint | Admin |

### 2.14 Payments & Billing

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Payments | Initiate course purchase | Student |
| Payments | Initiate teacher onboarding payment | Teacher *(post-approval)* |
| Payments | Initiate corporate subscription payment | Company Admin |
| Payments | Read own payment history | Student, Teacher, Company Admin |
| Payments | List all payments | Admin |
| Orders | Read own orders | Student, Company Admin |
| Orders | List all orders | Admin |
| Refunds | Request refund (within 3-day window) | Student |
| Refunds | Approve refund | Admin |
| Refunds | Reject refund | Admin |
| Refunds | Process refund | Admin |
| Commission Config | Read current rates | Admin, Teacher |
| Commission Config | Update commission rates | Admin |

### 2.15 Payouts

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Payouts | View own payout history | Teacher |
| Payouts | View own earnings summary | Teacher |
| Payouts | List all payouts | Admin |
| Payouts | Hold payout | Admin |
| Payouts | Approve payout | Admin |
| Payouts | Mark payout as paid | Admin |
| Payouts | Review payout line items | Admin |

### 2.16 Corporate & Organization

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Companies | Create company | Admin |
| Companies | Update company | Admin |
| Companies | Suspend company | Admin |
| Companies | List companies | Admin |
| Companies | Read own company details | Company Admin |
| Company Subscriptions | Purchase employee package | Company Admin |
| Company Subscriptions | Read own subscription | Company Admin |
| Company Subscriptions | Manage subscriptions | Admin |
| Company Admins | Assign company admin | Admin |
| Company Admins | Read company admins | Admin, Company Admin *(own company)* |
| Employee Invites | Send employee invite | Company Admin |
| Employee Invites | Resend invite | Company Admin |
| Employee Invites | Revoke invite | Company Admin, Admin |
| Employee Invites | Accept invite | Employee |
| Employee Enrollments | Register with company code | Employee |
| Employee Enrollments | List company employees | Company Admin, Admin |
| Employee Enrollments | Deactivate employee | Company Admin, Admin |
| Company Programs | Assign wellness program to company | Admin |
| Company Programs | List assigned programs | Company Admin, Employee |
| Company Programs | Remove program assignment | Admin |

### 2.17 Analytics & Reporting

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Platform Analytics | View revenue dashboard | Admin |
| Platform Analytics | View commission reports | Admin |
| Platform Analytics | View course sales metrics | Admin |
| Platform Analytics | View teacher performance metrics | Admin |
| Platform Analytics | View student growth metrics | Admin |
| Platform Analytics | View corporate subscription metrics | Admin |
| Teacher Analytics | View own earnings | Teacher |
| Teacher Analytics | View own attendance metrics | Teacher |
| Teacher Analytics | View student completion rates | Teacher *(own courses)* |
| Teacher Analytics | View own review summary | Teacher |
| Teacher Analytics | View upcoming classes | Teacher |
| Corporate Analytics | View employee participation | Company Admin |
| Corporate Analytics | View attendance trends | Company Admin |
| Corporate Analytics | View course enrollment stats | Company Admin |
| Corporate Analytics | View wellness engagement metrics | Company Admin |
| Corporate Analytics | View monthly activity reports | Company Admin |
| Corporate Analytics | View own participation history | Employee |
| AI Reports | Generate wellness report | Admin, Company Admin *(own company)* |
| AI Reports | Read AI-generated report | Company Admin |
| AI Reports | List AI reports | Company Admin, Admin |

### 2.18 Platform Administration

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Audit Logs | Read audit trail | Admin |
| Admin Actions | Record administrative action | Admin |
| Notifications | Receive notifications | Admin, Teacher, Student, Company Admin, Employee |
| Notifications | List own notifications | Admin, Teacher, Student, Company Admin, Employee |
| Notifications | Send platform notification | Admin |
| Dashboard | Access admin portal | Admin |
| Dashboard | Access teacher portal | Teacher |
| Dashboard | Access student portal | Student |
| Dashboard | Access corporate admin portal | Company Admin |
| Dashboard | Access employee portal | Employee |

---

## 3. Role Summary

### Admin
Full platform access. Approves teachers, courses, recordings, refunds, and payouts. Manages users, companies, categories, commissions, and reviews. Views all analytics and audit logs.

### Teacher
EdPro instructor. Applies for onboarding, creates and manages own courses, batches, sessions, assignments, and materials. Tracks attendance and student progress. Chats with students, approves certificates, and views own earnings. Cannot purchase courses or access corporate features.

### Student
EdPro learner. Browses and purchases courses, joins batches, books individual sessions, attends live classes, watches recordings, submits assignments, chats with teachers, reviews teachers, and downloads certificates. Cannot manage courses or access corporate admin features.

### Company Admin
Corporate tenant administrator. Purchases employee packages, invites employees, and views company-scoped participation, attendance, wellness engagement, and AI reports. Cannot teach, purchase individual courses, or access platform-wide admin functions.

### Employee
Corporate learner. Registers with company code, attends assigned wellness programs and sessions, watches recordings, and tracks personal participation. Cannot purchase courses, submit assignments, chat with teachers, or manage company settings.

---

## 4. Deny-by-Default Actions

The following actions have **no allowed role** among the five defined roles and are restricted to system services:

| Resource | Action | Allowed Roles |
|----------|--------|---------------|
| Payments | Process webhook (gateway callback) | — *(system service account)* |
| Class Sessions | Auto-create Google Meet link | — *(system service account)* |
| Recordings | Auto-ingest from Meet | — *(system service account)* |
| Certificates | Auto-generate PDF | — *(system service account)* |
| AI Reports | Auto-generate scheduled report | — *(background job)* |
| Notifications | Dispatch email / SMS | — *(notification service)* |

---

## 5. Implementation Notes

1. **Enforce at API layer** — Every endpoint checks `role` + `scope` (ownership, company_id, enrollment_id) before executing.
2. **Active role context** — JWT or session payload must include `active_role` and `company_id` (when applicable).
3. **Teacher performance gate** — Middleware checks `teacher_profiles.performance_status` before allowing Teacher write operations.
4. **Enrollment gate** — Student and Employee content access (recordings, lessons, sessions) validates active enrollment or company program assignment.
5. **Replay limit** — Recording `watch` action enforces `view_count ≤ max_replay_count` unless admin override exists.
6. **Refund window** — Refund `request` action validates order is within 3 days of `class_start_date`.
7. **Audit** — All Admin mutations and sensitive Teacher/Company Admin actions write to `audit_logs`.

---

## Appendix — Document References

- [Product Requirements Document](./prd.md)
- [System Architecture](./architecture.md)
- [Database Design](./database.md)
