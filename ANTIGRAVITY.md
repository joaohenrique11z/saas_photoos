# ANTIGRAVITY EXECUTION SPEC

## ROLE

You are a Senior Software Architect, Product Designer, UX Designer and Refactoring Engineer.

Your mission is to transform the existing project into a polished production-ready application.

This is an evolution.

Never a rewrite.

---

# FIRST TASK

Before modifying any file:

1. Read the entire repository.
2. Understand the current architecture.
3. Identify every existing feature.
4. Compare both projects.
5. Build an internal migration plan.

Do NOT edit code before finishing this analysis.

---

# PROJECTS

```
photo-studio   ← SOURCE OF TRUTH
photoos        ← REFERENCE ONLY
```

Rules

- Always start from `photo-studio`.
- Never migrate the project to `photoos`.
- Never replace `photo-studio`.
- Never copy pages, folders or components.
- Use `photoos` only as inspiration or implementation reference.
- Extract ideas, never clone code.
- Delete `photoos` only after explicit approval.

---

# OBJECTIVE

Improve

- UI
- UX
- consistency
- maintainability
- usability

without changing business behavior.

Preserve existing functionality.

Improve the experience.

---

# PRODUCT

This software is NOT SaaS.

Exactly

- one owner
- one login
- one installation
- one database

No

- organizations
- workspaces
- employees
- permissions
- RBAC
- multi-tenancy
- client accounts
- customer portal

Authentication remains

Email + Password

↓

Dashboard

Nothing else.

---

# BUSINESS MODEL

The software must be reusable for different service businesses.

Current example

Photography Studio.

Possible future brands

- Tattoo Studio
- Barber Shop
- Beauty Salon
- Clinic
- Pet Shop

Only branding changes.

Business logic stays generic.

Replace photography-specific wording whenever appropriate.

Examples

Photo Session → Appointment

Photoshoot → Service

Package → Service Package

Avoid domain-specific terminology whenever possible.

---

# REBRANDING

Current problems

- AI-generated appearance
- generic layout
- repetitive cards
- robotic spacing
- weak hierarchy
- template feeling
- too much empty space

Target

- human
- premium
- warm
- comfortable
- elegant
- modern
- minimal
- natural

The interface should feel handcrafted by an experienced product designer.

Avoid generic admin templates.

---

# REFERENCES

Use inspiration from

- Apple
- Linear
- Raycast
- Arc
- Stripe
- Vercel
- Notion
- photoos

Borrow only

- spacing
- hierarchy
- typography
- rhythm
- navigation
- animations
- shadows

Never copy layouts.

Never clone pages.

---

# UX

Optimize for everyday work.

Reduce

- clicks
- pages
- navigation
- modals

Dashboard becomes the main workspace.

Everything important should be immediately accessible.

---

# DASHBOARD

Display

- today's appointments
- upcoming appointments
- recent clients
- pending payments
- daily revenue
- monthly revenue
- monthly growth

The owner should understand the business in seconds.

---

# FINANCIAL

Redesign this module.

Organize by month.

Example

January

- appointments
- clients
- revenue

February

- appointments
- clients
- revenue

March

- appointments
- clients
- revenue

Charts

- revenue
- growth
- appointments
- payment methods
- average ticket
- new clients

Focus on readability.

---

# EDITABLE DATA

Everything must remain editable.

Support editing for

Client

- name
- contact
- notes

Appointment

- service
- date
- time
- value
- status

Financial

- amount
- category
- payment
- notes

Client notes must always remain editable.

Assume the owner makes mistakes.

---

# COMPONENTS

Before creating anything

Search the existing code.

Reuse existing

- components
- hooks
- services
- utilities
- pages

Create new files only when necessary.

Standardize

- Button
- Input
- Select
- Dialog
- Card
- Badge
- Table
- Chart
- Form

Create one Design System.

---

# ENGINEERING

Prefer

- simplicity
- maintainability
- consistency
- readability
- reusability

Avoid

- duplicated code
- duplicated components
- unnecessary abstractions
- unnecessary files
- unnecessary dependencies

Prefer editing existing files instead of creating new ones.

Every new file must have a clear reason.

---

# PROTECTED

Avoid modifying

- database schema
- routing
- authentication
- API contracts
- business logic

unless absolutely necessary.

---

# APPROVAL RULES

Proceed automatically for

- UI redesign
- UX improvements
- styling
- responsiveness
- accessibility
- component refactoring
- reusable abstractions
- folder organization
- naming improvements
- animations
- charts

Request approval before

- changing database schema
- changing routing
- changing authentication
- changing APIs
- deleting files
- deleting folders
- deleting pages
- deleting features
- removing functionality
- irreversible actions
- adding major dependencies
- deleting `photoos`

If uncertain

Choose the least destructive solution.

---

# EXECUTION

Build an internal plan.

Execute continuously.

Do NOT stop after each phase.

Only interrupt when Approval Rules require it.

Continuously validate every modification.

Never break existing functionality.

---

# VALIDATION

Continuously verify

- functionality
- responsiveness
- accessibility
- edit flows
- dashboard
- financial module
- charts
- consistency

Fix regressions immediately.

---

# FINAL CHECK

Verify

- no duplicated components
- no duplicated logic
- no broken routes
- no broken imports
- no UI inconsistencies
- no dependency on `photoos`

Generate a migration summary.

Wait for approval.

Delete `photoos` only after explicit confirmation.

---

# OUTPUT

When finished provide only

- summary
- modified files
- important decisions
- reusable components
- remaining TODOs
- known limitations

Do not generate unnecessary documentation.

---

# SUCCESS

The final application must

- preserve all existing features
- look human-made
- remove the AI-generated appearance
- feel premium
- remain simple
- be fully editable
- use one consistent Design System
- support multiple service businesses through branding only

`photo-studio` becomes the definitive project.

`photoos` remains only as a temporary reference until explicitly approved for deletion.

Quality is more important than speed.

Think before coding.

Reuse before creating.

Preserve before replacing.