import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ToastList } from "../components/ui/Toast";

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
const [toasts, setToasts] = useState([]);

const dismiss = useCallback((id) => {
setToasts((list) => list.filter((toast) => toast.id !== id));
}, []);

const show = useCallback(
(type, message) => {
const id = nextId++;
setToasts((list) => [...list, { id, type, message }]);
setTimeout(() => dismiss(id), 4500);
},
[dismiss]
);

const toast = useMemo(
() => ({
success: (message) => show("success", message),
error: (message) => show("error", message),
}),
[show]
);

return (
<ToastContext.Provider value={toast}>
{children}
<ToastList toasts={toasts} onDismiss={dismiss} />
</ToastContext.Provider>
);
}

// const toast = useToast(); toast.success("Saved"); toast.error("Failed")
export function useToast() {
const context = useContext(ToastContext);
if (!context) throw new Error("useToast must be used inside <ToastProvider>");
return context;
}