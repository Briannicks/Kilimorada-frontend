import logo from "../../assets/logo.png";

/**
 * Shared look for Login, Sign up and Verify.
 * <AuthLayout title="Welcome back" subtitle="Sign in to your account." footer={<p>...</p>}>
 *   ...form...
 * </AuthLayout>
 */
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9F8] px-4 py-10">
      <img src={logo} alt="KilimoRada" className="mb-8 w-32 sm:w-36" />

      <div className="w-full max-w-[480px] rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-base text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
    </main>
  );
}