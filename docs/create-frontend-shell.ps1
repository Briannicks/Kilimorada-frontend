# Run from the repo root (the folder that contains server/):  powershell -ExecutionPolicy Bypass -File docs\create-frontend-shell.ps1
$files = @(
  "client/index.html","client/package.json","client/vite.config.js","client/tailwind.config.js","client/postcss.config.js",
  "client/src/main.jsx","client/src/App.jsx","client/src/index.css","client/src/constants.js",
  "client/src/api/client.js","client/src/api/auth.js","client/src/api/dashboard.js","client/src/api/farmers.js",
  "client/src/api/reports.js","client/src/api/prices.js","client/src/api/broadcasts.js","client/src/api/registry.js","client/src/api/users.js",
  "client/src/context/AuthContext.jsx","client/src/context/ToastContext.jsx",
  "client/src/hooks/useFetch.js","client/src/hooks/usePagination.js","client/src/utils/format.js",
  "client/src/components/layout/AppLayout.jsx","client/src/components/layout/AuthLayout.jsx",
  "client/src/components/layout/Sidebar.jsx","client/src/components/layout/Topbar.jsx",
  "client/src/components/routing/ProtectedRoute.jsx","client/src/components/routing/AdminRoute.jsx","client/src/components/routing/GuestRoute.jsx",
  "client/src/components/ui/Button.jsx","client/src/components/ui/Input.jsx","client/src/components/ui/Select.jsx",
  "client/src/components/ui/Textarea.jsx","client/src/components/ui/Modal.jsx","client/src/components/ui/ConfirmDialog.jsx",
  "client/src/components/ui/Table.jsx","client/src/components/ui/Pagination.jsx","client/src/components/ui/Badge.jsx",
  "client/src/components/ui/StatCard.jsx","client/src/components/ui/EmptyState.jsx","client/src/components/ui/ErrorAlert.jsx",
  "client/src/components/ui/Skeleton.jsx","client/src/components/ui/Spinner.jsx","client/src/components/ui/Toast.jsx",
  "client/src/pages/auth/Login.jsx","client/src/pages/auth/Signup.jsx","client/src/pages/auth/Verify.jsx",
  "client/src/pages/dashboard/Dashboard.jsx",
  "client/src/pages/farmers/Farmers.jsx","client/src/pages/farmers/FarmerDetail.jsx","client/src/pages/farmers/FarmerForm.jsx",
  "client/src/pages/reports/Reports.jsx","client/src/pages/reports/ReportDetail.jsx","client/src/pages/reports/ReplyBox.jsx",
  "client/src/pages/prices/Prices.jsx","client/src/pages/prices/PriceForm.jsx",
  "client/src/pages/broadcasts/Broadcasts.jsx",
  "client/src/pages/agrovets/Agrovets.jsx","client/src/pages/agrovets/AgrovetForm.jsx",
  "client/src/pages/batch-codes/BatchCodes.jsx","client/src/pages/batch-codes/BatchCodeForm.jsx",
  "client/src/pages/ussd/UssdActivity.jsx","client/src/pages/users/Users.jsx","client/src/pages/profile/Profile.jsx",
  "client/src/pages/NotFound.jsx"
)
foreach ($f in $files) {
  New-Item -ItemType Directory -Force -Path (Split-Path $f) | Out-Null
  if (-not (Test-Path $f)) { New-Item -ItemType File -Path $f | Out-Null }
}
New-Item -ItemType Directory -Force -Path "client/public","client/src/assets" | Out-Null
Write-Host "Created $($files.Count) empty files. Copy logo.png into client/src/assets and the icons into client/public."
