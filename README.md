# GreenBox

GreenBox is an internal operations console for a healthy meal delivery
business in Tangier, Morocco. The admin runs the whole operation: **Admin →
Kitchen → Delivery**. Customers have no login of their own — the admin
enters and maintains every customer's profile, allergies and weekly meal
plan directly.

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js server actions / API routes
- **Database:** PostgreSQL via Prisma ORM (Prisma 7, driver adapter)
- **Auth:** Better Auth, email/password credentials (phone number as the identifier for drivers, email for admin/kitchen)
- **Validation:** Zod
- **Forms:** React Hook Form
- **Data fetching/state:** TanStack Query
- **File storage:** local disk under `public/uploads` (meal photos)

## Getting started

```bash
cp .env.example .env        # fill in DATABASE_URL / BETTER_AUTH_SECRET
npm install                 # also runs `prisma generate` via postinstall
docker compose up -d db     # or point DATABASE_URL at your own Postgres
npm run db:push             # create tables from prisma/schema.prisma
npm run db:seed             # seed the common allergies reference list
npm run dev
```

Generate a real `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

> **Migrating an existing deployment:** this schema removed
> `SubscriptionPlan`, `Subscription`, `Payment`, `Rating`, `Notification`,
> `WeeklyMenu` and `MenuItem`, and reshaped `CustomerProfile` /
> `CustomerMealSelection`. Running `npm run db:push` against a database that
> still has the old schema will drop those tables' data — back up first if
> that data matters.

### Useful scripts

| Script             | Purpose                                   |
| ------------------ | ------------------------------------------ |
| `npm run dev`       | Start the dev server                       |
| `npm run build`     | Production build                           |
| `npm run db:push`   | Push the Prisma schema to the database     |
| `npm run db:migrate`| Create/apply a Prisma migration            |
| `npm run db:studio` | Open Prisma Studio                         |
| `npm run db:seed`   | Seed reference data (common allergies)     |

### Docker

`docker compose up --build` runs the full stack (Postgres + the Next.js app
in standalone mode) for a production-like environment.

## Architecture

### Roles (RBAC)

Three active roles, modeled as `User.role`: `KITCHEN_CHEF`,
`DELIVERY_DRIVER`, `ADMIN` — plus `PENDING`, the harmless default for a
freshly self-registered account nobody has assigned a role to yet.
Customers are **not** `User` accounts; `CustomerProfile` is a plain record
the admin manages, with no login attached.

- `src/lib/rbac.ts` — role → home route / section-prefix mapping
- `src/lib/require-role.ts` — server-side guard used by each role's layout
- `src/middleware.ts` — cheap cookie-presence redirect for protected routes
- Route groups: `app/(kitchen)`, `app/(delivery)`, `app/(admin)`, each with
  their own layout that calls `requireRole(...)`. `ADMIN` can reach every
  section for oversight — including the kitchen's daily production view.

### Database schema (`prisma/schema.prisma`)

- **Auth:** `User`, `Session`, `Account`, `Verification` (Better Auth's
  expected shape) — only for `ADMIN`, `KITCHEN_CHEF`, `DELIVERY_DRIVER`
  accounts. `User.phoneNumber` is the sign-in identifier for drivers (see
  Auth below).
- **Customer:** `CustomerProfile` (name, phone, address, delivery window,
  `status: ACTIVE | PAUSED | INACTIVE`, no `User` link), `CustomerPreference`
  (general likes/dislikes, distinct from allergies), `Allergy` /
  `CustomerAllergy`, `CustomerProfileTag` (VIP, allergy alert, vegetarian, ...).
- **Meals & recipes:** `Meal` (name, photo, category, nutrition),
  `Ingredient`, `Recipe`, `RecipeIngredient` — the basis for both the meal
  catalog and the kitchen's ingredient prep lists. No inventory/stock
  management, by design.
- **Weekly meal planning:** `MealSchedule` — one evergreen default meal per
  `dayOfWeek` + `mealSlot` (`BREAKFAST | LUNCH | DINNER`), edited at
  `/admin/schedule`. It applies automatically to every `ACTIVE` customer.
  `CustomerMealSelection` is the per-customer override: the admin assigns a
  specific `Meal` for a given `weekStartDate` + `dayOfWeek` + `mealSlot`
  (with an optional `note`, e.g. "no onions") on that customer's page —
  wherever no override exists, `MealSchedule` fills the gap. No customer
  self-service.
- **Delivery:** `Driver`, `Delivery` (status pipeline: `PENDING → PREPARING
  → READY → ON_THE_WAY → DELIVERED`, with an address/GPS/time-window
  snapshot taken at creation time), one per `CustomerMealSelection`.

Run `npm run db:studio` to browse the schema visually once a database is
connected.

### Auth

Better Auth's email/password credential provider (`src/lib/auth.ts`,
`src/lib/auth-client.ts`) backs every account. `/login` shows two tabs:

- **Team** (`src/components/auth/staff-auth-form.tsx`) — signs in with a
  real email + password, for `ADMIN` and `KITCHEN_CHEF`.
- **Driver** (`src/components/auth/driver-auth-form.tsx`) — signs in with
  phone number + password. The phone number is mapped to a deterministic
  local email (`phoneToLocalEmail`, `src/lib/phone-identity.ts`) since
  Better Auth's credential provider is keyed by email either way; the real
  number is stored separately via the `phoneNumber` additional field.
  Login-only — drivers don't self-register.

Account creation:
- **Drivers:** created directly by an admin from `/admin/drivers`
  (`adminCreateDriver`, `src/lib/actions/driver.ts`) — sets a phone number
  and password the admin shares with the driver. No self-registration step.
- **Kitchen/Admin:** self-register via `/register` (Team tab only — new
  accounts start as `PENDING`, landing on `/pending-approval`); an existing
  admin then flips the `role` field on their `User` row via
  `npm run db:studio` (there's no self-serve admin promotion UI, by design).
- **Customers:** not `User` accounts at all — created and edited entirely
  from `/admin/customers` (`adminCreateCustomer`, `adminUpdateCustomerProfile`,
  `src/lib/actions/customer.ts`), including their weekly meal plan.

### UI

shadcn/ui components live in `src/components/ui/` (written directly against
this project's Tailwind v4 theme, since the network-based shadcn registry
isn't reachable from every environment). Add more components the same way,
or via `npx shadcn@latest add <component>` where network access allows it.

## Operational flow

1. **Admin creates a customer** (`/admin/customers`) — name, phone, address,
   delivery window, allergies, preferences.
2. **Admin plans the customer's week** (`/admin/customers/[id]`) — a
   day × meal-slot grid to assign a `Meal` and an optional remark for each
   slot, week by week.
3. **Kitchen sees the day's production** (`/kitchen`, mirrored at
   `/admin/kitchen`) — portions per meal, grouped by slot, with every
   customer's allergies, tags and remarks, plus a weekly ingredient
   shopping list.
4. **Delivery generates and tracks today's deliveries** (`/delivery`) —
   one delivery per active customer per planned meal slot for the day;
   admin assigns a driver, the driver walks it through the status pipeline.

## Module history

Built module by module as an MVP (customer self-service: accounts,
subscriptions, weekly menu selection, ratings, notifications, analytics),
then simplified into this admin/kitchen/delivery-only operational tool once
real-world usage showed the self-service surface was more than the business
needed to launch. Customer-facing modules were removed in favor of admin
data entry; the kitchen and delivery flows carried over, adapted to read
directly from the admin-entered weekly meal plan.
