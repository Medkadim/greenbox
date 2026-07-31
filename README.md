# GreenBox

GreenBox is a healthy meal subscription platform for Tangier, Morocco. This
repository is the MVP: an operational platform connecting **Customer →
GreenBox → Kitchen → Delivery**, with an administrator console tying it all
together.

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js server actions / API routes
- **Database:** PostgreSQL via Prisma ORM (Prisma 7, driver adapter)
- **Auth:** Better Auth, phone-number OTP as the primary sign-in method
- **Validation:** Zod
- **Forms:** React Hook Form
- **Data fetching/state:** TanStack Query
- **File storage:** Supabase Storage (wired in a later module)

## Getting started

```bash
cp .env.example .env        # fill in DATABASE_URL / BETTER_AUTH_SECRET
npm install                 # also runs `prisma generate` via postinstall
docker compose up -d db     # or point DATABASE_URL at your own Postgres
npm run db:push             # create tables from prisma/schema.prisma
npm run db:seed             # seed subscription plans + common allergies
npm run dev
```

Generate a real `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

### Useful scripts

| Script             | Purpose                                   |
| ------------------ | ------------------------------------------ |
| `npm run dev`       | Start the dev server                       |
| `npm run build`     | Production build                           |
| `npm run db:push`   | Push the Prisma schema to the database     |
| `npm run db:migrate`| Create/apply a Prisma migration            |
| `npm run db:studio` | Open Prisma Studio                         |
| `npm run db:seed`   | Seed reference data (plans, allergies)     |

### Docker

`docker compose up --build` runs the full stack (Postgres + the Next.js app
in standalone mode) for a production-like environment.

## Architecture

### Roles (RBAC)

Four roles ship in the MVP, modeled as `User.role`: `CUSTOMER`,
`KITCHEN_CHEF`, `DELIVERY_DRIVER`, `ADMIN`. Adding a role later means adding
an enum value plus a route group — no schema migration to a join table is
needed for the MVP's flat access model.

- `src/lib/rbac.ts` — role → home route / section-prefix mapping
- `src/lib/require-role.ts` — server-side guard used by each role's layout
- `src/middleware.ts` — cheap cookie-presence redirect for protected routes
- Route groups: `app/(customer)`, `app/(kitchen)`, `app/(delivery)`,
  `app/(admin)`, each with their own layout that calls `requireRole(...)`.
  `ADMIN` can reach every section for oversight.

### Database schema (`prisma/schema.prisma`)

- **Auth:** `User`, `Session`, `Account`, `Verification` (Better Auth's
  expected shape, phone-number plugin enabled).
- **Customer:** `CustomerProfile`, `CustomerPreference` (general likes /
  dislikes, distinct from allergies), `Allergy` / `CustomerAllergy`,
  `CustomerProfileTag` (VIP, allergy alert, vegetarian, ... — architecture
  ready for kitchen-facing tags).
- **Subscriptions & billing:** `SubscriptionPlan`, `Subscription`, `Payment`.
- **Meals & recipes:** `Meal` (name, photo, category, nutrition),
  `Ingredient`, `Recipe`, `RecipeIngredient` — the basis for both the
  customer-facing meal catalog and the kitchen's ingredient prep lists. No
  inventory/stock management in the MVP, by design.
- **Weekly menus:** `WeeklyMenu` (with a configurable `selectionDeadline`),
  `MenuItem` (a meal on a given day/slot, flagged `isRecommended` when part
  of GreenBox's suggested menu), `CustomerMealSelection` (a customer's pick,
  `source: RECOMMENDED | CUSTOM`, lockable), `MealCustomizationRequest`
  (free-text requests scoped to one selected meal, e.g. "no onions").
- **Delivery:** `Driver`, `Delivery` (status pipeline: `PENDING → PREPARING
  → READY → ON_THE_WAY → DELIVERED`, with an address/GPS/time-window
  snapshot taken at creation time).
- **Feedback & notifications:** `Rating`, `Notification` (typed, with a
  `channel` field ready for `PUSH` / `WHATSAPP` / `EMAIL` in addition to
  `IN_APP`).

Run `npm run db:studio` to browse the schema visually once a database is
connected.

### Auth

Better Auth is configured for phone-number OTP sign-in
(`src/lib/auth.ts`, `src/lib/auth-client.ts`,
`src/components/auth/phone-otp-form.tsx`). `sendOTP` currently logs the code
to the server console — swap it for a WhatsApp/SMS provider in the
notifications module. Email/password is enabled as a secondary method for
staff accounts (kitchen/delivery/admin), which won't be self-registered by
customers.

### UI

shadcn/ui components live in `src/components/ui/` (written directly against
this project's Tailwind v4 theme, since the network-based shadcn registry
isn't reachable from every environment). Add more components the same way,
or via `npx shadcn@latest add <component>` where network access allows it.

## Module roadmap

Built module by module, in this order:

1. ✅ Project setup
2. ✅ Authentication (phone OTP)
3. ✅ Database schema
4. ✅ User roles & permissions (RBAC)
5. ✅ Customer management
6. ✅ Subscription system
7. ✅ Meal management
8. ✅ Weekly menus
9. ✅ Personalized menus
10. ✅ Kitchen dashboard
11. ✅ Ingredient preparation list
12. ✅ Delivery dashboard
13. ✅ Admin dashboard
14. ✅ Notifications
15. ✅ Analytics

Each subsequent module adds real data + interactions on top of the current
scaffold's empty states, following the schema and RBAC boundaries defined
here.
