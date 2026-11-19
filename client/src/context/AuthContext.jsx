import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

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

// Returns { two_factor_required, message } when a code was emailed, otherwise the user
const login = useCallback(async (credentials) => {
const result = await authApi.login(credentials);
if (!result?.two_factor_required) setUser(result);
return result;
}, []);

const signup = useCallback(async (details) => {
const newUser = await authApi.signup(details);
setUser(newUser);
return newUser;
}, []);

const verify = useCallback(async (code) => {
const verifiedUser = await authApi.verifyCode(code);
setUser(verifiedUser);
return verifiedUser;
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