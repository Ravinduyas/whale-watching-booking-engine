import { Navigate, useLocation } from "react-router-dom";

// Route guard: bounce unauthenticated visitors to /login,
// remembering where they were headed.
export default function RequireAuth({ authed, children }) {
  const location = useLocation();
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
