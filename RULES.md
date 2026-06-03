# ANTIGRAVITY RULES — MEALIT EXISTING PROJECT

## 1. Project Context

This is an existing MEALIT project.

Do not create a new project from scratch.
Do not reinitialize the app.
Do not delete or replace the existing project structure unless absolutely necessary.
Do not overwrite existing files blindly.

The current project already contains extracted Google Stitch design files inside:

`/design`

The `/design` folder is the main visual reference for the UI.

Your job is to continue and improve the existing project based on the `/design` folder, not to create a new app from zero.

---

## 2. Main Objective

Continue developing the existing MEALIT mobile-first fullstack PWA.

MEALIT is a healthy and affordable meal planner app that helps users answer:

> “Dengan budget segini, saya bisa makan sehat apa hari ini?”

The app should focus on:

* Healthy meal planning
* Budget control
* Nutrition visibility
* Verified healthy vendors
* Nutri-Wallet spending tracker
* AI meal plan recommendation

Do not turn MEALIT into a generic food delivery app.

---

## 3. Required Tech Direction

The existing project should use or be migrated carefully toward this stack:

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn UI
* Lucide React
* Recharts
* next-pwa
* Auth.js / NextAuth with Google Provider
* Neon PostgreSQL
* Prisma ORM
* Gemini API server-side only
* Cloudinary for food/vendor image upload
* Vercel deployment

Do not use:

* Firebase
* Firestore
* Firebase Cloud Functions
* Express backend
* Direct frontend database connection
* Direct frontend Gemini API call

If the existing project already contains different dependencies, inspect them first before modifying. Do not remove dependencies unless they are unused or conflict with the required stack.

---

## 4. Design Source of Truth

Before modifying any UI, inspect:

`/design`

The extracted Stitch design files inside `/design` are the visual source of truth.

Use `/design` to understand:

* Screen structure
* Layout
* Colors
* Typography
* Spacing
* Rounded card style
* Shadows
* Navigation pattern
* Food cards
* Dashboard cards
* Nutri-Wallet visuals
* Authentication screen style
* Admin/vendor dashboard style

Do not redesign from scratch.
Do not replace the UI with a generic template.
Do not invent a new design system.
Do not ignore the Stitch design.

Your goal is to make the existing implementation match the Stitch design as closely as possible.

---

## 5. Existing Code Safety Rules

Before editing:

1. Inspect the current folder structure.
2. Identify existing pages, components, styles, utilities, configs, and dependencies.
3. Reuse existing code whenever possible.
4. Refactor gradually.
5. Preserve working functionality.
6. Avoid unnecessary file deletion.
7. Avoid large unrelated rewrites.
8. Keep changes scoped to the requested task.

When changing files:

* Prefer editing existing components instead of creating duplicates.
* If a component already exists, improve it.
* If a page already exists, update it.
* If a layout already exists, adapt it.
* Only create new files when no suitable file exists.
* Do not create another parallel app directory.
* Do not create duplicate routing structures.
* Do not create a new design system separate from `/design`.

---

## 6. UI Implementation Rules

Use the existing Stitch design in `/design` to update the current UI.

The app must remain:

* Mobile-first
* PWA-ready
* Clean
* Fresh
* Healthy
* Affordable
* Modern
* Consistent

Required UI behavior:

* Logged-in pages should use bottom navigation.
* Main actions should be easy to reach on mobile.
* Cards should use rounded corners.
* Budget/price information should be visually clear.
* Nutrition information should be easy to scan.
* Forms should be short and friendly.
* Empty states and loading states must exist.

Do not make the UI desktop-first.

---

## 7. Design System Rules

Use the design tokens found in `/design` whenever possible.

If values need to be defined manually, use this MEALIT direction:

### Primary Green

Use for health, nutrition, success, active navigation, and primary CTA.

Preferred values:

* `#0F5238`
* `#2D6A4F`
* `#22C55E`

### Budget Orange

Use for budget, price, savings, and Nutri-Wallet money highlights.

Preferred values:

* `#FF9F1C`
* `#F97316`

### Background

Use soft, calm backgrounds.

Preferred values:

* `#F8F9FA`
* `#FFFDF7`

### Surface

Use:

* `#FFFFFF`

### Text

Use:

* Primary: `#191C1D`
* Secondary: `#404943`
* Muted: `#707973`

Do not introduce unrelated colors unless needed for accessibility, charts, or error states.

Typography:

* Use Public Sans, Inter, or Plus Jakarta Sans.
* Match `/design` typography if defined.
* Page titles should be bold and clear.
* Numeric values like price, budget, calories, and protein must be visually emphasized.

Shape:

* Cards: rounded 16px–24px
* Buttons: rounded 8px–16px
* Badges/chips: fully rounded

Spacing:

* Use consistent 8px-based spacing.
* Mobile page padding should usually be 16px–20px.

---

## 8. Component Rules

Before creating a component, check if a similar one already exists.

Required reusable components, either existing or newly created only when missing:

* `AppShell`
* `BottomNavigation`
* `PageHeader`
* `FoodCard`
* `MealPlanCard`
* `BudgetCard`
* `NutritionSummaryCard`
* `VendorCard`
* `StatCard`
* `EmptyState`
* `LoadingSkeleton`
* `PrimaryButton`
* `SecondaryButton`
* `CategoryChips`
* `SearchBar`
* `ProgressCard`
* `DashboardSection`

Rules:

1. Do not duplicate component logic.
2. Do not create multiple versions of the same card.
3. Keep components reusable.
4. Keep props typed with TypeScript.
5. Match the Stitch design from `/design`.
6. Put shared UI in `components`.
7. Put page-specific sections in page folders if needed.

---

## 9. Page Rules

Continue or improve existing pages.
Do not recreate pages from scratch if they already exist.

Required routes:

Public:

* `/`
* `/about`
* `/help`
* `/contact`

Auth:

* `/login`
* `/onboarding`

Private app:

* `/profile-setup`
* `/dashboard`
* `/meal-planner`
* `/menus`
* `/menus/[id]`
* `/vendors`
* `/wallet`
* `/history`
* `/profile`

Role pages:

* `/vendor/dashboard`
* `/admin/dashboard`

If a route already exists:

* Inspect it.
* Preserve useful code.
* Update layout and styling to match `/design`.
* Connect it later to real data if needed.

If a route does not exist:

* Create it using the design reference from `/design`.

---

## 10. Fullstack Architecture Rules

The app should be a fullstack Next.js PWA.

Use server-side logic through:

* Server Actions
* Route Handlers
* Server Components where appropriate

Do not use a separate Express backend.

Architecture:

User
→ Next.js PWA
→ Auth.js Google Login
→ Server Actions / Route Handlers
→ Prisma ORM
→ Neon PostgreSQL
→ Gemini API server-side only

Important:

1. Frontend must never connect directly to Neon.
2. Frontend must never call Gemini directly.
3. Prisma must only run server-side.
4. API keys must only exist in server environment variables.
5. Auth session must be checked before accessing private user data.

---

## 11. Database Rules

Use Neon PostgreSQL with Prisma.

Required models:

* User
* UserProfile
* Vendor
* Menu
* MealPlan
* MealPlanItem
* WalletLog

Optional models:

* Order
* FavoriteMenu
* VendorReview
* Notification

Do not store money as float.

Correct:

* `price Int`
* `dailyBudget Int`
* `amount Int`

Wrong:

* `price Float`
* `dailyBudget Float`
* `amount Float`

Relationships:

1. One User has one UserProfile.
2. One User has many MealPlans.
3. One User has many WalletLogs.
4. One Vendor has many Menus.
5. One MealPlan has many MealPlanItems.
6. One MealPlanItem belongs to one Menu.
7. One WalletLog can optionally reference one Menu.

Use indexes where useful:

* userId
* vendorId
* menuId
* planDate
* logDate
* category
* isAvailable

---

## 12. Authentication Rules

Use Auth.js / NextAuth with Google Provider.

Rules:

1. User can login/register using Google.
2. After first login, create or update User in Neon.
3. If user has no UserProfile, redirect to `/profile-setup`.
4. If user has UserProfile, redirect to `/dashboard`.
5. Default user role is `user`.

Roles:

* `user`
* `vendor`
* `admin`

Route protection:

* Private app pages require login.
* Vendor dashboard requires `vendor` or `admin`.
* Admin dashboard requires `admin`.

Do not allow unauthenticated users to access private app pages.

---

## 13. Gemini AI Rules

Gemini is used only for AI meal planning.

Gemini API must only be called server-side.

AI input must include:

* user profile
* body goal
* daily budget
* available menu list from Neon
* menu ID
* menu name
* price
* calories
* protein
* carbs
* fat
* vendor availability

AI output must be structured JSON.

Gemini must not invent:

* menu items
* menu IDs
* vendor names
* prices
* calories
* protein values
* nutrition values

Validation rules:

1. Validate returned JSON.
2. Validate all returned `menuId` values exist in Neon.
3. Validate prices match the database.
4. Validate nutrition values match the database.
5. Validate total price.
6. Validate total calories.
7. Save only validated meal plans.

---

## 14. Nutri-Wallet Rules

Nutri-Wallet tracks:

* Daily spending
* Weekly spending
* Monthly spending
* Remaining daily budget
* Average daily spending
* Calories consumed
* Protein consumed
* Spending history

Use Recharts for charts.

Color rules:

* Orange for money/spending.
* Green for nutrition/progress.

Create WalletLog when:

* User saves a meal plan
* User manually logs a meal
* User confirms a menu selection

---

## 15. PWA Rules

The app must be installable as a PWA.

Required:

* Manifest
* App icons
* Theme color based on MEALIT green
* Background color based on MEALIT soft background
* Offline fallback page
* Responsive mobile layout
* Touch-friendly buttons

Do not break existing PWA config if it already exists. Inspect first, then adjust.

---

## 16. Code Organization Rules

Use the existing project structure if already present.

Do not force this structure if the project already has a valid structure.
Only migrate gradually if necessary.

Preferred structure:

```txt
src/
  app/
  components/
    ui/
    layout/
    cards/
    forms/
    charts/
    navigation/
  lib/
    auth.ts
    prisma.ts
    gemini.ts
    validations.ts
    utils.ts
  actions/
    profile.actions.ts
    meal-plan.actions.ts
    wallet.actions.ts
    menu.actions.ts

prisma/
  schema.prisma
  seed.ts
```

Rules:

1. Do not create duplicate folder structures.
2. Do not move files unnecessarily.
3. Do not break imports.
4. Keep database logic server-side.
5. Keep Gemini logic in server-side utilities.
6. Keep reusable UI in components.

---

## 17. Data Rules

Use realistic seed data when needed.

Seed data should include:

* 3 vendors
* 15 healthy menu items
* realistic Rupiah prices
* nutrition data
* verified and unverified vendors
* sample meal plans
* sample wallet logs

Student-friendly price range:

* Rp10.000 – Rp35.000

Do not let Gemini generate fake database seed menus unless explicitly requested.

---

## 18. Implementation Priority

Because this is an existing project, follow this priority:

1. Inspect existing project structure.
2. Inspect `/design`.
3. Compare current UI with Stitch design.
4. Fix design tokens and global styles.
5. Improve shared components.
6. Improve existing pages one by one.
7. Add missing pages only if needed.
8. Set up or fix Prisma + Neon.
9. Set up or fix Auth.js Google Login.
10. Connect pages to real data.
11. Add Gemini AI meal planner.
12. Add Nutri-Wallet calculations.
13. Add PWA polish.
14. Final responsive and accessibility pass.

Do not jump straight into AI integration before UI, auth, database, and menu data are stable.

---

## 19. Quality Checklist

Before marking any task as complete:

1. Existing project still runs.
2. No unnecessary files were deleted.
3. UI follows `/design`.
4. Mobile layout works.
5. Bottom navigation works.
6. Loading state exists.
7. Empty state exists.
8. Error state exists when needed.
9. TypeScript has no avoidable errors.
10. API keys are not exposed to the client.
11. Prisma is not used in client components.
12. Gemini is not called from the frontend.

---

## 20. Strict Do Not Rules

Do not:

* Start a new project.
* Reinitialize Next.js.
* Delete existing implementation blindly.
* Replace everything with a generic template.
* Ignore `/design`.
* Create duplicate routes.
* Create duplicate components.
* Use Firebase.
* Use Firestore.
* Use Express.
* Connect Neon from the frontend.
* Call Gemini from the frontend.
* Store secrets in client code.
* Make the app desktop-first.
* Remove bottom navigation from mobile app pages.
* Implement payment or delivery before meal planner is stable.

---

## 21. Final Goal

Continue the existing MEALIT project and make it match the extracted Stitch design in `/design`.

The final app should become a polished mobile-first fullstack PWA using:

Next.js + TypeScript + Tailwind CSS + Neon PostgreSQL + Prisma + Auth.js + Gemini API.

The implementation must preserve existing work, improve it carefully, and follow the Stitch visual design.
