import Spinner from "./Spinner";

const VARIANTS = {
  primary: "bg-green-700 text-white hover:bg-green-800 disabled:bg-green-700/60",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:text-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 disabled:text-slate-400",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-6 text-base",
};