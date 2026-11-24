# KilimoRada Frontend

The staff dashboard for **KilimoRada**, a farming hub for Kenyan farmers. Extension officers and admins use it to manage farmers, answer their reports, post market prices and send SMS alerts.

**Live site:** https://kilimorada.vercel.app/

## What you can do

- **Dashboard**: see farmer, report, price, broadcast and SMS totals at a glance
- **Farmers**: add, search and manage registered farmers
- **Reports**: read problems farmers report and reply to them by SMS
- **Market Prices**: post crop, fertilizer, seed and fuel prices that farmers see on USSD
- **Broadcasts**: send one SMS alert to all farmers, or to farmers who grow one crop
- **Agrovets**: keep a list of verified agrovet shops
- **Batch Codes**: record genuine and fake product batch codes
- **USSD Activity**: see fake-input reports and Ask Expert questions from USSD
- **Users** (admin only): approve new officers and change roles
- **Profile**: update your name, county, ward and picture

## Who can log in

1. Sign up and verify your email.
2. An admin approves your account. The first person to sign up becomes the admin.
3. Log in with your password and the code sent to your email.

## Built with

- React 19 and Vite
- Tailwind CSS
- React Router
- Formik and Yup for forms
- Lucide icons
- PWA support, so it can be installed on a phone

## Run it on your computer

You need [Node.js](https://nodejs.org/) installed and the KilimoRada backend running.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The app sends every `/api` request to the backend at `http://localhost:5555` (set in `vite.config.js`), so start the backend first. No `.env` file is needed.

## Build for production

```bash
npm run build
npm run preview
```

## Deployment

The frontend is hosted on **Vercel**. The file `vercel.json` does two things:

- sends `/api/...` requests to the backend on Render (`https://kilimo-rada-api.onrender.com`)
- sends every other page to `index.html`, so links like `/reports` work after a refresh

## Project structure

```
src/
  api/         requests to the backend, one file per feature
  components/  layout, route guards and shared UI pieces
  context/     login state and toast messages
  hooks/       useFetch, useDebounce, usePagination
  pages/       one folder per screen (dashboard, farmers, reports, ...)
  utils/       small helpers for dates and forms
  App.jsx      all the routes
```



