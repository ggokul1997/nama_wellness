# Nama Wellness — REST API Specification

**Version:** 1.0  
**Base URL:** `https://api.namawellness.com/api/v1`  
**Source:** [Product Requirements Document](./prd.md) · [RBAC Matrix](./rbac.md)

---

## 1. Conventions

| Item | Standard |
|------|----------|
| Format | JSON (`Content-Type: application/json`) |
| Auth header | `Authorization: Bearer <access_token>` |
| Active role header | `X-Active-Role: student \| teacher \| admin \| company_admin \| employee` |
| Pagination | `?page=1&limit=20` → response includes `meta: { page, limit, total, totalPages }` |
| Sorting | `?sort=created_at&order=desc` |
| Filtering | Query params per resource (e.g. `?status=published`) |
| IDs | UUID strings |
| Timestamps | ISO 8601 UTC (`2026-06-11T10:30:00Z`) |
| Money | `{ "amount": "1500.00", "currency": "INR" }` |
| Errors | `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }` |

### 1.1 Common Response Envelope

**Success (single resource)**
```json
{ "data": { } }
```

**Success (collection)**
```json
{ "data": [ ], "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

**Error**
```json
{ "error": { "code": "FORBIDDEN", "message": "Insufficient permissions", "details": [] } }
```

### 1.2 Authentication Levels

| Level | Description |
|-------|-------------|
| **Public** | No token required |
| **Authenticated** | Valid JWT; any active role |
| **Role: {role}** | Valid JWT + `X-Active-Role` matching listed role(s) |
| **Enrollment** | Authenticated + active enrollment on referenced course |
| **Ownership** | Authenticated + resource belongs to caller (teacher's course, own company, etc.) |
| **Webhook** | Gateway signature verification (no JWT) |

---

## 2. Authentication

### POST `/auth/register`
Register EdPro user (Student or Teacher).

| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "email": "user@example.com", "phone": "+919876543210", "password": "string", "firstName": "Asha", "lastName": "Patel", "role": "student" }` — `role`: `student` \| `teacher` |
| **Response Body** | `201` `{ "data": { "userId": "uuid", "email": "user@example.com", "emailVerified": false, "phoneVerified": false, "message": "Verification email sent" } }` |

---

### POST `/auth/register/corporate`
Register Corporate user with company code.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "email": "emp@company.com", "phone": "+919876543210", "password": "string", "firstName": "Raj", "lastName": "Kumar", "companyCode": "ACME2026", "role": "employee" }` — `role`: `employee` \| `company_admin` |
| **Response Body** | `201` `{ "data": { "userId": "uuid", "companyId": "uuid", "emailVerified": false, "phoneVerified": false } }` |

---

### POST `/auth/login`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "email": "user@example.com", "password": "string" }` |
| **Response Body** | `200` `{ "data": { "accessToken": "jwt", "refreshToken": "jwt", "expiresIn": 3600, "user": { "id": "uuid", "email": "user@example.com", "roles": ["student"], "profile": { "firstName": "Asha", "lastName": "Patel" } } } }` |

---

### POST `/auth/refresh`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "refreshToken": "jwt" }` |
| **Response Body** | `200` `{ "data": { "accessToken": "jwt", "expiresIn": 3600 } }` |

---

### POST `/auth/logout`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Authenticated |
| **Request Body** | `{ "refreshToken": "jwt" }` |
| **Response Body** | `204` No content |

---

### POST `/auth/verify-email`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "token": "email_verification_token" }` |
| **Response Body** | `200` `{ "data": { "emailVerified": true } }` |

---

### POST `/auth/verify-phone/send`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Authenticated |
| **Request Body** | `{ "phone": "+919876543210" }` |
| **Response Body** | `200` `{ "data": { "message": "OTP sent", "expiresIn": 300 } }` |

---

### POST `/auth/verify-phone/confirm`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Authenticated |
| **Request Body** | `{ "phone": "+919876543210", "otp": "123456" }` |
| **Response Body** | `200` `{ "data": { "phoneVerified": true } }` |

---

### POST `/auth/forgot-password`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "email": "user@example.com" }` |
| **Response Body** | `200` `{ "data": { "message": "Reset link sent if account exists" } }` |

---

### POST `/auth/reset-password`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Public |
| **Request Body** | `{ "token": "reset_token", "password": "newPassword" }` |
| **Response Body** | `200` `{ "data": { "message": "Password updated" } }` |

---

## 3. Profile & Users

### GET `/profile`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Authenticated |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "email": "user@example.com", "phone": "+91...", "emailVerified": true, "phoneVerified": true, "roles": ["student"], "profile": { "firstName": "Asha", "lastName": "Patel", "avatarUrl": null, "bio": null, "timezone": "Asia/Kolkata" } } }` |

---

### PATCH `/profile`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Authenticated |
| **Request Body** | `{ "firstName": "Asha", "lastName": "Patel", "bio": "Yoga enthusiast", "timezone": "Asia/Kolkata" }` |
| **Response Body** | `200` `{ "data": { /* updated profile */ } }` |

---

### POST `/profile/avatar`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Authenticated |
| **Request Body** | `{ "fileUrl": "s3://...", "fileName": "avatar.jpg", "mimeType": "image/jpeg" }` — presigned upload flow |
| **Response Body** | `200` `{ "data": { "avatarUrl": "https://..." } }` |

---

### GET `/users`
List all users (admin).

| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Query** | `?role=student&status=active&search=asha` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "email": "...", "status": "active", "roles": ["student"], "createdAt": "..." }], "meta": {} }` |

---

### GET `/users/:userId`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "email": "...", "phone": "...", "status": "active", "roles": [], "profile": {}, "createdAt": "..." } }` |

---

### PATCH `/users/:userId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Admin |
| **Request Body** | `{ "status": "suspended", "reason": "Policy violation" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "suspended" } }` |

---

### POST `/users/:userId/suspend`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "string" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "suspended" } }` |

---

### POST `/users/:userId/reactivate`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "string" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "active" } }` |

---

## 4. Teacher Onboarding

### POST `/teacher/applications`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher |
| **Request Body** | `{ "specialties": ["yoga", "meditation"], "bio": "10 years experience" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "pending", "submittedAt": "..." } }` |

---

### GET `/teacher/applications/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "under_review", "documents": [], "interviews": [] } }` |

---

### GET `/teacher/applications`
List applications (admin).

| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Query** | `?status=pending` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "userId": "uuid", "status": "pending", "submittedAt": "..." }], "meta": {} }` |

---

### GET `/teacher/applications/:applicationId`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Response Body** | `200` `{ "data": { "id": "uuid", "user": {}, "documents": [], "interviews": [], "status": "under_review" } }` |

---

### POST `/teacher/applications/:applicationId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "notes": "Approved after interview" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved" } }` |

---

### POST `/teacher/applications/:applicationId/reject`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Insufficient certification" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "rejected" } }` |

---

### POST `/teacher/applications/:applicationId/documents`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own application) |
| **Request Body** | `{ "documentType": "government_id", "fileUrl": "s3://...", "fileName": "id.pdf", "mimeType": "application/pdf", "fileSizeBytes": 102400 }` — `documentType`: `government_id` \| `certification` \| `experience_proof` \| `profile_photo` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "documentType": "government_id", "verified": false } }` |

---

### POST `/teacher/applications/:applicationId/documents/:documentId/verify`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "verified": true }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "verified": true } }` |

---

### POST `/teacher/applications/:applicationId/interviews`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "scheduledAt": "2026-06-15T14:00:00Z" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "scheduledAt": "...", "outcome": "pending" } }` |

---

### PATCH `/teacher/applications/:applicationId/interviews/:interviewId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Admin |
| **Request Body** | `{ "outcome": "passed", "notes": "Strong candidate" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "outcome": "passed" } }` |

---

### GET `/teacher/profile`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher |
| **Response Body** | `200` `{ "data": { "onboardingFeePaid": true, "performanceStatus": "good_standing", "specialties": [], "averageRating": 4.8, "activatedAt": "..." } }` |

---

### POST `/teacher/complaints`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student |
| **Request Body** | `{ "teacherId": "uuid", "courseId": "uuid", "description": "string" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "open" } }` |

---

### GET `/teacher/complaints`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "teacherId": "uuid", "status": "open" }], "meta": {} }` |

---

### PATCH `/teacher/complaints/:complaintId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Admin |
| **Request Body** | `{ "status": "resolved", "resolution": "Warning issued" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "resolved" } }` |

---

### POST `/teacher/:teacherId/termination`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Repeated no-shows" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "open" } }` |

---

### PATCH `/teacher/:teacherId/performance-status`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Admin |
| **Request Body** | `{ "performanceStatus": "probation", "reason": "Low attendance" }` — `good_standing` \| `warning` \| `probation` \| `suspension` \| `terminated` |
| **Response Body** | `200` `{ "data": { "teacherId": "uuid", "performanceStatus": "probation" } }` |

---

## 5. Categories

### GET `/categories`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Public |
| **Query** | `?isActive=true` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "name": "Yoga", "slug": "yoga", "iconUrl": null, "sortOrder": 1 }] }` |

---

### POST `/categories`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "name": "Dance", "slug": "dance", "description": "...", "iconUrl": null, "sortOrder": 10 }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "name": "Dance", "slug": "dance" } }` |

---

### PATCH `/categories/:categoryId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Admin |
| **Request Body** | `{ "name": "Dance & Movement", "isActive": true }` |
| **Response Body** | `200` `{ "data": { /* updated category */ } }` |

---

### DELETE `/categories/:categoryId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Admin |
| **Response Body** | `204` No content |

---

## 6. Courses

### GET `/courses`
Browse published courses.

| | |
|---|---|
| **Method** | GET |
| **Auth** | Public (published only) / Authenticated (extended filters) |
| **Query** | `?categoryId=uuid&courseType=live&search=yoga&page=1&limit=20` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "title": "Morning Yoga", "slug": "morning-yoga", "courseType": "live", "category": { "id": "uuid", "name": "Yoga" }, "teacher": { "id": "uuid", "name": "Priya Sharma", "averageRating": 4.9 }, "coverImageUrl": null, "pricing": { "amount": "2999.00", "currency": "INR" }, "status": "published" }], "meta": {} }` |

---

### GET `/courses/:courseId`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Public (published) / Role: Admin, Teacher (any status, ownership) |
| **Response Body** | `200` `{ "data": { "id": "uuid", "title": "...", "description": "...", "courseType": "hybrid", "status": "published", "category": {}, "teacher": {}, "pricing": {}, "modules": [], "publishedAt": "..." } }` |

---

### POST `/courses`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher, Admin |
| **Request Body** | `{ "title": "Morning Yoga", "description": "...", "courseType": "live", "categoryId": "uuid", "coverImageUrl": null }` — `courseType`: `live` \| `recorded` \| `hybrid` \| `individual` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "title": "Morning Yoga", "status": "draft" } }` |

---

### PATCH `/courses/:courseId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "title": "Updated Title", "description": "..." }` |
| **Response Body** | `200` `{ "data": { /* updated course */ } }` |

---

### POST `/courses/:courseId/submit`
Submit course for admin review.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own) |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "pending_review" } }` |

---

### POST `/courses/:courseId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "notes": "Approved" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved" } }` |

---

### POST `/courses/:courseId/reject`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Pricing too high" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "rejected" } }` |

---

### POST `/courses/:courseId/request-changes`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "feedback": "Add module descriptions" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "changes_requested" } }` |

---

### POST `/courses/:courseId/publish`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "published", "publishedAt": "..." } }` |

---

### POST `/courses/:courseId/assign-teacher`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "teacherId": "uuid" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "teacherId": "uuid" } }` |

---

### POST `/courses/:courseId/pricing`
Propose course price.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "amount": "2999.00", "currency": "INR" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "amount": "2999.00", "approvalStatus": "pending" } }` |

---

### POST `/courses/:courseId/pricing/:pricingId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "amount": "2499.00" }` — optional admin price override |
| **Response Body** | `200` `{ "data": { "id": "uuid", "approvalStatus": "approved", "isCurrent": true } }` |

---

### GET `/courses/:courseId/modules`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Public (preview lessons) / Enrollment (full access) |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "title": "Week 1", "sortOrder": 1, "lessons": [] }] }` |

---

### POST `/courses/:courseId/modules`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "title": "Week 1", "description": "...", "sortOrder": 1 }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "title": "Week 1" } }` |

---

### PATCH `/courses/:courseId/modules/:moduleId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "title": "Week 1 — Foundations" }` |
| **Response Body** | `200` `{ "data": { /* updated module */ } }` |

---

### DELETE `/courses/:courseId/modules/:moduleId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Teacher (own), Admin |
| **Response Body** | `204` No content |

---

### POST `/courses/:courseId/modules/:moduleId/lessons`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "title": "Introduction", "lessonType": "video", "contentUrl": "s3://...", "durationSeconds": 600, "sortOrder": 1, "isPreview": false }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "title": "Introduction" } }` |

---

### PATCH `/courses/:courseId/modules/:moduleId/lessons/:lessonId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "title": "...", "contentUrl": "s3://..." }` |
| **Response Body** | `200` `{ "data": { /* updated lesson */ } }` |

---

### DELETE `/courses/:courseId/modules/:moduleId/lessons/:lessonId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Teacher (own), Admin |
| **Response Body** | `204` No content |

---

### POST `/courses/:courseId/lessons/:lessonId/progress`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student, Employee + Enrollment |
| **Request Body** | `{ "progressPercent": 75, "lastPositionSeconds": 450, "completed": false }` |
| **Response Body** | `200` `{ "data": { "lessonId": "uuid", "progressPercent": 75, "completedAt": null } }` |

---

### GET `/courses/:courseId/materials`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Employee (enrolled) / Teacher (own) / Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "title": "Pose Guide", "fileUrl": "...", "approvalStatus": "approved" }] }` |

---

### POST `/courses/:courseId/materials`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own) |
| **Request Body** | `{ "title": "Pose Guide", "fileUrl": "s3://...", "fileName": "guide.pdf", "mimeType": "application/pdf", "fileSizeBytes": 204800 }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "approvalStatus": "pending" } }` |

---

### POST `/courses/:courseId/materials/:materialId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "approvalStatus": "approved" } }` |

---

## 7. Batches & Live Classes

### GET `/courses/:courseId/batches`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Authenticated |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "name": "Batch A", "capacity": 30, "enrolledCount": 12, "startDate": "2026-07-01", "status": "upcoming" }] }` |

---

### POST `/courses/:courseId/batches`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own course) |
| **Request Body** | `{ "name": "Batch A", "capacity": 30, "startDate": "2026-07-01", "endDate": "2026-09-30" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "name": "Batch A", "status": "upcoming" } }` |

---

### PATCH `/batches/:batchId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "name": "Batch A — Morning", "capacity": 25 }` |
| **Response Body** | `200` `{ "data": { /* updated batch */ } }` |

---

### GET `/batches/:batchId/sessions`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher (own), Student/Employee (enrolled), Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "title": "Session 1", "scheduledAt": "...", "durationMinutes": 60, "meetLink": "https://meet.google.com/...", "status": "scheduled" }] }` |

---

### POST `/batches/:batchId/sessions`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own batch) |
| **Request Body** | `{ "title": "Session 1", "scheduledAt": "2026-07-05T06:00:00Z", "durationMinutes": 60 }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "meetLink": "https://meet.google.com/...", "calendarEventId": "...", "status": "scheduled" } }` |

---

### PATCH `/sessions/:sessionId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own), Admin |
| **Request Body** | `{ "scheduledAt": "2026-07-05T07:00:00Z", "status": "cancelled" }` |
| **Response Body** | `200` `{ "data": { /* updated session */ } }` |

---

### GET `/teacher/availability`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isRecurring": true }] }` |

---

### POST `/teacher/availability`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher |
| **Request Body** | `{ "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isRecurring": true }` |
| **Response Body** | `201` `{ "data": { "id": "uuid" } }` |

---

### GET `/teachers/:teacherId/availability`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student |
| **Query** | `?date=2026-07-10` |
| **Response Body** | `200` `{ "data": [{ "slotStart": "2026-07-10T09:00:00Z", "slotEnd": "2026-07-10T10:00:00Z", "available": true }] }` |

---

### POST `/courses/:courseId/bookings`
Book individual session.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student |
| **Request Body** | `{ "teacherId": "uuid", "slotStart": "2026-07-10T09:00:00Z", "slotEnd": "2026-07-10T10:00:00Z" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "pending", "orderId": "uuid" } }` |

---

### GET `/bookings/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Teacher |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "courseId": "uuid", "slotStart": "...", "meetLink": "...", "status": "confirmed" }] }` |

---

### PATCH `/bookings/:bookingId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Student (own), Teacher (own), Admin |
| **Request Body** | `{ "status": "cancelled" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "cancelled" } }` |

---

## 8. Enrollments

### POST `/courses/:courseId/enroll`
Purchase and enroll (creates order + payment intent).

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student |
| **Request Body** | `{ "batchId": "uuid", "paymentGateway": "razorpay" }` — `batchId` required for live/hybrid |
| **Response Body** | `201` `{ "data": { "enrollmentId": "uuid", "orderId": "uuid", "payment": { "id": "uuid", "gatewayOrderId": "order_xxx", "amount": "2999.00", "currency": "INR", "status": "pending" } } }` |

---

### POST `/courses/:courseId/enroll/corporate`
Enroll via company program (no payment).

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Employee |
| **Request Body** | `{ "batchId": "uuid" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "courseId": "uuid", "source": "corporate", "status": "active" } }` |

---

### POST `/courses/:courseId/enroll/assign`
Admin-assign enrollment.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "userId": "uuid", "batchId": "uuid", "source": "reassignment" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "active" } }` |

---

### GET `/enrollments/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Employee |
| **Query** | `?status=active` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "course": { "id": "uuid", "title": "..." }, "batch": {}, "status": "active", "progressPercent": 45, "enrolledAt": "..." }], "meta": {} }` |

---

### GET `/enrollments/:enrollmentId`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Employee (own) / Teacher (own course) / Admin |
| **Response Body** | `200` `{ "data": { "id": "uuid", "course": {}, "batch": {}, "status": "active", "progressPercent": 45, "lessonProgress": [] } }` |

---

### GET `/courses/:courseId/enrollments`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher (own course), Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "user": { "id": "uuid", "name": "..." }, "status": "active", "progressPercent": 60 }], "meta": {} }` |

---

### POST `/enrollments/:enrollmentId/complete`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own course), Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "completed", "completedAt": "..." } }` |

---

## 9. Attendance

### POST `/sessions/:sessionId/attendance/join`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student, Employee + Enrollment |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "sessionId": "uuid", "joinedAt": "...", "meetLink": "https://meet.google.com/..." } }` |

---

### POST `/sessions/:sessionId/attendance/leave`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student, Employee + Enrollment |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "leftAt": "...", "durationSeconds": 3420, "attendancePercentage": 95.0 } }` |

---

### GET `/sessions/:sessionId/attendance`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher (own session), Admin |
| **Response Body** | `200` `{ "data": [{ "userId": "uuid", "userName": "...", "joinedAt": "...", "leftAt": "...", "attendancePercentage": 95.0 }] }` |

---

### GET `/enrollments/:enrollmentId/attendance`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Employee (own) / Teacher (own course) / Admin |
| **Response Body** | `200` `{ "data": [{ "sessionId": "uuid", "sessionTitle": "...", "joinedAt": "...", "attendancePercentage": 90.0 }] }` |

---

## 10. Recordings

### GET `/courses/:courseId/recordings`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Employee (enrolled) / Teacher (own) / Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "sessionId": "uuid", "durationSeconds": 3600, "status": "approved", "maxReplayCount": 5, "viewCount": 2 }] }` |

---

### GET `/recordings/:recordingId`
Returns playback URL (increments view count).

| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Employee + Enrollment |
| **Response Body** | `200` `{ "data": { "id": "uuid", "fileUrl": "https://...", "durationSeconds": 3600, "viewCount": 3, "remainingViews": 2 } }` |

---

### POST `/sessions/:sessionId/replacement-recordings`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own session) |
| **Request Body** | `{ "fileUrl": "s3://...", "fileName": "replacement.mp4" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "pending" } }` |

---

### POST `/replacement-recordings/:id/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved", "recordingId": "uuid" } }` |

---

### POST `/replacement-recordings/:id/reject`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Poor audio quality" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "rejected" } }` |

---

### POST `/recordings/:recordingId/access-override`
Admin override replay limit.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "enrollmentId": "uuid", "maxReplayCount": null, "reason": "Technical issue during live class" }` — `null` = unlimited |
| **Response Body** | `201` `{ "data": { "id": "uuid", "maxReplayCount": null } }` |

---

## 11. Assignments

### GET `/courses/:courseId/assignments`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student (enrolled), Teacher (own), Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "title": "Week 1 Reflection", "dueDate": "...", "instructions": "..." }] }` |

---

### POST `/courses/:courseId/assignments`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own course) |
| **Request Body** | `{ "title": "Week 1 Reflection", "instructions": "...", "dueDate": "2026-07-15T23:59:59Z", "maxScore": 100 }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "title": "Week 1 Reflection" } }` |

---

### PATCH `/assignments/:assignmentId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own) |
| **Request Body** | `{ "title": "...", "dueDate": "..." }` |
| **Response Body** | `200` `{ "data": { /* updated assignment */ } }` |

---

### DELETE `/assignments/:assignmentId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Teacher (own) |
| **Response Body** | `204` No content |

---

### POST `/assignments/:assignmentId/submissions`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student + Enrollment |
| **Request Body** | `{ "fileUrl": "s3://...", "fileName": "submission.pdf", "notes": "Completed all poses" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "submitted", "submittedAt": "..." } }` |

---

### GET `/assignments/:assignmentId/submissions`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher (own course), Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "student": { "id": "uuid", "name": "..." }, "status": "submitted", "submittedAt": "..." }] }` |

---

### GET `/assignments/:assignmentId/submissions/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student + Enrollment |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved", "feedback": "Great work!", "score": 95 } }` |

---

### PATCH `/submissions/:submissionId`
Review submission.

| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Teacher (own course) |
| **Request Body** | `{ "status": "approved", "feedback": "Great work!", "score": 95 }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved", "feedback": "Great work!" } }` |

---

## 12. Certificates

### POST `/enrollments/:enrollmentId/certificate/request`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student (own, completed enrollment) |
| **Request Body** | — |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "pending_approval" } }` |

---

### POST `/certificates/:certificateId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (own course) |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "issued", "pdfUrl": "https://...", "qrVerificationCode": "NW-XXXX", "issuedAt": "..." } }` |

---

### GET `/certificates/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "courseName": "...", "teacherName": "...", "completionDate": "2026-08-01", "pdfUrl": "...", "status": "issued" }] }` |

---

### GET `/certificates/verify/:qrCode`
Public certificate verification.

| | |
|---|---|
| **Method** | GET |
| **Auth** | Public |
| **Response Body** | `200` `{ "data": { "valid": true, "studentName": "...", "courseName": "...", "teacherName": "...", "completionDate": "2026-08-01", "issuedAt": "..." } }` |

---

### POST `/certificates/:certificateId/revoke`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Fraudulent completion" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "revoked" } }` |

---

## 13. Chat

### GET `/conversations`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Teacher |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "courseId": "uuid", "participants": [], "lastMessage": { "body": "...", "sentAt": "..." } }] }` |

---

### POST `/conversations`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student, Teacher |
| **Request Body** | `{ "participantId": "uuid", "courseId": "uuid" }` — `courseId` optional |
| **Response Body** | `201` `{ "data": { "id": "uuid", "participants": [] } }` |

---

### GET `/conversations/:conversationId/messages`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Teacher (participant) / Admin (moderation) |
| **Query** | `?page=1&limit=50` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "senderId": "uuid", "messageType": "text", "body": "Hello", "fileUrl": null, "sentAt": "..." }], "meta": {} }` |

---

### POST `/conversations/:conversationId/messages`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student, Teacher (participant) |
| **Request Body** | `{ "messageType": "text", "body": "Hello" }` or `{ "messageType": "file", "fileUrl": "s3://...", "fileName": "notes.pdf" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "sentAt": "..." } }` |

---

### DELETE `/messages/:messageId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Admin |
| **Response Body** | `204` No content |

---

## 14. Reviews

### POST `/teachers/:teacherId/reviews`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student + Enrollment |
| **Request Body** | `{ "courseId": "uuid", "enrollmentId": "uuid", "rating": 5, "comment": "Excellent teacher!" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "rating": 5, "status": "active" } }` |

---

### GET `/teachers/:teacherId/reviews`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Public |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "rating": 5, "comment": "...", "studentName": "Asha P.", "createdAt": "..." }], "meta": {} }` |

---

### DELETE `/reviews/:reviewId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Inappropriate content" }` |
| **Response Body** | `204` No content |

---

## 15. Payments & Orders

### POST `/payments/course`
Initiate course purchase payment.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student |
| **Request Body** | `{ "courseId": "uuid", "batchId": "uuid", "gateway": "razorpay" }` — `gateway`: `razorpay` \| `stripe` \| `upi` |
| **Response Body** | `201` `{ "data": { "paymentId": "uuid", "orderId": "uuid", "gatewayOrderId": "order_xxx", "amount": "2999.00", "currency": "INR", "checkoutUrl": "https://..." } }` |

---

### POST `/payments/onboarding`
Teacher onboarding fee payment.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Teacher (approved, fee unpaid) |
| **Request Body** | `{ "gateway": "razorpay" }` |
| **Response Body** | `201` `{ "data": { "paymentId": "uuid", "amount": "500.00", "currency": "INR", "checkoutUrl": "https://..." } }` |

---

### POST `/payments/subscription`
Corporate subscription payment.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Company Admin |
| **Request Body** | `{ "tier": "up_to_25", "gateway": "razorpay" }` — `tier`: `up_to_10` \| `up_to_25` \| `up_to_50` \| `up_to_100` \| `custom` |
| **Response Body** | `201` `{ "data": { "paymentId": "uuid", "subscriptionId": "uuid", "amount": "10000.00", "checkoutUrl": "https://..." } }` |

---

### GET `/payments/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Teacher, Company Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "amount": "2999.00", "purpose": "course_purchase", "status": "completed", "createdAt": "..." }], "meta": {} }` |

---

### GET `/payments`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Query** | `?status=completed&purpose=course_purchase` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "userId": "uuid", "amount": "...", "status": "completed" }], "meta": {} }` |

---

### GET `/orders/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Student, Company Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "courseId": "uuid", "totalAmount": "2999.00", "status": "paid", "createdAt": "..." }] }` |

---

### GET `/orders`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "userId": "uuid", "status": "paid" }], "meta": {} }` |

---

### POST `/orders/:orderId/refund`
Request refund (within 3-day window).

| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Student (own order) |
| **Request Body** | `{ "reason": "Schedule conflict" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "status": "requested", "withinRefundWindow": true } }` |

---

### POST `/refunds/:refundId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved" } }` |

---

### POST `/refunds/:refundId/reject`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Outside refund window" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "rejected" } }` |

---

### POST `/webhooks/razorpay`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Webhook (Razorpay signature) |
| **Request Body** | Razorpay event payload |
| **Response Body** | `200` `{ "received": true }` |

---

### POST `/webhooks/stripe`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Webhook (Stripe signature) |
| **Request Body** | Stripe event payload |
| **Response Body** | `200` `{ "received": true }` |

---

## 16. Payouts & Commission

### GET `/commission`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin, Teacher |
| **Response Body** | `200` `{ "data": { "platformRate": 15.0, "teacherRate": 85.0, "effectiveFrom": "2026-01-01" } }` |

---

### POST `/commission`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "platformRate": 15.0, "teacherRate": 85.0, "effectiveFrom": "2026-07-01" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "platformRate": 15.0, "teacherRate": 85.0 } }` |

---

### GET `/payouts/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "periodStart": "2026-06-01", "periodEnd": "2026-06-30", "grossAmount": "50000.00", "commissionAmount": "7500.00", "netAmount": "42500.00", "status": "paid" }], "meta": {} }` |

---

### GET `/payouts`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Query** | `?status=pending&teacherId=uuid` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "teacherId": "uuid", "netAmount": "42500.00", "status": "pending" }], "meta": {} }` |

---

### GET `/payouts/:payoutId`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher (own), Admin |
| **Response Body** | `200` `{ "data": { "id": "uuid", "lineItems": [{ "orderId": "uuid", "grossAmount": "2999.00", "netAmount": "2549.15" }] } }` |

---

### POST `/payouts/:payoutId/hold`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "reason": "Pending complaint investigation" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "held" } }` |

---

### POST `/payouts/:payoutId/approve`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "approved" } }` |

---

### POST `/payouts/:payoutId/mark-paid`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | — |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "paid", "paidAt": "..." } }` |

---

## 17. Corporate

### GET `/companies/me`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin |
| **Response Body** | `200` `{ "data": { "id": "uuid", "name": "Acme Corp", "companyCode": "ACME2026", "employeeLimit": 25, "status": "active", "subscription": { "tier": "up_to_25", "monthlyFee": "10000.00", "status": "active" } } }` |

---

### POST `/companies`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "name": "Acme Corp", "contactEmail": "hr@acme.com", "contactPhone": "+91...", "employeeLimit": 25 }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "companyCode": "ACME2026" } }` |

---

### GET `/companies`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "name": "Acme Corp", "status": "active" }], "meta": {} }` |

---

### PATCH `/companies/:companyId`
| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Role: Admin |
| **Request Body** | `{ "name": "Acme Corporation", "status": "active", "employeeLimit": 50 }` |
| **Response Body** | `200` `{ "data": { /* updated company */ } }` |

---

### GET `/companies/:companyId/employees`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin (own), Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "user": { "id": "uuid", "email": "...", "name": "..." }, "status": "active", "enrolledAt": "..." }], "meta": {} }` |

---

### POST `/companies/:companyId/invites`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Company Admin (own) |
| **Request Body** | `{ "email": "new.employee@acme.com" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "email": "new.employee@acme.com", "status": "pending", "expiresAt": "..." } }` |

---

### DELETE `/companies/:companyId/invites/:inviteId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Company Admin (own), Admin |
| **Response Body** | `204` No content |

---

### POST `/companies/:companyId/employees/:employeeId/deactivate`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Company Admin (own), Admin |
| **Request Body** | `{ "reason": "Left company" }` |
| **Response Body** | `200` `{ "data": { "id": "uuid", "status": "deactivated" } }` |

---

### GET `/companies/:companyId/programs`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin, Employee (own company) |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "course": { "id": "uuid", "title": "Workplace Yoga" }, "isActive": true }] }` |

---

### POST `/companies/:companyId/programs`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Admin |
| **Request Body** | `{ "courseId": "uuid" }` |
| **Response Body** | `201` `{ "data": { "id": "uuid", "courseId": "uuid", "isActive": true } }` |

---

### DELETE `/companies/:companyId/programs/:programId`
| | |
|---|---|
| **Method** | DELETE |
| **Auth** | Role: Admin |
| **Response Body** | `204` No content |

---

## 18. Analytics & AI Reports

### GET `/analytics/admin/revenue`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Query** | `?period=monthly&from=2026-01-01&to=2026-06-30` |
| **Response Body** | `200` `{ "data": { "totalRevenue": "500000.00", "commissions": "75000.00", "courseSales": "400000.00", "corporateSubscriptions": "100000.00", "trend": [] } }` |

---

### GET `/analytics/admin/teachers`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Response Body** | `200` `{ "data": [{ "teacherId": "uuid", "name": "...", "averageRating": 4.8, "completionRate": 85.0, "performanceStatus": "good_standing" }] }` |

---

### GET `/analytics/admin/students`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Response Body** | `200` `{ "data": { "totalStudents": 1200, "activeStudents": 800, "growth": [] } }` |

---

### GET `/analytics/teacher/dashboard`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Teacher |
| **Response Body** | `200` `{ "data": { "earnings": { "thisMonth": "42500.00", "total": "200000.00" }, "attendance": { "sessionsCompleted": 24, "missedSessions": 1 }, "completionRate": 78.5, "averageRating": 4.9, "upcomingClasses": [{ "sessionId": "uuid", "title": "...", "scheduledAt": "..." }] } }` |

---

### GET `/analytics/corporate/participation`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin |
| **Query** | `?from=2026-06-01&to=2026-06-30` |
| **Response Body** | `200` `{ "data": { "totalEmployees": 25, "activeParticipants": 18, "participationRate": 72.0, "byProgram": [] } }` |

---

### GET `/analytics/corporate/attendance`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin |
| **Response Body** | `200` `{ "data": { "averageAttendance": 85.5, "trends": [{ "date": "2026-06-01", "percentage": 90.0 }] } }` |

---

### GET `/analytics/corporate/engagement`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin |
| **Response Body** | `200` `{ "data": { "wellnessEngagementScore": 78.5, "enrollmentsByCourse": [], "monthlyActivity": [] } }` |

---

### GET `/analytics/employee/participation`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Employee |
| **Response Body** | `200` `{ "data": { "sessionsAttended": 12, "totalSessions": 16, "attendancePercentage": 75.0, "programsEnrolled": [] } }` |

---

### GET `/companies/:companyId/ai-reports`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin (own), Admin |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "reportType": "monthly_wellness", "periodStart": "2026-06-01", "periodEnd": "2026-06-30", "wellnessScore": 78.5, "generatedAt": "..." }] }` |

---

### POST `/companies/:companyId/ai-reports/generate`
| | |
|---|---|
| **Method** | POST |
| **Auth** | Role: Company Admin (own), Admin |
| **Request Body** | `{ "reportType": "monthly_wellness", "periodStart": "2026-06-01", "periodEnd": "2026-06-30" }` |
| **Response Body** | `202` `{ "data": { "jobId": "uuid", "status": "processing" } }` |

---

### GET `/ai-reports/:reportId`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Company Admin, Admin |
| **Response Body** | `200` `{ "data": { "id": "uuid", "wellnessScore": 78.5, "content": { "participationTrends": [], "employeeSummaries": [], "recommendedPrograms": [] } } }` |

---

## 19. Administration

### GET `/audit-logs`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Role: Admin |
| **Query** | `?actorId=uuid&entityType=course&from=2026-06-01` |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "actorId": "uuid", "action": "course.approve", "entityType": "course", "entityId": "uuid", "metadata": {}, "createdAt": "..." }], "meta": {} }` |

---

### GET `/notifications`
| | |
|---|---|
| **Method** | GET |
| **Auth** | Authenticated |
| **Response Body** | `200` `{ "data": [{ "id": "uuid", "channel": "email", "subject": "Class reminder", "body": "...", "sentAt": "..." }] }` |

---

## 20. File Uploads

### POST `/uploads/presign`
Get presigned S3 upload URL.

| | |
|---|---|
| **Method** | POST |
| **Auth** | Authenticated |
| **Request Body** | `{ "purpose": "document", "fileName": "id.pdf", "mimeType": "application/pdf", "fileSizeBytes": 102400 }` — `purpose`: `avatar` \| `document` \| `material` \| `assignment` \| `recording` \| `chat` |
| **Response Body** | `200` `{ "data": { "uploadUrl": "https://s3.amazonaws.com/...", "fileUrl": "s3://bucket/key", "expiresIn": 300 } }` |

---

## 21. HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Resource created |
| 202 | Accepted (async job started) |
| 204 | Success, no body |
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate enrollment, expired OTP) |
| 422 | Business rule violation (refund window expired, replay limit reached) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 22. Endpoint Summary

| Domain | Endpoints |
|--------|-----------|
| Authentication | 11 |
| Profile & Users | 8 |
| Teacher Onboarding | 14 |
| Categories | 4 |
| Courses & Content | 22 |
| Batches & Sessions | 12 |
| Enrollments | 6 |
| Attendance | 4 |
| Recordings | 6 |
| Assignments | 8 |
| Certificates | 5 |
| Chat | 5 |
| Reviews | 3 |
| Payments & Orders | 12 |
| Payouts & Commission | 8 |
| Corporate | 11 |
| Analytics & AI | 10 |
| Administration | 2 |
| File Uploads | 1 |
| **Total** | **152** |

---

## Appendix — Document References

- [Product Requirements Document](./prd.md)
- [RBAC Matrix](./rbac.md)
- [Database Design](./database.md)
- [System Architecture](./architecture.md)
