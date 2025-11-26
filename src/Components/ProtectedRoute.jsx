import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // o spinner
  if (!user) return <Navigate to="/" />; // redirige a Home, no a /login

  return children;
}
