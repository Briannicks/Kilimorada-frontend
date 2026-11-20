import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

// A logged-in user object always has an id. The other replies
// ({ two_factor_required }, { verification_required }, { pending_approval }) do not.
const isUser = (result) => Boolean(result?.id);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load: ask the server who is logged in
  useEffect(() => {
    authApi
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // If any request says the session expired, log out everywhere
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Returns { two_factor_required, message }, { verification_required, message } or the user
  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials);
    if (isUser(result)) setUser(result);
    return result;
  }, []);

  // Returns { verification_required, message }. Nobody is logged in until the code is checked.
  const signup = useCallback((details) => authApi.signup(details), []);

  // Returns the user (now logged in) or { pending_approval, message }
  const verify = useCallback(async (code) => {
    const result = await authApi.verifyCode(code);
    if (isUser(result)) setUser(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, isAdmin: user?.role === "admin", login, signup, verify, logout }),
    [user, loading, login, signup, verify, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}