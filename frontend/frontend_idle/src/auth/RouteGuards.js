import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const homeByRole = (role) => {
    switch (role) {
        case "shipper": return "/shipper";
        case "carrier": return "/carPage";
        default: return "/";
    }
}

export function RequireAuth({ children, roles }) {
    const { loading, authenticated, profile } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!authenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && !roles.includes(profile?.role)) {
        return <Navigate to={homeByRole(profile?.role)} replace />;
    }

    return children;
}

export function RedirectIfAuthed({ children }) {
    const { loading, authenticated, profile } = useAuth();
    if (loading) return null;
    if (authenticated) return <Navigate to={homeByRole(profile?.role)} replace />;
    return children;
}
