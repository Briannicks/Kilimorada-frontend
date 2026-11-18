# KilimoRada Frontend Plan (2 days)

Staff-only web app for **admins and officers**. Farmers use USSD, not this site.
No landing page: `/` goes to `/login`, or to `/dashboard` if already logged in.

**Rule for the whole team: no demo data.** Every number, name and list on screen comes
from the API. If the API returns nothing, show an empty state ("No farmers yet" + "Add farmer").
Never hardcode names, phone numbers, counts, prices, wards or "John Mutua".

Stitch screens in `docs/stitch-reference/` are **for look and layout only**.

---

## Stack
React + Vite, React Router, Tailwind, Formik + Yup, lucide-react icons, vite-plugin-pwa.
API calls use relative URLs (`/api/...`) with `credentials: "include"`.
Vite proxy in dev: `/api` → `http://localhost:5555`. In production Flask serves `client/dist`.

Theme: light green and white. Primary `#15803D`, hover `#166534`, tint `#F0FDF4`,
page `#F7F9F8`, cards white, font Inter. No gradients, no glow, no purple, no emojis.

---

## Remove from the Stitch designs

**Login / Sign up**
- "Republic of Kenya" and "Ministry of Agriculture & Livestock Development" footer
- "Official Staff Portal" pill and "Restricted to authorized Ministry & County Extension Officers"
- Pre-filled email `j.mutua@kilimorada.go.ke` and password dots
- "Forgot password?" and "Keep me signed in for 12 hours" (the backend has neither)
- Keep: logo, "Welcome back", "Sign in to your account.", Email, Password, Sign in, "New to KilimoRada? Create an account"

**All app pages**
- "John Mutua / Field Coordinator", "National Console", "Operations >" breadcrumb, "Kenya Operations", "v2.4"
- "Nakuru County" / "Nakuru County Hub" / "Central Desk" labels, extension hotline number
- Every number, percentage, name, phone number and table row (all fake)
- The "14" reports badge (use the real open-reports count)
- Logo `<img>` with long alt text: use `src/assets/logo.png`, alt="KilimoRada"

**Features the backend does not have (remove)**
- Dashboard: "+340 this month", "98.7% resolution rate", "Avg turn 4.2 hours", "KES 0.80 avg unit cost", "Safaricom & Airtel", "Live" pill, "Under Review" status, "Audit All Logs"
- Farmers: "Export CSV", extra stat cards; Ward must be a text input (wards are free text)
- Reports: "Verified Farmer", print button, "Verified treatment templates", "Save Draft", "SLA / Gateway" pill, "Est. 1 Acre", "Previous reports 2023–2024", "View Farmer Dossier" (use a normal link to the farmer page)
- Market Prices: "Tracked hubs", "USSD queries (24h)", "Price volatility", "Live USSD Simulator Feed" box
- Fix the text "USSD option 3": prices feed **options 1 to 4** (Fertilizer, Seeds, Fuel, Market Prices)

---

## Routes

| Route | Page | Access |
|---|---|---|
| `/login`, `/signup`, `/verify` | Auth | Logged out only |
| `/dashboard` | Dashboard | Logged in |
| `/farmers`, `/farmers/:id` | Farmers | Logged in (delete: admin) |
| `/reports`, `/reports/:id` | Reports | Logged in (delete: admin) |
| `/prices` | Market Prices | Logged in (edit/delete: owner or admin) |
| `/broadcasts` | Broadcasts | Logged in |
| `/agrovets` | Agrovets | View: all, edit: admin |
| `/batch-codes` | Batch Codes | View: all, edit: admin |
| `/ussd-activity` | Fake reports + Ask Expert questions | Logged in |
| `/users` | Users and roles | Admin only |
| `/profile` | Name + avatar | Logged in |

---

## Who builds what

| Person | Files |
|---|---|
| **Mocha** | `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/constants.js`, `src/api/client.js`, `src/utils/format.js`, `src/hooks/*`, `src/components/layout/*`, `pages/NotFound.jsx`. Day 2: Flask serves the React build + Render deploy |
| **Cheruu** | `src/context/AuthContext.jsx`, `src/api/auth.js`, `src/components/routing/*`, `pages/auth/Login.jsx`, `Signup.jsx`, `Verify.jsx` |
| **Sylvia** | `src/components/ui/*`, `src/context/ToastContext.jsx`, `src/api/dashboard.js`, `src/api/users.js`, `pages/dashboard/*`, `pages/users/*`, `pages/profile/*` |
| **Mwangi** | `src/api/farmers.js`, `pages/farmers/*` |
| **Michie** | `src/api/reports.js`, `src/api/prices.js`, `pages/reports/*`, `pages/prices/*` |
| **Wayne** | `src/api/broadcasts.js`, `src/api/registry.js`, `pages/broadcasts/*`, `pages/agrovets/*`, `pages/batch-codes/*`, `pages/ussd/*` |

---

## Timeline

**Day 1 (Wed 18 Nov)**
- By 1pm: Mocha pushes setup, API client, layout and routing. Everyone pulls.
- By 4pm: Cheruu pushes login/sign up/verify; Sylvia pushes the UI components.
- Evening: everyone builds their pages against the local Flask server.

**Day 2 (Thu 19 Nov)**
- Morning: finish pages, empty/loading/error states, mobile layout.
- Afternoon: Mocha connects Flask to serve `client/dist`, deploys to Render.
- Evening: whole team tests every page on the live site, fixes bugs, merges to `main`.

## Git
Branch per task (`feature/login-page`), PR into `dev`, review, merge. Commits like `feat: add farmers table`.
