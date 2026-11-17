# AI Career Studio — Implementation Roadmap

**Status:** Planning document only. Application code must not be written until this roadmap is approved.

**Product:** AI Career Studio — a production-oriented SaaS platform for ATS-friendly resume creation, portfolios, resume analysis, job matching, interview preparation, AI career guidance, document management, subscriptions, and administration.

---

## 0. Planning Principles

1. **Real application, not a static demo.** Every user-facing action must call a real API, persist real data, or perform a real server-side operation.
2. **No fabricated outcomes.** AI results, payments, subscription state, dashboard metrics, and notifications must come from real services and database records. Explicit demo/sample data is allowed only in clearly labeled cases such as the template gallery, plan catalog, automated tests, and an optional seeded development account.
3. **Server-side secrets only.** AI keys, database credentials, payment secrets, and storage credentials exist only in backend environment variables.
4. **Shared validation.** Zod schemas live in a shared package and are used by both frontend forms and backend request validation.
5. **Authorization everywhere.** Authenticated endpoints enforce both role checks and object ownership checks.
6. **Separation of concerns.** Frontend, backend, shared code, and infrastructure configuration are independently maintainable.
7. **Accessibility and responsiveness are requirements, not polish tasks.** Every phase includes keyboard access, clear focus states, semantic markup, labels, error announcements, and mobile layouts.
8. **Observable and recoverable.** Errors, background jobs, webhooks, AI calls, and PDF generation are logged with request IDs and actionable failure states.

---

## 1. Detailed System Architecture

### 1.1 High-Level Architecture

```text
Browser / Mobile Browser
        |
        | HTTPS
        v
React + Vite SPA (apps/web)
  - Public marketing pages
  - Authentication and onboarding
  - Authenticated product workspace
  - Admin workspace
        |
        | REST JSON over HTTPS, credentials: include
        v
Express API (apps/api, /api/v1)
  - Request ID, rate limit, CORS/CSRF, auth, RBAC, Zod validation
  - Controllers -> Services -> Repositories -> Mongoose Models
        |
        +--> MongoDB
        |      - Users, resumes, portfolios, documents, jobs, billing, admin data
        |
        +--> Object Storage Adapter
        |      - Uploaded PDFs/DOCX, generated files, avatars, portfolio assets
        |
        +--> AI Provider Adapter
        |      - OpenAI or Gemini, server-side only
        |
        +--> Payment Provider Adapter
        |      - Checkout, portal, subscriptions, signed webhooks
        |
        +--> Transactional Email Adapter
               - Verification, password reset, security notices, notifications
```

### 1.2 Runtime Components

| Component           | Responsibility                                             | Notes                                                               |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| React SPA           | All UI rendering and user interaction                      | No secrets, no direct database or paid-provider calls               |
| Express API         | REST API, auth, business rules, integrations               | Single source of truth for data and authorization                   |
| MongoDB             | Primary persistent datastore                               | Mongoose models, indexes, validation, schema versioning             |
| Object storage      | Binary files                                               | Local adapter for development, S3-compatible adapter for production |
| AI provider         | Generation, analysis, matching, advice, interview feedback | Provider abstraction with deterministic test adapter only in tests  |
| Payment provider    | Checkout, billing portal, subscriptions, webhooks          | Webhook is authoritative for subscription state                     |
| Email provider      | Account verification and reset emails                      | Abstracted so no credential is tied to app logic                    |
| Background worker   | Long-running AI, parsing, PDF, email, and cleanup jobs     | Start in-process, extract to a queue/worker when volume requires it |
| Observability layer | Logs, metrics, health checks, request tracing              | Required before production launch                                   |

### 1.3 Request Flow

1. Browser sends a request with the HTTP-only auth cookie and CSRF header where required.
2. API assigns a request ID and logs method, path, authenticated user ID, and duration without logging secrets or sensitive payloads.
3. Middleware applies rate limiting, cookie parsing, authentication, role checks, and Zod validation.
4. Controller delegates to a service.
5. Service enforces business rules, quotas, ownership, and integration calls.
6. Repository performs MongoDB operations.
7. Response is returned in a consistent envelope; failures pass through a centralized error handler.
8. UI renders loading, error, empty, success, and offline/retry states as appropriate.

### 1.4 Deployment Topology

- **Development:** local API, local Vite dev server, local MongoDB via Docker, local filesystem storage adapter, explicit test-mode AI/payment adapters only in automated tests.
- **Staging:** deployed SPA, deployed API, managed MongoDB, object storage, real provider sandbox keys, webhook endpoint, email sandbox.
- **Production:** HTTPS-only SPA served from CDN/static hosting, autoscaled API, managed MongoDB with backups, object storage, real secrets from a secret manager, separate webhook URL, monitoring and alerting.

### 1.5 Cross-Cutting Concerns

| Concern        | Approach                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| API versioning | All endpoints under `/api/v1`                                                              |
| Errors         | Consistent `{ success: false, error: { code, message, details, requestId } }`              |
| Success        | Consistent `{ success: true, data, meta }`                                                 |
| Pagination     | `page`, `limit`, `sort`, `search`, cursor support where useful                             |
| Idempotency    | Required for payment/checkout operations and webhook processing                            |
| Rate limits    | Strict limits on auth, AI, PDF, parsing, and password reset endpoints                      |
| File handling  | Size limits, MIME and magic-byte checks, private storage keys, short-lived signed URLs     |
| Auditing       | Admin actions, role changes, billing changes, subscription changes, destructive operations |
| Data retention | Configurable retention for AI logs and generated artifacts; user deletion workflow         |
| Health checks  | `/health/live`, `/health/ready` with database and integration readiness checks             |

---

## 2. Frontend Architecture

### 2.1 Frontend Stack and Conventions

- React, Vite, TypeScript, Tailwind CSS, React Router, React Hook Form, Zod, Lucide React, Zustand.
- `@hookform/resolvers` is the expected adapter between React Hook Form and Zod.
- No direct calls to AI, payment, storage, or database services from the browser.
- All network access goes through a typed API client in `apps/web/src/lib/api`.
- Server data is fetched through feature hooks that expose explicit `loading`, `error`, `empty`, `success`, and `refetch` states. Zustand manages UI/session/onboarding state rather than duplicating server data indefinitely.

### 2.2 Application Shell

```text
App
├── BrowserRouter
├── ApiClientProvider
├── AuthProvider
├── ToastProvider
├── AccessibilityAnnouncer
├── RouteGuard
└── Layout
    ├── PublicLayout
    ├── AuthLayout
    ├── DashboardLayout
    └── AdminLayout
```

### 2.3 Route Map

| Route group      | Routes                                                                                                                                            | Access                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Public           | `/`, `/features`, `/templates`, `/pricing`, `/about`, `/contact`                                                                                  | Everyone                                      |
| Auth             | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`                                                                     | Guests; some token-bound                      |
| Onboarding       | `/onboarding/profile`, `/onboarding/goals`, `/onboarding/complete`                                                                                | Authenticated, incomplete onboarding          |
| Dashboard        | `/app`                                                                                                                                            | Authenticated                                 |
| Resumes          | `/app/resumes`, `/app/resumes/new`, `/app/resumes/:id/edit`, `/app/resumes/:id/analyze`                                                           | Authenticated owner                           |
| Templates        | `/app/templates`, `/app/templates/:id/preview`                                                                                                    | Authenticated; premium gated where applicable |
| Job matcher      | `/app/jobs`, `/app/jobs/:id`, `/app/matcher`                                                                                                      | Authenticated owner                           |
| Portfolio        | `/app/portfolio`, `/app/portfolio/projects`, `/app/portfolio/settings`                                                                            | Authenticated owner                           |
| Career advisor   | `/app/advisor`, `/app/advisor/:conversationId`                                                                                                    | Authenticated                                 |
| Interviews       | `/app/interviews`, `/app/interviews/:sessionId`                                                                                                   | Authenticated owner                           |
| Documents        | `/app/documents`, `/app/documents/:id`                                                                                                            | Authenticated owner                           |
| Billing          | `/app/billing`, `/app/billing/checkout`, `/app/billing/history`                                                                                   | Authenticated                                 |
| Settings         | `/app/settings/profile`, `/app/settings/security`, `/app/settings/notifications`, `/app/settings/privacy`                                         | Authenticated                                 |
| Notifications    | `/app/notifications`                                                                                                                              | Authenticated                                 |
| Public portfolio | `/p/:slug`                                                                                                                                        | Public if portfolio visibility allows         |
| Admin            | `/admin`, `/admin/users`, `/admin/resumes`, `/admin/templates`, `/admin/subscriptions`, `/admin/ai-usage`, `/admin/audit-logs`, `/admin/webhooks` | `admin` role                                  |

### 2.4 Feature Module Pattern

Each frontend feature follows the same structure:

```text
features/<feature>/
├── components/
├── pages/
├── hooks/
├── services/
├── types/
└── index.ts
```

Examples: `features/resume-builder`, `features/resume-analyzer`, `features/job-matcher`, `features/portfolio`, `features/career-advisor`, `features/interviews`, `features/documents`, `features/billing`, `features/admin`.

### 2.5 State Management

| State                                                         | Location                                                     | Rationale                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Auth user, token status, onboarding stage                     | Zustand auth store                                           | Needed globally across route guards and layout |
| UI-only state: sidebar, modals, wizard step, editor selection | Feature Zustand stores or local state                        | Ephemeral and browser-local                    |
| Server data                                                   | Feature hooks + API client                                   | Source of truth remains backend                |
| Form state                                                    | React Hook Form                                              | Efficient validation and field-level errors    |
| Toast/notification feedback                                   | Toast store                                                  | Cross-page user feedback                       |
| Editor autosave state                                         | Debounced custom hook with pending/saving/saved/error states | Must communicate reliability to user           |

### 2.6 Design System

Tailwind theme tokens must use the exact brand palette:

| Token            | Hex       | Usage                                                           |
| ---------------- | --------- | --------------------------------------------------------------- |
| `brand.burgundy` | `#800020` | Primary buttons, active navigation, key headings, focus accents |
| `brand.beige`    | `#F3E6D5` | Warm section backgrounds, cards, subtle dividers                |
| `brand.cream`    | `#FFF9F2` | Main application and marketing background                       |
| `brand.rose`     | `#D45060` | Accents, highlights, badges, critical emphasis                  |
| `brand.ink`      | `#302126` | Primary text and dark surfaces                                  |

Rules:

- Do not use purple, blue gradients, neon colors, or unrelated random colors.
- Use semantic aliases such as `surface`, `foreground`, `muted`, `border`, `success`, `warning`, and `danger` that resolve to approved palette values or restrained neutral tints derived from the brand palette.
- Use consistent radii, spacing scale, typography scale, shadows, and motion durations.
- Buttons: burgundy primary, beige secondary, rose for selective emphasis, text/outline for tertiary.
- Cards: cream or white-like neutral surface with beige border and subtle shadow.
- Charts and scores: burgundy/beige/rose family only.
- Respect `prefers-reduced-motion`.

### 2.7 Reusable Components

`Button`, `IconButton`, `Card`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Badge`, `Alert`, `Toast`, `Modal`, `Drawer`, `Tabs`, `Stepper`, `Skeleton`, `EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`, `DataTable`, `Pagination`, `FileDropzone`, `ScoreRing`, `TemplateCard`, `ResumeSectionEditor`, `AiActionButton`, `QuotaMeter`, `PermissionGate`, `RouteGuard`.

### 2.8 Accessibility Requirements

- Semantic HTML landmarks and heading hierarchy.
- Visible focus rings using the brand palette.
- Keyboard-operable modals, menus, tabs, drag-and-drop alternatives.
- Labels, descriptions, `aria-invalid`, and live-region error messages.
- Color contrast checks for burgundy, rose, beige, and ink combinations.
- Form errors summarized and linked to fields.
- Alt text for previews; text alternatives for score charts.
- No color-only status signaling.
- Screen-reader announcements for autosave, AI completion, payment redirects, and errors.

---

## 3. Backend Architecture

### 3.1 Layered Structure

```text
Route -> Middleware -> Controller -> Service -> Repository -> Mongoose Model
                             |
                             +--> Integration Adapter (AI, storage, payment, email)
```

| Layer        | Responsibility                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Routes       | Map URLs to controllers; apply auth, roles, validation, rate limits                                   |
| Middleware   | Request ID, logging, cookie parsing, auth, RBAC, Zod validation, upload handling, error normalization |
| Controllers  | Parse request, call service, shape HTTP response; no business logic                                   |
| Services     | Business rules, quotas, ownership, orchestration, transaction-like workflows                          |
| Repositories | Mongoose queries, projections, pagination, index-aware access                                         |
| Models       | Collection shape, schema validation, indexes, hooks, plugins                                          |
| Integrations | Provider-specific adapters behind stable interfaces                                                   |
| Jobs         | Async tasks for parsing, PDF generation, AI workflows, email, cleanup                                 |
| Validators   | Shared Zod schemas and backend-specific refinements                                                   |

### 3.2 Backend Modules

| Module               | Service responsibility                                                             |
| -------------------- | ---------------------------------------------------------------------------------- |
| Auth service         | Registration, verification, login, refresh rotation, logout, password reset        |
| User service         | Profile/settings, onboarding, account deletion, privacy controls                   |
| Resume service       | CRUD, versioning, section editing, duplication, export orchestration               |
| Template service     | Template catalog, preview metadata, admin template management                      |
| AI service           | Provider selection, prompt execution, structured output validation, usage metering |
| Analysis service     | ATS scoring, content checks, keyword analysis, recommendations                     |
| Job match service    | Job description storage, match execution, result comparison                        |
| Portfolio service    | Portfolio CRUD, publishing, slug generation, project management                    |
| Interview service    | Session creation, question generation, answer evaluation                           |
| Document service     | Upload metadata, parsing orchestration, signed download URLs                       |
| Billing service      | Plans, checkout, portal, subscription state, entitlements, webhook handling        |
| Notification service | In-app notifications and email triggers                                            |
| Admin service        | Aggregations, moderation, audit logs, support views                                |
| Audit service        | Immutable action records for sensitive operations                                  |

### 3.3 Middleware Order

1. Request ID / context
2. Security headers and CORS
3. Body/query parsing with size limits
4. Cookie parsing and CSRF checks for state-changing browser requests
5. Rate limiting
6. Authentication
7. Role/permission authorization
8. Zod request validation
9. Controller
10. Centralized error handler

### 3.4 Validation Strategy

- Define Zod schemas once in `packages/shared`.
- Frontend uses schemas for React Hook Form validation.
- Backend uses the same schemas for body, query, and params validation.
- Backend adds stricter refinements: object IDs, normalized emails, ownership, file metadata, provider payload signatures, and quota checks.
- All untrusted strings are trimmed and length-limited.
- Rich text from AI or users is sanitized before storage/rendering.
- Mongoose schema validation is a final safety net, not the only validation layer.

### 3.5 Error Handling

| Scenario              | HTTP status          | Error code example                                        |
| --------------------- | -------------------- | --------------------------------------------------------- |
| Invalid request       | 400                  | `VALIDATION_ERROR`                                        |
| Bad credentials       | 401                  | `INVALID_CREDENTIALS`                                     |
| Expired/invalid token | 401                  | `SESSION_EXPIRED`                                         |
| Forbidden resource    | 403                  | `FORBIDDEN`                                               |
| Not found             | 404                  | `NOT_FOUND`                                               |
| Conflict/duplicate    | 409                  | `CONFLICT`                                                |
| Payload too large     | 413                  | `PAYLOAD_TOO_LARGE`                                       |
| Rate limited          | 429                  | `RATE_LIMITED`                                            |
| Quota exhausted       | 402 or 429 by policy | `QUOTA_EXCEEDED`                                          |
| Provider failure      | 502                  | `AI_PROVIDER_UNAVAILABLE`, `PAYMENT_PROVIDER_UNAVAILABLE` |
| Unexpected failure    | 500                  | `INTERNAL_ERROR`                                          |

Errors include a request ID and never expose stack traces, secrets, or raw provider responses in production.

---

## 4. Database Schema and Relationships

### 4.1 Modeling Approach

- MongoDB with Mongoose.
- Use references for independently queried or high-cardinality data.
- Embed small, always-read-together arrays such as resume section content snapshots.
- Store AI output with provider/model/prompt version for traceability.
- Store sensitive tokens as hashes only.
- Store billing state from provider webhooks; never infer paid status from browser redirects.
- Add `schemaVersion` to versioned documents.
- Soft-delete user-owned content where recovery is useful; permanently remove on verified account deletion workflows.

### 4.2 Core Collections

#### `users`

| Field                    | Type        | Notes                                               |
| ------------------------ | ----------- | --------------------------------------------------- |
| `_id`                    | ObjectId    | Primary key                                         |
| `email`                  | string      | Unique, lowercase, indexed                          |
| `emailVerifiedAt`        | Date/null   | Verification state                                  |
| `passwordHash`           | string      | Argon2id or bcrypt with strong cost                 |
| `firstName`, `lastName`  | string      | Display and personalization                         |
| `role`                   | enum        | `user`, `admin`; role changes audited               |
| `status`                 | enum        | `active`, `suspended`, `deleted`                    |
| `onboardingCompletedAt`  | Date/null   | Drives onboarding route guard                       |
| `avatarUrl`              | string/null | Storage key or signed URL reference                 |
| `locale`, `timezone`     | string      | Notifications and formatting                        |
| `tokenVersion`           | number      | Invalidates existing sessions after security events |
| `lastLoginAt`            | Date/null   | Security overview                                   |
| `deletedAt`              | Date/null   | Soft deletion marker                                |
| `createdAt`, `updatedAt` | Date        | Timestamps                                          |

#### `user_profiles`

| Field                 | Type            | Notes                                           |
| --------------------- | --------------- | ----------------------------------------------- |
| `userId`              | ObjectId ref    | Unique, indexed                                 |
| `headline`, `summary` | string          | Career profile                                  |
| `location`            | string          | User location                                   |
| `skills`              | string[]        | Normalized skill list                           |
| `experience`          | embedded array  | Company, role, dates, description, achievements |
| `education`           | embedded array  | Institution, degree, dates, details             |
| `links`               | embedded object | Website, LinkedIn, GitHub, portfolio            |
| `preferences`         | embedded object | Job goals, industries, remote preference        |
| `schemaVersion`       | number          | Migration support                               |

#### `refresh_tokens`

| Field                 | Type         | Notes                             |
| --------------------- | ------------ | --------------------------------- |
| `userId`              | ObjectId ref | Indexed                           |
| `tokenHash`           | string       | Hashed refresh token, unique      |
| `expiresAt`           | Date         | TTL index                         |
| `revokedAt`           | Date/null    | Rotation/revocation               |
| `familyId`            | string       | Detects token reuse               |
| `userAgent`, `ipHash` | string       | Device metadata; IP stored hashed |
| `createdAt`           | Date         | Timestamp                         |

#### `email_tokens` / `password_reset_tokens`

| Field           | Type         | Notes              |
| --------------- | ------------ | ------------------ |
| `userId`        | ObjectId ref | Indexed            |
| `tokenHash`     | string       | Unique hash        |
| `type`          | enum         | Verification/reset |
| `expiresAt`     | Date         | Short TTL          |
| `usedAt`        | Date/null    | Single use         |
| `requestIpHash` | string       | Abuse tracking     |

#### `resumes`

| Field                              | Type            | Notes                                                                                      |
| ---------------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `userId`                           | ObjectId ref    | Indexed with `updatedAt`                                                                   |
| `title`                            | string          | User-visible name                                                                          |
| `templateId`                       | ObjectId ref    | Template catalog                                                                           |
| `targetRole`                       | string          | Used by AI tools                                                                           |
| `content`                          | embedded object | Contact, summary, skills, experience, education, projects, certifications, custom sections |
| `settings`                         | embedded object | Typography, spacing, visibility toggles, language                                          |
| `status`                           | enum            | `draft`, `ready`, `archived`                                                               |
| `currentVersion`                   | number          | Version counter                                                                            |
| `lastAnalyzedAt`, `lastExportedAt` | Date/null       | Activity metadata                                                                          |
| `schemaVersion`                    | number          | Resume content schema version                                                              |
| `deletedAt`                        | Date/null       | Soft deletion                                                                              |
| `createdAt`, `updatedAt`           | Date            | Timestamps                                                                                 |

#### `resume_versions`

| Field                | Type          | Notes                       |
| -------------------- | ------------- | --------------------------- |
| `resumeId`, `userId` | ObjectId refs | Indexed                     |
| `versionNumber`      | number        | Incrementing                |
| `contentSnapshot`    | object        | Complete editable snapshot  |
| `label`, `source`    | string        | Manual, AI, import, restore |
| `createdAt`          | Date          | Timestamp                   |

#### `templates`

| Field                        | Type    | Notes                                                      |
| ---------------------------- | ------- | ---------------------------------------------------------- |
| `slug`, `name`               | string  | Unique slug                                                |
| `description`, `category`    | string  | Catalog filtering                                          |
| `thumbnailUrl`, `previewUrl` | string  | Stored assets                                              |
| `schemaVersion`              | number  | Compatible resume content version                          |
| `isPremium`, `isActive`      | boolean | Entitlement and visibility                                 |
| `sortOrder`                  | number  | Catalog ordering                                           |
| `renderConfig`               | object  | Server-side PDF template identifier, approved fonts/layout |

#### `documents`

| Field                               | Type          | Notes                                                                              |
| ----------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `userId`                            | ObjectId ref  | Indexed                                                                            |
| `name`                              | string        | Original display name                                                              |
| `kind`                              | enum          | `resume_pdf`, `resume_docx`, `imported_resume`, `generated_pdf`, `portfolio_asset` |
| `storageKey`                        | string        | Private object storage key                                                         |
| `mimeType`, `sizeBytes`, `checksum` | string/number | Validation and dedupe                                                              |
| `status`                            | enum          | `uploaded`, `parsing`, `parsed`, `failed`, `deleted`                               |
| `extractedText`                     | string/null   | Parser output; retention-controlled                                                |
| `parseError`                        | string/null   | Safe internal error code/message                                                   |
| `expiresAt`                         | Date/null     | Cleanup policy                                                                     |
| `createdAt`, `updatedAt`            | Date          | Timestamps                                                                         |

#### `job_descriptions`

| Field                    | Type         | Notes                           |
| ------------------------ | ------------ | ------------------------------- |
| `userId`                 | ObjectId ref | Indexed                         |
| `title`, `company`       | string       | Job metadata                    |
| `description`            | string       | Raw source text, length-limited |
| `extractedRequirements`  | string[]     | Optional structured extraction  |
| `location`, `sourceUrl`  | string       | Context                         |
| `status`                 | enum         | `active`, `archived`            |
| `createdAt`, `updatedAt` | Date         | Timestamps                      |

#### `match_results`

| Field                                    | Type           | Notes                           |
| ---------------------------------------- | -------------- | ------------------------------- |
| `userId`, `resumeId`, `jobDescriptionId` | ObjectId refs  | Indexed                         |
| `score`                                  | number         | Bounded, explainable score      |
| `matchedSkills`, `missingSkills`         | string[]       | Evidence-based output           |
| `recommendations`                        | embedded array | Actionable suggestions          |
| `aiProvider`, `aiModel`, `promptVersion` | string         | Traceability                    |
| `inputHash`                              | string         | Prevents duplicate repeat calls |
| `createdAt`                              | Date           | Timestamp                       |

#### `resume_analyses`

| Field                                    | Type            | Notes                                     |
| ---------------------------------------- | --------------- | ----------------------------------------- |
| `userId`, `resumeId`                     | ObjectId refs   | Indexed                                   |
| `overallScore`                           | number          | Derived from real rules and AI output     |
| `categories`                             | embedded object | ATS, clarity, impact, structure, keywords |
| `issues`, `strengths`                    | embedded arrays | Severity and evidence                     |
| `suggestions`                            | embedded array  | Priority and rationale                    |
| `aiProvider`, `aiModel`, `promptVersion` | string          | Traceability                              |
| `createdAt`                              | Date            | Timestamp                                 |

#### `portfolios`

| Field                    | Type            | Notes                                    |
| ------------------------ | --------------- | ---------------------------------------- |
| `userId`                 | ObjectId ref    | Unique                                   |
| `slug`                   | string          | Unique, validated, reserved-word checked |
| `headline`, `bio`        | string          | Public profile content                   |
| `theme`                  | embedded object | Brand-approved theme options only        |
| `skills`                 | string[]        | Display skills                           |
| `socialLinks`            | embedded object | Validated URLs                           |
| `visibility`             | enum            | `private`, `unlisted`, `public`          |
| `seo`                    | embedded object | Title, description, social image         |
| `publishedAt`            | Date/null       | Publication state                        |
| `createdAt`, `updatedAt` | Date            | Timestamps                               |

#### `portfolio_projects`

| Field                          | Type           | Notes              |
| ------------------------------ | -------------- | ------------------ |
| `portfolioId`, `userId`        | ObjectId refs  | Indexed            |
| `title`, `description`, `role` | string         | Project content    |
| `technologies`                 | string[]       | Tags               |
| `link`, `repositoryUrl`        | string         | Validated URLs     |
| `mediaKeys`                    | string[]       | Storage references |
| `sortOrder`, `isFeatured`      | number/boolean | Display controls   |
| `createdAt`, `updatedAt`       | Date           | Timestamps         |

#### `ai_conversations`

| Field                    | Type                                   | Notes                                               |
| ------------------------ | -------------------------------------- | --------------------------------------------------- |
| `userId`                 | ObjectId ref                           | Indexed                                             |
| `type`                   | enum                                   | `career_advice`, `interview`, `portfolio`, `resume` |
| `title`                  | string                                 | Derived from real content                           |
| `contextRefs`            | embedded array                         | Resume/job/portfolio references only                |
| `messages`               | embedded array or ref to `ai_messages` | Role, content, createdAt, token counts              |
| `status`                 | enum                                   | `active`, `archived`                                |
| `createdAt`, `updatedAt` | Date                                   | Timestamps                                          |

#### `ai_generations`

| Field                                                | Type         | Notes                                                                    |
| ---------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `userId`                                             | ObjectId ref | Indexed                                                                  |
| `type`                                               | enum         | Content generation, rewrite, analysis, match, advice, interview feedback |
| `provider`, `model`, `promptVersion`                 | string       | Reproducibility                                                          |
| `status`                                             | enum         | `queued`, `running`, `succeeded`, `failed`                               |
| `inputHash`, `outputRef`                             | string       | Avoid raw secret storage; reference result collection                    |
| `tokensIn`, `tokensOut`, `costEstimate`, `latencyMs` | number       | Usage and cost tracking                                                  |
| `errorCode`                                          | string/null  | Safe failure reason                                                      |
| `createdAt`, `completedAt`                           | Date         | Timestamps                                                               |

#### `ai_usage`

| Field                   | Type         | Notes                                |
| ----------------------- | ------------ | ------------------------------------ |
| `userId`                | ObjectId ref | Unique with period                   |
| `periodKey`             | string       | `YYYY-MM`                            |
| `generationCount`       | number       | Counted server-side                  |
| `tokensIn`, `tokensOut` | number       | Aggregated                           |
| `quotaOverride`         | number/null  | Manual support adjustment with audit |
| `updatedAt`             | Date         | Timestamp                            |

#### `interview_sessions`

| Field                           | Type               | Notes                                         |
| ------------------------------- | ------------------ | --------------------------------------------- |
| `userId`                        | ObjectId ref       | Indexed                                       |
| `resumeId`, `jobDescriptionId`  | ObjectId refs/null | Context                                       |
| `role`, `company`, `difficulty` | string/enum        | Session setup                                 |
| `mode`                          | enum               | `behavioral`, `technical`, `mixed`            |
| `questions`                     | embedded array     | Prompt, expectedFocus, order                  |
| `answers`                       | embedded array     | User answer, feedback, score, timestamps      |
| `overallFeedback`               | object/null        | Generated only after real answers             |
| `status`                        | enum               | `draft`, `in_progress`, `completed`, `failed` |
| `createdAt`, `updatedAt`        | Date               | Timestamps                                    |

#### `notifications`

| Field              | Type         | Notes                                             |
| ------------------ | ------------ | ------------------------------------------------- |
| `userId`           | ObjectId ref | Indexed with `readAt`                             |
| `type`             | enum         | System, billing, AI completion, security, product |
| `title`, `message` | string       | Safe rendered text                                |
| `data`             | object       | Links/resource IDs                                |
| `readAt`           | Date/null    | Read state                                        |
| `createdAt`        | Date         | Timestamp                                         |

#### `plans`

| Field                            | Type               | Notes                                                    |
| -------------------------------- | ------------------ | -------------------------------------------------------- |
| `code`, `name`                   | string             | Unique catalog code                                      |
| `description`                    | string             | Pricing page content                                     |
| `currency`, `amount`, `interval` | string/number/enum | Display metadata; source of truth mirrored from provider |
| `providerPriceIds`               | object             | Provider-specific IDs                                    |
| `features`                       | embedded object    | Resume limits, AI quota, PDF limits, premium templates   |
| `isActive`, `sortOrder`          | boolean/number     | Catalog control                                          |
| `updatedAt`                      | Date               | Timestamp                                                |

#### `subscriptions`

| Field                                                      | Type          | Notes                                                    |
| ---------------------------------------------------------- | ------------- | -------------------------------------------------------- |
| `userId`                                                   | ObjectId ref  | Indexed                                                  |
| `planId`                                                   | ObjectId ref  | Plan reference                                           |
| `provider`, `providerCustomerId`, `providerSubscriptionId` | string        | Unique provider subscription                             |
| `status`                                                   | enum          | Active, trialing, past_due, canceled, incomplete, unpaid |
| `currentPeriodStart`, `currentPeriodEnd`                   | Date          | Access window                                            |
| `cancelAtPeriodEnd`                                        | boolean       | Portal state                                             |
| `priceId`, `currency`, `amount`                            | string/number | Actual paid plan                                         |
| `updatedAt`                                                | Date          | Webhook-driven state                                     |

#### `payments`

| Field                                 | Type               | Notes               |
| ------------------------------------- | ------------------ | ------------------- |
| `userId`, `subscriptionId`            | ObjectId refs      | Indexed             |
| `provider`, `providerPaymentIntentId` | string             | Unique              |
| `amount`, `currency`, `status`        | number/string/enum | Provider event data |
| `receiptUrl`                          | string/null        | From provider       |
| `createdAt`                           | Date               | Timestamp           |

#### `webhook_events`

| Field                       | Type        | Notes                                        |
| --------------------------- | ----------- | -------------------------------------------- |
| `provider`, `eventId`       | string      | Unique pair for idempotency                  |
| `type`                      | string      | Provider event type                          |
| `payloadHash`               | string      | Audit and dedupe                             |
| `status`                    | enum        | `received`, `processed`, `failed`, `ignored` |
| `errorCode`                 | string/null | Safe failure reason                          |
| `receivedAt`, `processedAt` | Date        | Timestamps                                   |

#### `audit_logs`

| Field                                  | Type                 | Notes                              |
| -------------------------------------- | -------------------- | ---------------------------------- |
| `actorId`, `actorRole`                 | ObjectId/ref, string | Who acted                          |
| `action`, `resourceType`, `resourceId` | string               | What changed                       |
| `metadata`                             | object               | Non-sensitive before/after summary |
| `ipHash`, `userAgent`                  | string               | Security context                   |
| `createdAt`                            | Date                 | Timestamp; append-only             |

### 4.3 Relationship Summary

```text
User 1--1 UserProfile
User 1--N RefreshToken
User 1--N Email/PasswordResetToken
User 1--N Resume 1--N ResumeVersion
User 1--N Document
User 1--N JobDescription 1--N MatchResult
Resume 1--N ResumeAnalysis
User 1--1 Portfolio 1--N PortfolioProject
User 1--N AiConversation / AiGeneration / AiUsage
User 1--N InterviewSession
User 1--N Notification
User 1--1 Subscription 1--N Payment
Template 1--N Resume
WebhookEvent independent, idempotent
AuditLog independent, append-only
```

### 4.4 Indexes and Constraints

- Unique: `users.email`, `refresh_tokens.tokenHash`, `templates.slug`, `portfolios.slug`, `plans.code`, `subscriptions.providerSubscriptionId`, `webhook_events.provider + eventId`.
- Compound: `resumes.userId + updatedAt`, `documents.userId + status`, `match_results.userId + createdAt`, `notifications.userId + readAt`, `ai_generations.userId + createdAt`, `payments.userId + createdAt`.
- TTL: refresh tokens, email/reset tokens, temporary uploads, old AI logs according to retention policy.
- All user-owned queries include `userId` in the filter even when the resource ID is unique.

---

## 5. Complete Folder Structure

```text
ai-career-studio/
├── .editorconfig
├── .gitignore
├── .npmrc
├── package.json                         # npm workspaces + shared scripts
├── package-lock.json
├── tsconfig.base.json
├── docker-compose.yml                   # Local MongoDB + optional mail catcher
├── README.md
├── PROJECT_ROADMAP.md
├── .env.example
├── docs/
│   ├── adr/                             # Architecture decision records
│   ├── api/                             # Extended API examples and contracts
│   ├── database/                        # ER notes, index notes, migration runbooks
│   ├── deployment/                      # Environment and release runbooks
│   └── security/                        # Threat model and response checklist
├── scripts/
│   ├── seed/
│   │   ├── templates.ts                 # Real template catalog seed
│   │   ├── plans.ts                     # Pricing catalog seed
│   │   └── dev-demo.ts                  # Explicitly labeled dev-only sample data
│   ├── verify-env.ts
│   └── reset-db.ts                      # Guarded, non-production script
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── constants/
│       │   │   ├── brand.ts
│       │   │   ├── roles.ts
│       │   │   ├── plans.ts
│       │   │   └── feature-flags.ts
│       │   ├── schemas/
│       │   │   ├── auth.ts
│       │   │   ├── user.ts
│       │   │   ├── resume.ts
│       │   │   ├── template.ts
│       │   │   ├── document.ts
│       │   │   ├── job.ts
│       │   │   ├── analysis.ts
│       │   │   ├── portfolio.ts
│       │   │   ├── interview.ts
│       │   │   ├── billing.ts
│       │   │   ├── notification.ts
│       │   │   └── admin.ts
│       │   ├── types/
│       │   │   ├── api.ts
│       │   │   ├── entities.ts
│       │   │   └── integrations.ts
│       │   └── utils/
│       │       ├── pagination.ts
│       │       ├── scores.ts
│       │       └── strings.ts
│       └── __tests__/
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   │   ├── env.ts
│   │   │   │   ├── database.ts
│   │   │   │   ├── cookies.ts
│   │   │   │   ├── rate-limits.ts
│   │   │   │   └── logger.ts
│   │   │   ├── routes/
│   │   │   │   └── v1/
│   │   │   │       ├── index.ts
│   │   │   │       ├── health.routes.ts
│   │   │   │       ├── auth.routes.ts
│   │   │   │       ├── user.routes.ts
│   │   │   │       ├── resume.routes.ts
│   │   │   │       ├── template.routes.ts
│   │   │   │       ├── document.routes.ts
│   │   │   │       ├── job.routes.ts
│   │   │   │       ├── ai.routes.ts
│   │   │   │       ├── portfolio.routes.ts
│   │   │   │       ├── interview.routes.ts
│   │   │   │       ├── notification.routes.ts
│   │   │   │       ├── billing.routes.ts
│   │   │   │       ├── webhook.routes.ts
│   │   │   │       └── admin.routes.ts
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rbac.ts
│   │   │   │   ├── validate.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── csrf.ts
│   │   │   │   ├── upload.ts
│   │   │   │   ├── request-context.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── resume.service.ts
│   │   │   │   ├── template.service.ts
│   │   │   │   ├── document.service.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   ├── analysis.service.ts
│   │   │   │   ├── job-match.service.ts
│   │   │   │   ├── portfolio.service.ts
│   │   │   │   ├── interview.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── billing.service.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   └── audit.service.ts
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── UserProfile.ts
│   │   │   │   ├── RefreshToken.ts
│   │   │   │   ├── EmailToken.ts
│   │   │   │   ├── Resume.ts
│   │   │   │   ├── ResumeVersion.ts
│   │   │   │   ├── Template.ts
│   │   │   │   ├── Document.ts
│   │   │   │   ├── JobDescription.ts
│   │   │   │   ├── MatchResult.ts
│   │   │   │   ├── ResumeAnalysis.ts
│   │   │   │   ├── Portfolio.ts
│   │   │   │   ├── PortfolioProject.ts
│   │   │   │   ├── AiConversation.ts
│   │   │   │   ├── AiGeneration.ts
│   │   │   │   ├── AiUsage.ts
│   │   │   │   ├── InterviewSession.ts
│   │   │   │   ├── Notification.ts
│   │   │   │   ├── Plan.ts
│   │   │   │   ├── Subscription.ts
│   │   │   │   ├── Payment.ts
│   │   │   │   ├── WebhookEvent.ts
│   │   │   │   └── AuditLog.ts
│   │   │   ├── integrations/
│   │   │   │   ├── ai/
│   │   │   │   │   ├── AiProvider.ts
│   │   │   │   │   ├── openai.adapter.ts
│   │   │   │   │   ├── gemini.adapter.ts
│   │   │   │   │   ├── test.adapter.ts
│   │   │   │   │   └── factory.ts
│   │   │   │   ├── storage/
│   │   │   │   │   ├── StorageProvider.ts
│   │   │   │   │   ├── local.adapter.ts
│   │   │   │   │   ├── s3.adapter.ts
│   │   │   │   │   └── factory.ts
│   │   │   │   ├── payments/
│   │   │   │   │   ├── PaymentProvider.ts
│   │   │   │   │   ├── stripe-like.adapter.ts
│   │   │   │   │   ├── test.adapter.ts
│   │   │   │   │   └── factory.ts
│   │   │   │   ├── email/
│   │   │   │   │   ├── EmailProvider.ts
│   │   │   │   │   ├── smtp.adapter.ts
│   │   │   │   │   └── factory.ts
│   │   │   │   └── parsing/
│   │   │   │       ├── pdf.parser.ts
│   │   │   │       └── docx.parser.ts
│   │   │   ├── prompts/
│   │   │   │   ├── registry.ts
│   │   │   │   ├── resume-content.ts
│   │   │   │   ├── resume-analysis.ts
│   │   │   │   ├── job-match.ts
│   │   │   │   ├── portfolio.ts
│   │   │   │   ├── career-advice.ts
│   │   │   │   └── interview.ts
│   │   │   ├── jobs/
│   │   │   │   ├── queue.ts
│   │   │   │   ├── pdf-export.job.ts
│   │   │   │   ├── parse-document.job.ts
│   │   │   │   ├── ai-analysis.job.ts
│   │   │   │   ├── email.job.ts
│   │   │   │   └── cleanup.job.ts
│   │   │   ├── pdf/
│   │   │   │   ├── renderer.ts
│   │   │   │   ├── browser.ts
│   │   │   │   ├── sanitize.ts
│   │   │   │   └── templates/
│   │   │   │       ├── classic.hbs
│   │   │   │       ├── modern.hbs
│   │   │   │       └── executive.hbs
│   │   │   ├── utils/
│   │   │   │   ├── tokens.ts
│   │   │   │   ├── crypto.ts
│   │   │   │   ├── errors.ts
│   │   │   │   ├── async.ts
│   │   │   │   └── sanitize.ts
│   │   │   └── types/
│   │   │       └── express.d.ts
│   │   └── tests/
│   │       ├── unit/
│   │       ├── integration/
│   │       └── fixtures/
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── index.html
│       ├── .env.example
│       ├── Dockerfile
│       ├── public/
│       │   ├── brand/
│       │   ├── images/
│       │   └── favicon.svg
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── router/
│           │   ├── index.tsx
│           │   ├── guards.tsx
│           │   └── routes.ts
│           ├── app/
│           │   ├── providers.tsx
│           │   └── layouts/
│           │       ├── PublicLayout.tsx
│           │       ├── AuthLayout.tsx
│           │       ├── DashboardLayout.tsx
│           │       └── AdminLayout.tsx
│           ├── components/
│           │   ├── ui/
│           │   ├── forms/
│           │   ├── feedback/
│           │   ├── layout/
│           │   └── brand/
│           ├── features/
│           │   ├── landing/
│           │   ├── auth/
│           │   ├── onboarding/
│           │   ├── dashboard/
│           │   ├── resume-builder/
│           │   ├── resume-templates/
│           │   ├── resume-analyzer/
│           │   ├── job-matcher/
│           │   ├── portfolio/
│           │   ├── career-advisor/
│           │   ├── interviews/
│           │   ├── documents/
│           │   ├── billing/
│           │   ├── settings/
│           │   ├── notifications/
│           │   └── admin/
│           ├── stores/
│           │   ├── auth.store.ts
│           │   ├── ui.store.ts
│           │   ├── editor.store.ts
│           │   └── toast.store.ts
│           ├── lib/
│           │   ├── api/
│           │   │   ├── client.ts
│           │   │   ├── errors.ts
│           │   │   └── endpoints.ts
│           │   ├── hooks/
│           │   │   ├── useApiResource.ts
│           │   │   ├── useAutosave.ts
│           │   │   ├── useDebounce.ts
│           │   │   └── usePolling.ts
│           │   ├── auth/
│           │   │   ├── csrf.ts
│           │   │   └── permissions.ts
│           │   └── utils/
│           │       ├── format.ts
│           │       └── a11y.ts
│           ├── styles/
│           │   ├── index.css
│           │   └── tokens.css
│           └── types/
│               └── vite-env.d.ts
├── tests/
│   ├── e2e/                             # Critical user journeys
│   └── fixtures/
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

## 6. API Endpoint Documentation

### 6.1 Conventions

- Base URL: `/api/v1`.
- All request bodies and responses are JSON except multipart uploads and binary downloads.
- Authenticated endpoints require the HTTP-only access cookie.
- State-changing browser requests require CSRF protection.
- `GET` endpoints never mutate state.
- List endpoints support `page`, `limit`, `sort`, and `search` where applicable.
- Successful response: `{ "success": true, "data": ..., "meta": ... }`.
- Failed response: `{ "success": false, "error": { "code": "...", "message": "...", "details": ..., "requestId": "..." } }`.
- All endpoints below are planned; actual contracts are frozen in `packages/shared` schemas during implementation.

### 6.2 Health

| Method | Endpoint        | Auth | Purpose                                    |
| ------ | --------------- | ---- | ------------------------------------------ |
| GET    | `/health/live`  | No   | Process liveness                           |
| GET    | `/health/ready` | No   | MongoDB and critical integration readiness |

### 6.3 Authentication

| Method | Endpoint                    | Auth           | Key request data                              | Purpose                                            |
| ------ | --------------------------- | -------------- | --------------------------------------------- | -------------------------------------------------- |
| POST   | `/auth/register`            | No             | firstName, lastName, email, password, consent | Create account and send verification email         |
| POST   | `/auth/verify-email`        | No             | token                                         | Verify email                                       |
| POST   | `/auth/resend-verification` | No/limited     | email                                         | Resend verification                                |
| POST   | `/auth/login`               | No             | email, password                               | Issue access + refresh cookies                     |
| POST   | `/auth/refresh`             | Refresh cookie | none                                          | Rotate refresh token and issue new access token    |
| POST   | `/auth/logout`              | Access cookie  | none                                          | Revoke current refresh session and clear cookies   |
| POST   | `/auth/logout-all`          | Yes            | none                                          | Revoke all sessions by incrementing `tokenVersion` |
| POST   | `/auth/forgot-password`     | No/limited     | email                                         | Send reset link without account enumeration        |
| POST   | `/auth/reset-password`      | No             | token, newPassword                            | Reset password and revoke sessions                 |
| GET    | `/auth/me`                  | Yes            | none                                          | Return current user and entitlements               |
| PATCH  | `/auth/me`                  | Yes            | name, locale, timezone                        | Update basic account fields                        |
| POST   | `/auth/onboarding/complete` | Yes            | profile/goals payload                         | Mark onboarding complete                           |

### 6.4 Users and Settings

| Method | Endpoint                 | Auth | Purpose                                              |
| ------ | ------------------------ | ---- | ---------------------------------------------------- |
| GET    | `/users/me/profile`      | Yes  | Get profile                                          |
| PATCH  | `/users/me/profile`      | Yes  | Update profile, skills, experience, education, links |
| GET    | `/users/me/settings`     | Yes  | Get notification/privacy/display settings            |
| PATCH  | `/users/me/settings`     | Yes  | Update settings                                      |
| POST   | `/users/me/avatar`       | Yes  | Upload/change avatar through storage service         |
| DELETE | `/users/me/avatar`       | Yes  | Remove avatar                                        |
| DELETE | `/users/me`              | Yes  | Verified account deletion request                    |
| GET    | `/users/me/sessions`     | Yes  | List active sessions                                 |
| DELETE | `/users/me/sessions/:id` | Yes  | Revoke a session                                     |

### 6.5 Resumes

| Method | Endpoint                                   | Auth | Purpose                                                |
| ------ | ------------------------------------------ | ---- | ------------------------------------------------------ |
| GET    | `/resumes`                                 | Yes  | List resumes with pagination/filtering                 |
| POST   | `/resumes`                                 | Yes  | Create resume from blank/template/import               |
| GET    | `/resumes/:id`                             | Yes  | Get owned resume                                       |
| PATCH  | `/resumes/:id`                             | Yes  | Update resume content/settings/autosave                |
| DELETE | `/resumes/:id`                             | Yes  | Soft-delete resume                                     |
| POST   | `/resumes/:id/duplicate`                   | Yes  | Duplicate resume                                       |
| POST   | `/resumes/:id/archive`                     | Yes  | Archive/unarchive                                      |
| GET    | `/resumes/:id/versions`                    | Yes  | List versions                                          |
| POST   | `/resumes/:id/versions`                    | Yes  | Create manual version                                  |
| POST   | `/resumes/:id/versions/:versionId/restore` | Yes  | Restore version as new version                         |
| POST   | `/resumes/:id/export/pdf`                  | Yes  | Generate PDF and return document metadata/download URL |
| POST   | `/resumes/:id/analyze`                     | Yes  | Run ATS analysis                                       |
| GET    | `/resumes/:id/analysis`                    | Yes  | Latest analysis history                                |

### 6.6 Templates

| Method | Endpoint                         | Auth  | Purpose                                          |
| ------ | -------------------------------- | ----- | ------------------------------------------------ |
| GET    | `/templates`                     | No    | Public catalog metadata                          |
| GET    | `/templates/:slug`               | No    | Template details/preview                         |
| GET    | `/templates/:slug/render-config` | Yes   | Template render configuration for authorized use |
| POST   | `/admin/templates`               | Admin | Create template                                  |
| PATCH  | `/admin/templates/:id`           | Admin | Update template                                  |
| DELETE | `/admin/templates/:id`           | Admin | Deactivate/delete template                       |

### 6.7 Documents

| Method | Endpoint                       | Auth | Purpose                                    |
| ------ | ------------------------------ | ---- | ------------------------------------------ |
| GET    | `/documents`                   | Yes  | List documents                             |
| POST   | `/documents`                   | Yes  | Multipart upload with validation           |
| GET    | `/documents/:id`               | Yes  | Get metadata                               |
| POST   | `/documents/:id/parse`         | Yes  | Parse PDF/DOCX into structured resume text |
| GET    | `/documents/:id/download`      | Yes  | Short-lived signed redirect                |
| DELETE | `/documents/:id`               | Yes  | Delete document and storage object         |
| POST   | `/documents/:id/create-resume` | Yes  | Create resume from parsed content          |

### 6.8 Jobs and Matching

| Method | Endpoint            | Auth | Purpose                       |
| ------ | ------------------- | ---- | ----------------------------- |
| GET    | `/jobs`             | Yes  | List saved job descriptions   |
| POST   | `/jobs`             | Yes  | Create job description        |
| GET    | `/jobs/:id`         | Yes  | Get job description           |
| PATCH  | `/jobs/:id`         | Yes  | Update job description        |
| DELETE | `/jobs/:id`         | Yes  | Delete job description        |
| POST   | `/jobs/:id/match`   | Yes  | Match against selected resume |
| GET    | `/jobs/:id/matches` | Yes  | Match history                 |
| GET    | `/matches/:id`      | Yes  | Get match result              |

### 6.9 AI Endpoints

| Method | Endpoint                            | Auth | Purpose                                                     |
| ------ | ----------------------------------- | ---- | ----------------------------------------------------------- |
| POST   | `/ai/generate/resume-section`       | Yes  | Generate or rewrite a resume section from real user context |
| POST   | `/ai/rewrite`                       | Yes  | Rewrite selected text with tone/length constraints          |
| POST   | `/ai/analyze-resume`                | Yes  | ATS-style resume analysis                                   |
| POST   | `/ai/match-job`                     | Yes  | Resume/job description matching with explanations           |
| POST   | `/ai/generate-portfolio-content`    | Yes  | Portfolio headline/bio/project copy                         |
| POST   | `/ai/career-advice`                 | Yes  | Career guidance conversation response                       |
| POST   | `/ai/interview/questions`           | Yes  | Generate interview questions                                |
| POST   | `/ai/interview/:sessionId/feedback` | Yes  | Evaluate real user answer                                   |
| GET    | `/ai/jobs/:jobId`                   | Yes  | Poll async AI job status/result                             |
| GET    | `/ai/usage/me`                      | Yes  | Current-period usage and quota                              |

### 6.10 Portfolio

| Method | Endpoint                             | Auth | Purpose                         |
| ------ | ------------------------------------ | ---- | ------------------------------- |
| GET    | `/portfolio/me`                      | Yes  | Get own portfolio               |
| POST   | `/portfolio`                         | Yes  | Create portfolio                |
| PATCH  | `/portfolio/:id`                     | Yes  | Update content/theme/SEO        |
| POST   | `/portfolio/:id/publish`             | Yes  | Publish/unpublish               |
| GET    | `/portfolio/:id/projects`            | Yes  | List projects                   |
| POST   | `/portfolio/:id/projects`            | Yes  | Add project                     |
| PATCH  | `/portfolio/:id/projects/:projectId` | Yes  | Update project                  |
| DELETE | `/portfolio/:id/projects/:projectId` | Yes  | Delete project                  |
| GET    | `/portfolio/public/:slug`            | No   | Get public portfolio if visible |

### 6.11 Interview Preparation

| Method | Endpoint                    | Auth | Purpose                                        |
| ------ | --------------------------- | ---- | ---------------------------------------------- |
| GET    | `/interviews`               | Yes  | List sessions                                  |
| POST   | `/interviews`               | Yes  | Create session from resume/job/role/difficulty |
| GET    | `/interviews/:id`           | Yes  | Get session with questions/answers             |
| POST   | `/interviews/:id/questions` | Yes  | Generate next questions                        |
| POST   | `/interviews/:id/answers`   | Yes  | Submit answer for feedback                     |
| PATCH  | `/interviews/:id`           | Yes  | Update status/title                            |
| DELETE | `/interviews/:id`           | Yes  | Delete session                                 |
| POST   | `/interviews/:id/complete`  | Yes  | Generate final session summary                 |

### 6.12 Notifications

| Method | Endpoint                      | Auth | Purpose             |
| ------ | ----------------------------- | ---- | ------------------- |
| GET    | `/notifications`              | Yes  | List notifications  |
| GET    | `/notifications/unread-count` | Yes  | Badge count         |
| PATCH  | `/notifications/:id/read`     | Yes  | Mark read           |
| PATCH  | `/notifications/read-all`     | Yes  | Mark all read       |
| DELETE | `/notifications/:id`          | Yes  | Delete notification |

### 6.13 Billing and Payments

| Method | Endpoint                       | Auth                   | Purpose                                               |
| ------ | ------------------------------ | ---------------------- | ----------------------------------------------------- |
| GET    | `/billing/plans`               | No                     | Real plan catalog from database                       |
| GET    | `/billing/subscription`        | Yes                    | Current subscription and entitlements                 |
| POST   | `/billing/checkout`            | Yes                    | Create provider checkout session; return redirect URL |
| POST   | `/billing/portal`              | Yes                    | Create billing portal session                         |
| POST   | `/billing/cancel`              | Yes                    | Cancel at period end through provider                 |
| GET    | `/billing/payments`            | Yes                    | Payment history                                       |
| POST   | `/webhooks/payments/:provider` | No, signature-verified | Provider webhook; idempotent source of truth          |

### 6.14 Admin

| Method | Endpoint                    | Auth  | Purpose                                     |
| ------ | --------------------------- | ----- | ------------------------------------------- |
| GET    | `/admin/overview`           | Admin | Real aggregated counts/trends from database |
| GET    | `/admin/users`              | Admin | User list with filters                      |
| GET    | `/admin/users/:id`          | Admin | User detail                                 |
| PATCH  | `/admin/users/:id/status`   | Admin | Suspend/restore with audit                  |
| PATCH  | `/admin/users/:id/role`     | Admin | Role change with audit                      |
| GET    | `/admin/resumes`            | Admin | Moderation/read-only list                   |
| GET    | `/admin/subscriptions`      | Admin | Subscription overview                       |
| GET    | `/admin/ai-usage`           | Admin | Usage/cost overview                         |
| GET    | `/admin/audit-logs`         | Admin | Append-only audit trail                     |
| GET    | `/admin/webhooks`           | Admin | Webhook event status/retry view             |
| POST   | `/admin/webhooks/:id/retry` | Admin | Retry failed webhook processing             |

---

## 7. Authentication Flow

### 7.1 Registration and Verification

1. User submits registration form validated by shared Zod schema.
2. API normalizes email, checks uniqueness, and hashes password with Argon2id or bcrypt.
3. User document is created with `emailVerifiedAt: null` and default `user` role.
4. Verification token is generated with `crypto.randomBytes`, hashed, and stored with short expiry.
5. Email provider sends verification link.
6. User clicks link; backend verifies hash/expiry and marks email verified.
7. Frontend shows success state and redirects to login or onboarding.

### 7.2 Login and Session Establishment

1. User submits credentials.
2. API applies login rate limiting and constant-time-ish credential handling to reduce enumeration.
3. Password is verified against hash.
4. On success, API issues:
   - short-lived access token in secure HTTP-only cookie,
   - longer-lived refresh token in secure HTTP-only cookie at a stricter path,
   - hashed refresh token record in MongoDB.
5. Frontend calls `/auth/me` to hydrate the auth store on app load.
6. `tokenVersion` is included in claims so global revocation is possible.

### 7.3 Refresh and Logout

- Access token expiry triggers `/auth/refresh`.
- Refresh token is hashed and compared with stored record.
- Rotation issues a new refresh token and revokes the old one.
- Reuse of a revoked token revokes the whole token family and creates a security notification.
- Logout revokes current refresh token and clears cookies.
- Logout-all increments `tokenVersion`, invalidating all access tokens and refresh sessions.

### 7.4 Password Reset

1. Forgot-password request always returns the same generic success response.
2. A hashed, short-lived reset token is stored if the account exists.
3. Reset link redirects to frontend reset page.
4. Reset validates token, sets new password hash, revokes sessions, and sends a security notice email.

### 7.5 Authorization

- Route guards: public-only, authenticated, onboarding-required, guest-only, admin-only.
- Backend middleware enforces the same rules.
- Service layer checks resource ownership using `userId` on every object operation.
- Premium features check server-derived entitlements from the active subscription; frontend gating is advisory only.
- Admin actions are audited and cannot be completed solely from client state.

### 7.6 Cookie Security

| Cookie          | HTTP-only | Secure            | SameSite   | Path           | Purpose                                        |
| --------------- | --------- | ----------------- | ---------- | -------------- | ---------------------------------------------- |
| `access_token`  | Yes       | Yes in production | Lax/Strict | `/`            | API authentication                             |
| `refresh_token` | Yes       | Yes in production | Strict     | `/api/v1/auth` | Refresh rotation                               |
| `csrf_token`    | No        | Yes in production | Strict     | `/`            | Double-submit CSRF value for browser mutations |

Token payloads contain only `sub`, `role`, `tokenVersion`, `iat`, `exp`, and `jti` — never passwords, PII, or permissions that cannot be revoked.

---

## 8. AI Integration Strategy

### 8.1 Provider Abstraction

Define a stable internal `AiProvider` interface with operations for text generation and structured JSON generation. Implement OpenAI and Gemini adapters behind it. Select provider via server environment configuration. A test adapter may exist only for automated tests and must never be selectable in staging or production UI.

### 8.2 Server-Side Pipeline

1. Client calls a narrow endpoint with resource IDs and constrained options.
2. Backend authenticates, checks ownership and quota.
3. Backend loads the minimum necessary context from MongoDB.
4. Backend selects a versioned prompt from the prompt registry.
5. Backend sanitizes/redacts unnecessary PII before sending to the provider where feasible.
6. Provider adapter applies timeout, retries with exponential backoff, and circuit breaking.
7. Structured responses are parsed and validated with Zod.
8. Invalid outputs are retried once with a correction prompt; repeated failure returns a real error.
9. Result is persisted with provider, model, prompt version, token counts, latency, and status.
10. UI renders the real result with source context and user-editable controls.

### 8.3 AI Use Cases

| Feature                  | Input                             | Output                                         | Validation                                            |
| ------------------------ | --------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Resume section generator | Resume context, target role, tone | Structured section content                     | Required fields, length limits, no unsupported claims |
| Resume rewrite           | Selected text, mode               | Improved text                                  | Length and forbidden-content checks                   |
| ATS analysis             | Resume content                    | Scores, issues, strengths, suggestions         | Bounded scores, evidence references                   |
| Job match                | Resume + real job description     | Score, matched/missing skills, recommendations | Explainable output tied to input                      |
| Portfolio content        | Portfolio/profile context         | Headline, bio, project copy                    | Length/style constraints                              |
| Career advisor           | Conversation + context            | Guidance message                               | Safety rules, no guaranteed outcomes                  |
| Interview questions      | Role, difficulty, context         | Question list with focus areas                 | Count and format validation                           |
| Interview feedback       | Real answer + question            | Feedback and score                             | Bounded score, actionable rationale                   |

### 8.4 Prompt and Output Governance

- Prompts are versioned files, not inline strings scattered through code.
- Structured outputs use strict JSON schemas mirrored in Zod.
- Prompts instruct the model to avoid inventing experience, metrics, employers, degrees, or certifications.
- All AI-generated resume text remains editable and labeled as AI-assisted.
- Output is sanitized before storage/rendering.
- Prompt injection in uploaded resumes/job descriptions is treated as untrusted data.
- No fake AI result is returned on provider failure; show an error and retry affordance.
- For long operations, create an AI job record and expose status polling.

### 8.5 Cost, Quota, and Reliability

- Usage counted server-side per user per billing period.
- Quotas derived from subscription entitlements.
- Cache identical `inputHash + promptVersion` results for a short, documented period where appropriate.
- Track tokens, latency, provider errors, and estimated cost.
- Alert on abnormal usage.
- Degrade gracefully: disable AI actions, show quota state, and offer upgrade path instead of silently failing.

---

## 9. PDF Generation Strategy

### 9.1 Generation Flow

1. User clicks download/export.
2. API verifies ownership, entitlement, and template compatibility.
3. Server loads the resume snapshot and selected template.
4. Resume content and AI text are sanitized.
5. Puppeteer launches a controlled browser instance with a timeout.
6. Server renders an ATS-friendly HTML template using approved fonts and the brand palette.
7. PDF metadata is set: title, author, creation date.
8. PDF is streamed to object storage.
9. A `documents` record of kind `generated_pdf` is created.
10. User receives a short-lived signed download URL or direct secure stream.

### 9.2 Template Requirements

- Single-column, ATS-friendly layouts by default.
- Standard headings and human-readable section names.
- Selectable text, not image-only output.
- Consistent page margins and page-break rules.
- No icons or decorative graphics that interfere with parsing.
- Brand palette applied subtly: burgundy headings/accents, cream/beige surfaces only where print-safe.
- Dark ink text for readability.
- Fonts embedded or reliably available in the rendering environment.

### 9.3 Operational Concerns

- Reuse a Puppeteer browser pool or singleton rather than launching per request.
- Enforce request timeouts, memory limits, and concurrency limits.
- Store generated PDFs with versioning and cleanup policy.
- Return real failures if rendering fails; never download an empty placeholder.
- Use a serverless-compatible Chromium build if deploying to a serverless runtime.
- Include PDF generation dependencies in deployment image/Dockerfile.
- Add tests for page count, selectable text, known content presence, and repeated generation.

---

## 10. Payment Architecture

### 10.1 Provider Abstraction

Define a `PaymentProvider` interface with:

- create checkout session,
- create billing portal session,
- retrieve subscription,
- cancel subscription,
- verify webhook signature,
- normalize subscription/payment events.

Adapters implement provider-specific behavior. Production must use real provider credentials; test adapters only in automated tests or explicitly local sandbox development.

### 10.2 Subscription State

- Plans are stored in MongoDB with provider price IDs.
- Checkout creates a provider session and redirects the user.
- Browser redirect is not treated as payment success.
- Signed webhooks update `subscriptions`, `payments`, and entitlement state.
- Webhook events are idempotent using `provider + eventId`.
- Failed webhook processing is recorded and retryable from admin.
- Entitlements are server-derived from `subscription.status`, plan features, and current period.

### 10.3 Entitlements

Entitlements gate:

- number of resumes,
- AI generations per period,
- PDF exports,
- premium templates,
- document parsing,
- portfolio publishing features,
- interview session limits.

Frontend uses entitlements to display upgrade prompts but backend enforces them on every relevant request.

### 10.4 Payment Safety

- No hardcoded fake payment-success state.
- No manual database-only plan activation in production without an audited admin/support workflow.
- Prices displayed from plan records synchronized with provider catalog.
- Webhook secrets stored only in backend environment.
- Payment endpoints rate-limited and idempotent.
- Receipt/history data comes from provider events.

---

## 11. Security Requirements

### 11.1 Application Security

- HTTPS only in staging/production; HSTS enabled.
- Helmet/security headers including CSP, frame guards, referrer policy, and nosniff.
- CORS restricted to known frontend origins.
- CSRF protection on cookie-authenticated mutations.
- Rate limits on auth, AI, PDF, upload, parse, checkout, and forgot-password endpoints.
- Passwords hashed with Argon2id preferred or bcrypt with strong cost.
- Token and secret values hashed at rest when stored.
- Role-based access control plus per-resource ownership checks.
- No mass assignment: request schemas explicitly whitelist fields.
- NoSQL injection prevention: reject unexpected operator objects and validate ObjectIds.
- Output encoding and rich-text sanitization.
- Safe redirect allowlist after login/checkout.
- Destructive actions require confirmation and audit logging.

### 11.2 File and Storage Security

- Enforce file size, MIME type, and magic-byte validation.
- Store uploads under random, non-guessable object keys.
- Never serve user files through a public path without authorization.
- Use short-lived signed URLs for downloads.
- Scan files where a scanning service is available.
- Separate storage credentials with least privilege.
- Validate archive/compressed inputs carefully; reject unsupported types.
- Clean up failed and expired uploads.

### 11.3 AI Security and Privacy

- API keys only in backend secret store.
- No secrets in client bundles, logs, error messages, or analytics.
- Treat uploaded documents and job descriptions as untrusted prompt content.
- Filter or constrain model output before rendering.
- Avoid sending fields that are not needed for the task.
- Log metadata, not full sensitive prompts, by default.
- Document retention and deletion for AI generations and extracted text.

### 11.4 Operational Security

- Environment validation at startup; production refuses to boot with missing/insecure secrets.
- Dependency audit and lockfile discipline.
- Regular dependency updates.
- Centralized structured logging with redaction.
- Backup encryption and tested restore process.
- Admin action audit trail.
- Incident runbook for token compromise, webhook failure, and provider key rotation.
- Account deletion workflow removes or anonymizes user data across collections and storage.
- GDPR/privacy-oriented controls: export data, delete account, notification preferences, consent record.

### 11.5 Accessibility as Safety

- Clear error messages and focus management.
- Keyboard escape paths from all dialogs.
- No time-limited interactions without extension.
- Status changes announced to assistive technology.

---

## 12. Development Phases in Correct Order

Each phase ends with a gate. Do not begin later phases on unstable foundations.

### Phase 0 — Repository, Decisions, and Environment

**Work**

- Initialize Git repository and branching strategy.
- Create monorepo workspaces and base TypeScript configuration.
- Document environment variables and setup steps.
- Create `PROJECT_ROADMAP.md`, ADR template, and basic CI skeleton.
- Decide concrete AI provider, payment provider, email provider, and deployment target.

**Gate**

- Fresh machine can install dependencies and run empty frontend/backend builds.
- No secrets committed.
- Architecture decisions recorded.

### Phase 1 — Shared Contracts, Design System, and Backend Foundations

**Work**

- Shared Zod schemas and API types.
- Tailwind brand tokens and base UI components.
- Express app bootstrapping, env validation, MongoDB connection.
- Request context, logging, error handler, security headers, CORS.
- Mongoose base models, indexes, and database health checks.

**Gate**

- Lint, typecheck, unit tests, and health checks pass.
- Brand palette is the only application palette.

### Phase 2 — Authentication, Users, and Authorization

**Work**

- Registration, verification, login, refresh rotation, logout, password reset.
- Cookie/CSRF configuration.
- User/profile/settings models and services.
- Route guards and backend RBAC.
- Onboarding flow.

**Gate**

- Full auth lifecycle tested end-to-end.
- Unauthorized and cross-user access attempts are rejected.

### Phase 3 — Public Website, Auth UI, Onboarding, and Dashboard Shell

**Work**

- Landing, features, templates teaser, pricing, about/contact pages.
- Login/register/reset/verify screens.
- Onboarding wizard.
- Responsive dashboard layout with navigation and real auth state.
- Loading/error/empty/success component patterns.

**Gate**

- All public/auth routes responsive and accessible.
- Dashboard renders real user data only; no hardcoded statistics.

### Phase 4 — Resume Builder, Templates, Versions, and PDF Export

**Work**

- Resume CRUD and autosave.
- Live editor/preview and section editors.
- Template catalog and premium gating.
- Version history and duplication.
- Puppeteer PDF templates, export endpoint, download flow.

**Gate**

- Users can create, edit, version, export, and re-download real resumes.
- PDF has selectable text and passes basic ATS layout checks.

### Phase 5 — Document Upload and Parsing

**Work**

- Storage abstraction and multipart upload validation.
- PDF/DOCX parser services and parsing job.
- Document list, status, errors, signed download.
- Create resume from parsed document content.

**Gate**

- Real uploaded PDFs/DOCX parse into editable resume context.
- Failed parsing has visible reason and retry path.

### Phase 6 — AI Content Generation and ATS Analysis

**Work**

- AI provider adapters and factory.
- Prompt registry and structured-output validation.
- Quota/usage tracking.
- Resume section generation/rewrite.
- ATS-style analysis with saved history.

**Gate**

- Real provider outputs are generated, validated, persisted, and editable.
- Provider failure produces accurate error state, not fabricated results.

### Phase 7 — Job Matching, Portfolio, Career Advisor, and Interview Preparation

**Work**

- Job description CRUD.
- Match engine and match result history.
- Portfolio builder, projects, publishing, public route.
- Career advisor conversations.
- Interview sessions, questions, answers, and feedback.

**Gate**

- Each AI workflow is grounded in user-provided resources.
- Public portfolios enforce visibility rules.

### Phase 8 — Subscriptions, Billing, and Notifications

**Work**

- Plan catalog seed and pricing page.
- Checkout/portal/cancel flows.
- Webhook verification and idempotent processing.
- Entitlement enforcement in backend.
- In-app notifications and transactional email triggers.
- Billing history.

**Gate**

- Test-mode checkout and real sandbox webhooks correctly activate/deactivate entitlements.
- No plan status can be granted from client-side state.

### Phase 9 — Admin, Settings, and Polish

**Work**

- Admin overview from real aggregates.
- User/subscription/AI usage/template/webhook/audit views.
- Security and privacy settings.
- Data export and account deletion.
- Empty, error, success, and loading states across all modules.
- Accessibility audit and responsive QA.

**Gate**

- Admin has no hardcoded dashboard numbers.
- Critical flows meet keyboard and screen-reader requirements.

### Phase 10 — Testing, Hardening, Performance, and Deployment

**Work**

- Unit, integration, and E2E tests.
- Threat model review and security fixes.
- Rate-limit and abuse testing.
- MongoDB index review and query profiling.
- Puppeteer performance/concurrency tuning.
- CI/CD, Docker images, staging deployment, monitoring, alerts, backups.
- Production launch checklist and runbooks.

**Gate**

- CI green.
- Health, logging, backups, rollback, and incident procedures verified.
- Explicit approval before production release.

---

## 13. Technical Risks and Dependencies

### 13.1 Risks

| Risk                                             | Impact | Mitigation                                                                                                                            |
| ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| AI hallucinates experience or metrics            | High   | Strict prompts, evidence checks, editable outputs, validation, user confirmation                                                      |
| AI provider latency/outages/cost spikes          | High   | Timeouts, retries, circuit breaker, quotas, caching, usage alerts                                                                     |
| Puppeteer fails in deployment runtime            | High   | Pin versions, include Chromium dependencies, test in production-like image, serverless-compatible build if needed                     |
| PDF parsing quality varies by source document    | High   | Support text-based PDFs/DOCX first, validate extracted text, show clear failure; OCR considered later with explicit user consent/cost |
| Payment webhook processed twice or missed        | High   | Idempotency by event ID, signature verification, retry endpoint, reconciliation job                                                   |
| Subscription state drift between provider and DB | High   | Provider is authoritative; periodic reconciliation and admin webhook view                                                             |
| Uploaded files contain malicious content         | High   | Magic-byte checks, size limits, private storage, signed URLs, scanning where available                                                |
| CSRF/session theft                               | High   | HTTP-only cookies, Secure/SameSite, CSRF tokens, refresh rotation, reuse detection                                                    |
| Cross-user data leakage                          | High   | `userId` filters on every query, service-level ownership checks, integration tests                                                    |
| MongoDB schema drift                             | Medium | Schema versioning, Zod validation, migration scripts, staged rollout                                                                  |
| Large resume/portfolio content degrades UX       | Medium | Section-wise editing, payload limits, autosave debounce, pagination                                                                   |
| Premium feature gating inconsistent              | Medium | Server-side entitlements are authoritative; UI gating mirrors server response                                                         |
| Brand palette misused by new components          | Medium | Central Tailwind tokens, lint/review checklist, shared UI components only                                                             |
| Accessibility regressions                        | Medium | Shared components, automated checks, manual keyboard/screen-reader QA                                                                 |
| Email delivery failures block verification       | Medium | Provider abstraction, retry queue, resend endpoint, deliverability monitoring                                                         |
| Scope expansion across 17 modules                | High   | Phase gates, no parallel unstable foundations, approval before implementation                                                         |

### 13.2 External Dependencies to Decide Before Implementation

1. **AI provider:** OpenAI or Gemini; choose model, pricing limits, and data-processing posture.
2. **Payment provider:** concrete provider and price catalog.
3. **Email provider:** transactional SMTP/API provider.
4. **Object storage:** local development adapter and production S3-compatible provider.
5. **Deployment target:** container platform/serverless/VPS; affects Puppeteer and queue design.
6. **MongoDB Hosting:** managed service vs self-hosted; affects backups and scaling.
7. **Background job strategy:** in-process initially vs Redis-backed queue from the start.
8. **Observability stack:** logs/metrics/error tracking provider.
9. **File scanning/OCR:** whether required for launch or a later phase.
10. **Analytics/privacy policy:** consent and retention requirements.

### 13.3 Explicit Non-Goals for Initial Release

- OCR of scanned image-only resumes.
- Social OAuth login unless added to an approved later phase.
- Custom domain hosting for public portfolios.
- Multi-tenant organizations/teams.
- Native mobile applications.
- Real-time collaborative resume editing.
- Guaranteed job placement or interview outcomes.
- Fake payment, fake AI, or demo dashboard statistics presented as real user data.

---

## 14. Definition of Done

A feature is complete only when:

1. Frontend and backend validation use the relevant shared schema.
2. Backend enforces authentication, authorization, ownership, and entitlements.
3. Loading, error, empty, and success states are implemented.
4. Real data is persisted and retrievable after refresh.
5. Inputs and outputs are length-limited and sanitized.
6. Errors are logged with a request ID and shown safely to the user.
7. Layout is responsive from mobile through desktop.
8. Keyboard and screen-reader access are verified.
9. Unit/integration tests cover critical success and failure paths.
10. No secret, fabricated result, or hardcoded user metric is present.

---

## 15. Approval Required

Implementation must not begin until the following are confirmed:

- This roadmap is approved.
- Concrete AI, payment, email, storage, and deployment providers are selected.
- Environment/secret strategy is confirmed.
- Any change to the phase order or initial-release scope is explicitly approved.
